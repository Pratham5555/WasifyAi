from datetime import datetime
from typing import Dict, List, Any, Optional
from pydantic import BaseModel


class DetectionCreate(BaseModel):
    category: str
    confidence: float
    source: str = "api"


class DetectionOut(BaseModel):
    id: str
    user_id: str
    category: str
    confidence: float
    points_earned: int
    source: str
    image_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ClassificationResult(BaseModel):
    category: str
    confidence: float
    points_earned: int
    disposal_guide: Dict[str, Any]
    all_predictions: List[Dict[str, Any]]
