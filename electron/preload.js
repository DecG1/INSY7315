// Preload script runs in an isolated context.
// Expose safe, limited APIs to the renderer here if needed.
// For now we only set up a minimal bridge to read environment data.

import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  isPackaged: process.env.NODE_ENV === 'production'
});
