# SpaceOps

SpaceOps is a comprehensive space operations tracking application that provides real-time telemetry, 3D visualization, and AI-powered analytics. The project consists of a high-performance Next.js 3D frontend and a scalable FastAPI backend.

## Features

- **Interactive 3D Globe**: Built with React Three Fiber, featuring a real-time rotating Earth, orbital paths, and dynamically rendered space weather effects (Auroras, Solar Storm particles).
- **Live ISS Tracker**: Real-time telemetry tracking and orbital visualization powered by WebSockets.
- **NEO (Near-Earth Object) Hazards**: Proximity monitoring and interactive map markers for potentially hazardous asteroids.
- **Launch Schedule Feed**: Tracks upcoming rocket launches and displays their designated launch pad locations globally.
- **Space Solar Weather Alerts**: Visualize intense solar weather patterns, CMEs, and radiation levels impacting Earth.
- **Command Palette & Global Search**: Quickly search and navigate across all tracked telemetry via `Cmd+K`.
- **AI Analytics**: Integrated Claude API on the backend to explain complex space anomalies and hazardous events.
- **Background Jobs & Caching**: Celery background tasks polling NASA APIs and Redis-powered caching for low-latency updates.

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **State Management**: Zustand, React Query
- **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Real-time**: Native WebSocket integration

### Backend
- **Web Framework**: FastAPI (Python)
- **Database**: PostgreSQL (SQLAlchemy v2)
- **Caching & Queue**: Redis & Celery
- **API Clients**: HTTPX (integrating NASA Open APIs & Launch Library API)
- **AI Integration**: Anthropic Claude API

## Setup & Installation

### Backend Setup

#### Local Setup
1. Navigate to the backend directory and create a virtual environment:
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

#### Docker Compose Setup
Run all services (Database, Redis, FastAPI app, Celery worker) via Docker Compose:
```bash
docker-compose up --build
```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
