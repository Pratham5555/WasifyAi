"""
Wasify AI - FastAPI Backend
Run with: uvicorn main:app --reload
API docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from core.config import settings
from database import Base, engine
import models  # noqa: F401 - register all models with SQLAlchemy

from routes import auth, users, detections, leaderboard, rewards

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# Create uploads directory
Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)

app = FastAPI(
    title="Wasify AI API",
    description="AI-powered waste management backend. Classify waste, earn eco-points, save the planet.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow mobile app (React Native) and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(detections.router)
app.include_router(leaderboard.router)
app.include_router(rewards.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "Wasify AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
