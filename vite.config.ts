import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// The current PWA lives in html/. It is a single self-contained index.html
// (inline CSS/JS, no ES module imports) plus static PWA assets. We point Vite's
// root at html/ so html/index.html becomes the build entry → dist/index.html.
//
// Asset hashing is disabled because manifest.json (icons[].src) and sw.js
// (CORE_ASSETS) reference assets by plain, unhashed names; the service worker
// aborts install if cache.addAll() cannot find them.
//
// sw.js is referenced only inside a JS string and privacy.html is not linked
// from index.html, so Vite never discovers them. A tiny closeBundle hook copies
// all PWA static assets verbatim from html/ into dist/ after the build.

const HTML_DIR = resolve(__dirname, 'html')
const OUT_DIR = resolve(__dirname, 'dist')

const VERBATIM_ASSETS = [
  'sw.js', 'manifest.json', 'privacy.html',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png',
  'screenshot1.png', 'screenshot2.png', 'screenshot3.png',
]

function copyPwaAssets() {
  return {
    name: 'copy-pwa-assets',
    apply: 'build' as const,
    closeBundle() {
      mkdirSync(OUT_DIR, { recursive: true })
      for (const name of VERBATIM_ASSETS) {
        const from = resolve(HTML_DIR, name)
        if (existsSync(from)) copyFileSync(from, resolve(OUT_DIR, name))
      }
    },
  }
}

export default defineConfig({
  root: HTML_DIR,
  base: './',        // relative — AiT WebView serving path is unknown
  publicDir: false,  // prevent stale project-root public/ from copying to dist
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    assetsInlineLimit: 0,  // keep icon-512.png (~87KB) as a file, not base64
    rollupOptions: {
      output: {
        // Disable hashing so manifest.json/sw.js references remain valid
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  plugins: [copyPwaAssets()],
})
