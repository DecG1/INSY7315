# Desktop build (Electron)

This app can run as a desktop application using Electron.

## Development (hot reload)

1. Install dependencies (once):
   - npm install
   - npm install -D electron electron-builder concurrently wait-on
2. Start the Vite dev server and Electron together:

```
npm run dev:desktop
```

This runs Vite on http://localhost:5173, waits for it to be ready, and then starts Electron.

## Production build (installer)

1. Build the renderer bundle with Vite and package with electron-builder:

```
npm run dist
```

The installer(s) will be output to the `dist` directory created by electron-builder.

## Notes
- The Electron main process entry is `electron/main.js`.
- In development, the app loads `http://localhost:5173`.
- In production, it loads the built `dist/index.html`.
- Vite `base` is set to `./` so assets load correctly from the filesystem.
