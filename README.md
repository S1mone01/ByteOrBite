# GUIDA ALLA COMPILAZIONE: EXE (PC) E APK (ANDROID)

## COMPILAZIONE PC (.EXE)
Per generare l'installer di Windows (Setup), usa questi comandi:

1. **Spostati nella cartella electron:**
   ```bash
   cd ByteOrBite/electron
   ```
2. **Genera l'installer:**
   ```bash
   npm run electron:make
   ```

**Dove trovare il file:**
`ByteOrBite/electron/dist/`

---

## COMPILAZIONE ANDROID (FILE .APK)
Puoi generare l'APK tramite terminale.

1. **Apri il terminale nella cartella principale:**
   ```bash
   cd ByteOrBite
   ```
2. **Esegui la build del progetto:**
   ```bash
   npm run build
   ```
3. **Sincronizza i file:**
   ```bash
   npx cap sync android
   ```
4. **Spostati nella cartella android:**
   ```bash
   cd android
   ```
5. **Genera l'APK:**
   ```bash
   .\gradlew.bat assembleDebug
   ```

### VISUALIZZAZIONE E DEBUG CON ANDROID STUDIO
Se preferisci usare l'interfaccia grafica di Android Studio per testare l'app su un emulatore o un dispositivo fisico:

1. **Assicurati di essere nella cartella del progetto Ionic:**
   ```bash
   cd ByteOrBite
   ```
2. **Esegui la build e sincronizza i file (se non l'hai già fatto):**
   ```bash
   npm run build
   npx cap sync android
   ```
3. **Apri il progetto in Android Studio:**
   ```bash
   npx cap open android
   ```
   *In alternativa, apri Android Studio manualmente e seleziona la cartella `ByteOrBite/android`.*

4. **Avvia l'app:**
   - Attendi che Android Studio finisca l'indicizzazione (Gradle sync).
   - Seleziona un emulatore o un dispositivo fisico collegato nel menu a tendina in alto.
   - Clicca sul tasto **Run** (l'icona del triangolo verde "Play").

**Dove trovare il file:**
`ByteOrBite/android/app/build/outputs/apk/debug/`

---

## AUTOMAZIONE (RELEASE SU GITHUB)
È disponibile uno script PowerShell che automatizza la creazione di una **GitHub Release**. Lo script invia il codice e crea un "Tag" (es. v1.0.0), che attiva automaticamente una *GitHub Action* per compilare e pubblicare i file.

1. **Esegui lo script:**
   ```powershell
   .\publish_builds.ps1
   ```
2. **Inserisci la versione** quando richiesto (es. `1.0.0`).
3. **Monitora la build:** Vai sulla scheda **Actions** del tuo repository GitHub.
4. **Scarica i file:** Una volta terminata la build (circa 5-10 min), i file `.apk` e `.exe` appariranno nella sezione **Releases** a destra nella home del repository.

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
