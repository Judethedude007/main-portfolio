// build.js — substitutes env vars into index.html and copies all assets to /dist
// Run locally: node build.js
// Vercel runs this automatically via the buildCommand in vercel.json

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { config } from 'dotenv';

// Load .env for local builds (Vercel injects env vars automatically)
config();

const FORMSPREE_URL = process.env.FORMSPREE_URL;
if (!FORMSPREE_URL) {
    console.error('❌  FORMSPREE_URL is not set. Add it to .env or Vercel environment variables.');
    process.exit(1);
}

// Create dist/
mkdirSync('dist', { recursive: true });

// Process index.html — replace placeholder
let html = readFileSync('index.html', 'utf8');
html = html.replace(/__FORMSPREE_URL__/g, FORMSPREE_URL);
writeFileSync('dist/index.html', html, 'utf8');
console.log('✅  dist/index.html built');

// Copy all other files/folders (css, js, images, etc.) to dist/
const SKIP = new Set(['dist', 'node_modules', '.git', '.env', '.env.example', 'build.js', 'package.json', 'vercel.json', '.gitignore', 'index.html']);

function copyRecursive(src, dest) {
    const entries = readdirSync(src);
    mkdirSync(dest, { recursive: true });
    for (const entry of entries) {
        if (SKIP.has(entry)) continue;
        const srcPath  = join(src, entry);
        const destPath = join(dest, entry);
        if (statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

copyRecursive('.', 'dist');
console.log('✅  Assets copied to dist/');
console.log('\n🚀  Build complete → dist/');
