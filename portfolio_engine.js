// Initialize Kaboom
const k = kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.getElementById("game-canvas"),
    background: [0, 0, 0, 0], // Transparent
    global: true,
});

const SPEED = 200;
const JUMP_FORCE = 550;
const GRAVITY = 1600;
setGravity(GRAVITY);

window.controlMode = "idle"; // Idle on spawn so character stays grounded on hero header
let manualTimeout = null;

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
        window.controlMode = "manual";
        window.mobileLeftDown = true;
    };
    const endLeft = (e) => {
        if (e.cancelable) e.preventDefault();
        window.mobileLeftDown = false;
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
        window.controlMode = "manual";
        window.mobileRightDown = true;
    };
    const endRight = (e) => {
        if (e.cancelable) e.preventDefault();
        window.mobileRightDown = false;
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
        window.controlMode = "manual";
        window.mobileJumpPressed = true;
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
        {"xLeft":192,"xRight":802,"width":610,"y":222,"trap":"normal","name":"DIV.role-badge"},
        {"xLeft":192,"xRight":976,"width":784,"y":312,"trap":"normal","name":"H1"},
        {"xLeft":192,"xRight":976,"width":784,"y":428,"trap":"normal","name":"P.hero-hook"},
        {"xLeft":192,"xRight":668,"width":476,"y":492,"trap":"normal","name":"DIV.controls-pill"},
        {"xLeft":192,"xRight":366,"width":174,"y":532,"trap":"normal","name":"A.topbar-btn"},
        {"xLeft":376,"xRight":587,"width":211,"y":532,"trap":"normal","name":"A.topbar-btn"},
        {"xLeft":1008,"xRight":1328,"width":320,"y":492,"trap":"drop","name":"ASIDE.hero-aside-status"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":280,"trap":"normal","name":"P"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":354,"trap":"normal","name":"LI"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":376,"trap":"normal","name":"LI"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":398,"trap":"normal","name":"LI"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":421,"trap":"normal","name":"LI"},
        {"xLeft":1031,"xRight":1305,"width":274,"y":443,"trap":"normal","name":"LI"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":696,"trap":"normal","name":"DIV#selected-work"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":1176,"trap":"normal","name":"ARTICLE.featured-project-card"},
        {"xLeft":231,"xRight":591,"width":360,"y":1073,"trap":"normal","name":"DIV"},
        {"xLeft":231,"xRight":376,"width":145,"y":1123,"trap":"normal","name":"A.tech-pill"},
        {"xLeft":631,"xRight":1289,"width":658,"y":910,"trap":"normal","name":"P"},
        {"xLeft":631,"xRight":1289,"width":658,"y":1000,"trap":"normal","name":"DIV"},
        {"xLeft":631,"xRight":1289,"width":658,"y":1056,"trap":"normal","name":"DIV"},
        {"xLeft":631,"xRight":1289,"width":658,"y":1137,"trap":"normal","name":"DIV"},
        {"xLeft":192,"xRight":744,"width":552,"y":1583,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":228,"xRight":708,"width":480,"y":1458,"trap":"normal","name":"P"},
        {"xLeft":228,"xRight":342,"width":114,"y":1499,"trap":"spikes","name":"A.tech-pill"},
        {"xLeft":776,"xRight":1328,"width":552,"y":1583,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":812,"xRight":1292,"width":480,"y":1506,"trap":"normal","name":"P"},
        {"xLeft":812,"xRight":1032,"width":220,"y":1547,"trap":"normal","name":"SPAN.tech-pill"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":1901,"trap":"normal","name":"ARTICLE.standard-project-card"},
        {"xLeft":620,"xRight":1292,"width":672,"y":1804,"trap":"normal","name":"P"},
        {"xLeft":620,"xRight":893,"width":273,"y":1850,"trap":"normal","name":"SPAN.tech-pill"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":2032,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":192,"xRight":555,"width":363,"y":2304,"trap":"normal","name":"DIV.capability-card"},
        {"xLeft":225,"xRight":522,"width":297,"y":2271,"trap":"normal","name":"P"},
        {"xLeft":579,"xRight":941,"width":363,"y":2304,"trap":"glitch","name":"DIV.capability-card"},
        {"xLeft":611,"xRight":909,"width":297,"y":2271,"trap":"normal","name":"P"},
        {"xLeft":965,"xRight":1328,"width":363,"y":2304,"trap":"normal","name":"DIV.capability-card"},
        {"xLeft":998,"xRight":1295,"width":297,"y":2271,"trap":"normal","name":"P"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":2434,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":192,"xRight":748,"width":556,"y":2646,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":217,"xRight":723,"width":505,"y":2621,"trap":"bounce","name":"P"},
        {"xLeft":772,"xRight":1328,"width":556,"y":2646,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":797,"xRight":1303,"width":505,"y":2598,"trap":"bounce","name":"P"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":2782,"trap":"bounce","name":"ARTICLE.note-card"},
        {"xLeft":217,"xRight":1303,"width":1085,"y":2756,"trap":"bounce","name":"P"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":2912,"trap":"normal","name":"DIV.section-header"},
        {"xLeft":192,"xRight":1328,"width":1136,"y":3235,"trap":"normal","name":"SECTION.contact-card"},
        {"xLeft":237,"xRight":875,"width":638,"y":3069,"trap":"normal","name":"H2"},
        {"xLeft":237,"xRight":875,"width":638,"y":3144,"trap":"normal","name":"P"},
        {"xLeft":907,"xRight":1283,"width":376,"y":3073,"trap":"bounce","name":"A.cta-btn-primary"},
        {"xLeft":907,"xRight":1090,"width":183,"y":3174,"trap":"normal","name":"A.cta-btn-secondary"},
        {"xLeft":1100,"xRight":1283,"width":183,"y":3174,"trap":"normal","name":"A.cta-btn-secondary"}
    ];

    let landingRails = [];
    let isPhysicsActive = false;

    function getCalibratedRails() {
        const BASE_SHELL_LEFT = 192;
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
            const saved = localStorage.getItem("apoorv_custom_rails_v3");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    landingRails = parsed;
                    window.landingRails = landingRails;
                    console.log("Loaded custom ground rails v2 from localStorage:", landingRails.length);
                    return true;
                }
            }
        } catch(e) {
            console.warn("Failed to load custom rails", e);
        }
        return false;
    }

    // Dynamic DOM Bottom Landing Rail Detection
    function detectDOMBottomRails() {
        const elements = document.querySelectorAll('[data-kaboom-body="true"], [data-rail="true"]');
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const detected = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Disregard collapsed or non-visible elements
            if (rect.width < 10 || rect.height < 4) return;

            // Restructure detection: Landing rail is computed at the BOTTOM edge/baseline of the DOM element
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

        // Deduplicate any identical overlapping rails (within 2px Y and 4px X)
        const uniqueRails = [];
        for (const r of detected) {
            const dup = uniqueRails.find(u => Math.abs(u.y - r.y) <= 2 && Math.abs(u.xLeft - r.xLeft) <= 4 && Math.abs(u.xRight - r.xRight) <= 4);
            if (!dup) {
                uniqueRails.push(r);
            }
        }

        return uniqueRails;
    }

    // --- 5 STRATA KYBER DATA CORES (COLLECTIBLE REWARD SYSTEM) ---
    const DATA_CORES = [
        { id: "core-1", name: "Cirrus Telemetry Core", relX: 980, y: 190, sector: "S-01", collected: false, obj: null },
        { id: "core-2", name: "Cloudbreak Barometric Core", relX: 560, y: 1360, sector: "S-02", collected: false, obj: null },
        { id: "core-3", name: "Sky-Girder Structural Core", relX: 560, y: 2120, sector: "S-03", collected: false, obj: null },
        { id: "core-4", name: "Rooftop Signal Core", relX: 460, y: 2520, sector: "S-04", collected: false, obj: null },
        { id: "core-5", name: "Terra Firma Touchdown Core", relX: 900, y: 2980, sector: "S-05", collected: false, obj: null }
    ];

    let collectedCoresCount = 0;

    function spawnDataCores() {
        const BASE_SHELL_LEFT = 192;
        const shell = document.querySelector('main.portfolio-shell');
        const currentShellLeft = shell ? (shell.getBoundingClientRect().left + 32) : BASE_SHELL_LEFT;
        const deltaX = Math.round(currentShellLeft - BASE_SHELL_LEFT);

        DATA_CORES.forEach((core) => {
            if (core.obj) {
                try { destroy(core.obj); } catch(e) {}
                core.obj = null;
            }
            if (core.collected) return;

            const coreX = BASE_SHELL_LEFT + core.relX + deltaX;

            const coreObj = add([
                pos(coreX, core.y),
                rect(22, 22),
                rotate(45),
                anchor("center"),
                color(0, 229, 255),
                outline(3, rgb(23, 18, 15)),
                area(),
                z(30),
                "data_core"
            ]);

            core.obj = coreObj;
        });
    }

    function collectDataCore(core) {
        if (core.collected) return;
        core.collected = true;
        collectedCoresCount++;

        // SFX
        if (window.SFX && window.SFX.playPickup) window.SFX.playPickup();

        // Animate core collection burst
        if (core.obj) {
            tween(core.obj.scale, vec2(2.0, 2.0), 0.2, (v) => core.obj.scale = v);
            tween(core.obj.opacity, 0, 0.25, (v) => core.obj.opacity = v, easings.easeOutQuad).onEnd(() => {
                try { destroy(core.obj); } catch(e) {}
                core.obj = null;
            });
        }

        // Particle sparkle burst
        const originX = core.obj ? core.obj.pos.x : player.pos.x;
        const originY = core.obj ? core.obj.pos.y : player.pos.y - 35;
        for (let i = 0; i < 14; i++) {
            const pAngle = (Math.PI * 2 * i) / 14;
            const pSpeed = 120 + Math.random() * 80;
            const p = add([
                pos(originX, originY),
                rect(5, 5),
                rotate(45),
                anchor("center"),
                color(0, 229, 255),
                outline(1, rgb(23, 18, 15)),
                opacity(1),
                z(35)
            ]);
            tween(p.pos.x, p.pos.x + Math.cos(pAngle) * pSpeed * 0.35, 0.35, (v) => p.pos.x = v);
            tween(p.pos.y, p.pos.y + Math.sin(pAngle) * pSpeed * 0.35, 0.35, (v) => p.pos.y = v);
            tween(p.opacity, 0, 0.35, (v) => p.opacity = v, easings.easeOutQuad).onEnd(() => {
                try { destroy(p); } catch(e) {}
            });
        }

        // Update HUD
        const coresPill = document.getElementById("topbar-cores");
        if (coresPill) {
            coresPill.textContent = `💎 ${collectedCoresCount}/5 CORES`;
            coresPill.style.background = "#fce566";
            setTimeout(() => { if (coresPill) coresPill.style.background = ""; }, 300);
        }

        // Check for 5/5 Grand Reward: Golden Astromech Overcharge Mode
        if (collectedCoresCount >= 5) {
            triggerGoldenOvercharge();
        }
    }

    function triggerGoldenOvercharge() {
        console.log("5/5 DATA CORES COLLECTED! UNLOCKING GOLDEN ASTROMECH OVERCHARGE!");
        if (window.SFX && window.SFX.playVictory) window.SFX.playVictory();

        if (window.Player3D && window.Player3D.setGoldenMode) {
            window.Player3D.setGoldenMode(true);
        }

        const coresPill = document.getElementById("topbar-cores");
        if (coresPill) {
            coresPill.textContent = "★ 5/5 GOLDEN DROID ★";
            coresPill.style.background = "#ffd700";
            coresPill.style.color = "#17120f";
            coresPill.style.borderColor = "#17120f";
            coresPill.style.boxShadow = "0 0 12px #ffd700, 2px 2px 0 #17120f";
        }

        // Overcharge jump celebration
        if (player) {
            player.jump(JUMP_FORCE * 1.25);
        }

        // Confetti celebration
        for (let i = 0; i < 35; i++) {
            const cx = player ? player.pos.x + (Math.random() - 0.5) * 400 : window.innerWidth / 2;
            const cy = (player ? player.pos.y : window.scrollY + 300) - Math.random() * 200;
            const colors = [rgb(255, 215, 0), rgb(0, 229, 255), rgb(235, 94, 40), rgb(255, 255, 255)];
            const conf = add([
                pos(cx, cy),
                rect(8, 8),
                rotate(Math.random() * 360),
                color(colors[i % colors.length]),
                outline(1, rgb(23, 18, 15)),
                opacity(1),
                z(40)
            ]);
            tween(conf.pos.y, conf.pos.y + 150 + Math.random() * 100, 0.8 + Math.random() * 0.4, (v) => conf.pos.y = v);
            tween(conf.angle, conf.angle + 360, 1.2, (v) => conf.angle = v);
            tween(conf.opacity, 0, 1.2, (v) => conf.opacity = v).onEnd(() => {
                try { destroy(conf); } catch(e) {}
            });
        }
    }

    function syncDOM(force = false) {
        if (!force && localStorage.getItem("apoorv_custom_rails_v3")) {
            if (loadSavedRails()) return;
        }

        // Master default: Use the hardcoded master calibrated bottom landing rails
        landingRails = getCalibratedRails();
        window.landingRails = landingRails;
        console.log("Master calibrated bottom ground rails loaded as default:", landingRails.length);
        spawnDataCores();
    }

    window.landingRails = landingRails;
    window.syncDOM = () => syncDOM(true);
    window.setPhysicsActive = (val) => { isPhysicsActive = val; };

    // Pillar 6: Spawn player perched on the bottom baseline of H1 "APOORV"
    function placePlayerOnHero() {
        const h1 = document.querySelector('h1[data-kaboom-body="true"]') || document.querySelector('h1');
        if (h1 && player) {
            const r = h1.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const targetY = Math.round(r.bottom + scrollY);
            player.pos.x = Math.round(r.left + 120);
            player.pos.y = targetY;
            player.vy = 0;
            if (player.vel) {
                player.vel.x = 0;
                player.vel.y = 0;
            }
            player.grounded = true;
            const matchingRail = landingRails.find(rail => rail.domElement === h1 || rail.name === "H1" || (rail.xLeft <= player.pos.x && rail.xRight >= player.pos.x && Math.abs(rail.y - targetY) <= 5));
            player.currentRail = matchingRail || null;
            console.log("placePlayerOnHero perched player on H1 bottom:", player.pos.x, player.pos.y);
        }
    }

    // Initial DOM sync and placement
    syncDOM();
    placePlayerOnHero();

    // Pillar 5: Ensure initial physics sleep until document.fonts.ready finishes
    const activatePhysics = () => {
        syncDOM();
        if (window.controlMode === "idle") {
            placePlayerOnHero();
        }
        isPhysicsActive = true;
        console.log("Fonts ready: physics activated with Frame 0 stability.");
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
    let lastScrollY = window.scrollY;
    let isRespawning = false;

    function handleLanding(p, rail) {
        if (typeof p.triggerGround === "function") {
            p.triggerGround(rail);
        }

        if (!rail) return;

        if (rail.trap === "bounce") {
            p.jump(JUMP_FORCE * 1.45);
            if (rail.domElement) {
                rail.domElement.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                rail.domElement.style.transform = "scale(0.95) translateY(6px)";
                setTimeout(() => {
                    if (rail.domElement) rail.domElement.style.transform = "scale(1) translateY(0)";
                }, 150);
            }
            if (window.SFX && window.SFX.playJump) window.SFX.playJump();
        } else if (rail.trap === "drop") {
            // Level Devil Quicksand / Collapsing Platform Trap (0.1s warning)
            if (rail.domElement) {
                rail.domElement.style.transition = "transform 0.08s";
                rail.domElement.style.transform = "translateX(4px)";
                setTimeout(() => { if (rail.domElement) rail.domElement.style.transform = "translateX(-4px)"; }, 35);
                setTimeout(() => { if (rail.domElement) rail.domElement.style.transform = "translateX(0)"; }, 70);

                setTimeout(() => {
                    if (rail.domElement) {
                        rail.domElement.style.transition = "transform 0.6s ease-in, opacity 0.6s";
                        rail.domElement.style.transform = "translateY(600px)";
                        rail.domElement.style.opacity = "0.2";
                    }
                    const idx = landingRails.indexOf(rail);
                    if (idx !== -1) landingRails.splice(idx, 1);
                    if (p.currentRail === rail) {
                        p.grounded = false;
                        p.currentRail = null;
                    }
                }, 100);
            }
            if (window.SFX && window.SFX.playTrap) window.SFX.playTrap();
        } else if (rail.trap === "spikes") {
            if (window.SFX && window.SFX.playTrap) window.SFX.playTrap();
            if (window.Player3D && window.Player3D.smashIntoCamera) window.Player3D.smashIntoCamera();
            if (typeof shake === "function") shake(12);
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

    // --- TOUCHDOWN CELEBRATORY SEQUENCE ---
    let touchdownCelebrated = false;
    function triggerTouchdownCelebration() {
        if (touchdownCelebrated) return;
        touchdownCelebrated = true;
        console.log("TOUCHDOWN CONFIRMED: 0m REACHED AT TERRA FIRMA RUNWAY!");

        // 8-bit celebratory chime
        if (window.SFX && window.SFX.playVictory) {
            window.SFX.playVictory();
        }

        // Illuminate runway strip lights on Contact Card
        const contactCard = document.querySelector('.contact-card');
        if (contactCard) {
            contactCard.style.transition = "box-shadow 0.4s ease, border-color 0.4s ease";
            contactCard.style.boxShadow = "0 0 35px #fce566, 10px 10px 0 var(--purple-dark)";
            contactCard.style.borderColor = "#fce566";
            setTimeout(() => {
                if (contactCard) {
                    contactCard.style.boxShadow = "10px 10px 0 var(--purple-dark)";
                    contactCard.style.borderColor = "var(--ink)";
                }
            }, 2000);
        }

        // Flashing runway strobe on topbar badge
        const sectorPill = document.getElementById("topbar-sector");
        if (sectorPill) {
            sectorPill.style.background = "#fce566";
            sectorPill.style.color = "#17120f";
            sectorPill.style.borderColor = "#17120f";
            sectorPill.style.boxShadow = "0 0 14px #fce566, 2px 2px 0 var(--shell-line)";
            setTimeout(() => {
                if (sectorPill) {
                    sectorPill.style.background = "";
                    sectorPill.style.color = "";
                    sectorPill.style.borderColor = "";
                    sectorPill.style.boxShadow = "";
                }
            }, 1500);
        }
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
                    if (!onRailX) {
                        // Stepped off the edge
                        player.grounded = false;
                        player.currentRail = null;
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
                            // Glitch platform: intangible when phasing out
                            if (rail.trap === "glitch") {
                                const t = (typeof time === "function") ? time() : performance.now() * 0.001;
                                const isGlitchSolid = Math.sin(t * 2) > -0.25;
                                if (!isGlitchSolid) {
                                    if (rail.domElement) rail.domElement.style.opacity = "0.35";
                                    continue;
                                } else {
                                    if (rail.domElement) rail.domElement.style.opacity = "1.0";
                                }
                            }

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

        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // Apply Scroll Wind Force if scrolling fast
        if (Math.abs(scrollDelta) > 15 && !isRespawning && player.isGrounded && player.isGrounded()) {
            player.move(0, scrollDelta * 20);
            if (window.Player3D && window.Player3D.root) {
                window.Player3D.root.rotation.z = scrollDelta * 0.05;
                tween(window.Player3D.root.rotation.z, 0, 0.5, (v) => window.Player3D.root.rotation.z = v, easings.easeOutQuad);
            }
        }

        // --- DUAL-MODE CAMERA TRACKING ---
        // When the player is active (WASD/arrows/touch), smoothly scroll the page down/up to follow BB-8 across the sections
        const isPlayerActive = (typeof isKeyDown === "function" && (isKeyDown("left") || isKeyDown("right") || isKeyDown("up") || isKeyDown("down") || isKeyDown("a") || isKeyDown("d") || isKeyDown("w") || isKeyDown("s") || isKeyDown("space"))) || Boolean(window.mobileLeftDown || window.mobileRightDown || window.mobileJumpPressed || player.isMovingThisFrame);

        if (isPlayerActive && isPhysicsActive && !isRespawning) {
            const lowerComfortZone = currentScrollY + window.innerHeight * 0.60;
            const upperComfortZone = currentScrollY + window.innerHeight * 0.25;

            if (player.pos.y > lowerComfortZone) {
                const targetScrollY = Math.min(
                    document.documentElement.scrollHeight - window.innerHeight,
                    player.pos.y - window.innerHeight * 0.45
                );
                const diff = targetScrollY - currentScrollY;
                if (diff > 1) {
                    window.scrollBy(0, Math.min(diff * 0.12, 25));
                }
            } else if (player.pos.y < upperComfortZone && currentScrollY > 0) {
                const targetScrollY = Math.max(0, player.pos.y - window.innerHeight * 0.35);
                const diff = targetScrollY - currentScrollY;
                if (diff < -1) {
                    window.scrollBy(0, Math.max(diff * 0.12, -25));
                }
            }
        }

        camPos(window.innerWidth / 2, currentScrollY + window.innerHeight / 2);

        const viewTop = currentScrollY;
        const viewBottom = currentScrollY + window.innerHeight;

        // Out of bounds Recovery: generous threshold (650px below viewport or past bottom boundary)
        const docBottom = Math.max(document.body.scrollHeight, 3450);
        if ((player.pos.y > docBottom + 100 || player.pos.y > viewBottom + 650 || player.pos.y < viewTop - 400) && !isRespawning && isPhysicsActive) {
            respawnPlayer();
        }

        // --- REAL-TIME AVIATION ALTIMETER & 5-STRATA CALCULATION ---
        const docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const playerDescent = (player && player.pos) ? Math.max(0, player.pos.y - currentScrollY - 312) : 0;
        const effectiveDepth = Math.min(docMax, Math.max(0, currentScrollY + playerDescent));
        const altitudeMeters = Math.max(0, Math.round(10000 - (effectiveDepth / docMax) * 10000));

        let hudText = "";
        let sectorClass = "sector-1";

        if (altitudeMeters >= 7500) {
            hudText = `ALT: ${altitudeMeters.toLocaleString()}m • CIRRUS`;
            sectorClass = "sector-1";
        } else if (altitudeMeters >= 4500) {
            hudText = `ALT: ${altitudeMeters.toLocaleString()}m • CLOUDBREAK`;
            sectorClass = "sector-2";
        } else if (altitudeMeters >= 2000) {
            hudText = `ALT: ${altitudeMeters.toLocaleString()}m • GIRDERS`;
            sectorClass = "sector-3";
        } else if (altitudeMeters >= 350) {
            hudText = `ALT: ${altitudeMeters.toLocaleString()}m • ROOFTOPS`;
            sectorClass = "sector-4";
        } else {
            hudText = "ALT: 0m • TOUCHDOWN";
            sectorClass = "sector-5";
            triggerTouchdownCelebration();
        }

        if (altitudeMeters >= 1000) {
            touchdownCelebrated = false;
        }

        const prevSectorClass = window.currentSectorClass;
        window.currentSector = hudText;
        window.currentSectorClass = sectorClass;
        window.currentAltitude = altitudeMeters;

        const sectorPill = document.getElementById("topbar-sector");
        if (sectorPill && sectorPill.textContent !== hudText) {
            sectorPill.textContent = hudText;
        }

        if (prevSectorClass && prevSectorClass !== sectorClass) {
            if (window.SFX && window.SFX.playSectorChange) {
                window.SFX.playSectorChange();
            }
        }

        if (window.Engine3D && window.Engine3D.setSectorDepth) {
            window.Engine3D.setSectorDepth(effectiveDepth, sectorClass);
        }

        // --- DATA CORES FLOATING ANIMATION & COLLISION ---
        DATA_CORES.forEach((core, idx) => {
            if (!core.collected && core.obj) {
                const t = (typeof time === "function") ? time() : performance.now() * 0.001;
                core.obj.pos.y = core.y + Math.sin(t * 4 + idx) * 8;
                core.obj.angle = 45 + Math.sin(t * 2 + idx) * 15;

                // Check collision with player (hitbox center around y - 35)
                if (player && Math.hypot(player.pos.x - core.obj.pos.x, (player.pos.y - 35) - core.obj.pos.y) < 38) {
                    collectDataCore(core);
                }
            }
        });

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
    });

    // --- HYBRID CONTROLS ---
    window.addEventListener("dblclick", () => {
        if (window.controlMode !== "ambient") {
            window.controlMode = "ambient";
            console.log("Switched to Ambient Control");
        }
    });

    onKeyDown(() => {
        window.controlMode = "manual";
        if (manualTimeout) clearTimeout(manualTimeout);
        manualTimeout = setTimeout(() => {
            window.controlMode = "ambient";
        }, 4000);
    });

    // Pillar 6: Refactored Ambient AI: safe idle perching and attentive companion gaze
    onUpdate(() => {
        if (window.controlMode === "ambient" && !isRespawning && isPhysicsActive) {
            if (player.grounded && player.currentRail) {
                const rail = player.currentRail;
                const safeMargin = 25;
                const safeMinX = rail.xLeft + safeMargin;
                const safeMaxX = rail.xRight - safeMargin;

                // If rail is wide enough to pace:
                if (safeMaxX > safeMinX) {
                    const mWorld = toWorld(mousePos());
                    // Gently pace towards mouse ONLY if mouse is on the same platform horizontally
                    if (mWorld.x >= safeMinX && mWorld.x <= safeMaxX && Math.abs(mWorld.y - rail.y) < 150) {
                        const targetX = mWorld.x;
                        if (Math.abs(player.pos.x - targetX) > 15) {
                            const dir = Math.sign(targetX - player.pos.x);
                            player.move(dir * SPEED * 0.4, 0);
                            player.facingLeft = dir < 0;
                            player.isMovingThisFrame = true;
                        }
                    } else {
                        // Safe idle perching: clamp within safe platform bounds, never suicidal jump
                        if (player.pos.x < safeMinX) {
                            player.pos.x = safeMinX;
                        } else if (player.pos.x > safeMaxX) {
                            player.pos.x = safeMaxX;
                        }
                    }
                }
            }
        }
    });
});
