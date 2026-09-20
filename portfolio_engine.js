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

window.controlMode = "ambient"; // Default to ambient so the digital twin lives immediately

let manualTimeout = null;

// Wait for next frame so player.js is definitely loaded
onLoad(() => {
    // --- THE PLAYER ---
    // Uses createPlayer from player.js
    const player = window.createPlayer ? window.createPlayer(window.innerWidth / 2, 0) : createPlayer(window.innerWidth / 2, 0);
    window.player = player;

    // Track DOM elements and their Kaboom bodies
    const domBodies = new Map();

    function syncDOM() {
        const elements = document.querySelectorAll('[data-kaboom-body="true"]');
        
        elements.forEach(el => {
            const rectPos = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const absY = rectPos.top + scrollY;
            const absX = rectPos.left;
            
            if (!domBodies.has(el)) {
                const trapType = el.getAttribute("data-trap");
                const kBody = add([
                    rect(rectPos.width, rectPos.height),
                    pos(absX, absY),
                    area(),
                    body({ isStatic: true }),
                    opacity(0), // Invisible
                    "platform",
                    { trap: trapType, domElement: el }
                ]);
                domBodies.set(el, kBody);
            } else {
                const kBody = domBodies.get(el);
                kBody.pos.x = absX;
                kBody.pos.y = absY;
                kBody.use(rect(rectPos.width, rectPos.height));
            }
        });
    }

    syncDOM();

    const resizeObserver = new ResizeObserver(() => { syncDOM(); });
    document.querySelectorAll('[data-kaboom-body="true"]').forEach(el => { resizeObserver.observe(el); });
    resizeObserver.observe(document.body);

    // --- BABYLON 3D BRIDGE ---
    if (window.Engine3D) {
        window.Engine3D.init();
    }
    let is3DReady = false;

    // --- SCROLL-WIND PHYSICS & CAMERA SYNC ---
    debug.inspect = false; // Turn off hitboxes now that we have 3D!
    
    let lastScrollY = window.scrollY;
    let isRespawning = false;

    onUpdate(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // Apply Scroll Wind Force if scrolling fast
        if (Math.abs(scrollDelta) > 15 && !isRespawning && player.isGrounded()) {
            // Push the player physically
            player.move(0, scrollDelta * 20);
            if (window.Player3D) {
                // Lean character (simulate wind)
                window.Player3D.root.rotation.z = scrollDelta * 0.05;
                // Reset rotation tween
                tween(window.Player3D.root.rotation.z, 0, 0.5, (v) => window.Player3D.root.rotation.z = v, easings.easeOutQuad);
            }
        }

        camPos(window.innerWidth / 2, currentScrollY + window.innerHeight / 2);
        
        const viewTop = currentScrollY;
        const viewBottom = currentScrollY + window.innerHeight;
        
        // Out of bounds / Glass Smash Sequence
        if ((player.pos.y > viewBottom + 200 || player.pos.y < viewTop - 500) && !isRespawning) {
            isRespawning = true;
            player.vel.y = 0;
            player.vel.x = 0;
            
            if (window.Player3D && window.Player3D.smashIntoCamera) {
                window.Player3D.smashIntoCamera();
            }

            // Wait for smash animation to finish before respawning
            setTimeout(() => {
                player.pos = vec2(window.innerWidth / 2, window.scrollY + 50);
                player.vel.y = 0;
                player.vel.x = 0;
                isRespawning = false;
            }, 1000);
        }

        // Initialize 3D Player if engine is ready
        if (window.Engine3D && window.Engine3D.isReady && !is3DReady) {
            if (window.Player3D && window.Engine3D.scene) {
                window.Player3D.create(window.Engine3D.scene);
                is3DReady = true;
            }
        }

        // Sync 3D Player
        if (is3DReady) {
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

    // Smart AI State
    let aiState = "seek"; // 'seek', 'wander', or 'sales_pitch'
    let aiWanderDir = 1;
    let stuckTimer = 0;
    let lastX = 0;
    
    // Idle/Sales tracking
    let lastMousePos = vec2(0, 0);
    let idleTimer = 0;
    let targetCTA = null;

    // Ambient Controls (Smart AI & Sales Agent)
    onUpdate(() => {
        if (window.controlMode === "ambient" && !isRespawning) {
            const mPos = toWorld(mousePos());
            let moveDir = 0;

            // Idle Timer
            if (mPos.dist(lastMousePos) < 2) {
                idleTimer += dt();
            } else {
                idleTimer = 0;
                aiState = "seek";
                targetCTA = null;
            }
            lastMousePos = mPos.clone();

            // Trigger Sales Pitch if idle > 5s
            if (idleTimer > 5 && aiState !== "sales_pitch") {
                // Find nearest CTA
                const ctas = get("platform").filter(p => p.trap === "cta");
                if (ctas.length > 0) {
                    targetCTA = ctas.reduce((nearest, p) => 
                        player.pos.dist(p.pos) < player.pos.dist(nearest.pos) ? p : nearest
                    );
                    aiState = "sales_pitch";
                    console.log("AI switching to sales pitch mode!");
                } else {
                    aiState = "wander"; // No CTA found, just wander
                }
            }
            
            if (aiState === "sales_pitch" && targetCTA) {
                // Navigate to the CTA
                const targetX = targetCTA.pos.x + targetCTA.width / 2;
                if (Math.abs(player.pos.x - targetX) > 20) {
                    moveDir = Math.sign(targetX - player.pos.x);
                } else {
                    // We arrived at the CTA!
                    if (player.isGrounded() && chance(0.05)) {
                        player.jump(JUMP_FORCE); // Jump to get attention
                        if (window.Player3D) {
                            // Make them scale up to get attention
                            window.Player3D.root.scaling.x *= 1.2;
                            window.Player3D.root.scaling.y *= 1.2;
                            tween(1.2, 1, 0.5, (v) => {
                                window.Player3D.root.scaling.x = (player.facingLeft ? -1 : 1) * v;
                                window.Player3D.root.scaling.y = v;
                            }, easings.easeOutElastic);
                        }
                    }
                }
            } else if (aiState === "seek") {
                if (Math.abs(player.pos.x - mPos.x) > 20) {
                    moveDir = Math.sign(mPos.x - player.pos.x);
                }
            } else if (aiState === "wander") {
                moveDir = aiWanderDir;
                if (chance(0.02) || Math.abs(player.pos.x - mPos.x) < 50) {
                    aiState = "seek";
                }
            }

            // Stuck Detection
            if (moveDir !== 0 && Math.abs(player.pos.x - lastX) < 0.5) {
                stuckTimer++;
            } else {
                stuckTimer = 0;
            }
            lastX = player.pos.x;

            if (stuckTimer > 15 && player.isGrounded()) {
                const checkTargetY = aiState === "sales_pitch" && targetCTA ? targetCTA.pos.y : mPos.y;
                if (checkTargetY < player.pos.y) {
                    player.jump(JUMP_FORCE); 
                } else {
                    aiState = "wander";
                    aiWanderDir = -moveDir;
                    stuckTimer = 0;
                }
            }

            // Gap Detection (Look ahead 50px)
            let isGapAhead = true;
            const lookX = player.pos.x + (moveDir * 50);
            
            for (const plat of get("platform")) {
                // If there is a platform directly below our future X position
                if (lookX >= plat.pos.x && lookX <= plat.pos.x + plat.width) {
                    if (plat.pos.y >= player.pos.y - 10 && plat.pos.y <= player.pos.y + 150) {
                        isGapAhead = false;
                        break;
                    }
                }
            }

            // If there's a gap ahead, think like a human!
            if (isGapAhead && player.isGrounded() && moveDir !== 0) {
                if (mPos.y > player.pos.y + 50) {
                    // Mouse is below us, we WANT to fall. Proceed.
                } else {
                    // Mouse is above or level. We shouldn't fall!
                    // Is there a platform across the gap we can jump to?
                    let platformAcrossGap = false;
                    const jumpTargetX = player.pos.x + (moveDir * 150);
                    for (const plat of get("platform")) {
                        if (jumpTargetX >= plat.pos.x && jumpTargetX <= plat.pos.x + plat.width) {
                            if (plat.pos.y >= player.pos.y - 50 && plat.pos.y <= player.pos.y + 50) {
                                platformAcrossGap = true;
                                break;
                            }
                        }
                    }

                    if (platformAcrossGap) {
                        player.jump(JUMP_FORCE); // Leap of faith!
                    } else {
                        // Dead end! Nothing to jump to. Turn around and use the other side.
                        aiState = "wander";
                        aiWanderDir = -moveDir;
                        moveDir = aiWanderDir;
                    }
                }
            }

            // Apply Movement
            if (moveDir !== 0) {
                player.move(moveDir * SPEED * 0.8, 0);
                player.facingLeft = moveDir < 0;
                player.isMovingThisFrame = true; // Tell player.js to play run cycle
            }
        }
    });

    // --- TRAPS ---
    player.onCollide("platform", (plat) => {
        if (plat.trap === "drop") {
            plat.domElement.style.transition = "transform 0.1s";
            plat.domElement.style.transform = "translateX(5px)";
            setTimeout(() => plat.domElement.style.transform = "translateX(-5px)", 50);
            setTimeout(() => plat.domElement.style.transform = "translateX(0)", 100);
            
            setTimeout(() => {
                plat.isStatic = false; 
                plat.domElement.style.transition = "transform 1s ease-in";
                plat.domElement.style.transform = "translateY(1000px)"; 
            }, 500);
        }
        
        if (plat.trap === "spikes") {
            add([
                rect(plat.width, 10),
                color(255, 0, 0),
                pos(plat.pos.x, plat.pos.y - 10),
                area(),
                "spike"
            ]);
            plat.domElement.style.borderTop = "5px solid var(--danger)"; 
        }

        if (plat.trap === "bounce") {
            player.jump(JUMP_FORCE * 1.35);
            if (plat.domElement) {
                plat.domElement.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                plat.domElement.style.transform = "scale(0.97) translateY(4px)";
                setTimeout(() => {
                    plat.domElement.style.transform = "scale(1) translateY(0)";
                }, 150);
            }
            if (window.SFX && window.SFX.playJump) window.SFX.playJump();
        }
    });

    player.onCollide("spike", () => {
        shake(10);
        player.pos = vec2(window.innerWidth / 2, window.scrollY + 50);
        player.vel.y = 0;
    });
});
