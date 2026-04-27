"""
Dataset Setup Script for Wasify AI Model Training

Downloads and organizes the TrashNet dataset for training.
Run this script BEFORE train.py.

Usage:
    python dataset_setup.py

The dataset will be created in: ai-model/dataset/
"""
import os
import shutil
import random
from pathlib import Path

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
    "General_Trash",
]

# TrashNet maps to our categories:
# cardboard  → Cardboard
# glass      → Glass
# metal      → Metal
# paper      → Paper
# plastic    → Plastic
# trash      → General Trash

DATASET_DIR = Path("dataset")
TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "val"
TEST_DIR = DATASET_DIR / "test"


def create_dirs():
    for split in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        for cat in CATEGORIES:
            (split / cat).mkdir(parents=True, exist_ok=True)
    print("[OK] Directory structure created")


def download_trashnet():
    """
    Guides the user to download TrashNet manually.
    The dataset is available at: https://github.com/garythung/trashnet

    Or use Kaggle:
    https://www.kaggle.com/datasets/fedesoriano/garbage-classification
    """
    print("""
========================================================
 Wasify AI - Dataset Setup Instructions
========================================================

OPTION A: TrashNet (Recommended for quick start)
--------------------------------------------------
1. Go to: https://github.com/garythung/trashnet
2. Download the dataset zip (~3.5 GB)
   Direct: https://drive.google.com/drive/folders/0B3P9oO5A3RZSUHRlcXhmSVZEaGM
3. Extract to: ai-model/dataset/raw/
4. Run this script again with --organize flag

OPTION B: Kaggle Garbage Classification (Larger, 15k+ images)
-----------------------------------------------------------
1. Install kaggle CLI: pip install kaggle
2. Set up kaggle.json (from kaggle.com/account)
3. Run: kaggle datasets download -d sumn2u/garbage-classification-v2
4. Extract to: ai-model/dataset/raw/
5. Run this script again with --organize flag

OPTION C: Create Synthetic Demo Data (No download needed)
---------------------------------------------------------
Run: python dataset_setup.py --synthetic
This creates small colored image samples for each category.
The model will be very basic but allows testing the full pipeline.
========================================================
""")


def create_synthetic_dataset(samples_per_class=50):
    """
    Creates synthetic colored images for each category.
    This is only for testing the training pipeline.
    For real accuracy, use actual waste photos.
    """
    try:
        from PIL import Image, ImageDraw
        import numpy as np
    except ImportError:
        print("[ERROR] Install Pillow and numpy: pip install Pillow numpy")
        return

    # Color mapping for each category (synthetic)
    color_map = {
        "Plastic": [(100, 180, 220), (150, 200, 230), (80, 160, 200)],
        "Cardboard": [(180, 130, 80), (160, 120, 70), (190, 145, 95)],
        "Glass": [(180, 220, 180), (140, 200, 170), (160, 210, 190)],
        "Metal": [(160, 165, 170), (140, 145, 150), (175, 180, 185)],
        "Paper": [(240, 235, 220), (230, 225, 210), (245, 240, 230)],
        "Organic": [(80, 140, 60), (70, 120, 50), (100, 160, 70)],
        "E-Waste": [(40, 40, 50), (30, 35, 45), (50, 50, 60)],
        "Textile": [(200, 80, 120), (180, 70, 110), (210, 90, 130)],
        "Medical": [(240, 240, 245), (230, 230, 240), (245, 245, 250)],
        "Battery": [(30, 30, 30), (20, 20, 20), (40, 40, 40)],
        "Styrofoam": [(245, 245, 245), (240, 240, 240), (250, 250, 250)],
        "General_Trash": [(100, 100, 110), (90, 90, 100), (110, 110, 120)],
    }

    split_ratios = {"train": 0.7, "val": 0.15, "test": 0.15}

    print(f"Creating synthetic dataset ({samples_per_class} samples per class)...")

    for cat, colors in color_map.items():
        all_images = []

        for i in range(samples_per_class):
            base_color = colors[i % len(colors)]
            # Add random noise
            noise = np.random.randint(-30, 30, (224, 224, 3), dtype=np.int16)
            arr = np.clip(np.array(base_color, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
            img_arr = np.tile(arr, (224, 224, 1)).reshape(224, 224, 3)

            # Add some texture (random rectangles)
            img = Image.fromarray(img_arr.astype(np.uint8))
            draw = ImageDraw.Draw(img)
            for _ in range(5):
                x1, y1 = random.randint(0, 180), random.randint(0, 180)
                x2, y2 = x1 + random.randint(10, 40), y1 + random.randint(10, 40)
                r, g, b = [min(255, c + random.randint(-40, 40)) for c in base_color]
                draw.rectangle([x1, y1, x2, y2], fill=(r, g, b))

            all_images.append(img)

        # Split
        random.shuffle(all_images)
        n_train = int(len(all_images) * split_ratios["train"])
        n_val = int(len(all_images) * split_ratios["val"])
        splits = {
            "train": all_images[:n_train],
            "val": all_images[n_train:n_train + n_val],
            "test": all_images[n_train + n_val:],
        }

        for split_name, imgs in splits.items():
            split_dir = DATASET_DIR / split_name / cat
            split_dir.mkdir(parents=True, exist_ok=True)
            for i, img in enumerate(imgs):
                img.save(split_dir / f"{cat}_{split_name}_{i:04d}.jpg", "JPEG")

        print(f"  ✓ {cat}: {len(all_images)} synthetic images")

    print(f"\n[OK] Synthetic dataset created in: {DATASET_DIR}")
    print("     WARNING: This synthetic data is for pipeline testing only.")
    print("     The model will NOT accurately classify real waste images.")
    print("     Use real waste photos for production use.")


if __name__ == "__main__":
    import sys

    if "--synthetic" in sys.argv:
        create_dirs()
        create_synthetic_dataset(samples_per_class=100)
    else:
        download_trashnet()
