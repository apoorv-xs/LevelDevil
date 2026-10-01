import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateThumbnail() {
  const pressStart2pB64 = fs.readFileSync(path.join(__dirname, 'fonts', 'press-start-2p.woff2')).toString('base64');
  const courier400B64 = fs.readFileSync(path.join(__dirname, 'fonts', 'courier-prime-400.woff2')).toString('base64');
  const courier700B64 = fs.readFileSync(path.join(__dirname, 'fonts', 'courier-prime-700.woff2')).toString('base64');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @font-face {
      font-family: 'Press Start 2P';
      src: url(data:font/woff2;base64,${pressStart2pB64}) format('woff2');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Courier Prime';
      src: url(data:font/woff2;base64,${courier400B64}) format('woff2');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Courier Prime';
      src: url(data:font/woff2;base64,${courier700B64}) format('woff2');
      font-weight: 700;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #120e0c;
      color: #fffdf1;
      font-family: 'Courier Prime', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Subtle background grid pattern */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(230, 168, 59, 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(230, 168, 59, 0.07) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    /* Radar scan circles in background */
    .radar-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px dashed rgba(230, 168, 59, 0.12);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .c1 { width: 360px; height: 360px; }
    .c2 { width: 680px; height: 680px; border-style: solid; border-color: rgba(230, 168, 59, 0.06); }
    .c3 { width: 980px; height: 980px; }

    /* Crosshairs */
    .crosshair-h {
      position: absolute;
      top: 50%;
      left: 60px;
      right: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(230, 168, 59, 0.2), transparent);
    }
    .crosshair-v {
      position: absolute;
      left: 50%;
      top: 40px;
      bottom: 40px;
      width: 1px;
      background: linear-gradient(180deg, transparent, rgba(230, 168, 59, 0.2), transparent);
    }

    /* Main Container Frame */
    .outer-frame {
      position: relative;
      width: 1120px;
      height: 550px;
      border: 3px solid #e6a83b;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.6);
      background: rgba(20, 15, 12, 0.92);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32px 40px;
      z-index: 10;
    }

    /* Retro brutalist corner ticks */
    .corner-tick {
      position: absolute;
      width: 18px;
      height: 18px;
      border-color: #fce566;
    }
    .tl { top: -6px; left: -6px; border-top: 5px solid #fce566; border-left: 5px solid #fce566; }
    .tr { top: -6px; right: -6px; border-top: 5px solid #fce566; border-right: 5px solid #fce566; }
    .bl { bottom: -6px; left: -6px; border-bottom: 5px solid #fce566; border-left: 5px solid #fce566; }
    .br { bottom: -6px; right: -6px; border-bottom: 5px solid #fce566; border-right: 5px solid #fce566; }

    /* Top Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(230, 168, 59, 0.25);
      padding-bottom: 16px;
    }

    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: #4ade80;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      border-radius: 2px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
    }

    .top-id {
      color: #e6a83b;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.12em;
    }

    /* Center Content */
    .hero-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 15px 0;
    }

    .sub-tag {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.22em;
      color: #fce566;
      text-transform: uppercase;
      margin-bottom: 14px;
      background: rgba(230, 168, 59, 0.1);
      padding: 4px 16px;
      border: 1px solid rgba(230, 168, 59, 0.2);
    }

    .main-title {
      font-family: 'Press Start 2P', monospace;
      font-size: 54px;
      color: #fffdf1;
      text-shadow: 
        4px 4px 0px #000,
        0 0 30px rgba(252, 229, 102, 0.3);
      letter-spacing: 0.05em;
      margin-bottom: 18px;
    }

    .main-desc {
      font-size: 19px;
      font-weight: 400;
      color: #d1cbba;
      letter-spacing: 0.06em;
      max-width: 800px;
      line-height: 1.4;
      margin-bottom: 24px;
    }

    /* Telemetry Grid / Spec Badges */
    .telemetry-row {
      display: flex;
      gap: 16px;
      justify-content: center;
      width: 100%;
    }

    .telemetry-pill {
      background: #191411;
      border: 1px solid rgba(230, 168, 59, 0.3);
      padding: 10px 18px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      box-shadow: 2px 2px 0px #000;
    }

    .pill-label {
      font-size: 10px;
      color: #8c827a;
      letter-spacing: 0.12em;
      font-weight: 700;
    }

    .pill-value {
      font-size: 13px;
      color: #fffdf1;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .val-accent {
      color: #fce566;
    }

    /* Bottom Bar */
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(230, 168, 59, 0.25);
      padding-top: 16px;
      font-size: 13px;
      color: #8c827a;
      letter-spacing: 0.06em;
    }

    .author-sign {
      color: #e6a83b;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="radar-circle c1"></div>
  <div class="radar-circle c2"></div>
  <div class="radar-circle c3"></div>
  <div class="crosshair-h"></div>
  <div class="crosshair-v"></div>

  <div class="outer-frame">
    <div class="corner-tick tl"></div>
    <div class="corner-tick tr"></div>
    <div class="corner-tick bl"></div>
    <div class="corner-tick br"></div>

    <!-- Top Bar -->
    <div class="top-bar">
      <div class="badge-live">
        <div class="live-dot"></div>
        SECURE RADAR SYSTEM
      </div>
      <div class="top-id">
        APOORV A S &bull; CREATIVE TECHNOLOGIST
      </div>
    </div>

    <!-- Center Hero -->
    <div class="hero-content">
      <div class="sub-tag">WORKSTATION PERIMETER</div>
      <h1 class="main-title">CLIENT RADAR</h1>
      <p class="main-desc">Proprietary client intelligence &amp; sales outreach cockpit.</p>

      <div class="telemetry-row">
        <div class="telemetry-pill">
          <span class="pill-label">RADAR DATABASE</span>
          <span class="pill-value"><span class="val-accent">100+</span> TARGET ACCOUNTS</span>
        </div>
        <div class="telemetry-pill">
          <span class="pill-label">SECURITY CLEARANCE</span>
          <span class="pill-value"><span class="val-accent">AUTHORIZED</span> SALES REPS</span>
        </div>
        <div class="telemetry-pill">
          <span class="pill-label">ENGINE ARCHITECTURE</span>
          <span class="pill-value"><span class="val-accent">60 FPS</span> SPATIAL CORE</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div>ACCESS: apoorv.qzz.io/workspace/</div>
      <div class="author-sign">DESIGNED &amp; ENGINEERED BY APOORV A S</div>
    </div>
  </div>
</body>
</html>`;

  console.log("Launching headless browser to render radar-thumbnail.png (1200x630)...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1
  });

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const outputPath = path.join(__dirname, 'radar-thumbnail.png');
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();

  console.log(`Generated thumbnail successfully: ${outputPath}`);
}

generateThumbnail().catch(err => {
  console.error("Failed to generate thumbnail:", err);
  process.exit(1);
});
