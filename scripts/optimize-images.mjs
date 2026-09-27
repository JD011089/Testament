import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('public/images');
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.jpg'));

for (const file of files) {
  const input = path.join(dir, file);
  const base = file.replace(/\.jpg$/, '');
  const meta = await sharp(input).metadata();
  console.log(`${file} ${meta.width}x${meta.height}`);

  for (const width of [768, 1376]) {
    let webpQuality = 72;
    let webp = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: webpQuality }).toBuffer();
    while (webp.length > 150_000 && webpQuality > 42) {
      webpQuality -= 6;
      webp = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: webpQuality }).toBuffer();
    }
    while (width === 1376 && webp.length < 80_000 && webpQuality < 82) {
      webpQuality += 4;
      webp = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: webpQuality }).toBuffer();
    }

    let avifQuality = 48;
    let avif = await sharp(input).resize({ width, withoutEnlargement: true }).avif({ quality: avifQuality }).toBuffer();
    while (avif.length > 150_000 && avifQuality > 32) {
      avifQuality -= 4;
      avif = await sharp(input).resize({ width, withoutEnlargement: true }).avif({ quality: avifQuality }).toBuffer();
    }

    fs.writeFileSync(path.join(dir, `${base}-${width}.webp`), webp);
    fs.writeFileSync(path.join(dir, `${base}-${width}.avif`), avif);
    console.log(`  ${width} webp ${(webp.length / 1024).toFixed(0)}KB q${webpQuality} | avif ${(avif.length / 1024).toFixed(0)}KB q${avifQuality}`);
  }

  fs.unlinkSync(input);
}
