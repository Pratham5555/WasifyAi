# Wasify AI — Technology Stack

## Comparison Table

| Layer | Technology | Why This Choice | Alternative Considered |
|-------|------------|-----------------|------------------------|
| Mobile Framework | React Native 0.73 + TypeScript | Cross-platform, large ecosystem, TS safety | Flutter (less JS ecosystem), Expo (less native control) |
| State Management | Zustand | Lightweight, no boilerplate, TS-first | Redux Toolkit (heavier), MobX (complex) |
| Navigation | React Navigation v6 | De-facto standard, native stack performance | React Native Navigation (more complex setup) |
| Camera | react-native-vision-camera v3 | Best performance, frame processor support | react-native-camera (deprecated) |
| On-device AI | react-native-fast-tflite | Native bridge, GPU delegate support | ONNX Runtime Mobile (less community) |
| HTTP Client | Axios | Interceptors, good TypeScript support | Fetch API (no interceptors), ky (less popular) |
| Offline Storage | AsyncStorage + Zustand persist | Simple, reliable, built-in persistence | SQLite (overkill for this use case) |
| Animations | React Native Reanimated 3 | Runs on UI thread, smooth | Animated API (JS thread, less smooth) |
| Backend Framework | FastAPI | Fast, async, auto-docs, Python type hints | Django REST (heavier), Flask (less batteries) |
| Database | SQLite (dev) / PostgreSQL (prod) | SQLite = zero setup; PostgreSQL = production scale | MySQL (less JSON support), MongoDB (relational data fits SQL) |
| ORM | SQLAlchemy 2.0 | Mature, pythonic, great migration support | Tortoise ORM (less mature), Peewee (less features) |
| Auth | JWT (python-jose) | Stateless, mobile-friendly, refresh tokens | Session cookies (stateful, mobile-unfriendly) |
| Password Hashing | Argon2 (passlib) | Winner of Password Hashing Competition | bcrypt (older, less secure), SHA (never for passwords) |
| AI Model | MobileNetV2 → TFLite | Compact, fast, ImageNet pretrained, mobile-optimized | YOLOv8 (overkill for classification), EfficientNet (larger) |
| Deployment | Railway | Free tier, Docker support, easy env vars | Render (slower cold starts), Heroku (no free tier) |
| Testing (Backend) | pytest + httpx | Simple, async support, good fixtures | unittest (verbose), nose (deprecated) |
| Testing (Mobile) | Jest + Testing Library | Industry standard, good React Native support | Detox (E2E, complex setup) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React Native App                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Zustand │  │  Axios   │  │  Vision Camera     │ │
│  │  Stores  │  │  API     │  │  + TFLite Model    │ │
│  └──────────┘  └────┬─────┘  └────────────────────┘ │
└───────────────────┬─┴──────────────────────────────┘
                    │ REST API (JSON)
                    │
┌───────────────────▼──────────────────────────────────┐
│              FastAPI Backend                          │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Auth Routes │  │ Detection  │  │   Rewards    │ │
│  │  (JWT)       │  │ + Classify │  │  Leaderboard │ │
│  └──────────────┘  └────────────┘  └──────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │       SQLAlchemy ORM + Alembic Migrations       │ │
│  └───────────────────────┬─────────────────────────┘ │
└──────────────────────────┼───────────────────────────┘
                           │
            ┌──────────────▼──────────────┐
            │     SQLite (local dev)      │
            │  PostgreSQL (production)    │
            └─────────────────────────────┘
```

## AI Model Architecture

```
Input: 224×224×3 image (normalized 0-1)
          │
          ▼
  MobileNetV2 Base
  (pretrained ImageNet weights)
  155 layers, frozen initially
          │
          ▼
  GlobalAveragePooling2D
          │
          ▼
  Dropout(0.3)
          │
          ▼
  Dense(256, ReLU)
          │
          ▼
  Dropout(0.2)
          │
          ▼
  Dense(12, Softmax)
          │
          ▼
Output: 12 class probabilities
```
