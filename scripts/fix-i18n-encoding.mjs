/**
 * Repair mojibake in LanguageContext (UTF-8 bytes misread as Latin-1).
 * Also normalizes common punctuation and flag emoji corruptions.
 */
import fs from 'node:fs';

const path = 'src/context/LanguageContext.tsx';
let s = fs.readFileSync(path, 'utf8');

const pairs = [
  ['EspaÃ±ol', 'Español'],
  ['FranÃ§ais', 'Français'],
  ['ParamÃ¨tres', 'Paramètres'],
  ['MÃ©moriser', 'Mémoriser'],
  ['MÃ©morisation', 'Mémorisation'],
  ['PrÃ¡ctica', 'Práctica'],
  ['PrÃ¡cticas', 'Prácticas'],
  ['MisiÃ³n', 'Misión'],
  ['versiÃ³n', 'versión'],
  ['VersÃ­culos', 'Versículos'],
  ['versÃ­culo', 'versículo'],
  ['SÃ©rie', 'Série'],
  ['Ã‰critures', 'Écritures'],
  ['Passer Ã ', 'Passer à'],
  ['Ã ', 'à '],
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã±', 'ñ'],
  ['Ã¡', 'á'],
  ['Ã¨', 'è'],
  ['Ãª', 'ê'],
  ['Ã«', 'ë'],
  ['Ã®', 'î'],
  ['Ã¯', 'ï'],
  ['Ã´', 'ô'],
  ['Ã¶', 'ö'],
  ['Ã¹', 'ù'],
  ['Ã»', 'û'],
  ['Ã¼', 'ü'],
  ['Ã§', 'ç'],
  ['Ã‰', 'É'],
  ['Ã€', 'À'],
  ['Ã‚', 'Â'],
  ['Ã‡', 'Ç'],
  ['Ãˆ', 'È'],
  ['ÃŠ', 'Ê'],
  ['Ã‹', 'Ë'],
  ['ÃŽ', 'Î'],
  ['Ã”', 'Ô'],
  ['Ã™', 'Ù'],
  ['Ã›', 'Û'],
  ['â€™', "'"],
  ['â€˜', "'"],
  ['â€œ', '"'],
  ['â€', '"'],
  ['â€¢', '•'],
  ['â€“', '–'],
  ['â€”', '—'],
  ['â€¦', '…'],
  ['â†’', '→'],
  ['â‰¤', '≤'],
  ['ðŸ‡ºðŸ‡¸', '🇺🇸'],
  ['ðŸ‡ªðŸ‡¸', '🇪🇸'],
  ['ðŸ‡«ðŸ‡·', '🇫🇷'],
];

let changed = 0;
for (const [from, to] of pairs) {
  const n = s.split(from).length - 1;
  if (n > 0) {
    s = s.split(from).join(to);
    changed += n;
  }
}

fs.writeFileSync(path, s, 'utf8');
const remaining = (s.match(/Ã.|â€|ðŸ/g) || []).length;
console.log(`Replaced ${changed} sequences. Remaining mojibake markers: ${remaining}`);
