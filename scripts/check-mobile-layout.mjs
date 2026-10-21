import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/';
const failures = [];
function check(name, condition, details) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures.push(name);
    console.log(`FAIL ${name}`, details ?? '');
  }
}

const browser = await chromium.launch();

async function startOnMobile(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('#start');
  await page.waitForFunction(() => document.body.classList.contains('playing'));
  await page.waitForTimeout(500);
  return { page, errors };
}

const metrics = page => page.evaluate(() => {
  const box = selector => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      top: Math.round(rect.top), bottom: Math.round(rect.bottom),
      left: Math.round(rect.left), right: Math.round(rect.right),
      width: Math.round(rect.width), height: Math.round(rect.height),
      display: style.display, visibility: style.visibility,
    };
  };
  const kb = document.getElementById('keyboard-map-container');
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    appHeight: getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim(),
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    bodyClass: document.body.className,
    dockHidden: document.getElementById('keyboard-dock').hidden,
    kbHidden: kb.hidden,
    kbCollapsed: kb.classList.contains('collapsed'),
    dock: box('#keyboard-dock'),
    stage: box('#stage'),
    keyboard: box('#keyboard-map-container'),
    imeBar: box('#system-ime-bar'),
    main: box('main'),
    topbar: box('.topbar'),
    keyboardRows: document.querySelectorAll('.kb-row').length,
    keyboardKeys: document.querySelectorAll('.kb-key').length,
  };
});

// ---------- Phone portrait: welcome + playing ----------
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.625,
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const welcome = await metrics(page);
  check('portrait welcome has no horizontal overflow', welcome.scrollWidth <= welcome.innerWidth + 1, welcome);
  check('portrait welcome start button is inside the viewport',
    await page.evaluate(() => document.getElementById('start').getBoundingClientRect().bottom <= window.innerHeight), welcome);

  await page.click('#start');
  await page.waitForFunction(() => document.body.classList.contains('playing'));
  await page.waitForTimeout(500);
  const m = await metrics(page);
  check('portrait playing: no page errors', errors.length === 0, errors);
  check('portrait playing: dock is visible', m.dock && !m.dockHidden && m.dock.display !== 'none', m);
  check('portrait playing: software keyboard is visible', m.keyboard && !m.kbHidden && m.keyboardRows === 4 && m.keyboardKeys >= 40, m);
  check('portrait playing: system keyboard bar is visible', m.imeBar && m.imeBar.display !== 'none', m);
  check('portrait playing: no horizontal overflow', m.scrollWidth <= m.innerWidth + 1, m);
  check('portrait playing: app height equals viewport', m.appHeight === `${m.innerHeight}px`, m);
  check('portrait playing: dock is inside the viewport', m.dock.bottom <= m.innerHeight + 1 && m.dock.left >= 0 && m.dock.right <= m.innerWidth + 1, m);
  check('portrait playing: animal stage is visible above the dock', m.stage.height > 120 && m.stage.bottom <= m.dock.top + 2, m);
  check('portrait playing: no vertical page scroll', m.scrollHeight <= m.innerHeight + 1, m);

  // One tap must collapse exactly once (pointerdown + synthetic click used to
  // toggle twice and leave the keyboard unchanged).
  await page.tap('#btn-toggle-keyboard');
  await page.waitForTimeout(250);
  const collapsed = await metrics(page);
  check('single tap collapses the in-app keyboard', collapsed.kbHidden && collapsed.kbCollapsed, collapsed);
  await page.waitForTimeout(300);
  await page.tap('#btn-toggle-keyboard');
  await page.waitForTimeout(250);
  const expanded = await metrics(page);
  check('second tap restores the in-app keyboard', !expanded.kbHidden && !expanded.kbCollapsed, expanded);

  // System IME bar: typing one letter must consume it and keep focus for the
  // next character (keyboard must not close after one letter).
  await page.tap('#system-ime-input');
  await page.waitForTimeout(150);
  await page.keyboard.type('k');
  await page.waitForTimeout(200);
  const input = await page.evaluate(() => ({
    value: document.getElementById('system-ime-input').value,
    focused: document.activeElement === document.getElementById('system-ime-input'),
    animal: document.getElementById('animal-name').textContent,
  }));
  check('IME input clears after one letter', input.value === '', input);
  check('IME input keeps focus after a letter', input.focused, input);
  check('IME letter selects a matching animal', input.animal.trim().toLowerCase().startsWith('k'), input);

  // Simulate the system keyboard shrinking the viewport (as adjustResize /
  // interactive-widget=resizes-content does on a real device).
  await page.setViewportSize({ width: 390, height: 420 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(300);
  const ime = await metrics(page);
  check('IME open state detected from viewport height', ime.bodyClass.includes('ime-open'), ime);
  check('IME open hides the duplicate in-app keyboard', ime.keyboard.display === 'none', ime);
  check('IME open: app height tracks the visible viewport', ime.appHeight === '420px', ime);
  check('IME open: no horizontal overflow', ime.scrollWidth <= ime.innerWidth + 1, ime);
  check('IME open: dock stays above the IME', ime.dock.bottom <= ime.innerHeight + 1, ime);
  check('IME open: stage does not overlap the dock', ime.stage.bottom <= ime.dock.top + 2, ime);
  check('IME open: stage remains visible', ime.stage.height > 80, ime);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(300);
  const restored = await metrics(page);
  check('IME close restores the in-app keyboard', !restored.bodyClass.includes('ime-open') && restored.keyboard.display !== 'none', restored);

  await context.close();
}


// ---------- Phone landscape ----------
{
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  });
  const { page, errors } = await startOnMobile(context);
  const m = await metrics(page);
  check('landscape: no page errors', errors.length === 0, errors);
  check('landscape: side-by-side layout is active',
    await page.evaluate(() => getComputedStyle(document.querySelector('main')).flexDirection) === 'row', m);
  check('landscape: no horizontal overflow', m.scrollWidth <= m.innerWidth + 1, m);
  check('landscape: stage and dock fit side by side', m.dock.left >= m.stage.right - 2, m);
  check('landscape: dock is inside the viewport', m.dock.bottom <= m.innerHeight + 1, m);
  check('landscape: keyboard is visible', !m.kbHidden && m.keyboard.display !== 'none', m);
  check('landscape: stage is visible', m.stage.height > 120 && m.stage.width > 100, m);
  await context.close();
}

// ---------- Small phone (320x568) ----------
{
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-G390F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  });
  const { page, errors } = await startOnMobile(context);
  const m = await metrics(page);
  check('small phone: no page errors', errors.length === 0, errors);
  check('small phone: no horizontal overflow', m.scrollWidth <= m.innerWidth + 1, m);
  check('small phone: dock fits', m.dock.left >= 0 && m.dock.right <= m.innerWidth + 1 && m.dock.bottom <= m.innerHeight + 1, m);
  check('small phone: keys do not overflow their rows',
    await page.evaluate(() => [...document.querySelectorAll('.kb-key')].every(key => key.getBoundingClientRect().right <= window.innerWidth + 1)), m);
  await context.close();
}

// ---------- Tablet + desktop ----------
for (const [label, viewport] of [['tablet', { width: 1024, height: 768 }], ['desktop', { width: 1440, height: 900 }]]) {
  const context = await browser.newContext({ viewport, hasTouch: label === 'tablet' });
  const { page, errors } = await startOnMobile(context);
  const m = await metrics(page);
  check(`${label}: no page errors`, errors.length === 0, errors);
  check(`${label}: no horizontal overflow`, m.scrollWidth <= m.innerWidth + 1, m);
  check(`${label}: dock fits in the viewport`, m.dock.bottom <= m.innerHeight + 1 && m.dock.right <= m.innerWidth + 1, m);
  check(`${label}: stage fits in the viewport`, m.stage.top >= 0 && m.stage.bottom <= m.dock.top + 2, m);
  await context.close();
}

await browser.close();
console.log(`\n${failures.length ? `FAILURES (${failures.length}): ${failures.join(', ')}` : 'ALL CHECKS PASSED'}`);
process.exit(failures.length ? 1 : 0);

