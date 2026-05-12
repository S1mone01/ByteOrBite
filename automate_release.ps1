param (
    [string]$version,
    [string]$token
)

$env:GH_TOKEN = $token
$env:GITHUB_TOKEN = $token

if (-not $version.StartsWith("v")) { $tag = "v$version" } else { $tag = $version }

Write-Host "--- Avvio procedura di build e rilascio per $tag ---" -ForegroundColor Cyan

# 1. Build Locale
Write-Host "`n[1/3] Compilazione progetto Ionic/Angular..." -ForegroundColor Yellow
cd ByteOrBite
npm install
npm run build

Write-Host "`n[2/3] Compilazione APK Android..." -ForegroundColor Yellow
npx cap sync android
cd android
.\gradlew.bat assembleDebug
$apkPath = "app/build/outputs/apk/debug/app-debug.apk"
cd ..

Write-Host "`n[3/3] Compilazione EXE Electron..." -ForegroundColor Yellow
cd electron
npm install
# We use 'make' to just build, not publish automatically yet
npm run electron:make
$exePath = Get-ChildItem "dist/*.exe" | Select-Object -First 1 -ExpandProperty FullName
cd ../..

# 2. Commit e Push
Write-Host "`n--- Commit e Push ---" -ForegroundColor Cyan
git add .
git commit -m "Build per rilascio $tag"
git push

# 3. Caricamento su GitHub Release
Write-Host "`n--- Creazione Release su GitHub $tag ---" -ForegroundColor Cyan
gh release create $tag --title "Release $tag" --notes "Build automatizzata del $(Get-Date)"

# Caricamento APK
Write-Host "Caricamento APK..." -ForegroundColor Yellow
gh release upload $tag "ByteOrBite/android/$apkPath#app-debug.apk" --clobber

# Caricamento EXE
if ($exePath) {
    Write-Host "Caricamento EXE: $exePath" -ForegroundColor Yellow
    gh release upload $tag "$exePath" --clobber
}

Write-Host "`n--- Operazione completata! ---" -ForegroundColor Green
