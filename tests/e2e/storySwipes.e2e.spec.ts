import { test, expect } from '@playwright/test';

/**
 * Story swipe guard rails:
 * - a deliberate horizontal swipe moves forward/back between narration cards
 * - vertical and diagonal drags keep the current card
 * - swiping forward from an unfinished interaction stays on that card
 */
test.describe('story swipe gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (await next.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false)) {
      const skip = page.getByRole('button', { name: 'Skip' });
      if (await skip.isVisible().catch(() => false)) await skip.click();
      else {
        for (let i = 0; i < 5; i++) {
          const start = page.getByRole('button', { name: /Start with David/ });
          if (await start.isVisible().catch(() => false)) {
            await start.click();
            break;
          }
          await next.click();
        }
      }
    }
    await page.getByRole('button', { name: /Play the story|Play again|Resume story/ }).first().click();
    await page.locator('[role="progressbar"]').waitFor({ state: 'visible' });
  });

  async function swipeCard(page, fromX: number, toX: number, fromY?: number, toY?: number) {
    return page.evaluate(
      async ({ fromX, toX, fromY, toY }) => {
        const container = document.querySelector('div.fixed.inset-0 div.overflow-y-auto');
        const rect = container?.getBoundingClientRect();
        const progress = document.querySelector('[role="progressbar"]');
        const y = (rect?.top ?? 0) + (rect?.height ?? 600) / 2;
        const startY = fromY ?? y;
        const endY = toY ?? y;
        const touch = (x: number, yPos: number) =>
          new Touch({ identifier: 99, target: container!, clientX: x, clientY: yPos });
        container!.dispatchEvent(
          new TouchEvent('touchstart', { touches: [touch(fromX, startY)], bubbles: true, cancelable: true })
        );
        await new Promise((resolve) => setTimeout(resolve, 60));
        container!.dispatchEvent(
          new TouchEvent('touchend', { touches: [], changedTouches: [touch(toX, endY)], bubbles: true, cancelable: true })
        );
        await new Promise((resolve) => setTimeout(resolve, 400));
        return progress?.getAttribute('aria-valuenow');
      },
      { fromX, toX, fromY, toY }
    );
  }

  test('horizontal swipes navigate narration cards, other drags do not', async ({ page }) => {
    const progress = page.locator('[role="progressbar"]');
    await expect(progress).toHaveAttribute('aria-valuenow', '1');

    expect(await swipeCard(page, 300, 150)).toBe('2');
    expect(await swipeCard(page, 150, 300)).toBe('1');

    const y = 420;
    expect(await swipeCard(page, 200, 200, y + 100, y - 100)).toBe('1');
    expect(await swipeCard(page, 300, 160, y, y + 120)).toBe('1');
  });

  test('forward swipe stays on an unfinished interaction', async ({ page }) => {
    await swipeCard(page, 300, 150);
    const reveals = page.getByRole('button', { name: 'Tap to reveal' });
    await reveals.first().waitFor({ state: 'visible' });
    await reveals.first().click();
    expect(await swipeCard(page, 300, 150)).toBe('2');
  });
});
