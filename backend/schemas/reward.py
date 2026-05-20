from datetime import datetime
from pydantic import BaseModel


class RewardOut(BaseModel):
    id: str
    name: str
    description: str
    cost_points: int
    icon: str
    category: str
    is_active: bool

    class Config:
        from_attributes = True


class UserRewardOut(BaseModel):
    id: str
    reward_id: str
    claimed_at: datetime
    reward: RewardOut

    class Config:
        from_attributes = True


class ClaimRewardRequest(BaseModel):
    reward_id: str
