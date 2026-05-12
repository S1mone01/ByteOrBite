# GUIDA ALLA COMPILAZIONE: EXE (PC) E APK (ANDROID)

Questa sezione descrive come compilare manualmente le versioni per Windows e Android.

## 1. AGGIORNAMENTO VERSIONE
Prima di compilare, assicurati di aggiornare la versione del progetto nei file `package.json` (nella root e in `ByteOrBite/electron/`).

## 2. COMPILAZIONE PC (.EXE)
Per generare l'installer di Windows (Setup):

1. **Spostati nella cartella electron:**
   ```bash
   cd ByteOrBite/electron
   ```
2. **Installa le dipendenze (se necessario):**
   ```bash
   npm install
   ```
3. **Genera l'installer:**
   ```bash
   npm run electron:make
   ```

**Dove trovare il file:**
`ByteOrBite/electron/dist/ByteOrBite Setup [VERSIONE].exe`

---

## 3. COMPILAZIONE ANDROID (FILE .APK)
Per generare l'APK tramite terminale:

1. **Compila il progetto frontend (Angular/Ionic):**
   ```bash
   cd ByteOrBite
   npm install
   npm run build
   ```
2. **Sincronizza le modifiche con il progetto Android:**
   ```bash
   npx cap sync android
   ```
3. **Genera l'APK tramite Gradle:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```

**Dove trovare il file:**
`ByteOrBite/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. AUTOMAZIONE RILASCIO (release.bat)
Lo script `release.bat` automatizza l'intero processo di build e caricamento su GitHub.

1. **Configurazione:**
   - [Installa GitHub CLI (gh)](https://cli.github.com/).
   - Imposta il token: `set GITHUB_TOKEN=ghp_tuo_token`.
2. **Esecuzione:**
   - Avvia `.\release.bat`.
   - Lo script compilerà il frontend, l'APK e l'EXE, creando poi una nuova Release su GitHub con gli asset caricati.

---


## COMANDI BASE GIT (CARICAMENTO E MODIFICHE)

1. **Controlla lo stato dei file (quali sono modificati):**
   ```bash
   git status
   ```

2. **Aggiungi le modifiche per il commit:**
   ```bash
   git add .              # Aggiunge tutti i file modificati
   git add nome_file      # Aggiunge un file specifico
   ```

3. **Crea un commit con un messaggio descrittivo:**
   ```bash
   git commit -m "Descrizione delle modifiche effettuate"
   ```

4. **Invia le modifiche al repository online (GitHub):**
   ```bash
   git push
   ```

5. **Aggiorna il progetto locale con le modifiche online:**
   ```bash
   git pull
   ```
