"""
Wasify AI - Model Training Script
==================================
Trains a MobileNetV2-based waste classifier using transfer learning.

USAGE:
    # First, set up the dataset:
    python dataset_setup.py --synthetic   # for testing
    # OR follow dataset_setup.py instructions for real data

    # Then train:
    python train.py

OUTPUT:
    - ai-model/runs/best_model.h5      (Keras saved model)
    - ai-model/runs/training_plot.png  (accuracy/loss curves)

After training, convert to TFLite:
    python convert_to_tflite.py
"""
import os
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

CATEGORIES = [
    "Plastic", "Cardboard", "Glass", "Metal", "Paper", "Organic",
    "E-Waste", "Textile", "Medical", "Battery", "Styrofoam", "General_Trash",
]

NUM_CLASSES = len(CATEGORIES)
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_FROZEN = 10    # epochs with base model frozen (feature extraction)
EPOCHS_FINETUNE = 10  # epochs fine-tuning top layers
LEARNING_RATE = 1e-3
FINETUNE_LR = 1e-5

DATASET_DIR = Path("dataset")
RUNS_DIR = Path("runs")
RUNS_DIR.mkdir(exist_ok=True)


def build_data_pipeline():
    """Create train/val/test datasets with augmentation."""
    train_aug = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.1),
        layers.RandomBrightness(0.15),
        layers.RandomContrast(0.15),
    ])

    def load_split(split: str, augment: bool = False):
        ds = keras.utils.image_dataset_from_directory(
            DATASET_DIR / split,
            labels="inferred",
            label_mode="categorical",
            class_names=CATEGORIES,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            shuffle=(split == "train"),
            seed=42,
        )
        # Normalize to [0, 1]
        ds = ds.map(lambda x, y: (x / 255.0, y), num_parallel_calls=tf.data.AUTOTUNE)
        if augment:
            ds = ds.map(lambda x, y: (train_aug(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
        return ds.prefetch(tf.data.AUTOTUNE)

    train_ds = load_split("train", augment=True)
    val_ds = load_split("val")
    test_ds = load_split("test")

    return train_ds, val_ds, test_ds


def build_model():
    """Build MobileNetV2 transfer learning model."""
    base_model = keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # freeze initially

    inputs = keras.Input(shape=(*IMG_SIZE, 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

    model = keras.Model(inputs, outputs)
    return model, base_model


def train():
    print("=" * 60)
    print(" Wasify AI - Waste Classifier Training")
    print("=" * 60)
    print(f"  Categories: {NUM_CLASSES}")
    print(f"  Image size: {IMG_SIZE}")
    print(f"  Batch size: {BATCH_SIZE}")
    print()

    # Check dataset exists
    if not (DATASET_DIR / "train").exists():
        print("[ERROR] Dataset not found!")
        print("Run: python dataset_setup.py --synthetic")
        return

    train_ds, val_ds, test_ds = build_data_pipeline()
    model, base_model = build_model()

    # Phase 1: Feature extraction (frozen base)
    print("[Phase 1] Feature extraction (base model frozen)...")
    model.compile(
        optimizer=keras.optimizers.Adam(LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    callbacks = [
        keras.callbacks.ModelCheckpoint(
            RUNS_DIR / "best_model.h5",
            save_best_only=True,
            monitor="val_accuracy",
            verbose=1,
        ),
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=5,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            verbose=1,
        ),
    ]

    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FROZEN,
        callbacks=callbacks,
    )

    # Phase 2: Fine-tuning (unfreeze top layers)
    print("\n[Phase 2] Fine-tuning top layers...")
    base_model.trainable = True
    # Freeze all but the last 30 layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(FINETUNE_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FINETUNE,
        callbacks=callbacks,
    )

    # Evaluate
    print("\n[Evaluation] Testing on held-out test set...")
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"  Test accuracy: {test_acc:.4f} ({test_acc*100:.1f}%)")
    print(f"  Test loss:     {test_loss:.4f}")

    # Save results
    results = {
        "test_accuracy": float(test_acc),
        "test_loss": float(test_loss),
        "categories": CATEGORIES,
        "img_size": IMG_SIZE,
    }
    with open(RUNS_DIR / "results.json", "w") as f:
        json.dump(results, f, indent=2)

    # Plot training curves
    _plot_history([history1, history2])

    print(f"\n[OK] Model saved to: {RUNS_DIR / 'best_model.h5'}")
    print("     Next step: python convert_to_tflite.py")


def _plot_history(histories):
    try:
        import matplotlib.pyplot as plt
        acc = []
        val_acc = []
        loss = []
        val_loss = []
        for h in histories:
            acc += h.history["accuracy"]
            val_acc += h.history["val_accuracy"]
            loss += h.history["loss"]
            val_loss += h.history["val_loss"]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        ax1.plot(acc, label="Train Accuracy")
        ax1.plot(val_acc, label="Val Accuracy")
        ax1.set_title("Model Accuracy")
        ax1.set_xlabel("Epoch")
        ax1.legend()

        ax2.plot(loss, label="Train Loss")
        ax2.plot(val_loss, label="Val Loss")
        ax2.set_title("Model Loss")
        ax2.set_xlabel("Epoch")
        ax2.legend()

        plt.tight_layout()
        plt.savefig(RUNS_DIR / "training_plot.png", dpi=150)
        print(f"[OK] Training plot saved to: {RUNS_DIR / 'training_plot.png'}")
    except Exception as e:
        print(f"[WARN] Could not save plot: {e}")


if __name__ == "__main__":
    train()
