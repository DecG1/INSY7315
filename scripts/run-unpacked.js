#!/usr/bin/env node
// scripts/run-unpacked.js
// Finds the electron unpacked output (e.g., dist/win-unpacked or dist/INSY7315-win-unpacked)
// and runs the executable. Designed for Windows unpacked builds, but will attempt
// sensible fallbacks on other platforms.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

if (!fs.existsSync(distDir)) {
  exitWith('dist directory not found. Run `npm run pack` first to build an unpacked app.');
}

// Helper: recursively find first file matching predicate
function findFileRecursive(dir, predicate) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile() && predicate(e.name, full)) return full;
    if (e.isDirectory()) {
      const found = findFileRecursive(full, predicate);
      if (found) return found;
    }
  }
  return null;
}

// Look for common unpacked dir names
const candidates = fs.readdirSync(distDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(distDir, d.name));

let exePath = null;

// 1) Prefer *-unpacked directories (win-unpacked, INSY7315-win-unpacked, etc.)
for (const cand of candidates) {
  if (/unpacked$/i.test(cand) || /-unpacked$/i.test(cand)) {
    // On Windows, look for .exe
    if (process.platform === 'win32') {
      exePath = findFileRecursive(cand, (name) => name.toLowerCase().endsWith('.exe'));
      if (exePath) break;
    } else {
      // On mac/linux, look for an executable file without extension
      exePath = findFileRecursive(cand, (name, full) => {
        try {
          const st = fs.statSync(full);
          return (st.mode & 0o111) !== 0; // has any execute bit
        } catch (e) {
          return false;
        }
      });
      if (exePath) break;
    }
  }
}

// 2) Fallback: look directly under dist for .exe (installer) or unpacked exe
if (!exePath) {
  // installer exe
  exePath = findFileRecursive(distDir, (name) => name.toLowerCase().endsWith('.exe'));
}

if (!exePath) {
  exitWith('Could not locate an unpacked executable in dist. Contents:\n' + fs.readdirSync(distDir).join('\n'));
}

console.log('Found executable:', exePath);
console.log('Spawning...');

const child = spawn(exePath, [], { stdio: 'inherit', shell: false });
child.on('error', (err) => {
  console.error('Failed to start executable:', err);
  process.exit(2);
});
child.on('exit', (code, signal) => {
  if (signal) {
    console.log('Process terminated with signal', signal);
    process.exit(0);
  }
  process.exit(code === null ? 0 : code);
});
