/**
 * 1) Repair remaining mojibake sequences
 * 2) Escape unescaped apostrophes inside single-quoted translation values
 */
import fs from 'node:fs';

const pairs = [
  ['âœ“', '✓'], ['âš ï¸', '⚠️'], ['âš ', '⚠'], ['ðŸ“œ', '📜'], ['âŠ•', '⊕'],
  ['â‹®', '⋮'], ['âž”', '➡'], ['ðŸŽ¯', '🎯'], ['âš¡', '⚡'], ['ðŸ“–', '📖'],
  ['âš”ï¸', '⚔'], ['âš”', '⚔'], ['â†', '←'], ['Ã ', 'à'], ['Ã¡', 'á'],
  ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'], ['Ã±', 'ñ'], ['Ãš', 'Ú'],
  ['cÅ“ur', 'cœur'], ['Å“', 'œ'], ['Â¿', '¿'], ['Â¡', '¡'], ['Â«', '«'],
  ['Â»', '»'], ['Ã', 'Í'], ['Ã', 'Á'], ['Ã¢', 'â'], ['Ã‰', 'É'],
  ['ðŸ‡ºðŸ‡¸', '🇺🇸'], ['ðŸ‡ªðŸ‡¸', '🇪🇸'], ['ðŸ‡«ðŸ‡·', '🇫🇷'],
  ['EspaÃ±ol', 'Español'], ['FranÃ§ais', 'Français'],
];

function repairMojibake(s) {
  let n = 0;
  for (const [from, to] of pairs) {
    const c = s.split(from).length - 1;
    if (c) {
      s = s.split(from).join(to);
      n += c;
    }
  }
  return { s, n };
}

function escapeApostrophesInFile(path) {
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  let fixed = 0;
  const out = lines.map((line) => {
    // Only touch single-quoted object values: 'key': '....',
    const m = line.match(/^(\s*'[^']+'\s*:\s*)'(.*)('\s*,?\s*)$/);
    if (!m) return line;
    const [, prefix, mid, suffix] = m;
    if (!mid.includes("'")) return line;
    // Protect already-escaped apostrophes, escape the rest, restore.
    const protectedMid = mid.replace(/\\'/g, '\u0000');
    if (!protectedMid.includes("'")) return line;
    const escaped = protectedMid.replace(/'/g, "\\'").replace(/\u0000/g, "\\'");
    fixed += 1;
    return `${prefix}'${escaped}${suffix}`;
  });
  fs.writeFileSync(path, out.join('\n'));
  return fixed;
}

for (const path of [
  'src/context/LanguageContext.tsx',
  'src/components/WhatsNewModal.tsx',
  'src/components/OpenBookModal.tsx',
]) {
  if (!fs.existsSync(path)) continue;
  let s = fs.readFileSync(path, 'utf8');
  const { s: repaired, n } = repairMojibake(s);
  fs.writeFileSync(path, repaired);
  const esc = escapeApostrophesInFile(path);
  const rem = (fs.readFileSync(path, 'utf8').match(/Ã.|â€|ðŸ|âœ|âš/g) || []).length;
  console.log(`${path}: mojibake ${n}, escaped ${esc}, remaining markers ${rem}`);
}
