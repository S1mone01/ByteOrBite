# Script di automazione per build locale e caricamento su GitHub Release

Write-Host "--- Avvio procedura di build locale e rilascio ---" -ForegroundColor Cyan

# 0. Verifica GitHub CLI (gh)
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERRORE: GitHub CLI (gh) non è installato." -ForegroundColor Red
    Write-Host "Per favore installalo da: https://cli.github.com/ per permettere il caricamento delle Releases."
    exit
}

# 1. Chiedi la versione
$version = Read-Host "Inserisci il numero di versione (es. 1.1.0)"
if (-not $version.StartsWith("v")) { $tag = "v$version" } else { $tag = $version }

# 2. Build Locale
Write-Host "`n[1/3] Compilazione progetto Ionic/Angular..." -ForegroundColor Yellow
cd ByteOrBite
npm run build

Write-Host "`n[2/3] Compilazione APK Android..." -ForegroundColor Yellow
npx cap sync android
cd android
.\gradlew.bat assembleDebug
$apkPath = "app/build/outputs/apk/debug/app-debug.apk"
cd ..

Write-Host "`n[3/3] Compilazione EXE Electron..." -ForegroundColor Yellow
cd electron
npm run electron:make
$exePath = Get-ChildItem "dist/*.exe" | Select-Object -First 1 -ExpandProperty FullName
cd ../..

# 3. Caricamento su GitHub Release
Write-Host "`n--- Creazione Release su GitHub ---" -ForegroundColor Cyan

# Commit e Push del codice prima del tag
git add .
git commit -m "Build locale per rilascio $tag"
git push

# Creazione della release tramite GitHub CLI e caricamento file
Write-Host "Caricamento file su GitHub Release $tag..." -ForegroundColor Yellow
gh release create $tag --title "Release $tag" --notes "Build locale del $(Get-Date)"

# Caricamento APK
gh release upload $tag "ByteOrBite/android/$apkPath#app-debug.apk"

# Caricamento EXE
if ($exePath) {
    gh release upload $tag "$exePath"
}

Write-Host "`n--- Operazione completata! ---" -ForegroundColor Green
Write-Host "I file sono ora disponibili nella sezione Releases su GitHub."

