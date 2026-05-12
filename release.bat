@echo off
REM ==========================================
REM ByteOrBite - Build and Release Script
REM ==========================================

echo.
echo ========================================
echo  ByteOrBite - Build ^& Release (Local)
echo ========================================
echo.

REM --- PROMPT AGGIORNAMENTO VERSIONE ---
echo [ATTENZIONE] Hai aggiornato la versione (es. 1.0.1) in:
echo   - ByteOrBite/package.json
echo   - ByteOrBite/electron/package.json
echo.
set /p CONFIRM_VERSION="Confermi di voler procedere? (s/n): "
if /i "%CONFIRM_VERSION%" NEQ "s" (
    echo [INFO] Operazione annullata. Aggiorna i file e riprova.
    pause
    exit /b 0
)
echo.

REM Check if GITHUB_TOKEN is set
if "%GITHUB_TOKEN%"=="" (
    echo [ERROR] GITHUB_TOKEN non impostato!
    echo.
    echo Per favore imposta il token GitHub:
    echo.
    echo   set GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX
    echo.
    echo Poi esegui di nuovo questo script.
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js non trovato!
    pause
    exit /b 1
)

REM Step 1: Installazione dipendenze root
if not exist "node_modules" (
    echo [INFO] Installazione dipendenze root...
    call npm install
)

REM Step 2: Build Ionic
echo.
echo [1/3] Compilazione Ionic/Angular...
cd ByteOrBite
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build Ionic fallito!
    pause
    exit /b 1
)

REM Step 3: Build Android APK
echo.
echo [2/3] Compilazione APK Android...
call npx cap sync android
cd android
call .\gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build Android fallito!
    pause
    exit /b 1
)
set APK_PATH=%CD%\app\build\outputs\apk\debug\app-debug.apk
cd ..

REM Step 4: Build e Publish Electron
echo.
echo [3/3] Compilazione e Publish Electron...
cd electron
call npm install
call npm run publish
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Publish Electron fallito!
    pause
    exit /b 1
)
cd ../..

REM Step 5: Upload APK (richiede GitHub CLI 'gh')
echo.
echo [INFO] Caricamento APK sulla release appena creata...
echo Per questo passaggio e' necessario il GitHub CLI (gh).
where gh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    REM Recupera l'ultimo tag creato
    for /f "tokens=*" %%i in ('git describe --tags --abbrev^=0') do set LAST_TAG=%%i
    echo [INFO] Caricamento su release %LAST_TAG%...
    gh release upload %LAST_TAG% "%APK_PATH%#app-debug.apk" --clobber
) else (
    echo [WARNING] GitHub CLI (gh) non trovato. 
    echo L'APK non e' stato caricato automaticamente.
    echo Caricalo manualmente da: %APK_PATH%
)

echo.
echo ========================================
echo  Build ^& Rilascio completati con successo!
echo ========================================
echo.
pause
