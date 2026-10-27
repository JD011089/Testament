import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function stripConsolePlugin(): Plugin {
  return {
    name: 'strip-console',
    apply: 'build',
    transform(code, id) {
      if (!/[/\\]src[/\\]/.test(id) || id.includes('node_modules')) return null;
      const next = code.replace(/^[ \t]*console\.(?:log|debug|info|warn|error|trace)\(.*\);?[ \t]*$/gm, '');
      return next === code ? null : next;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      watch: {
        ignored: ['**/public/audio/**', '**/*.mp3', '**/.cache/**']
      }
    },
    plugins: [
      tailwindcss(),
      react(),
      mode === 'production' ? stripConsolePlugin() : null,
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        devOptions: {
          enabled: false
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png', 'icons/*.webp'],
        manifest: {
          id: '/',
          name: 'Testament — The Living Word',
          short_name: 'Testament',
          description: 'An interactive graphic-novel Bible study experience for adults. Plain English, real history, actionable wisdom.',
          theme_color: '#F8F1E0',
          background_color: '#F8F1E0',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'en',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshots/home-narrow.png',
              sizes: '390x844',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Home'
            },
            {
              src: '/screenshots/home-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Home'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          importScripts: ['/sw-notifications.js'],
          runtimeCaching: [
            {
              urlPattern: /\/images\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'testament-images',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            },
            {
              urlPattern: /\/audio\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'testament-audio',
                rangeRequests: true,
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 }
              }
            },
            {
              urlPattern: /^https:\/\/bible-api\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'testament-bible-api',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            },
            {
              urlPattern: /^https:\/\/bolls\.life\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'testament-bolls-api',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
          ]
        }
      })
    ]
  };
});

