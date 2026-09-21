const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GROUND_RAILS_PATH = path.join(ROOT_DIR, 'ground_rails.json');
const ENGINE_PATH = path.join(ROOT_DIR, 'portfolio_engine.js');
const COLLISION_EDITOR_PATH = path.join(ROOT_DIR, 'collision_editor.js');

async function calibrate() {
    console.log("🚀 Starting Level Devil Pixel-Accurate Rail Generator...");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    // Connect to local dev server
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const measuredRails = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('[data-kaboom-body="true"]'));
        const scrollY = window.scrollY || window.pageYOffset || 0;

        return nodes.map((el) => {
            const r = el.getBoundingClientRect();
            const tag = el.tagName;
            const cls = el.className && typeof el.className === "string" ? '.' + el.className.split(' ')[0] : '';
            const name = el.id ? `${tag}#${el.id}` : `${tag}${cls}`;
            const rawTrap = el.getAttribute("data-trap");
            const trap = (rawTrap && rawTrap !== "false" && rawTrap !== "none") ? rawTrap : "normal";

            return {
                xLeft: Math.round(r.left),
                xRight: Math.round(r.right),
                width: Math.round(r.width),
                y: Math.round(r.bottom + scrollY),
                trap: trap,
                name: name
            };
        });
    });

    await browser.close();

    console.log(`📐 Successfully measured ${measuredRails.length} live DOM elements on Home.`);
    if (measuredRails.length !== 51) {
        throw new Error(`Expected exactly 51 rails, but measured ${measuredRails.length}!`);
    }

    // Read current ground_rails.json to compare
    const oldRails = JSON.parse(fs.readFileSync(GROUND_RAILS_PATH, 'utf8'));
    let maxDiff = 0;
    measuredRails.forEach((m, i) => {
        const o = oldRails[i] || {};
        const diffY = m.y - (o.y || 0);
        if (Math.abs(diffY) > maxDiff) maxDiff = Math.abs(diffY);
        console.log(`  [Rail #${i + 1}] ${m.name.padEnd(28)} -> X:[${m.xLeft}, ${m.xRight}] Y:${m.y} (diff: ${diffY >= 0 ? '+' : ''}${diffY}px)`);
    });
    console.log(`\n🔍 Maximum detected Y-drift corrected: ${maxDiff}px`);

    // 1. Update ground_rails.json
    fs.writeFileSync(GROUND_RAILS_PATH, JSON.stringify(measuredRails, null, 2) + '\n', 'utf8');
    console.log(`✅ Saved updated rails to ground_rails.json`);

    // 2. Update CALIBRATED_RAILS in portfolio_engine.js
    const engineCode = fs.readFileSync(ENGINE_PATH, 'utf8');
    const railsCompactJson = JSON.stringify(measuredRails).replace(/},{/g, '},\n        {').replace(/^\[/, '[\n        ').replace(/\]$/, '\n    ]');
    const replacementCode = `const CALIBRATED_RAILS = ${railsCompactJson};`;
    const updatedEngine = engineCode.replace(/const CALIBRATED_RAILS = \[[^;]*\];/s, replacementCode);
    fs.writeFileSync(ENGINE_PATH, updatedEngine, 'utf8');
    console.log(`✅ Updated const CALIBRATED_RAILS in portfolio_engine.js`);

    // 3. Update DEFAULT_RAILS in collision_editor.js
    if (fs.existsSync(COLLISION_EDITOR_PATH)) {
        const editorCode = fs.readFileSync(COLLISION_EDITOR_PATH, 'utf8');
        const updatedEditor = editorCode.replace(/const DEFAULT_RAILS = \[[^;]*\];/s, `const DEFAULT_RAILS = ${railsCompactJson};`);
        fs.writeFileSync(COLLISION_EDITOR_PATH, updatedEditor, 'utf8');
        console.log(`✅ Updated const DEFAULT_RAILS in collision_editor.js`);
    }

    console.log("🎉 Pixel-accurate rail calibration complete!");
}

calibrate().catch(err => {
    console.error("❌ Calibration failed:", err);
    process.exit(1);
});
