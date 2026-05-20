import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    cost_points = Column(Integer, nullable=False)
    icon = Column(String, nullable=False, default="gift")
    category = Column(String, nullable=False, default="badge")  # badge, voucher, achievement
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class UserReward(Base):
    __tablename__ = "user_rewards"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    reward_id = Column(String, ForeignKey("rewards.id"), nullable=False)
    claimed_at = Column(DateTime(timezone=True), default=_now, nullable=False)
