import fs from 'fs';
import path from 'path';

const root = path.resolve('src');
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(full);
  }
}
walk(root);

function tokenFor(hex) {
  const value = hex.toLowerCase();
  if (value === '#fcfbfa' || value === '#faf8f5') return 'surface';
  const n = parseInt(value.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = (r + g + b) / 3;
  if (luma > 80) return null;
  if (luma < 16) return 'ink';
  if (luma < 26) return 'ink-raised';
  return 'ink-overlay';
}

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const next = text
    .replace(/((?:dark:)?)((?:hover:)?)bg-\[(#[0-9a-fA-F]{6})\](\/\d+)?/g, (match, dark, hover, hex, opacity = '') => {
      const token = tokenFor(hex);
      if (!token) return match;
      return `${dark}${hover}bg-${token}${opacity}`;
    })
    .replace(/shadow-glow-(?:gold|amber|ember)/g, 'shadow-glow')
    .replace(/text-\[(?:8|9|10)px\]/g, 'text-[11px]')
    .replace(/(^|[\s"'`])text-amber-600\b/g, '$1text-amber-800')
    .replace(/(^|[\s"'`])text-amber-700\b/g, '$1text-amber-800')
    .replace(/(^|[\s"'`])text-orange-600\b/g, '$1text-orange-800');
  if (next !== text) fs.writeFileSync(file, next);
}

console.log(`Polished ${files.length} files`);
