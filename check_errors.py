import sys
import os

sys.path.insert(0, os.path.abspath("."))

from app.core.db import SessionLocal
from app.models.space_weather import SpaceWeather

def check_explanations():
    db = SessionLocal()
    try:
        weather_alerts = db.query(SpaceWeather).all()
        for alert in weather_alerts:
            print(f"ID: {alert.id}, Explanation: {repr(alert.explanation)}")
            if "unavailable" in str(alert.explanation):
                alert.explanation = None
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_explanations()
