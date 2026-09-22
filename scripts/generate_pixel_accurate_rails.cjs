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
        const scrollY = window.scrollY || window.pageYOffset || 0;

        // 0. Stratosphere Topbar Header
        const topbar = { el: document.querySelector('header.topbar'), mode: 'bottom', name: 'HEADER.topbar' };

        // 1. Hero launchpad
        const heroItems = [
            { el: document.querySelector('.role-badge'), mode: 'bottom', name: 'DIV.role-badge' },
            { el: document.querySelector('h1'), mode: 'bottom', name: 'H1' },
            { el: document.querySelector('.hero-hook'), mode: 'bottom', name: 'P.hero-hook' },
            { el: document.querySelector('.controls-pill'), mode: 'bottom', name: 'DIV.controls-pill' },
            { el: document.querySelectorAll('.hero-section a.topbar-btn')[0] || document.querySelectorAll('a.topbar-btn')[0], mode: 'bottom', name: 'A.topbar-btn#selected-work' },
            { el: document.querySelectorAll('.hero-section a.topbar-btn')[1] || document.querySelectorAll('a.topbar-btn')[1], mode: 'bottom', name: 'A.topbar-btn#contract', trap: 'cta' },
            { el: document.querySelector('.hero-aside-status'), mode: 'top', name: 'ASIDE.hero-aside-status::roof' },
            { el: document.querySelector('.hero-aside-status p'), mode: 'bottom', name: 'P.hero-aside-p' },
            ...Array.from(document.querySelectorAll('.hero-aside-status li')).map((li, i) => ({ el: li, mode: 'bottom', name: `LI.hero-aside-item-${i+1}` })),
            { el: document.querySelector('.hero-aside-status'), mode: 'bottom', name: 'ASIDE.hero-aside-status::base' }
        ];

        // 2. Selected Work Runway Shelf
        const selectedWorkHeader = { el: document.querySelector('#selected-work'), mode: 'bottom', name: 'DIV#selected-work' };

        // 3. Flagship Card (ERAVEX)
        const featuredCard = document.querySelector('.featured-project-card');
        const featuredItems = [
            { el: featuredCard, mode: 'top', name: 'ARTICLE.featured-project-card::roof' },
            { el: featuredCard ? featuredCard.querySelector('.tech-pill') : null, mode: 'bottom', name: 'SPAN.tech-pill.webgpu' },
            { el: featuredCard ? featuredCard.querySelector('div[style*="background: rgba(142, 68, 173"]') : null, mode: 'bottom', name: 'DIV.featured-validation' },
            { el: featuredCard ? featuredCard.querySelector('a.tech-pill') : null, mode: 'bottom', name: 'A.tech-pill.launch-eravex', trap: 'cta' },
            { el: featuredCard, mode: 'bottom', name: 'ARTICLE.featured-project-card::base' }
        ];

        // 4. Dual Columns (Maison Anima & Level Devil)
        const standardCards = Array.from(document.querySelectorAll('.standard-project-card'));
        const maisonCard = standardCards[0];
        const levelDevilCard = standardCards[1];
        const jarvisCard = standardCards[2];

        const maisonItems = [
            { el: maisonCard, mode: 'top', name: 'ARTICLE.standard-project-card.maison::roof' },
            { el: maisonCard ? maisonCard.querySelector('a.tech-pill') : null, mode: 'bottom', name: 'A.tech-pill.case-study', trap: 'cta' },
            { el: maisonCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.maison::base' }
        ];

        const levelDevilItems = [
            { el: levelDevilCard, mode: 'top', name: 'ARTICLE.standard-project-card.level-devil::roof' },
            { el: levelDevilCard ? Array.from(levelDevilCard.querySelectorAll('span.tech-pill.accent')).pop() : null, mode: 'bottom', name: 'SPAN.tech-pill.active-canvas' },
            { el: levelDevilCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.level-devil::base' }
        ];

        // 5. Jarvis Card
        const jarvisItems = [
            { el: jarvisCard, mode: 'top', name: 'ARTICLE.standard-project-card.jarvis::roof' },
            { el: jarvisCard ? jarvisCard.querySelector('.tech-pill.accent') : null, mode: 'bottom', name: 'SPAN.tech-pill.loopback' },
            { el: jarvisCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.jarvis::base' }
        ];

        // 6. Capabilities Section (Pillar Pedestals)
        const sectionHeaders = Array.from(document.querySelectorAll('.section-header'));
        const capHeader = sectionHeaders[1];
        const capCards = Array.from(document.querySelectorAll('.capability-card'));
        const capItems = [
            { el: capHeader, mode: 'bottom', name: 'DIV.section-header.capabilities' },
            ...capCards.flatMap((card, i) => [
                { el: card, mode: 'top', name: `DIV.capability-card-${i+1}::roof` },
                { el: card, mode: 'bottom', name: `DIV.capability-card-${i+1}::base` }
            ])
        ];

        // 7. Recent Dispatches (Bounce Trampolines)
        const notesHeader = sectionHeaders[2];
        const noteCards = Array.from(document.querySelectorAll('.note-card'));
        const notesItems = [
            { el: notesHeader, mode: 'bottom', name: 'DIV.section-header.dispatches' },
            ...noteCards.flatMap((card, i) => [
                { el: card, mode: 'top', name: `ARTICLE.note-card-${i+1}::roof`, trap: 'bounce' },
                { el: card, mode: 'bottom', name: `ARTICLE.note-card-${i+1}::base`, trap: 'bounce' }
            ])
        ];

        // 8. Contact & Touchdown
        const contactHeader = sectionHeaders[3] || sectionHeaders[sectionHeaders.length - 1];
        const contactCard = document.querySelector('.contact-card');
        const contactH2 = contactCard ? contactCard.querySelector('h2') : null;
        const contactPrimaryBtn = contactCard ? contactCard.querySelector('.cta-btn-primary') : null;
        const secondaryRack = document.querySelector('.secondary-cta-rack');
        const touchdownZone = document.querySelector('.touchdown-zone');

        const contactItems = [
            { el: contactHeader, mode: 'bottom', name: 'DIV.section-header.contact' },
            { el: contactCard, mode: 'top', name: 'SECTION.contact-card::roof' },
            { el: contactH2, mode: 'bottom', name: 'H2.contact-heading' },
            { el: contactPrimaryBtn, mode: 'bottom', name: 'A.cta-btn-primary', trap: 'cta' },
            { el: secondaryRack, mode: 'bottom', name: 'DIV.secondary-cta-rack' },
            { el: contactCard, mode: 'bottom', name: 'SECTION.contact-card::base' },
            { el: touchdownZone, mode: 'bottom', name: 'DIV.touchdown-zone' }
        ];

        const allDefinitions = [
            topbar,
            ...heroItems,
            selectedWorkHeader,
            ...featuredItems,
            ...maisonItems,
            ...levelDevilItems,
            ...jarvisItems,
            ...capItems,
            ...notesItems,
            ...contactItems
        ].filter(item => item.el);

        return allDefinitions.map(def => {
            const r = def.el.getBoundingClientRect();
            const y = def.mode === 'top' ? Math.round(r.top + scrollY) : Math.round(r.bottom + scrollY);
            return {
                xLeft: Math.round(r.left),
                xRight: Math.round(r.right),
                width: Math.round(r.width),
                y: y,
                trap: def.trap || 'normal',
                name: def.name
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
