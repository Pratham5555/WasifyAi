import os
import uuid
import random
from datetime import datetime, timezone, date
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from core.config import settings
from core.deps import get_current_user
from database import get_db
from models.detection import Detection, CATEGORY_POINTS, DISPOSAL_GUIDE, WASTE_CATEGORIES
from models.user import User
from schemas.detection import DetectionOut, ClassificationResult
from services.classifier import classify_image

router = APIRouter(prefix="/detections", tags=["Detections"])


@router.get("", response_model=List[DetectionOut])
def list_detections(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Detection)
        .filter(Detection.user_id == current_user.id)
        .order_by(Detection.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/classify", response_model=ClassificationResult)
async def classify(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload an image and get AI waste classification."""
    # Validate file type
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are supported")

    # Save uploaded image
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    filename = f"{uuid.uuid4()}.jpg"
    file_path = upload_dir / filename

    contents = await image.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large")

    with open(file_path, "wb") as f:
        f.write(contents)

    # Classify the image
    category, confidence, all_predictions = classify_image(str(file_path))
    points = CATEGORY_POINTS.get(category, 5)
    guide = DISPOSAL_GUIDE.get(category, DISPOSAL_GUIDE["General Trash"])

    # Save detection to DB
    detection = Detection(
        user_id=current_user.id,
        category=category,
        confidence=confidence,
        image_path=str(file_path),
        points_earned=points,
        source="api",
    )
    db.add(detection)

    # Update user stats
    _update_user_stats(current_user, points, db)

    db.commit()

    return ClassificationResult(
        category=category,
        confidence=confidence,
        points_earned=points,
        disposal_guide={
            "bin_color": guide["bin_color"],
            "method": guide["method"],
            "tips": guide["tips"],
            "recyclable": guide["recyclable"],
            "hazardous": guide["hazardous"],
        },
        all_predictions=all_predictions,
    )


@router.post("", response_model=DetectionOut, status_code=status.HTTP_201_CREATED)
def create_detection(
    category: str = Form(...),
    confidence: float = Form(...),
    source: str = Form(default="on_device"),
    image: UploadFile = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a detection result (from on-device inference)."""
    if category not in WASTE_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unknown category: {category}")

    image_path = None
    if image:
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)
        filename = f"{uuid.uuid4()}.jpg"
        file_path = upload_dir / filename
        with open(file_path, "wb") as f:
            f.write(image.file.read())
        image_path = str(file_path)

    points = CATEGORY_POINTS.get(category, 5)
    detection = Detection(
        user_id=current_user.id,
        category=category,
        confidence=confidence,
        image_path=image_path,
        points_earned=points,
        source=source,
    )
    db.add(detection)
    _update_user_stats(current_user, points, db)
    db.commit()
    db.refresh(detection)
    return detection


@router.get("/{detection_id}", response_model=DetectionOut)
def get_detection(
    detection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detection = (
        db.query(Detection)
        .filter(Detection.id == detection_id, Detection.user_id == current_user.id)
        .first()
    )
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    return detection


def _update_user_stats(user: User, points: int, db: Session):
    """Update user scan count, points, and streak."""
    user.total_points += points
    user.scan_count += 1

    today = date.today()
    if user.last_scan_date:
        last_date = user.last_scan_date.date() if hasattr(user.last_scan_date, 'date') else user.last_scan_date
        delta = (today - last_date).days
        if delta == 1:
            user.streak_days += 1
        elif delta > 1:
            user.streak_days = 1
    else:
        user.streak_days = 1

    user.last_scan_date = datetime.now(timezone.utc)
