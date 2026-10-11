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
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam: Deep, calm resonant narration
    name: 'Adam (Cinematic)',
    edgeFallback: 'en-US-ChristopherNeural',
    settings: {
      stability: 0.70,
      similarity_boost: 0.85,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  brotherhood: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni: Warm, grounded natural conversational cadence
    name: 'Antoni (Grounded)',
    edgeFallback: 'en-US-GuyNeural',
    settings: {
      stability: 0.72,
      similarity_boost: 0.80,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  scholar: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George: Wise, articulate UK reader
    name: 'George (Scholar)',
    edgeFallback: 'en-GB-RyanNeural',
    settings: {
      stability: 0.75,
      similarity_boost: 0.82,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  grace: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel: Gentle, peaceful reflective cadence
    name: 'Rachel (Grace & Peace)',
    edgeFallback: 'en-US-JennyNeural',
    settings: {
      stability: 0.72,
      similarity_boost: 0.85,
      style: 0.0,
      use_speaker_boost: true
    }
  }
};

function numberToWordsEn(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num === 0) return 'zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  if (num < 1000) {
    const rem = num % 100;
    return ones[Math.floor(num / 100)] + ' hundred' + (rem ? ' ' + numberToWordsEn(String(rem)) : '');
  }
  return String(num);
}

/**
 * Normalizes scripture references, punctuation, and markdown formatting
 * to create smooth, human-like cadence with natural pauses.
 */
function normalizeScriptureForSpeech(text: string): string {
  return text
    // 1. Strip badges & annotations
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection\s*[•\-–—·*]?\s*Not\s+Scripture/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*Plain\s+English\s*[•\-–—·*]?\s*AI\s+reflection/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection/gi, ' ')
    .replace(/Scripture\s*\(Verbatim\)/gi, ' ')
    // 2. Strip URLs & web links
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.\S+/gi, ' ')
    // 3. Strip emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, ' ')
    // 4. Expand verse references: "Genesis 45:5" -> "Genesis forty-five, verse five"
    .replace(/\b(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g, (_match, book, ch, vs, endVs) => {
      const chWord = numberToWordsEn(ch);
      const vsWord = numberToWordsEn(vs);
      if (endVs) {
        const endWord = numberToWordsEn(endVs);
        return `${book} ${chWord}, verses ${vsWord} through ${endWord}`;
      }
      return `${book} ${chWord}, verse ${vsWord}`;
    })
    .replace(/(\d+):(\d+)/g, (_m, ch, vs) => `${numberToWordsEn(ch)}, verse ${numberToWordsEn(vs)}`)
    // 5. Clean markdown and bracket formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[{}[\]()<>~^|\\\/]/g, ' ')
    .replace(/\.{3,}\s*$/g, '.')
    .replace(/\.{3,}/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/--+/g, ', ')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
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

