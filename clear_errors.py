import sys
import os

# Add current directory to path so we can import app modules
sys.path.insert(0, os.path.abspath("."))

from app.core.db import SessionLocal
from app.models.neo import NEOHazard
from app.models.launch import Launch
from app.models.space_weather import SpaceWeather
from app.core.cache import redis_client

def clear_error_messages():
    db = SessionLocal()
    error_msg = "AI Explanation is currently unavailable. (Error: Local model service offline)"
    
    try:
        # Clear from DB
        neos = db.query(NEOHazard).filter(NEOHazard.explanation == error_msg).all()
        for neo in neos:
            neo.explanation = None
            
        launches = db.query(Launch).filter(Launch.explanation == error_msg).all()
        for launch in launches:
            launch.explanation = None
            
        weather_alerts = db.query(SpaceWeather).filter(SpaceWeather.explanation == error_msg).all()
        for alert in weather_alerts:
            alert.explanation = None
            
        db.commit()
        
        # Clear from Redis cache
        cache_keys_deleted = 0
        for key in redis_client.scan_iter("explanation:*"):
            redis_client.delete(key)
            cache_keys_deleted += 1
            
        print(f"Cleared {len(neos)} NEOs, {len(launches)} launches, {len(weather_alerts)} weather alerts from DB.")
        print(f"Cleared {cache_keys_deleted} keys from Redis cache.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_error_messages()
