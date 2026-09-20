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

    // Pillar 1 & 2 & 3: 1D Continuous Swept Horizontal Landing Rail system
    let landingRails = [];
    let isPhysicsActive = false;

    function loadSavedRails() {
        try {
            const saved = localStorage.getItem("apoorv_custom_rails");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    landingRails = parsed;
                    window.landingRails = landingRails;
                    console.log("Loaded custom ground rails from localStorage:", landingRails.length);
                    return true;
                }
            }
        } catch(e) {
            console.warn("Failed to load custom rails", e);
        }
        return false;
    }

    function syncDOM(force = false) {
        if (!force && localStorage.getItem("apoorv_custom_rails")) {
            if (loadSavedRails()) return;
        }
        const elements = document.querySelectorAll('[data-kaboom-body="true"]');
        const scrollY = window.scrollY || window.pageYOffset || 0;
        landingRails = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            // Pillar 3: Section headers walk directly on the visual underline.
            // Cards/badges calculate rail at top.
            let yRail;
            if (el.classList.contains("section-header") || el.matches(".section-header")) {
                yRail = rect.bottom + scrollY - 3;
            } else {
                yRail = rect.top + scrollY;
            }

            const rawTrap = el.getAttribute("data-trap");
            const trapType = (rawTrap && rawTrap !== "false" && rawTrap !== "none") ? rawTrap : "normal";
            landingRails.push({
                xLeft: rect.left,
                xRight: rect.right,
                width: rect.width,
                y: yRail,
                domElement: el,
                trap: trapType,
                name: el.tagName + (el.id ? '#' + el.id : (el.className ? '.' + el.className.split(' ')[0] : ''))
            });
        });
        window.landingRails = landingRails;
    }

    window.landingRails = landingRails;
    window.syncDOM = () => syncDOM(true);
    window.setPhysicsActive = (val) => { isPhysicsActive = val; };

    // Pillar 6: Spawn player perched on H1 "APOORV A S" (X = r.left + 120, Y = r.top)
    function placePlayerOnHero() {
        const h1 = document.querySelector('h1');
        if (h1 && player) {
            const r = h1.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset || 0;
            player.pos.x = r.left + 120;
            player.pos.y = r.top + scrollY;
            player.vy = 0;
            if (player.vel) {
                player.vel.x = 0;
                player.vel.y = 0;
            }
            player.grounded = true;
            const matchingRail = landingRails.find(rail => rail.domElement === h1);
            player.currentRail = matchingRail || null;
            console.log("placePlayerOnHero perched player on H1:", player.pos.x, player.pos.y);
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

        camPos(window.innerWidth / 2, currentScrollY + window.innerHeight / 2);

        const viewTop = currentScrollY;
        const viewBottom = currentScrollY + window.innerHeight;

        // Out of bounds Recovery
        if ((player.pos.y > viewBottom + 300 || player.pos.y < viewTop - 300) && !isRespawning && isPhysicsActive) {
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
