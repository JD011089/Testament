import { test, expect } from '@playwright/test';
import {
  normalizeScriptureForSpeech,
  splitForSpeech,
  pickNarratorVoice,
  voiceQualityScore,
  friendlyVoiceName,
} from '../src/utils/audio';

const voice = (name: string, lang = 'en-US', extra: Partial<SpeechSynthesisVoice> = {}) =>
  ({ name, lang, localService: true, default: false, voiceURI: name, ...extra }) as SpeechSynthesisVoice;

test.describe('Narration quality', () => {
  test('numbered books are read as ordinals', () => {
    expect(normalizeScriptureForSpeech('1 Kings 18:21')).toBe('First Kings eighteen, verse twenty-one');
    expect(normalizeScriptureForSpeech('Read 2 Corinthians 5:17 today')).toContain('Second Corinthians five, verse seventeen');
  });

  test('all-caps divine names are not spelled out', () => {
    expect(normalizeScriptureForSpeech('The LORD is my shepherd. GOD is near.')).toBe('The Lord is my shepherd. God is near.');
  });

  test('Spanish and French references keep digits and use the right word', () => {
    expect(normalizeScriptureForSpeech('Génesis 45:5', 'es')).toBe('Génesis 45, versículo 5');
    expect(normalizeScriptureForSpeech('Romains 8:28-30', 'fr')).toBe('Romains 8, versets 28 à 30');
  });

  test('long text is split into sentence-sized pieces that cover all the text', () => {
    const text = 'Elijah stood alone. ' + 'The crowd waited, and the prophets cried out from morning until noon, '.repeat(6) + 'Then fire fell!';
    const pieces = splitForSpeech(text);
    expect(pieces.length).toBeGreaterThan(1);
    for (const p of pieces) {
      expect(p.text.length).toBeLessThanOrEqual(161);
      expect(text.slice(p.start, p.start + p.text.length)).toBe(p.text);
    }
    expect(pieces.map((p) => p.text).join(' ').replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' ').trim());
  });

  test('short text stays in one piece', () => {
    expect(splitForSpeech('Be still, and know that I am God.')).toEqual([{ text: 'Be still, and know that I am God.', start: 0 }]);
  });

  test('natural voices beat robotic ones, and novelty voices are never chosen', () => {
    const voices = [
      voice('Albert'),
      voice('Microsoft David - English (United States)'),
      voice('Microsoft Andrew Online (Natural) - English (United States)', 'en-US', { localService: false }),
      voice('Microsoft Ava Online (Natural) - English (United States)', 'en-US', { localService: false }),
      voice('Microsoft Ryan Online (Natural) - English (United Kingdom)', 'en-GB', { localService: false }),
    ];
    expect(voiceQualityScore(voices[0])).toBeLessThan(0);
    expect(pickNarratorVoice(voices, 'cinematic', 'en')?.name).toContain('Andrew');
    expect(pickNarratorVoice(voices, 'grace', 'en')?.name).toContain('Ava');
    expect(pickNarratorVoice(voices, 'scholar', 'en')?.name).toContain('Ryan');
  });

  test('quality wins over a preferred name', () => {
    const voices = [
      voice('Daniel', 'en-GB'),
      voice('Microsoft Thomas Online (Natural) - English (United Kingdom)', 'en-GB'),
    ];
    expect(pickNarratorVoice(voices, 'scholar', 'en')?.name).toContain('Thomas');
  });

  test('picks a voice in the app language', () => {
    const voices = [
      voice('Microsoft Andrew Online (Natural) - English (United States)'),
      voice('Microsoft Elvira Online (Natural) - Spanish (Spain)', 'es-ES'),
    ];
    expect(pickNarratorVoice(voices, 'cinematic', 'es')?.lang).toBe('es-ES');
  });

  test('voice names are shortened for display', () => {
    expect(friendlyVoiceName('Microsoft Andrew Online (Natural) - English (United States)')).toBe('Andrew (Natural)');
    expect(friendlyVoiceName('Ava (Premium)')).toBe('Ava (Premium)');
  });
});
