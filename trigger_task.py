import sys
import os

sys.path.insert(0, os.path.abspath("."))

from app.tasks.ai_tasks import generate_ai_explanations
from app.core.db import SessionLocal

def trigger():
    print("Triggering task...")
    db = SessionLocal()
    generate_ai_explanations(db=db)
    print("Task finished.")

if __name__ == "__main__":
    trigger()
