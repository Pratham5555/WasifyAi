# ♻️ Wasify AI

> AI-powered waste management app — scan waste, get disposal tips, earn eco-points.

**React Native (Android) + FastAPI + TensorFlow Lite**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites — Install These First](#prerequisites--install-these-first)
3. [Step 1: Clone & Prepare the Project](#step-1-clone--prepare-the-project)
4. [Step 2: Set Up the Backend](#step-2-set-up-the-backend)
5. [Step 3: Set Up the Mobile App](#step-3-set-up-the-mobile-app)
6. [Step 4: Run the App](#step-4-run-the-app)
7. [Step 5: Deploy Backend to Railway](#step-5-deploy-backend-to-railway)
8. [AI Model Training (Optional)](#ai-model-training-optional)
9. [Troubleshooting](#troubleshooting)
10. [API Endpoints](#api-endpoints)
11. [Environment Variables](#environment-variables)
12. [Project Structure](#project-structure)

---

## Project Overview

Wasify AI classifies waste into **12 categories** using AI and gives you exact disposal instructions + eco-points for every scan.

| Feature | Description |
|---------|-------------|
| 📷 Camera Scan | Point at waste → AI classifies it instantly |
| ♻️ 12 Categories | Plastic, Glass, Metal, Paper, Cardboard, Organic, E-Waste, Textile, Medical, Battery, Styrofoam, General Trash |
| 💡 Disposal Guide | Bin color, disposal method, recycling tips, hazard warnings |
| 🏆 Eco Points | Earn points per scan (hazardous = more points) |
| 📊 Leaderboard | Compete with others globally |
| 🎁 Rewards | Claim badges and achievements with your points |
| 📱 Offline-first | Scans cached locally, synced when online |

---

## Prerequisites — Install These First

> ⚠️ **Do these steps in ORDER. Each one is required.**
> If you skip one, the later steps will fail.

---

### A) Node.js (Required for the mobile app)

1. Go to: **https://nodejs.org/en/download/**
2. Click **"LTS"** (the left green button — Long Term Support)
3. Download the **Windows Installer (.msi)**
4. Run the installer → click Next → Next → Install
5. **Check the box** "Automatically install necessary tools" if it appears
6. After install, open a **new** Command Prompt and verify:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

---

### B) Python 3.11 (Required for the backend)

1. Go to: **https://www.python.org/downloads/**
2. Click **"Download Python 3.11.x"** (any 3.11.x version)
3. Run the installer
4. ✅ **IMPORTANT: Check "Add Python to PATH"** at the bottom of the first screen
5. Click "Install Now"
6. After install, open a **new** Command Prompt and verify:
   ```
   python --version
   ```
   You should see `Python 3.11.x`

---

### C) JDK 17 (Required for Android builds)

1. Go to: **https://www.microsoft.com/openjdk**
2. Under "Download OpenJDK", select:
   - Version: **17**
   - OS: **Windows**
   - Architecture: **x64**
3. Download the **.msi** file and run it
4. After install, open a **new** Command Prompt and verify:
   ```
   java -version
   ```
   You should see something like `openjdk version "17.x.x"`

---

### D) Android Studio (Required for the Android emulator)

This is the biggest install (~3 GB). It gives you the Android SDK and emulator.

1. Go to: **https://developer.android.com/studio**
2. Click **"Download Android Studio"**
3. Run the installer, keep all defaults, click Next/Install
4. First time it opens, it will run a **Setup Wizard** — let it finish (downloads Android SDK, ~1-2 GB more)
5. After setup completes, you're in Android Studio

**Set ANDROID_HOME environment variable:**
1. In Android Studio, go to: `File → Settings → Appearance & Behavior → System Settings → Android SDK`
2. Copy the **"Android SDK Location"** path (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
3. Press Windows key → search "Environment Variables" → click "Edit the system environment variables"
4. Click "Environment Variables..." button
5. Under "System variables", click "New":
   - Variable name: `ANDROID_HOME`
   - Variable value: paste the SDK path from step 2
6. Find the `Path` variable in "System variables" → click Edit → click New → add:
   ```
   %ANDROID_HOME%\platform-tools
   ```
7. Click OK → OK → OK
8. Open a **new** Command Prompt and verify:
   ```
   adb --version
   ```
   You should see `Android Debug Bridge version x.x.x`

**Create a Virtual Device (Android Emulator):**
1. In Android Studio, click **"More Actions"** dropdown → **"Virtual Device Manager"**
2. Click **"Create Device"** (+ button)
3. Select **"Pixel 6"** → click Next
4. Select system image: **"UpsideDownCake" (API 34)** → click Download if needed → Next → Finish
5. Click the ▶️ Play button next to your new device to start the emulator
6. Wait for the Android home screen to appear (first boot takes 2-3 minutes)

---

### E) Git (Required for GitHub)

1. Go to: **https://git-scm.com/download/win**
2. Download and run the installer
3. Keep all defaults, click Next/Install
4. Verify in **new** Command Prompt:
   ```
   git --version
   ```

---

### F) GitHub CLI — gh (Required to create the GitHub repo)

1. Go to: **https://cli.github.com/**
2. Click **"Download for Windows"**
3. Run the installer
4. Verify in **new** Command Prompt:
   ```
   gh --version
   ```

---

## Step 1: Clone & Prepare the Project

Open **Command Prompt** (search "cmd" in Windows Start menu):

```cmd
cd D:\GITHUB\Wasify AI
```

> If this folder already exists with the files, skip to Step 2.

---

## Step 2: Set Up the Backend

Open Command Prompt in the project folder:

```cmd
cd D:\GITHUB\Wasify AI\backend
```

**Create a virtual environment (isolated Python environment):**
```cmd
python -m venv venv
```

**Activate the virtual environment:**
```cmd
venv\Scripts\activate
```
> You'll see `(venv)` appear at the start of your command prompt. This means it's active.

**Install all Python dependencies:**
```cmd
pip install -r requirements.txt
```
> This may take 2-5 minutes. You'll see packages installing.

**Create your .env file:**
```cmd
copy .env.example .env
```

**Initialize the database and seed rewards:**
```cmd
python -c "from database import Base, engine; import models; Base.metadata.create_all(bind=engine); print('DB created!')"
python seed.py
```

You should see:
```
DB created!
[OK] Seeded 8 rewards successfully.
```

**Start the backend server:**
```cmd
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ **Backend is running!** Open your browser and go to: **http://localhost:8000/docs**
You'll see the Swagger UI with all API endpoints. Keep this terminal open.

---

## Step 3: Set Up the Mobile App

Open a **NEW** Command Prompt window (keep the backend terminal open).

```cmd
cd D:\GITHUB\Wasify AI\mobile
```

**Initialize the React Native project:**
> This downloads the React Native base project. Takes 5-10 minutes.

```cmd
npx @react-native-community/cli@latest init WasifyApp --template react-native-template-typescript --skip-install
```

> If asked "Do you want to install this package?" → type `y` and press Enter

**Copy all source files into the initialized project:**

After the init command finishes, you'll have a `WasifyApp` folder created. But since we already have our source files in `mobile/`, we need to merge them. Run:

```cmd
cd D:\GITHUB\Wasify AI
```

Then open File Explorer and:
1. Copy everything from `D:\GITHUB\Wasify AI\mobile\src\` into `D:\GITHUB\Wasify AI\WasifyApp\src\`
2. Copy `D:\GITHUB\Wasify AI\mobile\App.tsx` → replace `D:\GITHUB\Wasify AI\WasifyApp\App.tsx`
3. Copy `D:\GITHUB\Wasify AI\mobile\package.json` → replace `D:\GITHUB\Wasify AI\WasifyApp\package.json`
4. Copy `D:\GITHUB\Wasify AI\mobile\tsconfig.json` → replace `D:\GITHUB\Wasify AI\WasifyApp\tsconfig.json`
5. Copy `D:\GITHUB\Wasify AI\mobile\babel.config.js` → replace `D:\GITHUB\Wasify AI\WasifyApp\babel.config.js`
6. Copy `D:\GITHUB\Wasify AI\mobile\metro.config.js` → replace `D:\GITHUB\Wasify AI\WasifyApp\metro.config.js`
7. Copy `D:\GITHUB\Wasify AI\mobile\__tests__\` → `D:\GITHUB\Wasify AI\WasifyApp\__tests__\`
8. Copy `D:\GITHUB\Wasify AI\mobile\__mocks__\` → `D:\GITHUB\Wasify AI\WasifyApp\__mocks__\`

**Install dependencies:**
```cmd
cd D:\GITHUB\Wasify AI\WasifyApp
npm install --legacy-peer-deps
```
> Takes 5-10 minutes. You'll see packages downloading.

**Find your computer's IP address:**
```cmd
ipconfig
```
Look for **"IPv4 Address"** under your WiFi adapter (looks like `192.168.x.x`).

**Update the API URL in the mobile app:**
Open `D:\GITHUB\Wasify AI\WasifyApp\src\services\api.ts` in any text editor (Notepad is fine).

Find this line:
```typescript
export const BASE_URL = 'http://10.0.2.2:8000';
```

- If using **Android Emulator** on the same PC: keep it as `http://10.0.2.2:8000` (this is correct)
- If using a **physical Android phone**: change to `http://YOUR_IP:8000` (use the IP from ipconfig)

**Configure camera permissions for Android:**

Open `D:\GITHUB\Wasify AI\WasifyApp\android\app\src\main\AndroidManifest.xml` in a text editor.

Find the line `<manifest ...>` and add these lines right after it:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

**Create assets directory for the AI model:**
```cmd
mkdir android\app\src\main\assets
```

---

## Step 4: Run the App

You need **3 things running** at the same time:

**Terminal 1 — Backend (already running from Step 2):**
```
uvicorn main:app --reload
```

**Terminal 2 — Android Emulator:**
- Make sure the Android emulator is open and showing the home screen (started in Prerequisite D)

**Terminal 3 — Metro Bundler (JavaScript server for React Native):**
```cmd
cd D:\GITHUB\Wasify AI\WasifyApp
npx react-native start
```
Wait until you see:
```
Metro waiting on exp://...
```

**Terminal 4 — Build and Install on Emulator:**
Open a **4th** Command Prompt:
```cmd
cd D:\GITHUB\Wasify AI\WasifyApp
npx react-native run-android
```

> This takes 3-8 minutes the first time (compiling Android code).
> You'll see a progress bar. When done, the app opens on the emulator automatically.

✅ **The app should now be running on your emulator!**

---

## Step 5: Deploy Backend to Railway

Railway is a free cloud platform where your backend runs 24/7 online.

### 5.1 — Create a Railway account
1. Go to: **https://railway.app/**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### 5.2 — Create a new project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already connected
4. Select your **WasifyAi** repository
5. Select the **backend** folder as the root

### 5.3 — Set environment variables
In Railway project → **Variables** tab → Add these:
```
SECRET_KEY          = (generate one: open cmd → python -c "import secrets; print(secrets.token_hex(32))")
DATABASE_URL        = (Railway will auto-create a PostgreSQL DB — see below)
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

### 5.4 — Add a PostgreSQL database
In Railway project → **"New"** → **"Database"** → **"Add PostgreSQL"**
- Railway automatically sets `DATABASE_URL` for you!

### 5.5 — Deploy
Railway auto-deploys when you push to GitHub. Your backend URL will be something like:
`https://wasifyai-production.up.railway.app`

### 5.6 — Update mobile app with deployed URL
In `src/services/api.ts`, change:
```typescript
export const BASE_URL = 'http://10.0.2.2:8000';
```
to:
```typescript
export const BASE_URL = 'https://your-app-name.up.railway.app';
```

---

## AI Model Training (Optional)

The app works without training a model (uses API-based classification).
To train a real model for on-device inference:

```cmd
cd D:\GITHUB\Wasify AI\ai-model
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create synthetic test dataset (fast, ~2 min)
python dataset_setup.py --synthetic

# Train the model (~30-60 min depending on your GPU)
python train.py

# Convert to TFLite
python convert_to_tflite.py
```

The `best_float32.tflite` file is automatically copied to the Android assets folder.

---

## Troubleshooting

### "Metro bundler not found" or "npx react-native start" fails
```cmd
npm install -g react-native-cli
```

### Build fails with "JAVA_HOME not set"
1. Find your JDK location: `where java` in cmd
2. Set JAVA_HOME: Windows → Environment Variables → New system variable
   - Name: `JAVA_HOME`
   - Value: `C:\Program Files\Microsoft\jdk-17.x.x.x-hotspot` (your JDK folder)

### App shows "Network Error" when scanning
- Make sure backend is running: `uvicorn main:app --reload` in the backend folder
- For emulator: URL should be `http://10.0.2.2:8000`
- Check `backend/venv` is activated (you see `(venv)` in cmd)

### "Could not connect to development server"
- Make sure Metro is running: `npx react-native start`
- Shake the phone/emulator → "Reload" → or press `R` in Metro terminal

### Camera permission denied
- In emulator: Settings → Apps → WasifyApp → Permissions → Camera → Allow

### Android build fails with Gradle error
```cmd
cd android
gradlew clean
cd ..
npx react-native run-android
```

### Python "ModuleNotFoundError"
Make sure you activated the virtual environment:
```cmd
cd backend
venv\Scripts\activate
```
You should see `(venv)` in your prompt.

### `npm install` fails with peer dependency errors
```cmd
npm install --legacy-peer-deps
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, get JWT tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| GET | `/users/me` | ✅ | Get current user profile |
| PATCH | `/users/me` | ✅ | Update user name |
| GET | `/detections` | ✅ | List scan history |
| POST | `/detections/classify` | ✅ | Upload image → AI classification |
| POST | `/detections` | ✅ | Save on-device detection |
| GET | `/leaderboard` | ✅ | Get eco points leaderboard |
| GET | `/rewards` | ✅ | List available rewards |
| POST | `/rewards/claim` | ✅ | Claim a reward with points |
| GET | `/rewards/claimed` | ✅ | List user's claimed rewards |

Full interactive docs: `http://localhost:8000/docs`

---

## Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `abc123...` (32+ chars) | JWT signing secret — CHANGE THIS |
| `DATABASE_URL` | `sqlite:///./wasify.db` | DB connection. SQLite for local, PostgreSQL for prod |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT access token expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | JWT refresh token expiry |
| `UPLOAD_DIR` | `uploads` | Folder to store uploaded images |
| `MAX_UPLOAD_SIZE_MB` | `10` | Max image upload size |

---

## Project Structure

```
Wasify AI/
├── README.md                    ← You are here
├── setup.bat                    ← Automated setup (run this!)
├── .gitignore
│
├── backend/                     ← FastAPI Python backend
│   ├── main.py                  ← App entry point
│   ├── database.py              ← SQLAlchemy setup
│   ├── requirements.txt         ← Python dependencies
│   ├── .env.example             ← Copy to .env
│   ├── seed.py                  ← Seeds rewards data
│   ├── railway.json             ← Railway deployment config
│   ├── core/
│   │   ├── config.py            ← Settings from .env
│   │   ├── security.py          ← JWT + password hashing
│   │   └── deps.py              ← Auth dependency injection
│   ├── models/
│   │   ├── user.py              ← User database model
│   │   ├── detection.py         ← Detection + 12 categories + disposal guide
│   │   └── reward.py            ← Rewards + UserRewards models
│   ├── schemas/                 ← Pydantic request/response schemas
│   ├── routes/                  ← API route handlers
│   ├── services/
│   │   └── classifier.py        ← Image classification (color-histogram demo)
│   └── tests/                   ← pytest tests
│
├── mobile/                      ← React Native source files
│   ├── App.tsx                  ← Root component
│   ├── package.json             ← JS dependencies
│   ├── src/
│   │   ├── theme/               ← Colors, spacing, typography
│   │   ├── navigation/          ← React Navigation setup
│   │   ├── store/               ← Zustand state management
│   │   ├── services/
│   │   │   └── api.ts           ← All API calls (UPDATE BASE_URL HERE)
│   │   ├── components/          ← Reusable UI components
│   │   ├── screens/             ← App screens
│   │   │   ├── SplashScreen     ← Animated launch screen
│   │   │   ├── OnboardingScreen ← 3-slide intro
│   │   │   ├── LoginScreen      ← Authentication
│   │   │   ├── RegisterScreen
│   │   │   ├── HomeScreen       ← Dashboard + stats
│   │   │   ├── CameraScreen     ← Live camera + capture
│   │   │   ├── ResultScreen     ← Classification result
│   │   │   ├── HistoryScreen    ← Past scans
│   │   │   ├── LeaderboardScreen← Rankings
│   │   │   └── ProfileScreen    ← Profile + rewards
│   │   ├── utils/               ← Category info, helpers
│   │   └── types/               ← TypeScript interfaces
│   └── __tests__/               ← Jest tests
│
├── ai-model/                    ← AI training pipeline
│   ├── dataset_setup.py         ← Download/generate training data
│   ├── train.py                 ← MobileNetV2 transfer learning
│   └── convert_to_tflite.py     ← Export to TFLite format
│
└── docs/
    ├── API.md                   ← Full API reference
    ├── TECH_STACK.md            ← Tech choices & architecture
    └── PRESENTATION.md          ← Slide deck content
```

---

## 12 Waste Categories

| # | Category | Points | Bin Color | Recyclable | Hazardous |
|---|----------|--------|-----------|------------|-----------|
| 1 | 🧴 Plastic | 10 | Yellow | ✅ | ❌ |
| 2 | 📦 Cardboard | 10 | Blue | ✅ | ❌ |
| 3 | 🍶 Glass | 12 | Green | ✅ | ❌ |
| 4 | 🥫 Metal | 12 | Yellow | ✅ | ❌ |
| 5 | 📄 Paper | 8 | Blue | ✅ | ❌ |
| 6 | 🌿 Organic | 8 | Brown | ❌ | ❌ |
| 7 | 💻 E-Waste | **25** | Special | ✅ | ⚠️ |
| 8 | 👕 Textile | 15 | Clothing Bank | ✅ | ❌ |
| 9 | 💊 Medical | **25** | Red/Special | ❌ | ⚠️ |
| 10 | 🔋 Battery | **25** | Special | ✅ | ⚠️ |
| 11 | ☁️ Styrofoam | 10 | General | ❌ | ❌ |
| 12 | 🗑️ General Trash | 5 | Black | ❌ | ❌ |

---

Made with 💚 for a greener planet.
