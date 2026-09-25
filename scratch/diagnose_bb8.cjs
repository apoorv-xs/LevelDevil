const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}\n${err.stack}`));

  console.log('Testing live production site: https://apoorv.qzz.io ...');
  await page.goto('https://apoorv.qzz.io', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const state = await page.evaluate(() => {
    return {
      hasThree: typeof THREE !== 'undefined',
      hasEngine3D: typeof window.Engine3D !== 'undefined',
      hasPlayer3D: typeof window.Player3D !== 'undefined',
      player3DCreated: window.Player3D?.isCreated,
      player3DRoot: Boolean(window.Player3D?.root),
      player3DPos: window.Player3D?.root ? { 
        x: window.Player3D.root.position.x, 
        y: window.Player3D.root.position.y, 
        z: window.Player3D.root.position.z,
        visible: window.Player3D.root.visible
      } : null,
      hasPlayer: typeof window.player !== 'undefined',
      playerPos: window.player?.pos ? { x: window.player.pos.x, y: window.player.pos.y } : null,
      landingRailsCount: window.landingRails?.length,
      threeCanvas: Boolean(document.getElementById('three-canvas')),
      threeCanvasZIndex: window.getComputedStyle(document.getElementById('three-canvas') || document.body).zIndex,
      scripts: Array.from(document.querySelectorAll('script')).map(s => s.src)
    };
  });

  console.log('=== REMOTE STATE ===');
  console.log(JSON.stringify(state, null, 2));
  console.log('=== REMOTE LOGS ===');
  console.log(logs.join('\n'));
  await page.screenshot({ path: 'scratch/remote_live.png' });
  await browser.close();
})();
