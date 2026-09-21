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

// Wait for next frame so player.js is loaded
onLoad(() => {
    // --- THE PLAYER ---
    const player = window.createPlayer ? window.createPlayer(window.innerWidth / 2, 0) : createPlayer(window.innerWidth / 2, 0);
    window.player = player;

    // Pillar 1 & 2 & 3: Master Calibrated 1D Continuous Swept Ground Rails Map
    const CALIBRATED_RAILS = [
        {"xLeft":152,"xRight":762,"width":610,"y":222,"trap":"normal","name":"DIV.role-badge"},
        {"xLeft":152,"xRight":936,"width":784,"y":312,"trap":"normal","name":"H1"},
        {"xLeft":152,"xRight":936,"width":784,"y":428,"trap":"normal","name":"P.hero-hook"},
        {"xLeft":152,"xRight":628,"width":476,"y":492,"trap":"normal","name":"DIV.controls-pill"},
        {"xLeft":152,"xRight":326,"width":174,"y":532,"trap":"normal","name":"A.topbar-btn"},
        {"xLeft":336,"xRight":547,"width":211,"y":532,"trap":"normal","name":"A.topbar-btn"},
        {"xLeft":968,"xRight":1288,"width":320,"y":492,"trap":"normal","name":"ASIDE.hero-aside-status"},
        {"xLeft":991,"xRight":1265,"width":274,"y":280,"trap":"normal","name":"P"},
        {"xLeft":991,"xRight":1265,"width":274,"y":354,"trap":"normal","name":"LI"},
        {"xLeft":991,"xRight":1265,"width":274,"y":376,"trap":"normal","name":"LI"},
        {"xLeft":991,"xRight":1265,"width":274,"y":398,"trap":"normal","name":"LI"},
        {"xLeft":991,"xRight":1265,"width":274,"y":421,"trap":"normal","name":"LI"},
        {"xLeft":991,"xRight":1265,"width":274,"y":443,"trap":"normal","name":"LI"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":711,"trap":"normal","name":"DIV#selected-work"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":1192,"trap":"normal","name":"ARTICLE.featured-project-card"},
        {"xLeft":191,"xRight":551,"width":360,"y":1089,"trap":"normal","name":"DIV"},
        {"xLeft":191,"xRight":336,"width":145,"y":1138,"trap":"normal","name":"A.tech-pill"},
        {"xLeft":591,"xRight":1249,"width":658,"y":925,"trap":"normal","name":"P"},
        {"xLeft":591,"xRight":1249,"width":658,"y":1015,"trap":"normal","name":"DIV"},
        {"xLeft":591,"xRight":1249,"width":658,"y":1072,"trap":"normal","name":"DIV"},
        {"xLeft":591,"xRight":1249,"width":658,"y":1153,"trap":"normal","name":"DIV"},
        {"xLeft":152,"xRight":704,"width":552,"y":1598,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":188,"xRight":668,"width":480,"y":1473,"trap":"normal","name":"P"},
        {"xLeft":188,"xRight":302,"width":114,"y":1514,"trap":"normal","name":"A.tech-pill"},
        {"xLeft":736,"xRight":1288,"width":552,"y":1598,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":772,"xRight":1252,"width":480,"y":1521,"trap":"normal","name":"P"},
        {"xLeft":772,"xRight":992,"width":220,"y":1562,"trap":"normal","name":"SPAN.tech-pill"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":1917,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":580,"xRight":1252,"width":672,"y":1820,"trap":"normal","name":"P"},
        {"xLeft":580,"xRight":853,"width":273,"y":1865,"trap":"normal","name":"SPAN.tech-pill"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2063,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":152,"xRight":515,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card"},
        {"xLeft":185,"xRight":482,"width":297,"y":2301,"trap":"normal","name":"P"},
        {"xLeft":539,"xRight":901,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card"},
        {"xLeft":571,"xRight":869,"width":297,"y":2301,"trap":"normal","name":"P"},
        {"xLeft":925,"xRight":1288,"width":363,"y":2334,"trap":"normal","name":"DIV.capability-card"},
        {"xLeft":958,"xRight":1255,"width":297,"y":2301,"trap":"normal","name":"P"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2480,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":152,"xRight":708,"width":556,"y":2692,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":177,"xRight":683,"width":505,"y":2667,"trap":"bounce","name":"P"},
        {"xLeft":732,"xRight":1288,"width":556,"y":2692,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":757,"xRight":1263,"width":505,"y":2644,"trap":"bounce","name":"P"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2828,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":177,"xRight":1263,"width":1085,"y":2802,"trap":"bounce","name":"P"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":2974,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":152,"xRight":1288,"width":1136,"y":3297,"trap":"normal","name":"SECTION.contact-card"},
        {"xLeft":197,"xRight":835,"width":638,"y":3131,"trap":"normal","name":"H2"},
        {"xLeft":197,"xRight":835,"width":638,"y":3206,"trap":"normal","name":"P"},
        {"xLeft":867,"xRight":1243,"width":376,"y":3135,"trap":"cta","name":"A.cta-btn-primary"},
        {"xLeft":867,"xRight":1243,"width":376,"y":3236,"trap":"normal","name":"DIV.secondary-cta-rack"},
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

    // Dynamic Multi-Page DOM Bottom Landing Rail Scanner
    function generatePageRails() {
        const page = getCurrentPage();
        const scrollY = window.scrollY || window.pageYOffset || 0;

        if (page === "home") {
            const elements = document.querySelectorAll('[data-kaboom-body="true"]');
            if (elements && elements.length > 0) {
                const detected = [];
                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width < 10 || rect.height < 4) return;
                    const yRail = Math.round(rect.bottom + scrollY);
                    const rawTrap = el.getAttribute("data-trap");
                    const trapType = (rawTrap && rawTrap !== "false" && rawTrap !== "none") ? rawTrap : "normal";
                    const tag = el.tagName;
                    const cls = el.className && typeof el.className === "string" ? '.' + el.className.split(' ')[0] : '';
                    const name = el.id ? `${tag}#${el.id}` : `${tag}${cls}`;

                    detected.push({
                        xLeft: Math.round(rect.left),
                        xRight: Math.round(rect.right),
                        width: Math.round(rect.width),
                        y: yRail,
                        domElement: el,
                        trap: trapType,
                        name: name
                    });
                });
                if (detected.length >= 45) {
                    return detected;
                }
            }
            return getCalibratedRails();
        }

        let selectors = [];
        if (page === "sales") {
            selectors = [
                '.hero',
                '.hero h1',
                '.hero .lede',
                '.hero a',
                '.action-rail a',
                '#form-google-auth-box',
                '#inquiry-card',
                '#inquiry-card h2',
                '#inquiry-form label',
                '#inquiry-form input',
                '#inquiry-form select',
                '#inquiry-form textarea',
                '#inquiry-form button[type="submit"]',
                '#engagement-card',
                '#engagement-card h2',
                '#engagement-card div[style*="padding:10px 12px"]',
                '[data-kaboom-body="true"]',
                '[data-rail="true"]'
            ];
        } else if (page === "workspace") {
            selectors = [
                'header.topbar',
                '.site-nav',
                '.city-tab',
                '#queueSearchInput',
                '#queueList > div',
                '.studio-panel',
                '#activeName',
                '#whatsappActionBtn',
                '#btnPrevLeadHero',
                '#btnNextLeadHero',
                '.obj-btn',
                '#objectionBox',
                '#flawsContainer',
                '#flawsContainer > div',
                '#dossierPane .grid > div',
                '#dossierPane > div.bg-\\[\\#15161B\\]',
                '[data-kaboom-body="true"]',
                '[data-rail="true"]'
            ];
        }

        const elements = document.querySelectorAll(selectors.join(', '));
        const detected = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 4) return;
            const yRail = Math.round(rect.bottom + scrollY);
            const rawTrap = el.getAttribute("data-trap");
            const trapType = (rawTrap && rawTrap !== "false" && rawTrap !== "none") ? rawTrap : (el.type === "submit" ? "cta" : "normal");
            const tag = el.tagName;
            const cls = el.className && typeof el.className === "string" ? '.' + el.className.split(' ')[0] : '';
            const name = el.id ? `${tag}#${el.id}` : `${tag}${cls}`;

            detected.push({
                xLeft: Math.round(rect.left),
                xRight: Math.round(rect.right),
                width: Math.round(rect.width),
                y: yRail,
                domElement: el,
                trap: trapType,
                name: name
            });
        });

        // Deduplicate overlapping rails (within 3px Y and 6px X)
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
                    rail.y = Math.round(r.bottom + scrollY);
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
    }

    window.landingRails = landingRails;
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
    placePlayerInitial();

    // Ensure initial physics sleep until document.fonts.ready finishes
    const activatePhysics = () => {
        syncDOM();
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
    });
    document.querySelectorAll('[data-kaboom-body="true"]').forEach(el => { resizeObserver.observe(el); });
    resizeObserver.observe(document.body);
    window.addEventListener("resize", () => { syncDOM(); });

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
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

            const isMovingDown = player.vy > 10 || player.isMovingThisFrame || (window.controlMode === "manual" && ((typeof isKeyDown === "function" && (isKeyDown("s") || isKeyDown("down"))) || (typeof window.isPhysicalKeyDown === "function" && (window.isPhysicalKeyDown("s") || window.isPhysicalKeyDown("down")))));
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
            const vh = window.innerHeight;
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
            const scrollProgress = Math.min(1, Math.max(0, currentScrollY / maxScroll));
            const touchdownEl = document.querySelector('.touchdown-zone') || document.querySelector('.contact-card');
            const bottomY = touchdownEl ? (touchdownEl.getBoundingClientRect().top + currentScrollY) : 3200;
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

        // Initialize 3D Player if engine is ready
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
