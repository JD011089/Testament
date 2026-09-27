import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#231d17" />
      <stop offset="100%" stop-color="#0a0c0f" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="emberGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#fdba74" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Dark Shield/Backdrop -->
  <rect width="512" height="512" rx="112" fill="url(#bgGlow)" />
  <rect x="12" y="12" width="488" height="488" rx="100" stroke="#3c3127" stroke-width="4" stroke-opacity="0.6" />
  
  <!-- Outer Gold Crest Circle -->
  <circle cx="256" cy="256" r="190" stroke="url(#goldGrad)" stroke-width="8" stroke-dasharray="16 10" opacity="0.4" />
  <circle cx="256" cy="256" r="172" stroke="url(#goldGrad)" stroke-width="3" opacity="0.7" />

  <!-- Shield Shape -->
  <path d="M256 90 L370 140 V270 C370 348 256 414 256 414 C256 414 142 348 142 270 V140 Z" 
        fill="#141820" stroke="url(#goldGrad)" stroke-width="8" />

  <!-- Subtle Inner Shield Inlay -->
  <path d="M256 112 L350 154 V262 C350 326 256 382 256 382 C256 382 162 326 162 262 V154 Z" 
        fill="#1a202c" opacity="0.5" />

  <!-- Radiance Behind Cross/Sword -->
  <circle cx="256" cy="245" r="70" fill="url(#emberGrad)" opacity="0.15" filter="url(#glow)" />

  <!-- Open Parchment Scroll Leaves -->
  <path d="M190 230 C220 220 245 228 256 238 C267 228 292 220 322 230 V315 C292 305 267 312 256 322 C245 312 220 305 190 315 Z" 
        fill="#2a221b" stroke="url(#goldGrad)" stroke-width="4" />
  <path d="M256 238 V322" stroke="url(#goldGrad)" stroke-width="3" />

  <!-- Stylized Cross / Sword of Truth -->
  <g filter="url(#glow)">
    <!-- Vertical Blade / Beam -->
    <path d="M256 145 V335" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round" />
    <path d="M256 150 V330" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.9" />
    <!-- Horizontal Cross Guard -->
    <path d="M210 195 H302" stroke="url(#goldGrad)" stroke-width="10" stroke-linecap="round" />
    <path d="M215 195 H297" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.9" />
    <!-- Pommel/Crown detail -->
    <circle cx="256" cy="140" r="7" fill="url(#goldGrad)" />
  </g>

  <!-- Flame of Wisdom above -->
  <path d="M256 120 C248 135 244 145 256 160 C268 145 264 135 256 120 Z" fill="url(#emberGrad)" filter="url(#glow)" />
</svg>
`;

async function run() {
  const iconsDir = path.resolve('public/icons');
  const publicDir = path.resolve('public');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(iconSvg);
  const crest = iconSvg
    .replace('<rect width="512" height="512" rx="112" fill="url(#bgGlow)" />', '')
    .replace('<rect x="12" y="12" width="488" height="488" rx="100" stroke="#3c3127" stroke-width="4" stroke-opacity="0.6" />', '');
  const maskableSvg = crest
    .replace(
      '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n  <rect width="512" height="512" fill="#090b0e" />\n  <g transform="translate(51.2 51.2) scale(0.8)">'
    )
    .replace('</svg>', '</g>\n</svg>');

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(iconsDir, 'maskable-512.png'));

  const apple = await sharp(Buffer.from(maskableSvg)).resize(180, 180).png().toBuffer();
  await sharp(apple).toFile(path.resolve('public/apple-touch-icon.png'));

  await sharp(svgBuffer).resize(128, 128).webp({ quality: 80 }).toFile(path.join(iconsDir, 'icon-128.webp'));
  await sharp(svgBuffer).resize(64, 64).webp({ quality: 80 }).toFile(path.join(iconsDir, 'icon-64.webp'));

  const pngSizes = [16, 32, 48];
  const pngs = [];
  for (const size of pngSizes) {
    const png = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    pngs.push({ png, size });
  }
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngIco(pngs));

  console.log('Successfully generated PWA icons.');
}

function pngIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + count * 16;
  const entries = images.map((img) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += img.png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((img) => img.png)]);
}

run().catch(console.error);
