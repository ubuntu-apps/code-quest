/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { PYODIDE_CACHE, PYODIDE_CDN_BASE, WEBR_CACHE, WEBR_CDN_BASE } from './src/runtimeVersions'

/** Matches URLs that start with `base` (workbox matches cross-origin RegExps from the start). */
function startsWith(base: string): RegExp {
  return new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}

// https://vite.dev/config/
export default defineConfig({
  base: '/code-quest/',
  build: {
    // iPhone 6 tops out at iOS 12 / Safari 12, which cannot parse optional
    // chaining (?.), nullish coalescing (??) or logical-assignment operators.
    // Down-level the whole bundle so the app boots on these old browsers.
    target: ['es2015', 'safari12'],
  },
  plugins: [
    react(),
    VitePWA({
      // Ask before reloading into a new version (see src/pwaUpdate.ts).
      registerType: 'prompt',
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
      // Offline support. The app shell, including public/pyodide-worker.js, is precached
      // by the default glob. Everything else is cached as it is used:
      workbox: {
        // Take control on the first visit, so lessons opened then are cached too.
        // (Updates still wait for the learner: registerType is 'prompt'.)
        clientsClaim: true,
        runtimeCaching: [
          {
            // Lessons: always try the network so content updates show up, and fall
            // back to the last copy when offline.
            urlPattern: /\/content\/.+\.json(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'codequest-content',
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Python runtime and packages. The URL is versioned, so files never change.
            urlPattern: startsWith(PYODIDE_CDN_BASE),
            handler: 'CacheFirst',
            options: {
              // Opaque (status 0) responses too: Pyodide's main script loads that way. A bad
              // one is dropped after a failed load (src/lib/runtimeCache.ts).
              cacheName: PYODIDE_CACHE,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // R runtime, also versioned.
            urlPattern: startsWith(WEBR_CDN_BASE),
            handler: 'CacheFirst',
            options: {
              cacheName: WEBR_CACHE,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],
      manifest: {
        id: '/code-quest/',
        name: 'CodeQuest',
        short_name: 'CodeQuest',
        description: 'Learn to code through quests of hands-on challenges.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        orientation: 'any',
        start_url: '/code-quest/',
        scope: '/code-quest/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
  },
})
