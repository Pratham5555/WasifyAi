"""
Wasify AI - Convert Keras model to TensorFlow Lite
===================================================

Run AFTER training:
    python convert_to_tflite.py

This produces: ai-model/runs/best_float32.tflite

Then copy the .tflite file to the Android assets:
    copy runs\\best_float32.tflite ..\\mobile\\android\\app\\src\\main\\assets\\
"""
import json
from pathlib import Path
import numpy as np

MODEL_PATH = Path("runs/best_model.h5")
OUTPUT_PATH = Path("runs/best_float32.tflite")
MOBILE_ASSETS = Path("../mobile/android/app/src/main/assets")

CATEGORIES = [
    "Plastic", "Cardboard", "Glass", "Metal", "Paper", "Organic",
    "E-Waste", "Textile", "Medical", "Battery", "Styrofoam", "General_Trash",
]


def convert():
    try:
        import tensorflow as tf
    except ImportError:
        print("[ERROR] TensorFlow not installed. Run: pip install tensorflow")
        return

    if not MODEL_PATH.exists():
        print(f"[ERROR] Model not found at {MODEL_PATH}")
        print("Run: python train.py first")
        return

    print("Loading Keras model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    model.summary()

    print("\nConverting to TFLite (float32)...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = []  # float32 - best accuracy
    tflite_model = converter.convert()

    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUTPUT_PATH, "wb") as f:
        f.write(tflite_model)

    size_mb = OUTPUT_PATH.stat().st_size / 1024 / 1024
    print(f"[OK] TFLite model saved: {OUTPUT_PATH} ({size_mb:.1f} MB)")

    # Verify the model with a sample inference
    print("\nVerifying TFLite model...")
    interpreter = tf.lite.Interpreter(model_path=str(OUTPUT_PATH))
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print(f"  Input shape:  {input_details[0]['shape']}")
    print(f"  Output shape: {output_details[0]['shape']}")

    # Test inference with random input
    dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
    interpreter.set_tensor(input_details[0]["index"], dummy_input)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]["index"])
    predicted_class = CATEGORIES[np.argmax(output[0])]
    print(f"  Test inference: {predicted_class} (confidence: {output[0].max():.3f})")
    print("[OK] Model verified successfully!")

    # Save labels file
    labels_path = Path("runs/labels.txt")
    with open(labels_path, "w") as f:
        for cat in CATEGORIES:
            f.write(cat + "\n")
    print(f"[OK] Labels saved to: {labels_path}")

    # Copy to mobile assets
    if MOBILE_ASSETS.exists():
        import shutil
        dest = MOBILE_ASSETS / "best_float32.tflite"
        shutil.copy(OUTPUT_PATH, dest)
        print(f"[OK] Copied to mobile assets: {dest}")
    else:
        print(f"\n[!] Mobile assets directory not found at: {MOBILE_ASSETS}")
        print("    Manually copy the file:")
        print(f"    copy {OUTPUT_PATH} mobile\\android\\app\\src\\main\\assets\\best_float32.tflite")

    print("""
========================================================
 NEXT STEPS TO USE THE MODEL IN THE APP:
========================================================
1. Copy best_float32.tflite to:
   mobile/android/app/src/main/assets/

2. In CameraScreen.tsx, enable on-device mode:
   - Import loadTensorflowModel from react-native-fast-tflite
   - Load: const model = await loadTensorflowModel(require('../../assets/models/best_float32.tflite'))
   - The model takes [1, 224, 224, 3] float32 input (normalized 0-1)
   - Output is [1, 12] softmax probabilities

3. Category order matches CATEGORIES list above (index 0 = Plastic, etc.)
========================================================
""")


if __name__ == "__main__":
    convert()
