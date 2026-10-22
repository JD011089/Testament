import { test, expect, type Page } from '@playwright/test';

/**
 * Full daily loop for David and Goliath at 390x844 and 820x1180:
 * first run -> Today -> play story -> quiz -> lock in -> collect -> Deck -> reload resume.
 * Also asserts that Back never exits mid-flow.
 */

// The ladder tiles keep raw punctuation, so derive the expected order from the
// exact WEB verse text rather than hand-typing tokens.
const VERSE_TEXT = "and that all this assembly may know that Yahweh doesn't save with sword and spear; for the battle is Yahweh's, and he will give you into our hand.";
const VERSE_WORDS = VERSE_TEXT.split(/\s+/).filter(Boolean);

test.setTimeout(150_000);

async function dismissFirstRun(page: Page) {
  const next = page.getByRole('button', { name: 'Next', exact: true });
  const appeared = await next.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
  if (!appeared) return;

  // Advance through the onboarding screens; the final screen has the start button.
  for (let i = 0; i < 5; i++) {
    const start = page.getByRole('button', { name: /Start with David/ });
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      break;
    }
    await next.click();
  }
  // Hard guarantee the overlay is gone so it cannot intercept later clicks.
  await next.waitFor({ state: 'hidden', timeout: 10_000 });
}

async function advance(page: Page) {
  await page.keyboard.press('ArrowRight');
}

async function clickContinue(page: Page) {
  const cont = page.getByRole('button', { name: 'Continue', exact: true });
  await cont.waitFor({ state: 'visible' });
  await cont.click();
}

async function playStory(page: Page) {
  await dismissFirstRun(page);
  await page.getByRole('button', { name: /Play the story|Play again|Resume story/ }).first().click();

  // Card 0: narration
  await advance(page);

  // Card 1: tap-reveal armor
  const reveals = page.getByRole('button', { name: 'Tap to reveal' });
  await reveals.first().waitFor({ state: 'visible' });
  for (let i = 0; i < 5; i++) await reveals.first().click();
  await clickContinue(page);

  // Card 2: narration
  await advance(page);

  // Card 3: drag five stones (tap item, then tap the bag)
  await page.getByRole('button', { name: 'Smooth stone' }).first().waitFor({ state: 'visible' });
  for (let i = 0; i < 5; i++) {
    const stone = page.locator('button:not([disabled]):has-text("Smooth stone")').first();
    await stone.click();
    await page.getByText('Tap the bag to drop it').click();
  }
  await clickContinue(page);

  // Card 4: choice
  await page.getByRole('button', { name: /Yes/ }).first().click();
  await clickContinue(page);

  // Card 5: hold to swing
  const hold = page.getByRole('button', { name: /Hold to swing/ });
  await hold.waitFor({ state: 'visible' });
  const box = await hold.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    await page.mouse.up();
  }
  await clickContinue(page);

  // Card 6: narration
  await advance(page);

  // Card 7: payoff -> Done for now
  await page.getByRole('button', { name: /Done for now/ }).click();
}

async function answerQuiz(page: Page) {
  for (let i = 0; i < 3; i++) {
    const options = page.locator('button[aria-pressed]');
    await options.first().waitFor({ state: 'visible' });
    await options.first().click();
    const advanceBtn = page.getByRole('button', { name: /Next question|^Done$/ });
    await advanceBtn.click();
  }
}

async function lockIn(page: Page) {
  await page.getByText('Tap the words in order.').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: VERSE_WORDS[0], exact: true }).first().click();
  const wrongWord = VERSE_WORDS[2];
  await page.getByRole('button', { name: wrongWord, exact: true }).click();
  await expect(page.getByRole('button', { name: wrongWord, exact: true })).toHaveCount(0);
  const placedWord = page.getByRole('button', { name: `Remove ${wrongWord} from your verse`, exact: true });
  await expect(placedWord).toBeVisible();
  await placedWord.click();
  await expect(page.getByRole('button', { name: wrongWord, exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: VERSE_WORDS[1], exact: true }).first().click();
  for (const word of VERSE_WORDS.slice(2)) {
    await page.getByRole('button', { name: word, exact: true }).first().click();
  }
  await page.getByText(/In order|Close\./).waitFor({ state: 'visible' });
}

test('complete the daily loop, land the card in Deck, and resume', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('testament_audio_enabled', 'false'));
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // First run -> Today
  await dismissFirstRun(page);
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

  // Back from the story at the first card does not exit the flow.
  await page.getByRole('button', { name: /Play the story/ }).first().click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

  // Play the whole story, quiz, lock in, collect.
  await playStory(page);
  await answerQuiz(page);
  // A due review must not hold the daily flow on step three after today's verse is locked in.
  await page.evaluate(() => {
    localStorage.setItem('testament_memory_ladder', JSON.stringify({
      '1 Samuel 17:11': { ref: '1 Samuel 17:11', level: 1, reps: 0, lapses: 0, dueDate: '2020-01-01', lastReviewed: '', masteredDays: [] }
    }));
  });
  await lockIn(page);
  await expect(page.getByText("Today's verse")).toBeHidden();
  await expect(page.getByText('Verse collected')).toBeVisible();
  await page.getByRole('button', { name: /Done for today/ }).click();

  // Clear Done state
  await expect(page.getByRole('heading', { name: /Done for today/ })).toBeVisible();

  // Card landed in Deck
  await page.getByRole('button', { name: 'Deck', exact: true }).click();
  await expect(page.getByText('1 Samuel 17:47').first()).toBeVisible();

  // Reload resumes with the card still collected
  await page.reload();
  await page.getByRole('button', { name: 'Deck', exact: true }).click();
  await expect(page.getByText('1 Samuel 17:47').first()).toBeVisible();
});
