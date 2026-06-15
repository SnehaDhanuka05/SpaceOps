# SpaceOps Backend

A FastAPI-based backend application for space operations tracking: ISS tracking, Near-Earth Object (NEO) hazards, launch schedules, space solar weather alerts, and AI analysis of hazardous activities.

## Features
- **ISS Tracker**: Core endpoints and real-time feeds using WebSockets.
- **NEO Hazards**: Space telemetry monitoring and proximity alerts.
- **Launch Feed**: Launch calendar tracking and details.
- **Space Weather**: Solar weather, CME activity, solar storms.
- **AI Analytics**: Claude API integration to evaluate hazards.
- **Celery Tasks**: Background polling of NASA API and Launch feeds.
- **Caching**: Redis operations integration.

## Tech Stack
- **Web Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy v2)
- **Caching & Queue**: Redis & Celery
- **API Clients**: HTTPX (NASA Open APIs & Launch Library API)

## Setup & Installation

### Local Setup
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run application locally:
   ```bash
   uvicorn app.main:app --reload
   ```

### Docker Compose Setup
Run all services (Database, Redis, FastAPI app, Celery worker) via Docker Compose:
```bash
docker-compose up --build
```
