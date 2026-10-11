import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_MASTER = path.resolve('src/assets/icons/icon-master.png');

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

async function run() {
  const iconsDir = path.resolve('public/icons');
  const publicDir = path.resolve('public');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  if (!fs.existsSync(SRC_MASTER)) {
    throw new Error(`Master icon file not found at ${SRC_MASTER}`);
  }

  // 1. Standard icon with rounded squircle transparent mask
  const squircleMask = Buffer.from(
    '<svg width="1024" height="1024"><rect x="0" y="0" width="1024" height="1024" rx="224" ry="224" fill="#ffffff" /></svg>'
  );

  const masked1024 = await sharp(SRC_MASTER)
    .composite([{ input: squircleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Primary PWA Icons
  console.log('Generating public/icons/icon-512.png...');
  await sharp(masked1024).resize(512, 512).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(iconsDir, 'icon-512.png'));

  console.log('Generating public/icons/icon-192.png...');
  await sharp(masked1024).resize(192, 192).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(iconsDir, 'icon-192.png'));

  // WebP versions
  console.log('Generating public/icons/icon-128.webp & icon-64.webp...');
  await sharp(masked1024).resize(128, 128).webp({ quality: 90 }).toFile(path.join(iconsDir, 'icon-128.webp'));
  await sharp(masked1024).resize(64, 64).webp({ quality: 90 }).toFile(path.join(iconsDir, 'icon-64.webp'));

  // Notification rich icon
  console.log('Generating public/icons/notification-icon.png...');
  await sharp(masked1024).resize(192, 192).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(iconsDir, 'notification-icon.png'));

  // Apple touch icon (180x180)
  console.log('Generating public/apple-touch-icon.png...');
  await sharp(SRC_MASTER).resize(180, 180).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 2. Android Maskable Icon (512x512) - Unmasked master within safe zone (80% / 410px) on full-bleed background
  console.log('Generating public/icons/maskable-512.png...');
  const bgSvg = Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="maskableBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#fff8eb" />
          <stop offset="45%" stop-color="#ebd2a2" />
          <stop offset="80%" stop-color="#cf9444" />
          <stop offset="100%" stop-color="#a66e2c" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#maskableBg)" />
    </svg>
  `);

  const scaledMaster = await sharp(SRC_MASTER)
    .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(bgSvg)
    .composite([
      {
        input: scaledMaster,
        top: Math.round((512 - 410) / 2),
        left: Math.round((512 - 410) / 2)
      }
    ])
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(iconsDir, 'maskable-512.png'));

  // 3. Multi-resolution favicon.ico (16, 32, 48)
  console.log('Generating public/favicon.ico...');
  const icoSizes = [16, 32, 48];
  const icoPngs = [];
  for (const size of icoSizes) {
    const png = await sharp(masked1024).resize(size, size).png().toBuffer();
    icoPngs.push({ png, size });
  }
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngIco(icoPngs));

  console.log('Successfully generated all PWA icons.');
}

run().catch(console.error);
