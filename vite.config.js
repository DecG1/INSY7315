import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for web and Electron renderer. We use a relative base so
// the built assets resolve correctly when loaded from the local file system
// inside the packaged Electron app.
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    assetsInlineLimit: 0, // Don't inline images, keep them as separate files
  },
});
