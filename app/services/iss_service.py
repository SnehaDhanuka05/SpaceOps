from sqlalchemy.orm import Session
from app.models.iss import ISSTelemetry
from app.services.external_apis import nasa_api_client
from app.utils.logger import get_logger

logger = get_logger(__name__)

class ISSService:
    @staticmethod
    def get_latest_telemetry(db: Session) -> ISSTelemetry:
        return db.query(ISSTelemetry).order_by(ISSTelemetry.timestamp.desc()).first()

    @staticmethod
    async def fetch_and_store_telemetry(db: Session) -> ISSTelemetry:
        logger.info("Fetching ISS position from external API...")
        try:
            data = await nasa_api_client.get_iss_position()
        except Exception as e:
            logger.warning(f"Failed to fetch ISS position from API: {e}. Returning last known telemetry...")
            last_telemetry = ISSService.get_latest_telemetry(db)
            if last_telemetry:
                return last_telemetry
            else:
                logger.error("No cached ISS telemetry available.")
                raise e

        position = data.get("iss_position", {})
        
        telemetry = ISSTelemetry(
            latitude=float(position.get("latitude", 0.0)),
            longitude=float(position.get("longitude", 0.0)),
            altitude=420.0,  # Default ISS altitude in km
            velocity=27600.0 # Default speed in km/h
        )
        db.add(telemetry)
        db.commit()
        db.refresh(telemetry)
        logger.info(f"Stored ISS position: lat={telemetry.latitude}, lon={telemetry.longitude}")
        return telemetry

