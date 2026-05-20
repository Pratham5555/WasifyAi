from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.deps import get_current_user
from database import get_db
from models.user import User

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    full_name: str
    total_points: int
    scan_count: int
    is_current_user: bool


@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )

    return [
        LeaderboardEntry(
            rank=idx + 1,
            user_id=u.id,
            full_name=u.full_name,
            total_points=u.total_points,
            scan_count=u.scan_count,
            is_current_user=(u.id == current_user.id),
        )
        for idx, u in enumerate(users)
    ]
