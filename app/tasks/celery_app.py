from celery import Celery
from app.config import settings

celery_app = Celery(
    "spaceops_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Autodiscover tasks
celery_app.autodiscover_tasks([
    "app.tasks.iss_tasks",
    "app.tasks.neo_tasks",
    "app.tasks.launch_tasks",
    "app.tasks.space_weather_tasks",
    "app.tasks.ai_tasks",
])

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "sync-iss-every-30-seconds": {
        "task": "app.tasks.iss_tasks.sync_iss_position",
        "schedule": 30.0,
    },
    "sync-neo-every-hour": {
        "task": "app.tasks.neo_tasks.sync_neo_hazards",
        "schedule": 3600.0,
    },
    "sync-launches-every-3-hours": {
        "task": "app.tasks.launch_tasks.sync_upcoming_launches",
        "schedule": 10800.0,
    },
    "sync-space-weather-every-hour": {
        "task": "app.tasks.space_weather_tasks.sync_space_weather",
        "schedule": 3600.0,
    },
    "generate-ai-explanations-every-minute": {
        "task": "app.tasks.ai_tasks.generate_ai_explanations",
        "schedule": 60.0,
    },
}

