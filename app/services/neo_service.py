from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.neo import NEOHazard
from app.services.external_apis import nasa_api_client
from app.utils.transformers import transform_neo_feed
from app.utils.logger import get_logger

logger = get_logger(__name__)

class NEOService:
    @staticmethod
    def get_hazards(db: Session, hazardous_only: bool = False, limit: int = 20):
        query = db.query(NEOHazard)
        if hazardous_only:
            query = query.filter(NEOHazard.is_potentially_hazardous_asteroid == True)
        return query.order_by(NEOHazard.close_approach_date.asc()).limit(limit).all()

    @staticmethod
    async def fetch_and_store_neo(db: Session) -> list:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        end_date_str = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        
        logger.info(f"Syncing NEO hazards from {today_str} to {end_date_str}")
        try:
            raw_data = await nasa_api_client.get_neo_hazards(today_str, end_date_str)
        except Exception as e:
            logger.warning(f"Failed to fetch NEO hazards from API: {e}. Returning last known hazards...")
            last_hazards = NEOService.get_hazards(db, limit=100)
            if last_hazards:
                return last_hazards
            else:
                logger.error("No cached NEO hazards available.")
                return []
        
        transformed_items = transform_neo_feed(raw_data)
        saved_items = []
        for item in transformed_items:
            # Parse close_approach_date to date object
            try:
                item_date = datetime.strptime(item["close_approach_date"], "%Y-%m-%d").date()
            except Exception:
                item_date = datetime.utcnow().date()

            existing = db.query(NEOHazard).filter(
                NEOHazard.neo_reference_id == item["neo_reference_id"]
            ).first()
            
            if existing:
                existing.name = item["name"]
                existing.nasa_jpl_url = item["nasa_jpl_url"]
                existing.absolute_magnitude_h = item["absolute_magnitude_h"]
                existing.estimated_diameter_km_max = item["estimated_diameter_km_max"]
                existing.is_potentially_hazardous_asteroid = item["is_potentially_hazardous_asteroid"]
                existing.close_approach_date = item_date
                existing.miss_distance_km = float(item["miss_distance_km"]) if item["miss_distance_km"] else None
                existing.relative_velocity_kph = float(item["relative_velocity_kph"]) if item["relative_velocity_kph"] else None
                saved_items.append(existing)
            else:
                new_neo = NEOHazard(
                    neo_reference_id=item["neo_reference_id"],
                    name=item["name"],
                    nasa_jpl_url=item["nasa_jpl_url"],
                    absolute_magnitude_h=item["absolute_magnitude_h"],
                    estimated_diameter_km_max=item["estimated_diameter_km_max"],
                    is_potentially_hazardous_asteroid=item["is_potentially_hazardous_asteroid"],
                    close_approach_date=item_date,
                    miss_distance_km=float(item["miss_distance_km"]) if item["miss_distance_km"] else None,
                    relative_velocity_kph=float(item["relative_velocity_kph"]) if item["relative_velocity_kph"] else None
                )
                db.add(new_neo)
                saved_items.append(new_neo)
                
        db.commit()
        logger.info(f"Successfully synced {len(saved_items)} Near-Earth Objects.")
        return saved_items
