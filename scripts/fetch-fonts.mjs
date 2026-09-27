import fs from 'fs';
import path from 'path';

const cssUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap';
const outDir = path.resolve('public/fonts');
fs.mkdirSync(outDir, { recursive: true });

const css = await fetch(cssUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },
}).then((res) => res.text());

const faces = [];
let index = 0;
const rewritten = css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (_match, url) => {
  const name = `font-${index}.woff2`;
  index += 1;
  faces.push({ url, name });
  return `url('/fonts/${name}')`;
});

for (const face of faces) {
  const buf = Buffer.from(await fetch(face.url).then((res) => res.arrayBuffer()));
  fs.writeFileSync(path.join(outDir, face.name), buf);
  console.log(face.name, buf.length);
}

const local = rewritten
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\} /g, '}\n');

fs.writeFileSync(path.resolve('src/fonts.css'), local.trim() + '\n');
console.log('Wrote src/fonts.css');
