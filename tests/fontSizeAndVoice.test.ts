import { test, expect } from '@playwright/test';
import { FONT_SCALE_STEPS, getStoredFontScaleStep } from '../src/context/FontSizeContext';
import { NARRATOR_VOICES, normalizeScriptureForSpeech } from '../src/utils/audio';

test.describe('Testament — Font Size Picker & Voice API Overhaul Suite', () => {

  test('Font Scale: 5-step scale is configured with correct multipliers and M default', () => {
    expect(FONT_SCALE_STEPS).toHaveLength(5);
    const steps = FONT_SCALE_STEPS.map(s => s.step);
    expect(steps).toEqual(['xs', 's', 'm', 'l', 'xl']);

    const stepM = FONT_SCALE_STEPS.find(s => s.step === 'm');
    expect(stepM).toBeDefined();
    expect(stepM?.scale).toBe(1.0);

    const stepXS = FONT_SCALE_STEPS.find(s => s.step === 'xs');
    expect(stepXS?.scale).toBe(0.88);

    const stepXL = FONT_SCALE_STEPS.find(s => s.step === 'xl');
    expect(stepXL?.scale).toBe(1.35);

    expect(getStoredFontScaleStep()).toBe('m');
  });

  test('Voice Settings: All narrator profiles expose a name, subtitle, and description', () => {
    const profiles = ['cinematic', 'brotherhood', 'scholar', 'grace'] as const;
    for (const p of profiles) {
      const voice = NARRATOR_VOICES[p];
      expect(voice).toBeDefined();
      expect(voice.name.length).toBeGreaterThan(0);
      expect(voice.subtitle.length).toBeGreaterThan(0);
      expect(voice.description.length).toBeGreaterThan(0);
    }
  });

  test('Speech Normalization: Reflection badges and verbatim labels are stripped and never spoken', () => {
    const raw = "Reflection • Not Scripture. David stood before the giant. Scripture (Verbatim)";
    const normalized = normalizeScriptureForSpeech(raw);
    expect(normalized).not.toContain("Not Scripture");
    expect(normalized).not.toContain("Reflection");
    expect(normalized).not.toContain("Scripture (Verbatim)");
    expect(normalized).toContain("David stood before the giant.");
  });

  test('Speech Normalization: Emojis and URLs are stripped', () => {
    const raw = "Read more at https://bible.org 📖 or visit www.testament.app 🔥 today.";
    const normalized = normalizeScriptureForSpeech(raw);
    expect(normalized).not.toContain("https://");
    expect(normalized).not.toContain("www.");
    expect(normalized).not.toContain("📖");
    expect(normalized).not.toContain("🔥");
    expect(normalized).toContain("Read more at");
    expect(normalized).toContain("today.");
  });

  test('Speech Normalization: Verse citations are expanded into spoken words', () => {
    const raw = "Genesis 45:5 explains the providence.";
    const normalized = normalizeScriptureForSpeech(raw);
    expect(normalized).toContain("Genesis forty-five, verse five");
  });

  test('Speech Normalization: Verse citation ranges are expanded into spoken words', () => {
    const raw = "Romans 8:28-30 is our anchor.";
    const normalized = normalizeScriptureForSpeech(raw);
    expect(normalized).toContain("Romans eight, verses twenty-eight through thirty");
  });

  test('Speech Normalization: Markdown formatting symbols are cleaned cleanly', () => {
    const raw = "**Bold truth** and *italic wisdom* in `code` — stand firm...";
    const normalized = normalizeScriptureForSpeech(raw);
    expect(normalized).not.toContain("**");
    expect(normalized).not.toContain("*");
    expect(normalized).not.toContain("`");
    expect(normalized).toContain("Bold truth");
    expect(normalized).toContain("italic wisdom");
  });

});
