# Wasify AI — API Reference

Base URL: `http://localhost:8000` (local) or your Railway deployment URL

Interactive docs: `http://localhost:8000/docs` (Swagger UI)

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT tokens |
| POST | `/auth/refresh` | Refresh access token |

**POST /auth/register**
```json
Request:  { "email": "user@email.com", "password": "pass123", "full_name": "John Doe" }
Response: { "id": "uuid", "email": "...", "total_points": 0, ... }
```

**POST /auth/login**
```json
Request:  { "email": "user@email.com", "password": "pass123" }
Response: { "access_token": "...", "refresh_token": "...", "token_type": "bearer" }
```

---

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | ✓ | Get current user profile |
| PATCH | `/users/me` | ✓ | Update user name |

---

### Detections

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/detections` | ✓ | List user's scan history |
| POST | `/detections/classify` | ✓ | Upload image, get AI classification |
| POST | `/detections` | ✓ | Save on-device detection result |
| GET | `/detections/{id}` | ✓ | Get single detection |

**POST /detections/classify** (multipart/form-data)
```
image: <file>   (JPEG/PNG, max 10MB)
```
Response:
```json
{
  "category": "Plastic",
  "confidence": 0.873,
  "points_earned": 10,
  "disposal_guide": {
    "bin_color": "Yellow",
    "method": "Rinse and place in recycling bin...",
    "tips": ["Check the recycling number...", "..."],
    "recyclable": true,
    "hazardous": false
  },
  "all_predictions": [
    {"category": "Plastic", "confidence": 0.873},
    {"category": "Glass", "confidence": 0.062},
    ...
  ]
}
```

---

### Leaderboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leaderboard` | ✓ | Top users by eco points |

Response:
```json
[
  { "rank": 1, "user_id": "...", "full_name": "Alice", "total_points": 850, "scan_count": 42, "is_current_user": false },
  ...
]
```

---

### Rewards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/rewards` | ✓ | List available rewards |
| POST | `/rewards/claim` | ✓ | Claim a reward |
| GET | `/rewards/claimed` | ✓ | List user's claimed rewards |

**POST /rewards/claim**
```json
Request:  { "reward_id": "uuid" }
Response: { "success": true, "new_balance": 450, "message": "Successfully claimed 'Eco Warrior Badge'!" }
```

---

## Waste Categories & Points

| Category | Points | Recyclable | Hazardous |
|----------|--------|------------|-----------|
| Plastic | 10 | ✅ | ❌ |
| Cardboard | 10 | ✅ | ❌ |
| Glass | 12 | ✅ | ❌ |
| Metal | 12 | ✅ | ❌ |
| Paper | 8 | ✅ | ❌ |
| Organic | 8 | ❌ | ❌ |
| E-Waste | 25 | ✅ | ⚠️ |
| Textile | 15 | ✅ | ❌ |
| Medical | 25 | ❌ | ⚠️ |
| Battery | 25 | ✅ | ⚠️ |
| Styrofoam | 10 | ❌ | ❌ |
| General Trash | 5 | ❌ | ❌ |
