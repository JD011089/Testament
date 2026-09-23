import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const ttsCache = new Map<string, Buffer>();

function neuralTtsPlugin(): Plugin {
  return {
    name: 'vite-neural-tts-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tts')) {
          return next();
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const text = url.searchParams.get('text');
          const voiceParam = url.searchParams.get('voice') || 'cinematic';

          if (!text) {
            res.statusCode = 400;
            res.end('Missing text parameter');
            return;
          }

          let voiceName = 'en-US-ChristopherNeural';
          if (voiceParam === 'brotherhood') {
            voiceName = 'en-US-GuyNeural';
          } else if (voiceParam === 'scholar') {
            voiceName = 'en-GB-RyanNeural';
          }

          const cacheKey = `${voiceName}:${text}`;
          if (ttsCache.has(cacheKey)) {
            const cached = ttsCache.get(cacheKey)!;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', String(cached.length));
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(cached);
            return;
          }

          const tts = new MsEdgeTTS();
          await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
          const { audioStream } = tts.toStream(text);

          const chunks: Buffer[] = [];
          audioStream.on('data', (chunk: Uint8Array) => {
            chunks.push(Buffer.from(chunk));
          });

          audioStream.on('end', () => {
            const fullBuffer = Buffer.concat(chunks);
            ttsCache.set(cacheKey, fullBuffer);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', String(fullBuffer.length));
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(fullBuffer);
            try { tts.close(); } catch { /* ignore */ }
          });

          audioStream.on('error', (err) => {
            console.error('Audio stream error:', err);
            try { tts.close(); } catch { /* ignore */ }
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end('Audio streaming error');
            }
          });
        } catch (err) {
          console.error('TTS endpoint error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('TTS generation error');
          }
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/public/audio/**', '**/*.mp3']
    }
  },
  plugins: [
    react(),
    neuralTtsPlugin(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icons/*.png', 'audio/**/*.mp3'],
      manifest: {
        name: 'Testament - Interactive Bible Journey',
        short_name: 'Testament',
        description: 'An interactive graphic-novel Bible study experience for adults. Plain English, real history, actionable wisdom.',
        theme_color: '#0f1217',
        background_color: '#090b0e',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        importScripts: ['/sw-notifications.js']
      }
    })
  ],
})
