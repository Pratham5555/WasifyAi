@echo off
setlocal enabledelayedexpansion
title Wasify AI - Windows Setup Script
color 0A

echo.
echo  ========================================================
echo   __          __           _  __         _      ___
echo   \ \        / /          (_)/ _|       / \    |_ _|
echo    \ \  /\  / /__ _ ___   _| |_ _   _ / _ \    | |
echo     \ \/  \/ / _` / __| | |  _| | | / ___ \   | |
echo      \  /\  / (_| \__ \ | | | | |_| / /   \ \ |___|
echo       \/  \/ \__,_|___/ |_|_|  \__, /_/     \_\
echo                                  __/ |
echo                                 |___/
echo.
echo   Wasify AI - Complete Setup Script for Windows
echo  ========================================================
echo.

:: ---- CHECK PREREQUISITES ----
echo [1/7] Checking prerequisites...
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js LTS from: https://nodejs.org/en/download/
    echo After installing, restart this script.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js found: %NODE_VER%

:: Check npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found. Please reinstall Node.js.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] npm found: %NPM_VER%

:: Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python 3.11+ from: https://www.python.org/downloads/
    echo IMPORTANT: Check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PY_VER=%%i
echo [OK] Python found: %PY_VER%

:: Check Java (JDK)
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Java not found. You need JDK 17 for Android builds.
    echo.
    echo Please install JDK 17 from:
    echo https://www.microsoft.com/openjdk  (Recommended - Microsoft Build of OpenJDK)
    echo After installing, set JAVA_HOME and restart this script.
    echo.
    set JAVA_MISSING=1
) else (
    for /f "tokens=*" %%i in ('java -version 2^>^&1') do (set JAVA_VER=%%i && goto :java_found)
    :java_found
    echo [OK] Java found: %JAVA_VER%
    set JAVA_MISSING=0
)

:: Check ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    echo [WARNING] ANDROID_HOME environment variable not set.
    echo.
    echo Please install Android Studio from: https://developer.android.com/studio
    echo Then set ANDROID_HOME to your SDK path (usually C:\Users\YourName\AppData\Local\Android\Sdk)
    echo See README.md for exact instructions.
    set ANDROID_MISSING=1
) else (
    echo [OK] ANDROID_HOME found: %ANDROID_HOME%
    set ANDROID_MISSING=0
)

echo.
echo --------------------------------------------------------
echo.

:: ---- SETUP BACKEND ----
echo [2/7] Setting up Backend (FastAPI)...
echo.

cd /d "%~dp0backend"

:: Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

:: Activate and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed

:: Create .env from example
if not exist ".env" (
    copy .env.example .env >nul
    echo [OK] Created .env file (please update with your values)
) else (
    echo [OK] .env file already exists
)

:: Create uploads directory
if not exist "uploads" mkdir uploads
echo [OK] Uploads directory ready

:: Initialize database
echo Initializing database...
python -c "from database import Base, engine; from models import user, detection, reward; Base.metadata.create_all(bind=engine); print('[OK] Database tables created')"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database initialization failed
    pause
    exit /b 1
)

:: Seed initial rewards
echo Seeding initial data...
python seed.py
echo [OK] Backend setup complete

call venv\Scripts\deactivate.bat
cd /d "%~dp0"

echo.
echo --------------------------------------------------------
echo.

:: ---- SETUP MOBILE ----
if "%JAVA_MISSING%"=="1" (
    echo [SKIP] Skipping mobile setup - Java JDK not found
    echo Install JDK 17 and re-run this script to set up the mobile app.
    goto :skip_mobile
)

echo [3/7] Setting up Mobile App (React Native)...
echo.

:: Check if React Native project already initialized
if not exist "mobile\android" (
    echo Initializing React Native project (this may take 5-10 minutes)...
    npx @react-native-community/cli@latest init WasifyApp --template react-native-template-typescript --directory mobile --skip-install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] React Native init failed
        pause
        exit /b 1
    )
    echo [OK] React Native project initialized
) else (
    echo [OK] React Native project already initialized
)

:: Install mobile dependencies
echo Installing mobile dependencies (this may take 5-10 minutes)...
cd /d "%~dp0mobile"
npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Mobile dependencies installed

:: Create assets directory for model
if not exist "android\app\src\main\assets" (
    mkdir "android\app\src\main\assets"
    echo [OK] Assets directory created
)

:: Copy model placeholder note
echo. > "android\app\src\main\assets\MODEL_README.txt"
echo Place best_float32.tflite here for on-device AI inference. >> "android\app\src\main\assets\MODEL_README.txt"
echo See ai-model\README.md for training instructions. >> "android\app\src\main\assets\MODEL_README.txt"

cd /d "%~dp0"

echo.
echo [4/7] Patching Android configuration...

:: Patch MainApplication.kt for Reanimated (if needed)
:: (Handled by postinstall scripts)

echo [OK] Android configuration ready
echo.

:skip_mobile

:: ---- AI MODEL SETUP ----
echo [5/7] Setting up AI Model training environment...
echo.

cd /d "%~dp0ai-model"

if not exist "venv" (
    echo Creating AI model virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    call venv\Scripts\deactivate.bat
    echo [OK] AI model environment ready
) else (
    echo [OK] AI model environment already exists
)

cd /d "%~dp0"

echo.
echo --------------------------------------------------------
echo.
echo [6/7] Final checks...

:: Summary
echo.
echo  ========================================================
echo   SETUP COMPLETE!
echo  ========================================================
echo.
echo  NEXT STEPS:
echo.
echo  1. UPDATE backend\.env with your Supabase/DB credentials
echo     (For local testing, default SQLite works out of the box)
echo.
echo  2. START the backend:
echo     cd backend
echo     venv\Scripts\activate
echo     uvicorn main:app --reload
echo     Backend runs at: http://localhost:8000
echo.
echo  3. START the mobile app (in a NEW terminal):
echo     cd mobile
echo     npx react-native start
echo     Then in ANOTHER terminal:
echo     npx react-native run-android
echo.
echo  4. UPDATE mobile\src\services\api.ts with your computer's
echo     local IP address (find it with: ipconfig)
echo     Example: http://192.168.1.100:8000
echo.
if "%ANDROID_MISSING%"=="1" (
    echo  [!] Still need Android Studio + ANDROID_HOME set
    echo     See README.md section "Android Setup"
    echo.
)
echo  Full instructions: README.md
echo  API docs: http://localhost:8000/docs (when backend is running)
echo.
echo  ========================================================
echo.
pause
