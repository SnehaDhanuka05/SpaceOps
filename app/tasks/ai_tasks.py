import asyncio
import json

from app.core.db import SessionLocal
from app.models.neo import NEOHazard
from app.models.launch import Launch
from app.models.space_weather import SpaceWeather
from app.services.ai_service import AIService
from app.utils.logger import get_logger
from app.api.v1.websockets.connections import manager

from sqlalchemy.orm import Session

logger = get_logger(__name__)


async def generate_ai_explanations(db: Session = None):
    logger.info("Starting background task: generate_ai_explanations...")
    db_created = False
    if db is None:
        db = SessionLocal()
        db_created = True
    
    try:
        # 1. Process NEO Hazards lacking explanations
        neos = db.query(NEOHazard).filter(
            (NEOHazard.explanation == None) | (NEOHazard.explanation == "")
        ).all()
        for neo in neos:
            data_summary = f"Asteroid name: {neo.name}, reference ID: {neo.neo_reference_id}, miss distance: {neo.miss_distance_km} km, is potentially hazardous: {neo.is_potentially_hazardous_asteroid}."
            explanation, _ = await AIService.get_explanation("neo", neo.neo_reference_id, data_summary)
            neo.explanation = explanation
            db.add(neo)
            await manager.broadcast_json({
                "event": "neo_explanation",
                "neo_reference_id": neo.neo_reference_id,
                "explanation": explanation
            })
            
        # 2. Process Upcoming Launches lacking explanations
        launches = db.query(Launch).filter(
            (Launch.explanation == None) | (Launch.explanation == "")
        ).all()
        for launch in launches:
            data_summary = f"Launch name: {launch.name}, provider: {launch.provider}, pad: {launch.launch_pad}, rocket: {launch.rocket_name}, description: {launch.description}."
            explanation, _ = await AIService.get_explanation("launch", launch.launch_id, data_summary)
            launch.explanation = explanation
            db.add(launch)
            await manager.broadcast_json({
                "event": "launch_explanation",
                "launch_id": launch.launch_id,
                "explanation": explanation
            })

        # 3. Process Space Weather alerts lacking explanations
        weather_alerts = db.query(SpaceWeather).filter(
            (SpaceWeather.explanation == None) | (SpaceWeather.explanation == "")
        ).all()
        for alert in weather_alerts:
            data_summary = f"Space weather event type: {alert.event_type}, event ID: {alert.event_id}, severity: {alert.severity}, details: {alert.details}."
            explanation, _ = await AIService.get_explanation("space-weather", alert.event_id, data_summary)
            alert.explanation = explanation
            db.add(alert)
            await manager.broadcast_json({
                "event": "weather_explanation",
                "event_id": alert.event_id,
                "explanation": explanation
            })
            
        db.commit()
        logger.info("Successfully finished generate_ai_explanations task.")
    except Exception as e:
        logger.error(f"Error executing generate_ai_explanations: {e}")
        db.rollback()
    finally:
        if db_created:
            db.close()

