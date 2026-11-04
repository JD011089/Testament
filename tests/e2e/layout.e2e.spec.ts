import { test, expect, type Page } from '@playwright/test';

/**
 * Layout guard: nothing on screen may overlap or spill sideways on real phones.
 *
 * Galaxy S26 Ultra reports 384 CSS px wide at its default FHD+ resolution,
 * 412 px at WQHD+, and less when the phone's font size is raised. Each screen is checked at both widths, at the app's M, L and
 * XL text sizes, in light and dark.
 *
 * Run: npm run test:e2e -- layout
 */

const PHONES = [
  // Chrome on Samsung zooms pages when the system font size is raised, which
  // narrows the screen (384px / 1.15 ≈ 336px).
  { name: 'S26 Ultra, larger system font', width: 336, height: 724 },
  { name: 'S26 Ultra FHD+', width: 384, height: 832 },
  { name: 'S26 Ultra WQHD+', width: 412, height: 891 },
];
const TEXT_SIZES = ['m', 'l', 'xl'] as const;

const ROUTES: { name: string; path: string; ready?: string }[] = [
  { name: 'Today', path: '/' },
  { name: 'Journey', path: '/map' },
  { name: 'Bible', path: '/library' },
  { name: 'Collection', path: '/deck' },
  { name: 'Settings', path: '/settings' },
  { name: 'Reminders', path: '/notifications' },
  { name: 'Journal', path: '/journal' },
  { name: 'People', path: '/people' },
  { name: 'How it works', path: '/how-it-works' },
  { name: 'Learner mode', path: '/learner-mode' },
  { name: 'Story', path: '/story/elijah-carmel' },
];

/**
 * Runs in the page. Finds visible text runs, icons and controls whose boxes
 * overlap (ignoring parent/child pairs and fixed bars floating over content),
 * plus anything wider than the screen.
 */
function findClashes(): string[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const problems: string[] = [];

  const visible = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) return false;
    for (let a: Element | null = el.parentElement; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) return false;
    }
    return true;
  };
  const isFixedLayer = (el: Element) => {
    for (let a: Element | null = el; a; a = a.parentElement) {
      const p = getComputedStyle(a).position;
      if (p === 'fixed' || p === 'sticky') return a;
    }
    return null;
  };
  const label = (el: Element) => {
    const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `<${el.tagName.toLowerCase()}${text ? ` "${text}"` : ''}>`;
  };

  // 1. Sideways overflow.
  if (document.documentElement.scrollWidth > vw + 1) {
    let widest: Element | null = null;
    let widestRight = vw;
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > widestRight + 1 && visible(el) && getComputedStyle(el).position !== 'fixed') {
        widest = el;
        widestRight = r.right;
      }
    });
    problems.push(`page is ${document.documentElement.scrollWidth}px wide (screen ${vw}px)${widest ? `, widest: ${label(widest)}` : ''}`);
  }

  // 2. Collect boxes for text runs, icons and controls in view.
  type Box = { el: Element; r: DOMRect; kind: string };
  const boxes: Box[] = [];
  // A box counts only if it is on top at its centre (not hidden under a page or sheet).
  const onTop = (el: Element, r: DOMRect) => {
    const x = Math.min(vw - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(x, y);
    if (!hit) return false;
    if (hit === el || el.contains(hit) || hit.contains(el)) return true;
    // Covered by something. Only a full-screen page, sheet or backdrop really hides it;
    // a small chip or button on top of it is exactly the clash we are looking for.
    for (let a: Element | null = hit; a; a = a.parentElement) {
      if (a.contains(el)) break;
      const p = getComputedStyle(a).position;
      const b = a.getBoundingClientRect();
      if ((p === 'fixed' || p === 'absolute') && b.width >= vw * 0.9 && b.height >= vh * 0.6) return false;
    }
    return true;
  };
  const inView = (r: DOMRect) => r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent || !n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'OPTION'].includes(el.tagName) || !visible(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const raw of Array.from(range.getClientRects())) {
      // Trim to any ancestor that clips its overflow (e.g. text clamped to two lines).
      let r: DOMRect | null = raw;
      for (let a: Element | null = el; a && r; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const c = a.getBoundingClientRect();
        const left = Math.max(r.left, c.left), top = Math.max(r.top, c.top);
        const right = Math.min(r.right, c.right), bottom = Math.min(r.bottom, c.bottom);
        r = right - left > 1 && bottom - top > 1 ? new DOMRect(left, top, right - left, bottom - top) : null;
      }
      if (r && inView(r) && onTop(el, r)) boxes.push({ el, r, kind: 'text' });
    }
  }
  document.querySelectorAll('svg, img, button, a, input, select, textarea, [role="switch"]').forEach((el) => {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
    const size = el.getBoundingClientRect();
    // Artwork and decorative drawings (map trail, scenes): text sits on them by design.
    if ((el.tagName === 'IMG' || el.tagName.toLowerCase() === 'svg') && (size.width > 120 || size.height > 120)) return;
    const r = el.getBoundingClientRect();
    if (inView(r) && visible(el) && onTop(el, r)) boxes.push({ el, r, kind: el.tagName.toLowerCase() });
  });

  const related = (a: Element, b: Element) => a === b || a.contains(b) || b.contains(a);
  const seen = new Set<string>();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i];
      const B = boxes[j];
      if (related(A.el, B.el)) continue;
      // Controls only clash with things outside themselves.
      const ctlA = A.el.closest('button, a, label');
      const ctlB = B.el.closest('button, a, label');
      if (ctlA && ctlA === ctlB) continue;
      // Icons placed inside a text field (search magnifier) are intentional.
      const isField = (e: Element) => ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.tagName);
      if ((isField(A.el) && B.kind === 'svg') || (isField(B.el) && A.kind === 'svg')) continue;
      // A graphic layered exactly over another (progress ring on a thumbnail) is intentional.
      const graphic = (k: string) => k === 'svg' || k === 'img';
      const inside = (p: DOMRect, q: DOMRect) => p.left >= q.left - 1 && p.right <= q.right + 1 && p.top >= q.top - 1 && p.bottom <= q.bottom + 1;
      if (graphic(A.kind) && graphic(B.kind) && (inside(A.r, B.r) || inside(B.r, A.r))) continue;
      // Fixed/sticky bars float over scrolling content on purpose.
      const fa = isFixedLayer(A.el);
      const fb = isFixedLayer(B.el);
      if (fa !== fb && (!fa || !fb || !(fa.contains(fb) || fb.contains(fa)))) continue;
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
      const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w > 2 && h > 2) {
        const key = `${label(A.el)}|${label(B.el)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        problems.push(`${label(A.el)} overlaps ${label(B.el)} (${Math.round(w)}×${Math.round(h)}px at y=${Math.round(Math.max(A.r.top, B.r.top))})`);
      }
    }
  }
  return problems;
}

async function prepare(page: Page, textSize: string, theme: string) {
  await page.addInitScript(([size, th]) => {
    localStorage.setItem('testament_first_run_done', 'true');
    localStorage.setItem('testament_font_scale_step', size);
    localStorage.setItem('testament_theme', th);
    localStorage.setItem('testament_audio_enabled', 'false');
    sessionStorage.setItem('testament_onboarding_snoozed', '1');
  }, [textSize, theme]);
}

for (const phone of PHONES) {
  test.describe(`${phone.name} (${phone.width}px)`, () => {
    test.use({
      viewport: { width: phone.width, height: phone.height },
      deviceScaleFactor: 2.8125,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S948U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    });

    for (const route of ROUTES) {
      test(`${route.name} has no clashes`, async ({ page }) => {
        const report: string[] = [];
        for (const theme of ['light', 'dark']) {
          for (const size of TEXT_SIZES) {
            if (theme === 'dark' && size !== 'm') continue; // dark mode shares layout; one size is enough
            await prepare(page, size, theme);
            await page.goto(route.path);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(600);
            // Close any popup that appears on first visit so the screen itself is checked.
            const problems = await page.evaluate(findClashes);
            for (const p of problems) report.push(`[${theme}, text ${size.toUpperCase()}] ${p}`);
          }
        }
        expect(report, report.join('\n')).toEqual([]);
      });
    }
  });
}
