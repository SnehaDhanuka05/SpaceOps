from sqlalchemy.orm import Session
from datetime import datetime
from app.models.launch import Launch
from app.services.external_apis import nasa_api_client
from app.utils.logger import get_logger

logger = get_logger(__name__)

class LaunchService:
    @staticmethod
    def get_upcoming_launches(db: Session, limit: int = 10):
        return db.query(Launch).order_by(Launch.window_start.asc()).limit(limit).all()

    @staticmethod
    async def fetch_and_store_launches(db: Session) -> list:
        logger.info("Fetching upcoming launches from Space Launch Now API...")
        try:
            data = await nasa_api_client.get_upcoming_launches()
        except Exception as e:
            logger.warning(f"Failed to fetch launches from API: {e}. Returning last known launches...")
            last_launches = LaunchService.get_upcoming_launches(db, limit=100)
            if last_launches:
                return last_launches
            else:
                logger.error("No cached launches available.")
                return []
            
        results = data.get("results", [])
            
        saved_launches = []
        for launch_data in results:
            launch_id = launch_data.get("id")
            name = launch_data.get("name", "Unknown Launch")
            provider = launch_data.get("launch_service_provider", {}).get("name")
            status = launch_data.get("status", {}).get("name")
            
            window_start_str = launch_data.get("window_start")
            window_end_str = launch_data.get("window_end")
            
            window_start = None
            window_end = None
            try:
                if window_start_str:
                    window_start = datetime.fromisoformat(window_start_str.replace("Z", "+00:00")).replace(tzinfo=None)
                if window_end_str:
                    window_end = datetime.fromisoformat(window_end_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception as e:
                logger.error(f"Failed to parse dates for launch {launch_id}: {e}")
                
            rocket_name = launch_data.get("rocket", {}).get("configuration", {}).get("full_name")
            launch_pad = launch_data.get("pad", {}).get("name")
            description = launch_data.get("mission", {}).get("description")
            
            existing = db.query(Launch).filter(Launch.launch_id == launch_id).first()
            if existing:
                existing.name = name
                existing.provider = provider
                existing.status = status
                existing.window_start = window_start
                existing.window_end = window_end
                existing.rocket_name = rocket_name
                existing.launch_pad = launch_pad
                existing.description = description
                saved_launches.append(existing)
            else:
                new_launch = Launch(
                    launch_id=launch_id,
                    name=name,
                    provider=provider,
                    status=status,
                    window_start=window_start,
                    window_end=window_end,
                    rocket_name=rocket_name,
                    launch_pad=launch_pad,
                    description=description
                )
                db.add(new_launch)
                saved_launches.append(new_launch)
                
        db.commit()
        logger.info(f"Successfully synced {len(saved_launches)} launches.")
        return saved_launches
