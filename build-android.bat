@echo off
:: ---------- ZERO GAME Android Build ----------
:: Checks for required tools, installs deps, builds, and outputs APK path

:: 1. Verify Node.js / npm
node -v >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed. Install from https://nodejs.org/
  exit /b 1
)
npm -v >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm is not installed. Install Node.js which includes npm.
  exit /b 1
)

:: 2. Verify Java
java -version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Java JDK not found. Install JDK 17 or newer.
  exit /b 1
)

:: 3. Verify Android SDK (adb as proxy)
adb version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Android SDK (adb) not found. Install Android Studio or Command‑line SDK.
  exit /b 1
)

:: 4. Verify Gradle
gradle -v >nul 2>&1
if errorlevel 1 (
  echo WARNING: Gradle not found. Using Gradle wrapper.
)

:: 5. Install project dependencies (only if node_modules missing)
if not exist "node_modules\" (
  echo Installing npm dependencies...
  npm ci
) else (
  echo npm dependencies already installed.
)

:: 6. Build the web assets for production
echo Building Vite project...
npm run build

:: 7. Sync with Capacitor Android platform
npx cap copy android
npx cap sync android

:: 8. Build the Android debug APK
echo Building Android debug APK...
cd android
if exist "gradlew.bat" (
  gradlew.bat assembleDebug
) else (
  echo ERROR: Gradle wrapper not found in android/ directory.
  exit /b 1
)
cd ..

:: 9. Verify APK existence
set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"
if exist "%APK_PATH%" (
  for %%A in ("%APK_PATH%") do set "SIZE=%%~zA"
  if %SIZE% GTR 0 (
    echo SUCCESS: APK generated at %CD%\%APK_PATH%
  ) else (
    echo ERROR: APK file is empty.
    exit /b 1
  )
) else (
  echo ERROR: APK not found at %APK_PATH%.
  exit /b 1
)

pause