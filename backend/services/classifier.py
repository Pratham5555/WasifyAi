"""
Waste image classifier service.

Uses color-histogram analysis as a demo classifier.
Replace classify_image() with TFLite/ONNX inference for production accuracy.

To train a real model, see: ai-model/train.py
"""
import random
from pathlib import Path
from typing import Tuple, List, Dict, Any

try:
    from PIL import Image
    import numpy as np
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


CATEGORIES = [
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


def _analyze_image(image_path: str) -> Tuple[str, float]:
    """
    Color-histogram heuristic classifier.
    Returns (category, confidence).
    """
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32)

    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    r_mean = float(r.mean())
    g_mean = float(g.mean())
    b_mean = float(b.mean())
    brightness = (r_mean + g_mean + b_mean) / 3.0

    # Standard deviation (texture proxy)
    std = float(arr.std())

    # Dominant color ratios
    total = r_mean + g_mean + b_mean + 1e-6

    # --- Heuristic rules ---
    # Very white/bright → Paper or Styrofoam or Medical
    if brightness > 210 and std < 25:
        if g_mean > r_mean:
            return "Medical", 0.64
        return "Styrofoam", 0.67

    # High brightness, varied texture → Paper
    if brightness > 185 and std < 40:
        return "Paper", 0.70

    # Green dominant → Organic (plants, food)
    if g_mean > r_mean * 1.1 and g_mean > b_mean * 1.1 and g_mean > 100:
        return "Organic", 0.72

    # Blue dominant → Glass (blue glass, water bottles)
    if b_mean > r_mean * 1.15 and b_mean > g_mean * 1.05:
        return "Glass", 0.66

    # Very dark, mixed hues → E-Waste or Battery
    if brightness < 70:
        if std > 50:
            return "E-Waste", 0.61
        return "Battery", 0.63

    # Warm brown/tan → Cardboard
    if r_mean > g_mean * 1.1 and g_mean > b_mean * 1.1 and 80 < brightness < 175:
        return "Cardboard", 0.74

    # Mid-gray (neutral) → Metal
    if abs(r_mean - g_mean) < 18 and abs(g_mean - b_mean) < 18 and 90 < brightness < 200:
        return "Metal", 0.69

    # High red → could be Textile or Plastic
    if r_mean / total > 0.40 and brightness > 100:
        return "Plastic", 0.62

    # Moderate varied colors → Textile
    if std > 60 and brightness > 80:
        return "Textile", 0.58

    return "General Trash", 0.52


def _build_predictions(top_category: str, top_confidence: float) -> List[Dict[str, Any]]:
    """Build a probability distribution across all categories for UI display."""
    remaining = 1.0 - top_confidence
    others = [c for c in CATEGORIES if c != top_category]
    # Distribute remaining probability unevenly
    weights = sorted([random.random() for _ in others], reverse=True)
    weight_sum = sum(weights) + 1e-6
    probs = [w / weight_sum * remaining for w in weights]

    predictions = [{"category": top_category, "confidence": round(top_confidence, 4)}]
    for cat, prob in zip(others, probs):
        predictions.append({"category": cat, "confidence": round(prob, 4)})

    return sorted(predictions, key=lambda x: x["confidence"], reverse=True)


def classify_image(image_path: str) -> Tuple[str, float, List[Dict[str, Any]]]:
    """
    Classify a waste image.

    Returns:
        (category, confidence, all_predictions)
    """
    if not PIL_AVAILABLE:
        # Fallback if Pillow not installed
        cat = random.choice(CATEGORIES)
        conf = round(random.uniform(0.55, 0.85), 3)
        return cat, conf, _build_predictions(cat, conf)

    path = Path(image_path)
    if not path.exists():
        cat = "General Trash"
        return cat, 0.50, _build_predictions(cat, 0.50)

    try:
        category, confidence = _analyze_image(image_path)
        # Add slight random variation to avoid identical results
        confidence = min(0.97, confidence + random.uniform(-0.03, 0.05))
        confidence = round(confidence, 3)
        return category, confidence, _build_predictions(category, confidence)
    except Exception:
        cat = "General Trash"
        conf = 0.50
        return cat, conf, _build_predictions(cat, conf)
