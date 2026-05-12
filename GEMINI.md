# ByteOrBite - Project Overview

ByteOrBite is a cross-platform food-related application built with **Ionic Framework (v8)** and **Angular (v20)**. It is designed to run on the Web, Android (via **Capacitor**), and Desktop (via **Electron**).

The application features a modern tab-based navigation system and includes pages for a home screen, menu, panini (sandwiches), and a complete authentication system (login, registration, password reset).

## Technologies
- **Frontend:** Angular 20, Ionic 8 (Standalone Components)
- **Mobile:** Capacitor 8
- **Desktop:** Electron 41
- **Icons:** IonIcons
- **Maps:** Leaflet (via `@types/leaflet`)
- **State/Auth:** AuthService (local storage/service-based)

---

## Building and Running

### Development Environment
To start the development server for the web:
```bash
cd ByteOrBite
npm install
npm start
```

### Desktop (Windows .EXE)
To generate the Windows installer (Setup):
1. Navigate to the electron directory: `cd ByteOrBite/electron`
2. Install dependencies: `npm install`
3. Build the installer: `npm run electron:make`
*The output is located in `ByteOrBite/electron/dist/`.*

### Android (.APK)
To generate the debug APK:
1. Build the frontend:
   ```bash
   cd ByteOrBite
   npm install
   npm run build
   ```
2. Sync with Android project: `npx cap sync android`
3. Build APK using Gradle:
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```
*The output is located in `ByteOrBite/android/app/build/outputs/apk/debug/app-debug.apk`.*

### Automated Release
Use the `release.bat` script in the root directory to automate the build and release process (requires GitHub CLI `gh`).

---

## Project Structure

- `ByteOrBite/`: Main project directory.
    - `src/app/`: Angular source code.
        - `home/`, `menu/`, `panini/`, `login/`: Application pages.
        - `tabs/`: Main navigation structure.
        - `services/`: Core logic and data services (e.g., `AuthService`).
    - `electron/`: Desktop-specific configuration and build scripts.
    - `android/`: Android-specific native project.
- `release.bat`: Automation script for builds and GitHub releases.

---

## Development Conventions

- **Standalone Components:** The project strictly uses Angular standalone components.
- **Ionic Standalone:** Use `@ionic/angular/standalone` for all Ionic components.
- **Icons:** Explicitly import and add icons using `addIcons` from `ionicons`.
- **Environment:** Configuration is managed in `ByteOrBite/src/environments/`.
- **Versioning:** When releasing, ensure the version is updated in both `ByteOrBite/package.json` and `ByteOrBite/electron/package.json`.
- **Capacitor Plugins:** Use `@capacitor/preferences` for local storage and `@capacitor/camera` / `@capacitor/filesystem` for native features.
