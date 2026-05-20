# Wasify AI — Presentation Guide

## Slide 1: Title
**Wasify AI**
*AI-Powered Waste Management & Eco Rewards*
> "Smart waste. Greener future."

---

## Slide 2: Problem Statement
- 🌍 2.01 billion tonnes of municipal waste generated annually
- 🗑️ Only 16% properly recycled globally
- ❓ Most people don't know WHICH bin to use for specific items
- 📱 No intuitive, real-time tool to guide everyday waste decisions

---

## Slide 3: Our Solution
**Wasify AI** — Point. Scan. Learn. Earn.

| Step | What happens |
|------|-------------|
| 1️⃣ Point | Open app, aim camera at any waste item |
| 2️⃣ Scan | AI classifies into 1 of 12 waste categories |
| 3️⃣ Learn | Get exact disposal instructions + bin color |
| 4️⃣ Earn | Earn eco-points, climb leaderboard, claim rewards |

---

## Slide 4: Key Features
- **12-Category AI Classifier** — Plastic, Glass, Metal, Paper, Cardboard, Organic, E-Waste, Textile, Medical, Battery, Styrofoam, General Trash
- **Real-time Camera Detection** — React Native Vision Camera with live preview
- **Disposal Guidance** — Exact bin color, method, recycling tips, hazard warnings
- **Eco Points System** — Gamified rewards (E-Waste = 25 pts, hazardous items worth more)
- **Day Streaks** — Encourages daily scanning habits
- **Global Leaderboard** — Compete with other eco warriors
- **Rewards Store** — Claim badges and achievements with points
- **Offline-First** — Caches pending scans, syncs when online
- **Dark Eco-Tech UI** — Beautiful, unique design with gradient animations

---

## Slide 5: Tech Stack
| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.73 + TypeScript |
| Camera | react-native-vision-camera v3 |
| On-device AI | TensorFlow Lite (react-native-fast-tflite) |
| State | Zustand + AsyncStorage (offline-first) |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (access + refresh tokens) |
| AI Model | MobileNetV2 → TFLite (transfer learning) |
| Deployment | Railway (backend) |

---

## Slide 6: AI Model Architecture
```
Input Image (224×224)
       ↓
MobileNetV2 (pretrained ImageNet)
       ↓
GlobalAveragePooling2D
       ↓
Dense(256, ReLU) + Dropout
       ↓
Dense(12, Softmax)
       ↓
12 Waste Category Probabilities
```
- Transfer learning from ImageNet weights
- Fine-tuned on waste classification dataset
- Converted to TFLite float32 for mobile inference
- Fallback to API classification if model not on device

---

## Slide 7: Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Camera permissions & native setup | react-native-permissions library, step-by-step native config |
| TFLite model not available at runtime | Graceful API fallback — app works without the model |
| No waste dataset initially | Synthetic dataset generator for testing + TrashNet for real training |
| Offline scanning | Zustand persist + AsyncStorage queue, sync on reconnect |
| Android-Windows dev (no Mac) | Windows-specific setup script (setup.bat), AVD emulator |
| JWT expiry handling | Axios interceptor catches 401, auto-clears token |
| Real-time points update | Pull-to-refresh on every screen, Zustand store updates |

---

## Slide 8: Business & Impact Model
- **Users scan daily** → build habit → increase eco awareness
- **Points gamification** → retention → community building
- **Leaderboard** → social competition → viral growth
- **Future monetization**: brand partnerships (reward vouchers), B2B API for waste management companies, municipality licensing

---

## Slide 9: Demo Flow
1. Open app → Splash animation → Onboarding slides
2. Register account (email + password)
3. Home screen: see your points, recent scans, streak
4. Camera tab: scan a waste item (tap capture)
5. Result screen: see category + disposal guide + points earned
6. History: all past scans with confidence scores
7. Leaderboard: see where you rank globally
8. Profile: claim rewards, view achievements

---

## Slide 10: Future Roadmap
- [ ] Real TrashNet model training (production accuracy)
- [ ] On-device inference with GPU delegate (faster, offline)
- [ ] Barcode scan → product waste type lookup
- [ ] Location-based nearest recycling center map
- [ ] Social sharing of eco milestones
- [ ] iOS support
- [ ] AR overlay (real-time bounding boxes)
- [ ] Company/school team leaderboards
