from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import get_current_user
from database import get_db
from models.reward import Reward, UserReward
from models.user import User
from schemas.reward import RewardOut, ClaimRewardRequest

router = APIRouter(prefix="/rewards", tags=["Rewards"])


class ClaimResponse(RewardOut):
    new_balance: int
    message: str


@router.get("", response_model=List[RewardOut])
def list_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Reward).filter(Reward.is_active == True).order_by(Reward.cost_points).all()


@router.post("/claim", status_code=status.HTTP_200_OK)
def claim_reward(
    payload: ClaimRewardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reward = db.query(Reward).filter(Reward.id == payload.reward_id, Reward.is_active == True).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    already_claimed = (
        db.query(UserReward)
        .filter(UserReward.user_id == current_user.id, UserReward.reward_id == reward.id)
        .first()
    )
    if already_claimed:
        raise HTTPException(status_code=400, detail="You already claimed this reward")

    if current_user.total_points < reward.cost_points:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough points. Need {reward.cost_points}, have {current_user.total_points}",
        )

    current_user.total_points -= reward.cost_points
    user_reward = UserReward(user_id=current_user.id, reward_id=reward.id)
    db.add(user_reward)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "new_balance": current_user.total_points,
        "message": f"Successfully claimed '{reward.name}'!",
    }


@router.get("/claimed", response_model=List[dict])
def get_claimed_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    claimed = (
        db.query(UserReward)
        .filter(UserReward.user_id == current_user.id)
        .all()
    )
    result = []
    for ur in claimed:
        reward = db.query(Reward).filter(Reward.id == ur.reward_id).first()
        if reward:
            result.append({
                "id": ur.id,
                "reward_id": ur.reward_id,
                "name": reward.name,
                "icon": reward.icon,
                "claimed_at": ur.claimed_at.isoformat(),
            })
    return result
