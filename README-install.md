# Install the INSY7315 Desktop App (Windows)

This guide explains how to build the installer once on your dev machine and install it on any Windows device at the restaurant.

## Prerequisites (dev machine only)
- Node.js 18+ (LTS)

## Build the installer

```powershell
# From the project folder
npm install
npm run dist
```

When it finishes, the Windows installer will be created in the `dist/` folder (for example: `INSY7315 Setup 1.0.0.exe`).

## Copy to the restaurant device
- Transfer the `INSY7315 Setup <version>.exe` to the Windows machine (USB, network, or cloud).

## Install
- Double‑click the `.exe` and follow the prompts.
- The app will add a Start Menu entry and optional Desktop shortcut.

## Launch
- From Start Menu: search for "INSY7315" and run it.
- Or double‑click the Desktop shortcut if you created one.

## Data persistence
- All data is stored locally in the user profile via IndexedDB (Dexie). Updating the app does not delete data.
- Uninstalling may offer an option to remove app data—keep it unchecked if you want to preserve data.

## SmartScreen note
If Windows SmartScreen shows a warning ("Windows protected your PC"):
- Click "More info" → "Run anyway".
- To remove this warning for end users, configure code signing in the future.

## App icon
- The installer and app use `logo/logo (2).png` as the icon. Provide a 512×512 PNG for best results. (Windows uses ICO internally; electron-builder converts PNG automatically.)

## Optional: Run in desktop dev mode
```powershell
npm run dev:desktop
```
This starts the Vite dev server and opens the Electron shell pointed at it.
