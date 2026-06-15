from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.space_weather import SpaceWeather
from app.models.raw_response import RawAPIResponse
from app.services.external_apis import nasa_api_client
from app.utils.logger import get_logger

logger = get_logger(__name__)

class SpaceWeatherService:
    @staticmethod
    def get_weather_alerts(db: Session, limit: int = 10):
        return db.query(SpaceWeather).order_by(SpaceWeather.start_time.desc()).limit(limit).all()

    @staticmethod
    async def fetch_and_store_weather(db: Session) -> list:
        start_date = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
        logger.info(f"Fetching space weather (solar flares) from NASA starting from {start_date}...")
        try:
            raw_flares = await nasa_api_client.get_solar_flares(start_date)
            # Save raw payload
            raw_record = RawAPIResponse(source="space_weather", payload=raw_flares)
            db.add(raw_record)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to fetch space weather alerts from API: {e}. Falling back to last saved raw response...")
            last_raw = db.query(RawAPIResponse).filter(RawAPIResponse.source == "space_weather").order_by(RawAPIResponse.timestamp.desc()).first()
            if last_raw:
                raw_flares = last_raw.payload
            else:
                logger.error("No cached space weather raw response available.")
                return []
            
        saved_alerts = []
        for flare in raw_flares:
            event_id = flare.get("flrID")
            if not event_id:
                continue
                
            start_time_str = flare.get("beginTime")
            peak_time_str = flare.get("peakTime")
            
            start_time = None
            peak_time = None
            try:
                if start_time_str:
                    start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00")).replace(tzinfo=None)
                if peak_time_str:
                    peak_time = datetime.fromisoformat(peak_time_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception as e:
                logger.error(f"Failed to parse dates for flare {event_id}: {e}")
                
            class_type = flare.get("classType", "N/A")
            details = f"Solar Flare class: {class_type}. Source location: {flare.get('sourceLocation', 'Unknown')}"
            
            existing = db.query(SpaceWeather).filter(SpaceWeather.event_id == event_id).first()
            if existing:
                existing.start_time = start_time
                existing.peak_time = peak_time
                existing.severity = class_type
                existing.details = details
                saved_alerts.append(existing)
            else:
                new_event = SpaceWeather(
                    event_id=event_id,
                    event_type="Solar Flare",
                    start_time=start_time,
                    peak_time=peak_time,
                    k_index=None,
                    severity=class_type,
                    details=details
                )
                db.add(new_event)
                saved_alerts.append(new_event)
                
        db.commit()
        logger.info(f"Successfully synced {len(saved_alerts)} space weather events.")
        return saved_alerts
