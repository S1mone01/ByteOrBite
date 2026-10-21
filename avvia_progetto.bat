@echo off
title Avvio ByteOrBite Full-Stack
chcp 65001 >nul

:: Determina il percorso corretto delle cartelle
set "CURRENT_DIR=%~dp0"
if exist "%CURRENT_DIR%ByteOrBite-Server-exspress" (
    set "BACKEND_DIR=%CURRENT_DIR%ByteOrBite-Server-exspress"
    set "FRONTEND_DIR=%CURRENT_DIR%ByteOrBite"
) else (
    set "BACKEND_DIR=%CURRENT_DIR%..\ByteOrBite-Server-exspress"
    set "FRONTEND_DIR=%CURRENT_DIR%"
)

echo ===============================================================
echo            AVVIO SISTEMA COMPLETO BYTE OR BITE
echo ===============================================================
echo.
echo [1/2] Avvio del Backend Express (Porta 3000)...
start "ByteOrBite - Backend Express" cmd /k "cd /d "%BACKEND_DIR%" && title [SERVER] Express API :3000 && npm start"

echo [2/2] Avvio del Frontend Ionic / Angular (ng serve)...
start "ByteOrBite - Frontend Ionic" cmd /k "cd /d "%FRONTEND_DIR%" && title [CLIENT] Ionic / Angular && npm start"

echo.
echo ---------------------------------------------------------------
echo  Entrambi i servizi sono stati avviati in due finestre separate:
echo    - Server Express: http://localhost:3000
echo    - Frontend App:   http://localhost:4200 (o 8100)
echo.
echo  Puoi minimizzare questa finestra o premere un tasto per chiuderla.
echo ---------------------------------------------------------------
pause
