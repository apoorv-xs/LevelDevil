const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log('====================================================');
  console.log('🚀 COMPREHENSIVE EMPIRICAL STRESS AUDIT: BB-8 SYSTEM');
  console.log('====================================================\n');

  const benchmarkReport = {
    descentTracking: { samples: 0, offScreenDrops: 0, minScreenY: Infinity, maxScreenY: -Infinity },
    manualControlHandoff: { passed: false },
    formTypingIsolation: { passed: false },
    constructTool: { passed: false },
    memoryLeakAudit: { passed: false, contextCount: 0 },
    errors: []
  };

  // --- BENCHMARK 1: FULL DESCENT TRACKING AUDIT (Home 0 -> 3600px) ---
  console.log('--- TEST 1: FULL ATMOSPHERIC DESCENT TRACKING (0 to 3600px) ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => {
    if (msg.type() === 'error') benchmarkReport.errors.push(`[Console Error]: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    benchmarkReport.errors.push(`[Page Error]: ${err.message}`);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const maxScroll = await page.evaluate(() => Math.max(document.documentElement.scrollHeight - window.innerHeight, 3200));
  console.log(`Max scroll depth: ${maxScroll}px`);

  for (let scrollTarget = 0; scrollTarget <= maxScroll; scrollTarget += 200) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scrollTarget);
    await page.waitForTimeout(150);

    const telemetry = await page.evaluate(() => {
      const p = window.player;
      const scrollY = window.scrollY || 0;
      const vh = window.innerHeight;
      const screenY = p ? Math.round(p.pos.y - scrollY) : -999;
      return {
        x: p ? Math.round(p.pos.x) : 0,
        y: p ? Math.round(p.pos.y) : 0,
        screenY,
        scrollY,
        vh,
        intent: window.System1Brain?.currentIntent,
        grounded: p?.grounded,
        isOffScreen: screenY < -60 || screenY > vh + 60
      };
    });

    benchmarkReport.descentTracking.samples++;
    if (telemetry.screenY < benchmarkReport.descentTracking.minScreenY) {
      benchmarkReport.descentTracking.minScreenY = telemetry.screenY;
    }
    if (telemetry.screenY > benchmarkReport.descentTracking.maxScreenY) {
      benchmarkReport.descentTracking.maxScreenY = telemetry.screenY;
    }
    if (telemetry.isOffScreen) {
      benchmarkReport.descentTracking.offScreenDrops++;
      console.warn(`⚠️ OFF-SCREEN AT scrollY=${telemetry.scrollY}: BB-8 at y=${telemetry.y}, screenY=${telemetry.screenY}px (intent: ${telemetry.intent})`);
    }
  }

  console.log(`Descent Samples: ${benchmarkReport.descentTracking.samples}`);
  console.log(`Min Screen Y: ${benchmarkReport.descentTracking.minScreenY}px, Max Screen Y: ${benchmarkReport.descentTracking.maxScreenY}px`);
  console.log(`Off-screen drops during descent: ${benchmarkReport.descentTracking.offScreenDrops}`);

  // --- BENCHMARK 2: MANUAL CONTROL & AUTONOMOUS RESUMPTION ---
  console.log('\n--- TEST 2: MANUAL KEYBOARD CONTROL & AUTONOMOUS RESUMPTION ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const initialX = await page.evaluate(() => Math.round(window.player.pos.x));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');

  const manualMode = await page.evaluate(() => window.controlMode);
  const postMoveX = await page.evaluate(() => Math.round(window.player.pos.x));
  console.log(`Manual steering test: initialX=${initialX}, postMoveX=${postMoveX}, controlMode=${manualMode}`);

  // Wait 3.5s for autonomous resumption
  console.log('Waiting 3.5s for autonomous brain to resume...');
  await page.waitForTimeout(3500);
  const resumedMode = await page.evaluate(() => window.controlMode);
  console.log(`Post-idle controlMode: ${resumedMode}`);

  if (manualMode === 'manual' && resumedMode === 'autonomous' && postMoveX !== initialX) {
    benchmarkReport.manualControlHandoff.passed = true;
  }

  // --- BENCHMARK 3: HARD-LIGHT CONSTRUCT PLATFORM ---
  console.log('\n--- TEST 3: HARD-LIGHT CONSTRUCT PLATFORM ---');
  const constructRes = await page.evaluate(() => {
    if (typeof window.triggerConstructPlatform === 'function') {
      window.triggerConstructPlatform();
      const arch = window.AstromechArchitect || window.Player3D?.architect;
      const rails = arch?.activeRails || [];
      const rail = rails[0];
      return {
        spawned: rails.length > 0,
        hasNaN: isNaN(rail?.group?.position?.x) || isNaN(rail?.group?.position?.y),
        pos3D: rail?.group?.position ? { x: rail.group.position.x, y: rail.group.position.y } : null,
        playerGroundedOnIt: window.player?.currentRail?.name === 'HARD_LIGHT_PLATFORM'
      };
    }
    return { spawned: false };
  });
  console.log('Construct Platform Result:', constructRes);
  if (constructRes.spawned && !constructRes.hasNaN && constructRes.playerGroundedOnIt) {
    benchmarkReport.constructTool.passed = true;
  }

  // --- BENCHMARK 4: FORM TYPING ISOLATION ON /sales ---
  console.log('\n--- TEST 4: FORM TYPING ISOLATION ON /sales ---');
  await page.goto('http://localhost:5173/sales', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const salesInitialPos = await page.evaluate(() => ({ x: Math.round(window.player.pos.x), y: Math.round(window.player.pos.y) }));
  
  // Focus name input and type 'wasd wasd'
  const nameInput = page.locator('#inquiry-name');
  if (await nameInput.isVisible()) {
    await nameInput.focus();
    await page.waitForTimeout(1200);

    const salesSettled = await page.evaluate(() => ({
      x: Math.round(window.player.pos.x),
      y: Math.round(window.player.pos.y),
      mode: window.controlMode
    }));

    await page.keyboard.type('wasdwasdwasd');
    await page.waitForTimeout(300);

    const salesPostType = await page.evaluate(() => ({
      x: Math.round(window.player.pos.x),
      y: Math.round(window.player.pos.y),
      mode: window.controlMode
    }));
    console.log(`Sales input typing test: settledMode=${salesSettled.mode}, postTypeMode=${salesPostType.mode}, pos=(${salesPostType.x}, ${salesPostType.y})`);

    // Verify controlMode DID NOT get hijacked to 'manual' by typing WASD
    if (salesPostType.mode === 'autonomous') {
      benchmarkReport.formTypingIsolation.passed = true;
    }
  } else {
    console.warn('#inquiry-name not visible on /sales');
  }

  // --- BENCHMARK 5: ROUTE TRANSITION & MEMORY LIFECYCLE ---
  console.log('\n--- TEST 5: ROUTE CYCLING & MEMORY LIFECYCLE ---');
  for (let cycle = 1; cycle <= 3; cycle++) {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.goto('http://localhost:5173/sales', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.goto('http://localhost:5173/workspace/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
  }

  // Check final state
  const finalCheck = await page.evaluate(() => {
    return {
      hasCompanion: !!window.player,
      is3DReady: !!window.Engine3D?.isReady
    };
  });
  console.log('Final post-transition state on /workspace/:', finalCheck);
  benchmarkReport.memoryLeakAudit.passed = finalCheck.hasCompanion;

  await browser.close();

  // --- BENCHMARK SUMMARY ---
  console.log('\n====================================================');
  console.log('📊 AUDIT RESULTS SUMMARY');
  console.log('====================================================');
  console.log(`1. Descent Tracking: ${benchmarkReport.descentTracking.offScreenDrops === 0 ? '✅ 100% VISIBLE' : '❌ ' + benchmarkReport.descentTracking.offScreenDrops + ' DROPS'}`);
  console.log(`2. Manual Handoff: ${benchmarkReport.manualControlHandoff.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`3. Construct Platform Tool: ${benchmarkReport.constructTool.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`4. Form Typing Isolation: ${benchmarkReport.formTypingIsolation.passed ? '✅ PASSED (NO HIJACK)' : '❌ FAILED'}`);
  console.log(`5. Route Cycle Teardown: ${benchmarkReport.memoryLeakAudit.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`6. Console/Page Errors: ${benchmarkReport.errors.length === 0 ? '✅ 0 ERRORS' : '❌ ' + benchmarkReport.errors.length + ' ERRORS'}`);
  if (benchmarkReport.errors.length > 0) {
    console.log('Errors:', benchmarkReport.errors);
  }
  console.log('====================================================\n');

  if (benchmarkReport.descentTracking.offScreenDrops > 0 || !benchmarkReport.manualControlHandoff.passed || !benchmarkReport.formTypingIsolation.passed || !benchmarkReport.constructTool.passed || benchmarkReport.errors.length > 0) {
    process.exit(1);
  }
})();
