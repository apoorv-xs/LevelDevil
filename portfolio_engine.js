// Preserve native browser window.Event to prevent any library from clobbering DOM Event interface
const _NativeDOMEvent = typeof window !== "undefined" ? window.Event : null;

// Initialize Kaboom with mobile DPR clamp (PERF-02)
const k = kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.getElementById("game-canvas"),
    background: [0, 0, 0, 0], // Transparent
    global: true,
    pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
});

// Enforce native DOM Event restoration for Web3 wallet standards and extensions
if (_NativeDOMEvent && typeof window !== "undefined") {
    window.Event = _NativeDOMEvent;
}

const SPEED = 200;
const JUMP_FORCE = 550;
const GRAVITY = 1600;
setGravity(GRAVITY);

window.controlMode = "autonomous"; // Naturally autonomous AI companion across every page
let manualTimeout = null;

// Track window-level active keys to prevent canvas focus starvation (DEF-01)
const activeKeys = new Set();
window.isPhysicalKeyDown = function (k) {
    return activeKeys.has(k.toLowerCase());
};

function isTypingInForm() {
    if (typeof document === "undefined") return false;
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(el.isContentEditable);
}

function resetToAutonomous() {
    if (manualTimeout) clearTimeout(manualTimeout);
    manualTimeout = setTimeout(() => {
        window.controlMode = "autonomous";
        manualTimeout = null;
    }, 2600); // 2.5 - 3.0 seconds idle time
}

function triggerManualControl() {
    if (isTypingInForm()) return;
    window.controlMode = "manual";
    if (manualTimeout) {
        clearTimeout(manualTimeout);
        manualTimeout = null;
    }
}

// Window-level key listeners ensuring manual keyboard input works everywhere (DEF-01)
window.addEventListener("keydown", (e) => {
    if (isTypingInForm()) return;
    const key = e.key.toLowerCase();
    activeKeys.add(key);
    if (key === "arrowleft") activeKeys.add("left");
    if (key === "arrowright") activeKeys.add("right");
    if (key === "arrowup") activeKeys.add("up");
    if (key === "arrowdown") activeKeys.add("down");
    if (key === " ") activeKeys.add("space");

    if (["a", "d", "w", "s", "left", "right", "up", "down", "space"].some(k => activeKeys.has(k))) {
        triggerManualControl();
    }
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    activeKeys.delete(key);
    if (key === "arrowleft") activeKeys.delete("left");
    if (key === "arrowright") activeKeys.delete("right");
    if (key === "arrowup") activeKeys.delete("up");
    if (key === "arrowdown") activeKeys.delete("down");
    if (key === " ") activeKeys.delete("space");

    if (!["a", "d", "w", "s", "left", "right", "up", "down", "space"].some(k => activeKeys.has(k))) {
        resetToAutonomous();
    }
});

// Track mouse position for companion 3D head/eye gaze
window.mousePos2D = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener("mousemove", (e) => {
    window.mousePos2D.x = e.clientX;
    window.mousePos2D.y = e.clientY;
});

// Mobile control state flags
window.mobileLeftDown = false;
window.mobileRightDown = false;
window.mobileJumpPressed = false;

// Wire touch & mouse events on #mobile-controls
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnJump = document.getElementById("btn-jump");

if (btnLeft) {
    const startLeft = (e) => {
        if (e.cancelable) e.preventDefault();
        triggerManualControl();
        window.mobileLeftDown = true;
    };
    const endLeft = (e) => {
        if (e.cancelable) e.preventDefault();
        window.mobileLeftDown = false;
        resetToAutonomous();
    };
    btnLeft.addEventListener("touchstart", startLeft, { passive: false });
    btnLeft.addEventListener("touchend", endLeft, { passive: false });
    btnLeft.addEventListener("touchcancel", endLeft, { passive: false });
    btnLeft.addEventListener("mousedown", startLeft);
    btnLeft.addEventListener("mouseup", endLeft);
}

if (btnRight) {
    const startRight = (e) => {
        if (e.cancelable) e.preventDefault();
        triggerManualControl();
        window.mobileRightDown = true;
    };
    const endRight = (e) => {
        if (e.cancelable) e.preventDefault();
        window.mobileRightDown = false;
        resetToAutonomous();
    };
    btnRight.addEventListener("touchstart", startRight, { passive: false });
    btnRight.addEventListener("touchend", endRight, { passive: false });
    btnRight.addEventListener("touchcancel", endRight, { passive: false });
    btnRight.addEventListener("mousedown", startRight);
    btnRight.addEventListener("mouseup", endRight);
}

if (btnJump) {
    const doJump = (e) => {
        if (e.cancelable) e.preventDefault();
        triggerManualControl();
        window.mobileJumpPressed = true;
        resetToAutonomous();
    };
    btnJump.addEventListener("touchstart", doJump, { passive: false });
    btnJump.addEventListener("mousedown", doJump);
}

// Window-level release listeners to prevent mobile sticky drag lockout outside button boundary
const releaseMobileControls = () => {
    if (window.mobileLeftDown || window.mobileRightDown) {
        window.mobileLeftDown = false;
        window.mobileRightDown = false;
        resetToAutonomous();
    }
};
window.addEventListener("pointerup", releaseMobileControls);
window.addEventListener("mouseup", releaseMobileControls);
window.addEventListener("touchend", releaseMobileControls);
window.addEventListener("touchcancel", releaseMobileControls);

// Wait for next frame so player.js is loaded
onLoad(() => {
    // --- THE PLAYER ---
    const player = window.createPlayer ? window.createPlayer(window.innerWidth / 2, 0) : createPlayer(window.innerWidth / 2, 0);
    window.player = player;

    // Pillar 1 & 2 & 3: Master Calibrated 1D Continuous Swept Ground Rails Map
    const CALIBRATED_RAILS = [
        {"xLeft":0,"xRight":1440,"width":1440,"y":54,"trap":"normal","name":"HEADER.topbar"},
        {"xLeft":152,"xRight":762,"width":610,"y":222,"trap":"normal","name":"DIV.role-badge"},
        {"xLeft":152,"xRight":936,"width":784,"y":312,"trap":"normal","name":"H1"},
        {"xLeft":152,"xRight":936,"width":784,"y":428,"trap":"normal","name":"P.hero-hook"},
        {"xLeft":152,"xRight":628,"width":476,"y":492,"trap":"normal","name":"DIV.controls-pill"},
        {"xLeft":152,"xRight":326,"width":174,"y":532,"trap":"normal","name":"A.topbar-btn#selected-work"},
        {"xLeft":336,"xRight":547,"width":211,"y":532,"trap":"cta","name":"A.topbar-btn#contract"},
        {"xLeft":968,"xRight":1288,"width":320,"y":176,"trap":"normal","name":"ASIDE.hero-aside-status::roof"},
        {"xLeft":991,"xRight":1265,"width":274,"y":280,"trap":"normal","name":"P.hero-aside-p"},
        {"xLeft":991,"xRight":1265,"width":274,"y":354,"trap":"normal","name":"LI.hero-aside-item-1"},
        {"xLeft":991,"xRight":1265,"width":274,"y":376,"trap":"normal","name":"LI.hero-aside-item-2"},
        {"xLeft":991,"xRight":1265,"width":274,"y":398,"trap":"normal","name":"LI.hero-aside-item-3"},
        {"xLeft":991,"xRight":1265,"width":274,"y":421,"trap":"normal","name":"LI.hero-aside-item-4"},
        {"xLeft":991,"xRight":1265,"width":274,"y":443,"trap":"normal","name":"LI.hero-aside-item-5"},
        {"xLeft":968,"xRight":1288,"width":320,"y":492,"trap":"normal","name":"ASIDE.hero-aside-status::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":711,"trap":"normal","name":"DIV#selected-work"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":743,"trap":"normal","name":"ARTICLE.featured-project-card::roof"},
        {"xLeft":191,"xRight":257,"width":66,"y":935,"trap":"normal","name":"SPAN.tech-pill.webgpu"},
        {"xLeft":191,"xRight":551,"width":360,"y":1089,"trap":"normal","name":"DIV.featured-validation"},
        {"xLeft":191,"xRight":336,"width":145,"y":1138,"trap":"cta","name":"A.tech-pill.launch-eravex"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":1192,"trap":"normal","name":"ARTICLE.featured-project-card::base"},
        {"xLeft":152,"xRight":704,"width":552,"y":1224,"trap":"normal","name":"ARTICLE.standard-project-card.maison::roof"},
        {"xLeft":188,"xRight":302,"width":114,"y":1514,"trap":"cta","name":"A.tech-pill.case-study"},
        {"xLeft":152,"xRight":704,"width":552,"y":1598,"trap":"normal","name":"ARTICLE.standard-project-card.maison::base"},
        {"xLeft":736,"xRight":1288,"width":552,"y":1224,"trap":"normal","name":"ARTICLE.standard-project-card.level-devil::roof"},
        {"xLeft":772,"xRight":992,"width":220,"y":1562,"trap":"normal","name":"SPAN.tech-pill.active-canvas"},
        {"xLeft":736,"xRight":1288,"width":552,"y":1598,"trap":"normal","name":"ARTICLE.standard-project-card.level-devil::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":1630,"trap":"normal","name":"ARTICLE.standard-project-card.jarvis::roof"},
        {"xLeft":188,"xRight":308,"width":120,"y":1790,"trap":"normal","name":"SPAN.tech-pill.loopback"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":1917,"trap":"normal","name":"ARTICLE.standard-project-card.jarvis::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2063,"trap":"normal","name":"DIV.section-header.capabilities"},
        {"xLeft":152,"xRight":515,"width":363,"y":2095,"trap":"normal","name":"DIV.capability-card-1::roof"},
        {"xLeft":152,"xRight":515,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card-1::base"},
        {"xLeft":539,"xRight":901,"width":363,"y":2095,"trap":"normal","name":"DIV.capability-card-2::roof"},
        {"xLeft":539,"xRight":901,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card-2::base"},
        {"xLeft":925,"xRight":1288,"width":363,"y":2095,"trap":"normal","name":"DIV.capability-card-3::roof"},
        {"xLeft":925,"xRight":1288,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card-3::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2480,"trap":"normal","name":"DIV.section-header.dispatches"},
        {"xLeft":152,"xRight":708,"width":556,"y":2512,"trap":"bounce","name":"ARTICLE.note-card-1::roof"},
        {"xLeft":152,"xRight":708,"width":556,"y":2692,"trap":"bounce","name":"ARTICLE.note-card-1::base"},
        {"xLeft":732,"xRight":1288,"width":556,"y":2512,"trap":"bounce","name":"ARTICLE.note-card-2::roof"},
        {"xLeft":732,"xRight":1288,"width":556,"y":2692,"trap":"bounce","name":"ARTICLE.note-card-2::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2716,"trap":"bounce","name":"ARTICLE.note-card-3::roof"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2828,"trap":"bounce","name":"ARTICLE.note-card-3::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2974,"trap":"normal","name":"DIV.section-header.contact"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":3006,"trap":"normal","name":"SECTION.contact-card::roof"},
        {"xLeft":197,"xRight":835,"width":638,"y":3131,"trap":"normal","name":"H2.contact-heading"},
        {"xLeft":867,"xRight":1243,"width":376,"y":3135,"trap":"cta","name":"A.cta-btn-primary"},
        {"xLeft":867,"xRight":1243,"width":376,"y":3236,"trap":"normal","name":"DIV.secondary-cta-rack"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":3297,"trap":"normal","name":"SECTION.contact-card::base"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":3488,"trap":"normal","name":"DIV.touchdown-zone"}
    ];

    let landingRails = [];
    let isPhysicsActive = false;

    function getCurrentPage() {
        const p = (window.location.pathname || "").toLowerCase();
        if (p.includes("sales") || document.body?.classList?.contains("sales-page")) return "sales";
        if (p.includes("workspace") || document.body?.classList?.contains("retro-workspace")) return "workspace";
        return "home";
    }

    function getCalibratedRails() {
        const BASE_SHELL_LEFT = 152;
        const shell = document.querySelector('main.portfolio-shell');
        const currentShellLeft = shell ? (shell.getBoundingClientRect().left + 32) : BASE_SHELL_LEFT;
        const deltaX = Math.round(currentShellLeft - BASE_SHELL_LEFT);

        return CALIBRATED_RAILS.map(r => ({
            ...r,
            xLeft: r.xLeft + deltaX,
            xRight: r.xRight + deltaX,
            width: r.xRight - r.xLeft
        }));
    }

    function loadSavedRails() {
        try {
            const saved = localStorage.getItem("apoorv_custom_rails_v4");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    landingRails = parsed;
                    window.landingRails = landingRails;
                    console.log("Loaded custom ground rails v4 from localStorage:", landingRails.length);
                    return true;
                }
            }
        } catch(e) {
            console.warn("Failed to load custom rails", e);
        }
        return false;
    }

    // Dynamic Multi-Page DOM Landing Rail Scanner (Refined Dual-Surface Roof & Shelf Engine)
    function generatePageRails() {
        const page = getCurrentPage();
        const scrollY = window.scrollY || window.pageYOffset || 0;

        if (page === "home") {
            const topbar = { el: document.querySelector('header.topbar'), mode: 'bottom', name: 'HEADER.topbar' };
            const heroBadge = { el: document.querySelector('.role-badge'), mode: 'bottom', name: 'DIV.role-badge' };
            const heroH1 = { el: document.querySelector('h1'), mode: 'bottom', name: 'H1' };
            const heroHook = { el: document.querySelector('.hero-hook'), mode: 'bottom', name: 'P.hero-hook' };
            const heroControls = { el: document.querySelector('.controls-pill'), mode: 'bottom', name: 'DIV.controls-pill' };
            const heroBtns = Array.from(document.querySelectorAll('.hero-section a.topbar-btn, .hero-main a.topbar-btn'));
            const heroBtn1 = { el: heroBtns[0], mode: 'bottom', name: 'A.topbar-btn#selected-work' };
            const heroBtn2 = { el: heroBtns[1], mode: 'bottom', name: 'A.topbar-btn#contract', trap: 'cta' };
            const heroAside = document.querySelector('.hero-aside-status');
            const heroAsideRoof = { el: heroAside, mode: 'top', name: 'ASIDE.hero-aside-status::roof' };
            const heroAsideP = { el: heroAside ? heroAside.querySelector('p') : null, mode: 'bottom', name: 'P.hero-aside-p' };
            const heroAsideLis = Array.from(document.querySelectorAll('.hero-aside-status li')).map((li, i) => ({ el: li, mode: 'bottom', name: `LI.hero-aside-item-${i+1}` }));
            const heroAsideBase = { el: heroAside, mode: 'bottom', name: 'ASIDE.hero-aside-status::base' };

            const selectedWorkHeader = { el: document.querySelector('#selected-work'), mode: 'bottom', name: 'DIV#selected-work' };

            const featuredCard = document.querySelector('.featured-project-card');
            const featuredRoof = { el: featuredCard, mode: 'top', name: 'ARTICLE.featured-project-card::roof' };
            const featuredPill = { el: featuredCard ? featuredCard.querySelector('.tech-pill') : null, mode: 'bottom', name: 'SPAN.tech-pill.webgpu' };
            const featuredValidation = { el: featuredCard ? featuredCard.querySelector('div[style*="background: rgba(142, 68, 173"]') : null, mode: 'bottom', name: 'DIV.featured-validation' };
            const featuredLaunchBtn = { el: featuredCard ? featuredCard.querySelector('a.tech-pill') : null, mode: 'bottom', name: 'A.tech-pill.launch-eravex', trap: 'cta' };
            const featuredBase = { el: featuredCard, mode: 'bottom', name: 'ARTICLE.featured-project-card::base' };

            const standardCards = Array.from(document.querySelectorAll('.standard-project-card'));
            const maisonCard = standardCards[0];
            const maisonRoof = { el: maisonCard, mode: 'top', name: 'ARTICLE.standard-project-card.maison::roof' };
            const maisonBtn = { el: maisonCard ? maisonCard.querySelector('a.tech-pill') : null, mode: 'bottom', name: 'A.tech-pill.case-study', trap: 'cta' };
            const maisonBase = { el: maisonCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.maison::base' };

            const levelDevilCard = standardCards[1];
            const levelDevilRoof = { el: levelDevilCard, mode: 'top', name: 'ARTICLE.standard-project-card.level-devil::roof' };
            const levelDevilPill = { el: levelDevilCard ? Array.from(levelDevilCard.querySelectorAll('span.tech-pill.accent')).pop() : null, mode: 'bottom', name: 'SPAN.tech-pill.active-canvas' };
            const levelDevilBase = { el: levelDevilCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.level-devil::base' };

            const jarvisCard = standardCards[2];
            const jarvisRoof = { el: jarvisCard, mode: 'top', name: 'ARTICLE.standard-project-card.jarvis::roof' };
            const jarvisPill = { el: jarvisCard ? jarvisCard.querySelector('.tech-pill.accent') : null, mode: 'bottom', name: 'SPAN.tech-pill.loopback' };
            const jarvisBase = { el: jarvisCard, mode: 'bottom', name: 'ARTICLE.standard-project-card.jarvis::base' };

            const sectionHeaders = Array.from(document.querySelectorAll('.section-header'));
            const capHeader = { el: sectionHeaders[1], mode: 'bottom', name: 'DIV.section-header.capabilities' };
            const capCards = Array.from(document.querySelectorAll('.capability-card'));
            const capItems = capCards.flatMap((card, i) => [
                { el: card, mode: 'top', name: `DIV.capability-card-${i+1}::roof` },
                { el: card, mode: 'bottom', name: `DIV.capability-card-${i+1}::base` }
            ]);

            const notesHeader = { el: sectionHeaders[2], mode: 'bottom', name: 'DIV.section-header.dispatches' };
            const noteCards = Array.from(document.querySelectorAll('.note-card'));
            const notesItems = noteCards.flatMap((card, i) => [
                { el: card, mode: 'top', name: `ARTICLE.note-card-${i+1}::roof`, trap: 'bounce' },
                { el: card, mode: 'bottom', name: `ARTICLE.note-card-${i+1}::base`, trap: 'bounce' }
            ]);

            const contactHeader = { el: sectionHeaders[3] || sectionHeaders[sectionHeaders.length - 1], mode: 'bottom', name: 'DIV.section-header.contact' };
            const contactCard = document.querySelector('.contact-card');
            const contactRoof = { el: contactCard, mode: 'top', name: 'SECTION.contact-card::roof' };
            const contactH2 = { el: contactCard ? contactCard.querySelector('h2') : null, mode: 'bottom', name: 'H2.contact-heading' };
            const contactPrimaryBtn = { el: contactCard ? contactCard.querySelector('.cta-btn-primary') : null, mode: 'bottom', name: 'A.cta-btn-primary', trap: 'cta' };
            const secondaryRack = { el: document.querySelector('.secondary-cta-rack'), mode: 'bottom', name: 'DIV.secondary-cta-rack' };
            const contactBase = { el: contactCard, mode: 'bottom', name: 'SECTION.contact-card::base' };
            const touchdownZone = { el: document.querySelector('.touchdown-zone'), mode: 'bottom', name: 'DIV.touchdown-zone' };

            const homeDefinitions = [
                topbar,
                heroBadge, heroH1, heroHook, heroControls, heroBtn1, heroBtn2,
                heroAsideRoof, heroAsideP, ...heroAsideLis, heroAsideBase,
                selectedWorkHeader,
                featuredRoof, featuredPill, featuredValidation, featuredLaunchBtn, featuredBase,
                maisonRoof, maisonBtn, maisonBase,
                levelDevilRoof, levelDevilPill, levelDevilBase,
                jarvisRoof, jarvisPill, jarvisBase,
                capHeader, ...capItems,
                notesHeader, ...notesItems,
                contactHeader, contactRoof, contactH2, contactPrimaryBtn, secondaryRack, contactBase,
                touchdownZone
            ].filter(d => d.el);

            if (homeDefinitions.length >= 45) {
                return homeDefinitions.map(def => {
                    const r = def.el.getBoundingClientRect();
                    const y = def.mode === 'top' ? Math.round(r.top + scrollY) : Math.round(r.bottom + scrollY);
                    return {
                        xLeft: Math.round(r.left),
                        xRight: Math.round(r.right),
                        width: Math.round(r.width),
                        y: y,
                        domElement: def.el,
                        trap: def.trap || 'normal',
                        name: def.name,
                        surface: def.mode
                    };
                });
            }
            return getCalibratedRails();
        }

        const detected = [];

        if (page === "sales") {
            const topbar = { el: document.querySelector('header.topbar'), mode: 'bottom', name: 'HEADER.topbar' };
            const heroH1 = { el: document.querySelector('.hero h1'), mode: 'bottom', name: 'H1.hero-heading' };
            const contactChips = Array.from(document.querySelectorAll('.hero div a')).map((a, i) => ({ el: a, mode: 'bottom', name: `A.hero-chip-${i+1}` }));
            const actionRails = Array.from(document.querySelectorAll('.action-rail a')).map((a, i) => ({ el: a, mode: 'bottom', name: `A.action-rail-${i+1}` }));

            const inquiryCard = document.querySelector('#inquiry-card');
            const inquiryRoof = { el: inquiryCard, mode: 'top', name: 'ARTICLE#inquiry-card::roof' };
            const googleBtn = { el: document.querySelector('#sign-in'), mode: 'bottom', name: 'BUTTON#sign-in' };
            const nameInput = { el: document.querySelector('#inquiry-form input[name="name"]'), mode: 'bottom', name: 'INPUT#name' };
            const emailInput = { el: document.querySelector('#inquiry-form input[name="email"]'), mode: 'bottom', name: 'INPUT#email' };
            const scopeSelect = { el: document.querySelector('#inquiry-form select[name="scope"]'), mode: 'bottom', name: 'SELECT#scope' };
            const budgetSelect = { el: document.querySelector('#inquiry-form select[name="budget"]'), mode: 'bottom', name: 'SELECT#budget' };
            const msgTextarea = { el: document.querySelector('#inquiry-form textarea[name="message"]'), mode: 'bottom', name: 'TEXTAREA#message' };
            const submitBtn = { el: document.querySelector('#inquiry-form button[type="submit"]'), mode: 'bottom', name: 'BUTTON#submit', trap: 'cta' };
            const inquiryBase = { el: inquiryCard, mode: 'bottom', name: 'ARTICLE#inquiry-card::base' };

            const engagementCard = document.querySelector('#engagement-card');
            const engagementRoof = { el: engagementCard, mode: 'top', name: 'ARTICLE#engagement-card::roof' };
            const engagementBoxes = Array.from(document.querySelectorAll('#engagement-card div[style*="padding:10px 12px"]')).map((b, i) => ({ el: b, mode: 'bottom', name: `DIV.standard-box-${i+1}` }));
            const engagementBase = { el: engagementCard, mode: 'bottom', name: 'ARTICLE#engagement-card::base' };

            const salesDefinitions = [
                topbar, heroH1, ...contactChips, ...actionRails,
                inquiryRoof, googleBtn, nameInput, emailInput, scopeSelect, budgetSelect, msgTextarea, submitBtn, inquiryBase,
                engagementRoof, ...engagementBoxes, engagementBase
            ].filter(d => d.el);

            salesDefinitions.forEach(def => {
                const r = def.el.getBoundingClientRect();
                if (r.width < 10 || r.height < 4) return;
                const y = def.mode === 'top' ? Math.round(r.top + scrollY) : Math.round(r.bottom + scrollY);
                detected.push({
                    xLeft: Math.round(r.left),
                    xRight: Math.round(r.right),
                    width: Math.round(r.width),
                    y: y,
                    domElement: def.el,
                    trap: def.trap || 'normal',
                    name: def.name,
                    surface: def.mode
                });
            });
        } else if (page === "workspace") {
            const topbar = { el: document.querySelector('header.topbar'), mode: 'bottom', name: 'HEADER.topbar' };
            const cityTabs = Array.from(document.querySelectorAll('.city-tab')).map((b, i) => ({ el: b, mode: 'bottom', name: `BUTTON.city-tab-${i+1}`, trap: 'cta' }));
            const searchInput = { el: document.querySelector('#queueSearchInput'), mode: 'bottom', name: 'INPUT#queueSearchInput' };

            const panels = Array.from(document.querySelectorAll('.studio-panel'));
            const heroPanel = panels[0];
            const flawsPanel = panels[1];
            const notesPanel = panels[2];

            const heroRoof = { el: heroPanel, mode: 'top', name: 'DIV.hero-panel::roof' };
            const btnPrev = { el: document.querySelector('#btnPrevLeadHero'), mode: 'bottom', name: 'BUTTON#btnPrevLeadHero', trap: 'cta' };
            const btnNext = { el: document.querySelector('#btnNextLeadHero'), mode: 'bottom', name: 'BUTTON#btnNextLeadHero', trap: 'cta' };
            const activeName = { el: document.querySelector('#activeName'), mode: 'bottom', name: 'H1#activeName' };
            const heroBase = { el: heroPanel, mode: 'bottom', name: 'DIV.hero-panel::base' };

            const flawsRoof = { el: flawsPanel, mode: 'top', name: 'DIV.flaws-panel::roof' };
            const flawsBase = { el: flawsPanel, mode: 'bottom', name: 'DIV.flaws-panel::base' };

            const notesRoof = { el: notesPanel, mode: 'top', name: 'DIV.notes-panel::roof' };
            const callNotes = { el: document.querySelector('#callNotesInput'), mode: 'bottom', name: 'TEXTAREA#callNotesInput' };
            const saveBtn = { el: document.querySelector('#btnNextLeadHandoff'), mode: 'bottom', name: 'BUTTON#save-next', trap: 'cta' };
            const notesBase = { el: notesPanel, mode: 'bottom', name: 'DIV.notes-panel::base' };

            const wsDefinitions = [
                topbar, ...cityTabs, searchInput,
                heroRoof, btnPrev, btnNext, activeName, heroBase,
                flawsRoof, flawsBase,
                notesRoof, callNotes, saveBtn, notesBase
            ].filter(d => d.el);

            wsDefinitions.forEach(def => {
                const r = def.el.getBoundingClientRect();
                if (r.width < 10 || r.height < 4) return;
                const y = def.mode === 'top' ? Math.round(r.top + scrollY) : Math.round(r.bottom + scrollY);
                detected.push({
                    xLeft: Math.round(r.left),
                    xRight: Math.round(r.right),
                    width: Math.round(r.width),
                    y: y,
                    domElement: def.el,
                    trap: def.trap || 'normal',
                    name: def.name,
                    surface: def.mode
                });
            });
        }
        const uniqueRails = [];
        for (const r of detected) {
            const dup = uniqueRails.find(u => Math.abs(u.y - r.y) <= 3 && Math.abs(u.xLeft - r.xLeft) <= 6 && Math.abs(u.xRight - r.xRight) <= 6);
            if (!dup) uniqueRails.push(r);
        }
        return uniqueRails;
    }

    function syncDOM(force = false) {
        if (!force && getCurrentPage() === "home" && localStorage.getItem("apoorv_custom_rails_v4")) {
            if (loadSavedRails()) return;
        }

        const scrollY = window.scrollY || window.pageYOffset || 0;
        let needsRebuild = false;

        // In-place live geometry update if rails are already bound to DOM elements
        if (!force && landingRails && landingRails.length > 0) {
            for (let i = 0; i < landingRails.length; i++) {
                const rail = landingRails[i];
                if (rail.domElement && document.body.contains(rail.domElement)) {
                    const r = rail.domElement.getBoundingClientRect();
                    rail.xLeft = Math.round(r.left);
                    rail.xRight = Math.round(r.right);
                    rail.width = Math.round(r.width);
                    rail.y = (rail.surface === "top") ? Math.round(r.top + scrollY) : Math.round(r.bottom + scrollY);
                } else {
                    needsRebuild = true;
                    break;
                }
            }
        } else {
            needsRebuild = true;
        }

        if (needsRebuild || force) {
            landingRails = generatePageRails();
            window.landingRails = landingRails;
        }

        // Keep grounded player pinned to their active rail
        if (player && player.grounded && player.currentRail) {
            player.pos.y = player.currentRail.y;
        }

        console.log(`Landing rails loaded for [${getCurrentPage()}]:`, landingRails.length);
        updateCachedDimensions();
    }

    let cachedMaxScroll = 0;
    let cachedBottomY = 3488;

    function updateCachedDimensions() {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const vh = window.innerHeight || 800;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const docH = document.documentElement ? document.documentElement.scrollHeight : 4000;
        cachedMaxScroll = Math.max(1, docH - vh);

        const touchdownEl = document.querySelector('.touchdown-zone') || document.querySelector('.contact-card');
        if (touchdownEl) {
            cachedBottomY = touchdownEl.getBoundingClientRect().top + scrollY;
        } else {
            cachedBottomY = 3488;
        }
    }

    window.landingRails = landingRails;
    window.generatePageRails = generatePageRails;
    window.syncDOM = () => syncDOM(true);
    window.setPhysicsActive = (val) => { isPhysicsActive = val; };

    // Initial placement of BB-8 across any page
    function placePlayerInitial() {
        const page = getCurrentPage();
        let targetEl = null;
        if (page === "home") {
            targetEl = document.querySelector('h1[data-kaboom-body="true"]') || document.querySelector('h1');
        } else if (page === "sales") {
            targetEl = document.querySelector('.hero h1') || document.querySelector('h1');
        } else if (page === "workspace") {
            targetEl = document.querySelector('header.topbar') || document.querySelector('.city-tab') || document.querySelector('#queueSearchInput');
        }

        if (targetEl && player) {
            const r = targetEl.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const targetY = Math.round(r.bottom + scrollY);
            player.pos.x = Math.round(r.left + Math.min(120, r.width / 2));
            player.pos.y = targetY;
            player.vy = 0;
            if (player.vel) {
                player.vel.x = 0;
                player.vel.y = 0;
            }
            player.grounded = true;
            const matchingRail = landingRails.find(rail => rail.domElement === targetEl || (rail.xLeft <= player.pos.x && rail.xRight >= player.pos.x && Math.abs(rail.y - targetY) <= 8));
            player.currentRail = matchingRail || null;
            console.log(`Placed BB-8 on initial rail for [${page}]:`, player.pos.x, player.pos.y);
        }
    }

    // Initial DOM sync and placement
    syncDOM();
    updateCachedDimensions();
    placePlayerInitial();

    // Ensure initial physics sleep until document.fonts.ready finishes
    const activatePhysics = () => {
        syncDOM();
        updateCachedDimensions();
        placePlayerInitial();
        isPhysicsActive = true;
        console.log("Fonts ready: physics activated with Frame 0 stability across page.");
    };

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(activatePhysics);
    } else {
        activatePhysics();
    }

    const resizeObserver = new ResizeObserver(() => {
        syncDOM();
        updateCachedDimensions();
    });
    document.querySelectorAll('[data-kaboom-body="true"]').forEach(el => { resizeObserver.observe(el); });
    resizeObserver.observe(document.body);
    window.addEventListener("resize", () => {
        syncDOM();
        updateCachedDimensions();
    });

    // Note: Pillar 5 removes duplicate window.Engine3D.init() call.
    // Engine3D auto-initializes itself in babylon_engine.js.
    let is3DReady = false;

    // --- SCROLL-WIND PHYSICS & CAMERA SYNC ---
    debug.inspect = false;
    let lastScrollY = window.scrollY || 0;
    let lastDwellY = window.scrollY || 0;
    let dwellDuration = 0;
    let isRespawning = false;

    function handleLanding(p, rail) {
        if (typeof p.triggerGround === "function") {
            p.triggerGround(rail);
        }

        if (!rail) return;

        if (rail.trap === "bounce") {
            p.jump(JUMP_FORCE * 1.35);
            if (rail.domElement) {
                rail.domElement.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                rail.domElement.style.transform = "scale(0.97) translateY(4px)";
                setTimeout(() => {
                    if (rail.domElement) rail.domElement.style.transform = "scale(1) translateY(0)";
                }, 150);
            }
            if (window.SFX && window.SFX.playJump) window.SFX.playJump();
        } else if (rail.trap === "drop") {
            if (rail.domElement) {
                rail.domElement.style.transition = "transform 0.1s";
                rail.domElement.style.transform = "translateX(5px)";
                setTimeout(() => { if (rail.domElement) rail.domElement.style.transform = "translateX(-5px)"; }, 50);
                setTimeout(() => { if (rail.domElement) rail.domElement.style.transform = "translateX(0)"; }, 100);

                setTimeout(() => {
                    if (rail.domElement) {
                        rail.domElement.style.transition = "transform 1s ease-in";
                        rail.domElement.style.transform = "translateY(1000px)";
                    }
                    const idx = landingRails.indexOf(rail);
                    if (idx !== -1) landingRails.splice(idx, 1);
                    if (p.currentRail === rail) {
                        p.grounded = false;
                        p.currentRail = null;
                    }
                }, 500);
            }
        } else if (rail.trap === "spikes") {
            if (typeof shake === "function") shake(10);
            respawnPlayer();
        }
    }

    function respawnPlayer() {
        isRespawning = true;
        player.vy = 0;
        if (player.vel) {
            player.vel.x = 0;
            player.vel.y = 0;
        }
        player.grounded = false;
        player.currentRail = null;

        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        const viewCenterY = currentScrollY + window.innerHeight / 2;

        let targetPlat = null;
        let minDist = Infinity;
        for (const p of landingRails) {
            const d = Math.abs(p.y - viewCenterY);
            if (d < minDist) {
                minDist = d;
                targetPlat = p;
            }
        }

        const respawnX = targetPlat ? (targetPlat.xLeft + Math.min(100, targetPlat.width / 2)) : (window.innerWidth / 2);
        const respawnY = targetPlat ? (targetPlat.y - 15) : (currentScrollY + 80);

        player.pos.x = respawnX;
        player.pos.y = respawnY;
        player.vy = 0;
        if (player.vel) {
            player.vel.x = 0;
            player.vel.y = 0;
        }

        if (window.Player3D && window.Player3D.root) {
            window.Player3D.isSmashing = false;
            window.Player3D.root.position.z = 0;
        }

        setTimeout(() => {
            isRespawning = false;
        }, 200);
    }

    onUpdate(() => {
        const dtTotal = dt();
        const currentScrollY = window.scrollY || window.pageYOffset || 0;

        // Pillar 1 & 2: 3-Sub-Step Vertical Integration with Swept Interval Collision
        if (isPhysicsActive && !isRespawning && dtTotal > 0) {
            const clampedDt = Math.min(dtTotal, 0.05);
            const SUB_STEPS = 3;
            const subDt = clampedDt / SUB_STEPS;

            for (let step = 0; step < SUB_STEPS; step++) {
                // Grounded walking: check if player stepped off the rail laterally
                if (player.grounded && player.currentRail) {
                    const rail = player.currentRail;
                    const onRailX = (player.pos.x >= rail.xLeft - 10 && player.pos.x <= rail.xRight + 10);
                    const isManualDrop = window.controlMode === "manual" && !isTypingInForm() &&
                        ((typeof isKeyDown === "function" && (isKeyDown("s") || isKeyDown("down"))) ||
                         (typeof window.isPhysicalKeyDown === "function" && (window.isPhysicalKeyDown("s") || window.isPhysicalKeyDown("down"))));
                    const isAutonomousDrop = window.controlMode === "autonomous" && Boolean(window.System1Brain && window.System1Brain.wantsDrop);
                    const isDroppingDown = isManualDrop || isAutonomousDrop;

                    if (!onRailX || isDroppingDown) {
                        // Stepped off the edge or intentionally dropped through
                        player.grounded = false;
                        player.currentRail = null;
                        if (isDroppingDown) {
                            player.pos.y += 3;
                            player.vy = 120;
                        }
                    } else {
                        // Maintain vertical lock on rail
                        player.pos.y = rail.y;
                        player.vy = 0;
                        continue;
                    }
                }

                // Apply gravity
                player.vy += GRAVITY * subDt;
                if (player.vy > 650) {
                    player.vy = 650;
                }

                const yPrev = player.pos.y;
                const yNext = yPrev + player.vy * subDt;

                // Swept interval collision check: ONLY when falling downwards (vy >= 0)
                // Upward motion passes freely through platforms (jump-through mechanic)
                // Lateral collision is strictly ignored (eliminates horizontal ejection)
                if (player.vy >= 0) {
                    let bestRail = null;
                    let bestY = Infinity;

                    for (const rail of landingRails) {
                        if (player.pos.x >= rail.xLeft - 10 && player.pos.x <= rail.xRight + 10) {
                            // Swept interval check: yPrev <= rail.y <= yNext
                            if (yPrev <= rail.y + 0.1 && rail.y <= yNext + 0.5) {
                                if (rail.y < bestY) {
                                    bestY = rail.y;
                                    bestRail = rail;
                                }
                            }
                        }
                    }

                    if (bestRail) {
                        player.pos.y = bestRail.y;
                        player.vy = 0;
                        player.grounded = true;
                        player.currentRail = bestRail;
                        handleLanding(player, bestRail);
                        break;
                    } else {
                        player.pos.y = yNext;
                    }
                } else {
                    // Moving upwards: jump-through platforms freely
                    player.pos.y = yNext;
                }
            }
        }

        // Dual-Driven Camera Tracking:
        // As player actively moves/falls downwards, auto-scroll when entering bottom 65% of viewport
        // Guarded against scrolling when typing in form inputs (DEF-03)
        if (isPhysicsActive && !isRespawning && player && !isTypingInForm()) {
            const vh = window.innerHeight;
            const playerScreenY = player.pos.y - currentScrollY;
            const maxScroll = cachedMaxScroll || Math.max(0, document.documentElement.scrollHeight - vh);

            const isMovingDown = player.vy > 10 || (window.isPhysicalKeyDown && (window.isPhysicalKeyDown("down") || window.isPhysicalKeyDown("s"))) || (typeof isKeyDown === "function" && (isKeyDown("down") || isKeyDown("s")));
            if (isMovingDown && playerScreenY > vh * 0.65) {
                const targetScroll = player.pos.y - vh * 0.45;
                const clampedTarget = Math.min(maxScroll, Math.max(0, targetScroll));
                if (clampedTarget > currentScrollY) {
                    const diff = clampedTarget - currentScrollY;
                    const scrollStep = Math.max(1, Math.min(diff * 0.12, 28));
                    window.scrollBy(0, scrollStep);
                }
            } else if (player.vy < -10 && playerScreenY < vh * 0.25 && currentScrollY > 0) {
                const targetScroll = player.pos.y - vh * 0.45;
                const clampedTarget = Math.max(0, targetScroll);
                if (clampedTarget < currentScrollY) {
                    const diff = clampedTarget - currentScrollY;
                    const scrollStep = Math.min(-1, Math.max(diff * 0.12, -28));
                    window.scrollBy(0, scrollStep);
                }
            }
        }

        // Altimeter Telemetry HUD (from 10,000 FT at stratosphere to 0 FT / TOUCHDOWN at bedrock)
        const altimeterPill = document.getElementById("altimeter-pill");
        if (altimeterPill) {
            const maxScroll = cachedMaxScroll || Math.max(1, (document.documentElement?.scrollHeight || 4000) - window.innerHeight);
            const scrollProgress = Math.min(1, Math.max(0, currentScrollY / maxScroll));
            const bottomY = cachedBottomY;
            const heroBaseline = 550;
            const playerProgress = player ? Math.min(1, Math.max(0, (player.pos.y - heroBaseline) / (bottomY - heroBaseline))) : 0;
            let progress = Math.min(1, Math.max(scrollProgress, playerProgress));
            if (currentScrollY <= 10 && (!player || player.pos.y <= heroBaseline)) {
                progress = 0;
            }

            if (progress >= 0.98 || currentScrollY >= maxScroll - 20 || (player && player.pos.y >= bottomY - 60)) {
                altimeterPill.textContent = "ALT: 0 FT / TOUCHDOWN";
            } else {
                const alt = Math.max(0, Math.round((1 - progress) * 10000));
                altimeterPill.textContent = `ALT: ${alt.toLocaleString()} FT`;
            }
        }

        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // Apply Scroll Wind Force tilt dynamically (without tunneling through rails) (DEF-04)
        if (Math.abs(scrollDelta) > 15 && !isRespawning) {
            if (window.Player3D && window.Player3D.root) {
                const targetRotZ = Math.max(-0.25, Math.min(scrollDelta * 0.04, 0.25));
                window.Player3D.root.rotation.z = targetRotZ;
                tween(window.Player3D.root.rotation.z, 0, 0.5, (v) => window.Player3D.root.rotation.z = v, easings.easeOutQuad);
            }
        }

        // Track reading dwell on current viewport Y
        if (Math.abs(currentScrollY - lastDwellY) < 25) {
            dwellDuration += dtTotal;
        } else {
            lastDwellY = currentScrollY;
            dwellDuration = 0;
        }

        // Autonomous System 1 Decision Brain Execution
        if (window.controlMode === "autonomous" && isPhysicsActive && !isRespawning && player) {
            const telemetry = {
                scrollY: currentScrollY,
                viewportFocusY: currentScrollY + window.innerHeight * 0.45,
                viewportHeight: window.innerHeight,
                userScrollSpeed: (dtTotal > 0) ? (scrollDelta / dtTotal) : 0,
                dwellTime: dwellDuration,
                currentRail: player.currentRail,
                groundedRail: player.currentRail,
                allRails: landingRails,
                playerPos: { x: player.pos.x, y: player.pos.y },
                activeElement: document.activeElement,
                page: getCurrentPage(),
                isGrounded: player.grounded
            };

            if (window.System1Brain && window.System1Brain.evaluate) {
                const cmd = window.System1Brain.evaluate(dtTotal, telemetry);
                if (cmd.action === "celebrate") {
                    if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
                        window.Player3D.celebrateVictory();
                    }
                }
                if (cmd.wantsDrop && player.grounded && player.currentRail) {
                    player.grounded = false;
                    player.currentRail = null;
                    player.pos.y += 3;
                    player.vy = 120;
                }
                if (cmd.moveX !== 0) {
                    player.move(cmd.moveX * SPEED * 0.75, 0);
                    player.facingLeft = cmd.moveX < 0;
                    player.isMovingThisFrame = true;
                }
                if (cmd.wantsJump && player.grounded) {
                    player.jump(cmd.jumpForce || JUMP_FORCE);
                    if (window.SFX && window.SFX.playJump) window.SFX.playJump();
                }
            }
        }

        // Keep companion thought bubble synced with player position
        if (window.System1Brain && window.System1Brain.updateBubblePosition && player) {
            window.System1Brain.updateBubblePosition(player);
        }

        camPos(window.innerWidth / 2, currentScrollY + window.innerHeight / 2);

        const viewTop = currentScrollY;
        const viewBottom = currentScrollY + window.innerHeight;

        // Out of bounds Recovery (relaxed kill plane to allow inter-section leaps)
        const pageMaxY = Math.max(document.documentElement.scrollHeight + 300, 3650);
        const isFarBelowView = player.pos.y > viewBottom + 900;
        const isPastBedrockVoid = player.pos.y > pageMaxY;
        const isAboveCeiling = player.pos.y < -300;

        if ((isFarBelowView || isPastBedrockVoid || isAboveCeiling) && !isRespawning && isPhysicsActive) {
            respawnPlayer();
        }

        if (!window.Engine3D || !window.Engine3D.isReady || !window.Player3D || !window.Player3D.isCreated) {
            is3DReady = false;
        } else if (window.Player3D.root && window.Engine3D.scene && window.Player3D.root.parent !== window.Engine3D.scene) {
            if (typeof window.Player3D.dispose === "function") {
                window.Player3D.dispose();
            }
            is3DReady = false;
        }
        if (window.Engine3D && window.Engine3D.isReady && !is3DReady) {
            if (window.Player3D && window.Engine3D.scene) {
                window.Player3D.create(window.Engine3D.scene);
                is3DReady = true;
            }
        }

        // Sync 3D Player
        if (is3DReady && window.Player3D) {
            window.Player3D.syncWith2D(player);
        }

        // Continually detect if manual movement keys are actively held
        const isMovementActive = !isTypingInForm() && (
            (typeof isKeyDown === "function" && (
                isKeyDown("left") || isKeyDown("right") || isKeyDown("a") || isKeyDown("d") ||
                isKeyDown("up") || isKeyDown("w") || isKeyDown("down") || isKeyDown("s") ||
                isKeyDown("space")
            )) || window.mobileLeftDown || window.mobileRightDown || window.mobileJumpPressed
        );

        if (isMovementActive) {
            triggerManualControl();
        } else if (window.controlMode === "manual" && !manualTimeout) {
            resetToAutonomous();
        }
    });

    const MOVEMENT_KEYS = ["a", "d", "w", "s", "left", "right", "up", "down", "space"];
    onKeyDown((key) => {
        if (MOVEMENT_KEYS.includes(key) && !isTypingInForm()) {
            triggerManualControl();
        }
    });

    onKeyRelease((key) => {
        if (MOVEMENT_KEYS.includes(key) && !isTypingInForm()) {
            resetToAutonomous();
        }
    });
});
