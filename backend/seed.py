"""
Seed the database with initial rewards data.
Run: python seed.py
"""
import sys
import os

# Ensure we can import project modules
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Base, engine
from models import User, Detection, Reward, UserReward  # noqa: F401 - register models

# Create all tables
Base.metadata.create_all(bind=engine)

REWARDS = [
    {
        "name": "Eco Warrior Badge",
        "description": "Awarded to users who complete their first 10 scans. A badge of eco-honor!",
        "cost_points": 50,
        "icon": "shield",
        "category": "badge",
    },
    {
        "name": "Green Champion",
        "description": "For the dedicated recycler — awarded after 500 points earned.",
        "cost_points": 200,
        "icon": "trophy",
        "category": "badge",
    },
    {
        "name": "Planet Saver",
        "description": "Elite status for eco leaders. Unlock exclusive leaderboard crown.",
        "cost_points": 500,
        "icon": "earth",
        "category": "achievement",
    },
    {
        "name": "Recycle Master",
        "description": "Certificate of excellence in waste management. 25 categories identified.",
        "cost_points": 300,
        "icon": "recycle",
        "category": "achievement",
    },
    {
        "name": "Zero Waste Hero",
        "description": "Identified hazardous waste (E-Waste / Battery / Medical) 5+ times.",
        "cost_points": 150,
        "icon": "star",
        "category": "badge",
    },
    {
        "name": "Streak Starter",
        "description": "Scanned waste 7 days in a row. Keep the streak going!",
        "cost_points": 100,
        "icon": "flame",
        "category": "badge",
    },
    {
        "name": "Community Leader",
        "description": "Reached Top 10 on the leaderboard. The community sees you!",
        "cost_points": 400,
        "icon": "users",
        "category": "achievement",
    },
    {
        "name": "Nature Guardian",
        "description": "Classified 20+ organic waste items for composting.",
        "cost_points": 120,
        "icon": "leaf",
        "category": "badge",
    },
]


def seed():
    db = SessionLocal()
    try:
        existing_count = db.query(Reward).count()
        if existing_count > 0:
            print(f"[OK] Database already seeded ({existing_count} rewards exist). Skipping.")
            return

        for r in REWARDS:
            reward = Reward(**r)
            db.add(reward)

        db.commit()
        print(f"[OK] Seeded {len(REWARDS)} rewards successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
