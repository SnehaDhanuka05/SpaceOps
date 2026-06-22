from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.tasks.iss_tasks import sync_iss_position
from app.tasks.neo_tasks import sync_neo_hazards
from app.tasks.launch_tasks import sync_upcoming_launches
from app.tasks.space_weather_tasks import sync_space_weather
from app.tasks.ai_tasks import generate_ai_explanations
from app.utils.logger import get_logger

logger = get_logger(__name__)

scheduler = AsyncIOScheduler()

def start_scheduler():
    logger.info("Starting APScheduler for periodic tasks...")
    
    # Add jobs
    scheduler.add_job(sync_iss_position, 'interval', seconds=30, id='sync-iss')
    scheduler.add_job(sync_neo_hazards, 'interval', seconds=3600, id='sync-neo')
    scheduler.add_job(sync_upcoming_launches, 'interval', seconds=10800, id='sync-launches')
    scheduler.add_job(sync_space_weather, 'interval', seconds=3600, id='sync-space-weather')
    scheduler.add_job(generate_ai_explanations, 'interval', seconds=60, id='generate-ai-explanations')
    
    scheduler.start()
    logger.info("APScheduler started successfully.")

def shutdown_scheduler():
    logger.info("Shutting down APScheduler...")
    scheduler.shutdown()
