# Script di automazione per il rilascio su GitHub

Write-Host "--- Avvio procedura di rilascio ---" -ForegroundColor Cyan

# 1. Chiedi la versione
$version = Read-Host "Inserisci il numero di versione (es. 1.0.0)"
if (-not $version.StartsWith("v")) { $tag = "v$version" } else { $tag = $version }

# 2. Commit delle modifiche correnti (senza binari)
Write-Host "Salvataggio modifiche su Git..." -ForegroundColor Yellow
git add .
git commit -m "Preparazione rilascio $tag"
git push

# 3. Creazione e invio del TAG (questo attiva la GitHub Action)
Write-Host "Creazione tag $tag per attivare la Release..." -ForegroundColor Yellow
git tag $tag
git push origin $tag

Write-Host "`n--- Operazione avviata! ---" -ForegroundColor Green
Write-Host "Controlla la scheda 'Actions' su GitHub per seguire la build."
Write-Host "Una volta completata, troverai i file nella sezione 'Releases'."
