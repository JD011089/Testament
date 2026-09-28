import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const ttsCache = new Map<string, Buffer>();

// Voice settings tailored for maximum naturalness and character authenticity
interface VoiceProfileConfig {
  voiceId: string;
  name: string;
  edgeFallback: string;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

const ELEVENLABS_VOICE_PROFILES: Record<string, VoiceProfileConfig> = {
  cinematic: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam: Epic, deep, resonant cinematic narration
    name: 'Adam (Cinematic)',
    edgeFallback: 'en-US-ChristopherNeural',
    settings: {
      stability: 0.45,
      similarity_boost: 0.85,
      style: 0.20,
      use_speaker_boost: true
    }
  },
  brotherhood: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni: Warm, grounded, natural conversational cadence
    name: 'Antoni (Grounded)',
    edgeFallback: 'en-US-GuyNeural',
    settings: {
      stability: 0.55,
      similarity_boost: 0.80,
      style: 0.10,
      use_speaker_boost: true
    }
  },
  scholar: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George: Articulate, wise British scholar & storyteller
    name: 'George (Scholar)',
    edgeFallback: 'en-GB-RyanNeural',
    settings: {
      stability: 0.65,
      similarity_boost: 0.82,
      style: 0.05,
      use_speaker_boost: true
    }
  }
};

/**
 * Normalizes scripture references, punctuation, and markdown formatting
 * to create smooth, human-like cadence with natural pauses.
 */
function normalizeScriptureForSpeech(text: string): string {
  return text
    // Replace scripture citations e.g. "Exodus 14:14" -> "Exodus 14 verse 14"
    .replace(/\b(\d?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)\b/g, '$1 $2 verse $3')
    .replace(/(\d+):(\d+)/g, '$1 verse $2')
    // Remove markdown formatting (bold, italics, code blocks)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^#+\s+/gm, '')
    // Clean bullet list symbols
    .replace(/^\s*[-*•]\s+/gm, '')
    // Handle ellipses at end of sentence vs mid-sentence
    .replace(/\.{3,}\s*$/g, '.')
    .replace(/\.{3,}/g, ', ')
    .replace(/—/g, ', ')
    .replace(/--+/g, ', ')
    // Fix punctuation spacing
    .replace(/\s+([,.:;?!])/g, '$1')
    // Clean up doubled punctuation
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
    // Ensure no trailing dangling comma
    .replace(/,\s*$/, '.')
    .trim();
}

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

function neuralTtsPlugin(env: Record<string, string>): Plugin {
  const diskCacheDir = path.resolve('.cache/audio-tts');
  try {
    if (!fs.existsSync(diskCacheDir)) {
      fs.mkdirSync(diskCacheDir, { recursive: true });
    }
  } catch {
    /* ignore */
  }

  const apiKey = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || '';

  return {
    name: 'vite-neural-tts-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tts')) {
          return next();
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const rawText = url.searchParams.get('text');
          const voiceParam = url.searchParams.get('voice') || 'cinematic';

          if (!rawText) {
            res.statusCode = 400;
            res.end('Missing text parameter');
            return;
          }

          const cleanText = normalizeScriptureForSpeech(rawText);
          const profile = ELEVENLABS_VOICE_PROFILES[voiceParam] || ELEVENLABS_VOICE_PROFILES.cinematic;
          const voiceId = profile.voiceId;

          // Check memory cache
          const cacheKey = `${voiceId}:${cleanText}`;
          if (ttsCache.has(cacheKey)) {
            const cached = ttsCache.get(cacheKey)!;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', String(cached.length));
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('X-TTS-Engine', 'ElevenLabs-MemoryCache');
            res.end(cached);
            return;
          }

          // Check disk cache
          const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
          const diskFile = path.join(diskCacheDir, `${hash}.mp3`);
          if (fs.existsSync(diskFile)) {
            try {
              const fileBuf = fs.readFileSync(diskFile);
              if (fileBuf.length > 500) {
                ttsCache.set(cacheKey, fileBuf);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Length', String(fileBuf.length));
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('X-TTS-Engine', 'ElevenLabs-DiskCache');
                res.end(fileBuf);
                return;
              }
            } catch {
              /* ignore and generate */
            }
          }

          // Generate via ElevenLabs API
          let audioBuffer: Buffer | null = null;
          let engineUsed = 'ElevenLabs';

          if (apiKey) {
            try {
              const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                  'xi-api-key': apiKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  text: cleanText,
                  model_id: 'eleven_turbo_v2_5',
                  voice_settings: profile.settings
                }),
                signal: AbortSignal.timeout(15000)
              });

              if (elevenRes.ok) {
                const arrayBuf = await elevenRes.arrayBuffer();
                audioBuffer = Buffer.from(arrayBuf);
              } else {
                const errDetail = await elevenRes.text().catch(() => '');
                console.warn(`[ElevenLabs TTS] Warning: API returned HTTP ${elevenRes.status}: ${errDetail}. Falling back to backup neural TTS.`);
              }
            } catch (elevenErr) {
              console.warn('[ElevenLabs TTS] Request error, falling back to backup neural engine:', (elevenErr as Error).message);
            }
          }

          // Robust Backup: Fall back to Edge TTS if ElevenLabs fails or quota exhausted
          if (!audioBuffer) {
            engineUsed = 'EdgeTTS-Fallback';
            const fallbackVoice = profile.edgeFallback;
            const tts = new MsEdgeTTS();
            await tts.setMetadata(fallbackVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
            const { audioStream } = tts.toStream(cleanText);

            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
              audioStream.on('data', (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));
              audioStream.on('end', () => {
                audioBuffer = Buffer.concat(chunks);
                try { tts.close(); } catch { /* ignore */ }
                resolve();
              });
              audioStream.on('error', (err) => {
                try { tts.close(); } catch { /* ignore */ }
                reject(err);
              });
            });
          }

          if (audioBuffer && audioBuffer.length > 0) {
            // Save to memory cache
            ttsCache.set(cacheKey, audioBuffer);
            // Save to disk cache
            try {
              fs.writeFileSync(diskFile, audioBuffer);
            } catch {
              /* ignore disk write errors */
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', String(audioBuffer.length));
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('X-TTS-Engine', engineUsed);
            res.end(audioBuffer);
          } else {
            res.statusCode = 500;
            res.end('Failed to generate speech audio');
          }
        } catch (err) {
          console.error('[TTS Middleware Error]:', err);
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      watch: {
        ignored: ['**/public/audio/**', '**/*.mp3', '**/.cache/**']
      }
    },
    plugins: [
      react(),
      mode === 'production' ? stripConsolePlugin() : null,
      neuralTtsPlugin(env),
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
          theme_color: '#090b0e',
          background_color: '#090b0e',
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
          navigateFallbackDenylist: [/^\/api\//, /testament_reload=/],
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
              urlPattern: /^https:\/\/api\.getbible\.net\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'testament-getbible',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
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
            }
          ]
        }
      })
    ]
  };
});

