import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


WASTE_CATEGORIES = [
    "Plastic",
    "Cardboard",
    "Glass",
    "Metal",
    "Paper",
    "Organic",
    "E-Waste",
    "Textile",
    "Medical",
    "Battery",
    "Styrofoam",
    "General Trash",
]

# Points awarded per category
CATEGORY_POINTS = {
    "Plastic": 10,
    "Cardboard": 10,
    "Glass": 12,
    "Metal": 12,
    "Paper": 8,
    "Organic": 8,
    "E-Waste": 25,
    "Textile": 15,
    "Medical": 25,
    "Battery": 25,
    "Styrofoam": 10,
    "General Trash": 5,
}

DISPOSAL_GUIDE = {
    "Plastic": {
        "bin_color": "Yellow",
        "method": "Rinse and place in recycling bin. Remove caps and labels if possible.",
        "tips": ["Check the recycling number (1-7) on the bottom", "Flatten bottles to save space", "Never put plastic bags in recycling bins"],
        "recyclable": True,
        "hazardous": False,
    },
    "Cardboard": {
        "bin_color": "Blue",
        "method": "Flatten boxes and place in paper/cardboard recycling bin. Keep dry.",
        "tips": ["Remove tape and staples when possible", "Break down large boxes", "Wet cardboard cannot be recycled"],
        "recyclable": True,
        "hazardous": False,
    },
    "Glass": {
        "bin_color": "Green",
        "method": "Rinse and place in glass recycling bin. Sort by color if required locally.",
        "tips": ["Never put broken glass in recycling without wrapping", "Remove lids (they go in metal)", "Light bulbs are NOT recyclable here"],
        "recyclable": True,
        "hazardous": False,
    },
    "Metal": {
        "bin_color": "Yellow",
        "method": "Rinse cans and place in recycling. Crush to save space.",
        "tips": ["Both aluminum and steel cans are recyclable", "Remove food residue first", "Foil can also be recycled if clean"],
        "recyclable": True,
        "hazardous": False,
    },
    "Paper": {
        "bin_color": "Blue",
        "method": "Place in paper recycling bin. Keep dry and clean.",
        "tips": ["Shredded paper should go in a bag", "Greasy pizza boxes are NOT recyclable", "Remove plastic windows from envelopes"],
        "recyclable": True,
        "hazardous": False,
    },
    "Organic": {
        "bin_color": "Brown/Green",
        "method": "Compost in garden or food waste bin. Great for creating natural fertilizer.",
        "tips": ["Avoid adding meat or dairy to home compost", "Fruit peels and vegetable scraps are ideal", "Coffee grounds and tea bags are compostable"],
        "recyclable": False,
        "hazardous": False,
    },
    "E-Waste": {
        "bin_color": "Special Drop-off",
        "method": "Take to an e-waste recycling center. NEVER put in regular bins.",
        "tips": ["Wipe personal data before disposal", "Many retailers offer free take-back programs", "Contains valuable metals that can be recovered"],
        "recyclable": True,
        "hazardous": True,
    },
    "Textile": {
        "bin_color": "Clothing Bank",
        "method": "Donate if usable, or drop at textile recycling bank. Do not put in general waste.",
        "tips": ["Even worn-out clothes can be recycled as rags", "Charity shops accept good-condition items", "Some brands have take-back programs"],
        "recyclable": True,
        "hazardous": False,
    },
    "Medical": {
        "bin_color": "Red/Special",
        "method": "Take to pharmacy or medical waste facility. NEVER put in household bins.",
        "tips": ["Sharps go in a sharps container, not loose", "Unused medicines to pharmacy for safe disposal", "Masks and gloves go in general waste"],
        "recyclable": False,
        "hazardous": True,
    },
    "Battery": {
        "bin_color": "Special Drop-off",
        "method": "Take to battery collection point (supermarkets, electronics stores).",
        "tips": ["Tape terminals of lithium batteries before disposal", "Car batteries go to auto shops", "Never put lithium batteries in general waste (fire risk)"],
        "recyclable": True,
        "hazardous": True,
    },
    "Styrofoam": {
        "bin_color": "General Waste",
        "method": "Most areas cannot recycle styrofoam. Check local drop-off locations.",
        "tips": ["Break into smaller pieces for easier disposal", "Some specialty recyclers accept clean styrofoam", "Reduce use by choosing alternatives"],
        "recyclable": False,
        "hazardous": False,
    },
    "General Trash": {
        "bin_color": "Black/Grey",
        "method": "Place in general waste bin. Try to separate any recyclable components first.",
        "tips": ["Try to identify specific category for better disposal", "Reduce waste by buying less packaging", "Check if local council offers additional recycling"],
        "recyclable": False,
        "hazardous": False,
    },
}


class Detection(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    image_path = Column(String, nullable=True)
    points_earned = Column(Integer, default=0, nullable=False)
    source = Column(String, default="api", nullable=False)  # "api" or "on_device"
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
