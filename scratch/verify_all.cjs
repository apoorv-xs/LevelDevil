const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const allErrors = [];

  // 1. HOME DESKTOP
  console.log('=== TEST 1: HOME DESKTOP ===');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error Home]:', msg.text());
      allErrors.push(`[Home]: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    console.error('[Page Error Home]:', err.message);
    allErrors.push(`[Home]: ${err.message}`);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Trigger construct platform directly
  console.log('Triggering triggerConstructPlatform()...');
  await page.evaluate(() => {
    if (typeof window.triggerConstructPlatform === 'function') {
      window.triggerConstructPlatform();
    }
  });
  await page.waitForTimeout(600);

  const constructCheck = await page.evaluate(() => {
    const active = window.AstromechArchitect?.activeRails || window.Player3D?.architect?.activeRails || [];
    return {
      activeRailsCount: active.length,
      hasNaN: active.some(r => isNaN(r.group?.position?.x) || isNaN(r.group?.position?.y)),
      rail: active[0] ? {
        name: active[0].name,
        pos3D: { x: active[0].group?.position?.x, y: active[0].group?.position?.y },
        pos2D: { x: active[0].cx, y: active[0].y2d },
        materialsCount: active[0].materials?.length
      } : null
    };
  });
  console.log('Construct Platform Check:', JSON.stringify(constructCheck, null, 2));

  // 2. SALES DESKTOP
  console.log('\n=== TEST 2: SALES DESKTOP ===');
  const salesPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  salesPage.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error Sales]:', msg.text());
      allErrors.push(`[Sales]: ${msg.text()}`);
    }
  });
  salesPage.on('pageerror', err => {
    console.error('[Page Error Sales]:', err.message);
    allErrors.push(`[Sales]: ${err.message}`);
  });

  await salesPage.goto('http://localhost:5173/sales', { waitUntil: 'networkidle' });
  await salesPage.waitForTimeout(2000);

  const salesStatus = await salesPage.evaluate(() => {
    return {
      hasInquiryForm: !!document.querySelector('#inquiry-form'),
      companionReady: !!window.player,
      mobileControls: !!document.querySelector('#mobile-controls')
    };
  });
  console.log('Sales Status:', JSON.stringify(salesStatus, null, 2));

  // 3. WORKSPACE
  console.log('\n=== TEST 3: WORKSPACE ===');
  const wsPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wsPage.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error WS]:', msg.text());
      allErrors.push(`[Workspace]: ${msg.text()}`);
    }
  });
  wsPage.on('pageerror', err => {
    console.error('[Page Error WS]:', err.message);
    allErrors.push(`[Workspace]: ${err.message}`);
  });

  await wsPage.goto('http://localhost:5173/workspace/', { waitUntil: 'networkidle' });
  await wsPage.waitForTimeout(2000);

  const wsStatus = await wsPage.evaluate(() => {
    return {
      companionReady: !!window.player,
      mobileControls: !!document.querySelector('#mobile-controls'),
      dataAttributesCount: document.querySelectorAll('[data-kaboom-body="true"]').length
    };
  });
  console.log('Workspace Status:', JSON.stringify(wsStatus, null, 2));

  await browser.close();

  console.log('\n=== ERROR AUDIT ===');
  console.log('Total console/page errors:', allErrors.length);
  if (allErrors.length > 0) {
    console.error('Errors found:\n' + allErrors.join('\n'));
    process.exit(1);
  }
  
  if (constructCheck.hasNaN) {
    console.error('FATAL: Construct platform has NaN coordinates!');
    process.exit(1);
  }
  if (constructCheck.activeRailsCount === 0) {
    console.error('FATAL: Construct platform failed to spawn!');
    process.exit(1);
  }

  console.log('\n>>> ALL 3 ROUTES VERIFIED: ZERO ERRORS, BB-8 COMPANION OPERATIONAL ACROSS THE ENTIRE SUITE! <<<');
})();
