console.log("INT: init.js loaded");

try {
    // --- CONFIGURATION ---
    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    const C_DEVIL_SKIN = "#060610"; // Deep void black
    const C_DEVIL_EYES = "#00F0FF"; // Neon cyan

    console.log("INT: Config set", CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- KABOOM SETUP ---
    // --- KABOOM SETUP ---
    const k = kaboom({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: [0, 0, 0, 0], // TRANSPARENT BACKGROUND
        canvas: document.getElementById("game-canvas"),
        root: document.getElementById("game-container"),
        stretch: false,
        letterbox: false,
        global: true, // EXPLICIT GLOBAL
        // debug: true 
    });
    window.k = k; // Expose K for pausing

    // FORCE GLOBALS (Azure Safety Net)
    window.scene = k.scene;
    const originalGo = k.go;
    window.go = function (sceneName, ...args) {
        if (sceneName !== "empty") {
            window.CURRENT_SCENE = sceneName;
        }
        return originalGo(sceneName, ...args);
    };
    k.go = window.go;
    window.add = k.add;
    window.pos = k.pos;
    window.rect = k.rect;
    window.color = k.color;
    window.area = k.area;
    window.body = k.body;
    window.anchor = k.anchor;
    window.z = k.z;
    window.text = k.text;
    window.rotate = k.rotate;
    window.scale = k.scale;
    window.opacity = k.opacity;
    window.outline = k.outline;
    window.move = k.move;
    window.lerp = k.lerp;
    window.dt = k.dt;
    window.rand = k.rand;
    window.vec2 = k.vec2;
    window.rgb = k.rgb;
    window.time = k.time;
    window.wait = k.wait;
    window.tween = k.tween;
    window.easings = k.easings;
    window.camPos = k.camPos;
    window.width = k.width;
    window.height = k.height;
    window.onUpdate = k.onUpdate;
    window.onDraw = k.onDraw;
    window.onCollide = k.onCollide;
    window.isKeyPressed = k.isKeyPressed;
    window.isKeyDown = k.isKeyDown;
    window.destroy = k.destroy;
    window.drawRect = k.drawRect;
    window.drawCircle = k.drawCircle;
    window.drawPolygon = k.drawPolygon;
    window.setGravity = k.setGravity;
    window.circle = k.circle;
    window.lifespan = k.lifespan;
    window.loop = k.loop;
    window.Rect = k.Rect;
    window.Polygon = k.Polygon;
    window.UP = k.UP;
    window.DOWN = k.DOWN;
    window.LEFT = k.LEFT;
    window.RIGHT = k.RIGHT;

    console.log("INT: Kaboom initialized");

    // --- OVERRIDE addKaboom for Z-INDEX ---
    // Ensure explosions are always on top
    const originalAddKaboom = window.addKaboom;
    window.addKaboom = function (p) {
        const boom = originalAddKaboom(p);
        if (boom) {
            boom.use(z(200)); // FORCE FRONT LAYER
        }
        return boom;
    };

    // --- HELPER FUNCTIONS ---
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    // Global references to jaws for cross-scene control
    window.g_TransitionJaws = { top: null, bot: null };
    window.g_IsTransitioning = false;

    // --- TRANSITION ANIMATION ---
    window.runDevilTransition = function (nextSceneName, onBiteClose) {
        window.g_IsTransitioning = true;
        if (window.SFX) window.SFX.playPort();
        const skinColor = rgb(...hexToRgb(C_DEVIL_SKIN));
        const eyeColor = rgb(...hexToRgb(C_DEVIL_EYES));

        const halfH = height() / 2;
        const teethSize = 40;

        // --- UPPER JAW ---
        const topJaw = add([
            pos(0, -halfH - 100),
            rect(width(), halfH + 100),
            color(skinColor),
            z(9999), // MAX Z
            fixed(),
            stay(), // PERSIST
            "transition_jaw"
        ]);

        // Teeth Top
        const teethCount = Math.ceil(width() / teethSize);
        for (let i = 0; i < teethCount; i++) {
            topJaw.add([
                rect(teethSize, teethSize),
                pos(i * (teethSize * 1.5), halfH + 100 - (teethSize / 2)),
                anchor("center"),
                rotate(45),
                color(skinColor)
            ]);
        }

        // Eyes 
        topJaw.add([
            rect(60, 30),
            pos(width() * 0.3, halfH + 100 - 110),
            anchor("center"),
            rotate(15),
            color(eyeColor),
        ]);
        topJaw.add([
            rect(60, 30),
            pos(width() * 0.7, halfH + 100 - 110),
            anchor("center"),
            rotate(-15),
            color(eyeColor),
        ]);


        // --- LOWER JAW ---
        const botJaw = add([
            pos(0, height() + 100),
            rect(width(), halfH + 100),
            color(skinColor),
            z(9999), // MAX Z
            fixed(),
            stay(), // PERSIST
            "transition_jaw"
        ]);

        // Teeth Bot
        for (let i = 0; i < teethCount; i++) {
            botJaw.add([
                rect(teethSize, teethSize),
                pos(i * (teethSize * 1.5) + (teethSize * 0.75), -teethSize / 2),
                anchor("center"),
                rotate(45),
                color(skinColor)
            ]);
        }

        // Store for next scene
        g_TransitionJaws.top = topJaw;
        g_TransitionJaws.bot = botJaw;

        // ANIMATION
        const biteTime = 0.5;

        // 1. Close Jaws
        tween(topJaw.pos.y, -50, biteTime, (val) => topJaw.pos.y = val, easings.easeOutBounce);
        tween(botJaw.pos.y, halfH, biteTime, (val) => botJaw.pos.y = val, easings.easeOutBounce)
            .onEnd(() => {
                // Jaws CLOSED
                if (onBiteClose) onBiteClose();
                // 2. Switch Scene
                if (nextSceneName) go(nextSceneName);
            });
    }

    // --- GATE ENTRY ANIMATION ---
    window.enterGate = function (player, gate, nextScene) {
        try {
            // Guard: Prevent double-entry
            if (player.isEntering) return;
            player.isEntering = true;

            console.log("INT: Entering Gate", nextScene);

            // 1. Disable Player
            player.paused = true;
            if (player.body) player.body.isStatic = true; // Stop physics interactions

            // 2. Animation params
            const enterTime = 0.5;

            // Center Player on Gate
            if (gate && gate.pos) {
                tween(player.pos.x, gate.pos.x, enterTime, (val) => player.pos.x = val, easings.easeOutQuad);
                tween(player.pos.y, gate.pos.y, enterTime, (val) => player.pos.y = val, easings.easeOutQuad);
            }

            // Scale Down (Suck effect)
            if (!player.scale) player.scale = vec2(1);
            tween(player.scale.x, 0, enterTime, (val) => player.scale.x = val, easings.easeInBack);
            tween(player.scale.y, 0, enterTime, (val) => player.scale.y = val, easings.easeInBack);

            // 3. Trigger Transition
            wait(enterTime * 0.8, () => {
                console.log("INT: Triggering Transition to", nextScene);
                window.runDevilTransition(nextScene);
            });
        } catch (err) {
            console.error("INT: Error in enterGate", err);
            // Fallback: just go
            window.runDevilTransition(nextScene);
        }
    };
    window.addGlobalClouds = function () {
        function addCloud(x, y, speed) {
            const cloud = add([
                pos(x, y),
                rect(60, 20),
                color(255, 255, 255),
                opacity(0.8),
                z(5),
                "cloud"
            ]);
            // Cloud Details (Pixel shapes)
            cloud.add([rect(30, 20), pos(15, -15), color(255, 255, 255)]);
            cloud.add([rect(20, 10), pos(40, 5), color(255, 255, 255)]);

            // Manual Movement Loop
            cloud.onUpdate(() => {
                cloud.move(-speed, 0);
                if (cloud.pos.x < -100) {
                    cloud.pos.x = width() + 100;
                }
            });
        }

        addCloud(width() * 0.2, height() * 0.15, 20);
        addCloud(width() * 0.5, height() * 0.1, 15);
        addCloud(width() * 0.8, height() * 0.2, 25);
    };

    window.addParallaxBackground = function (worldWidth, floorHeight) {
        const skyH = height() - floorHeight;

        // Parallax layers (far and near)
        const farHills = add([
            pos(0, skyH),
            z(0.2), // Behind details, but in front of sky rect (z=0)
            "parallax_far"
        ]);

        const nearHills = add([
            pos(0, skyH),
            z(0.3),
            "parallax_near"
        ]);

        const farHillColor = rgb(30, 15, 60); // Dark purple synthwave hill
        const nearHillColor = rgb(50, 20, 80); // Deep magenta synthwave hill

        const segmentW = 400;
        const totalSegments = Math.ceil(worldWidth / segmentW) + 5;

        for (let i = -2; i < totalSegments; i++) {
            // Far hill
            farHills.add([
                rect(segmentW + 100, 240),
                pos(i * segmentW, 0),
                anchor("botleft"),
                color(farHillColor),
                opacity(0.7),
                z(0.2)
            ]);
            // Neon cyan line edge
            farHills.add([
                rect(segmentW + 100, 2),
                pos(i * segmentW, -240),
                anchor("botleft"),
                color(0, 240, 255),
                opacity(0.75),
                z(0.2)
            ]);

            // Near hill
            nearHills.add([
                rect(segmentW, 140),
                pos(i * segmentW + segmentW * 0.5, 0),
                anchor("botleft"),
                color(nearHillColor),
                opacity(0.85),
                z(0.3)
            ]);
            // Neon magenta line edge
            nearHills.add([
                rect(segmentW, 2),
                pos(i * segmentW + segmentW * 0.5, -140),
                anchor("botleft"),
                color(255, 0, 127),
                opacity(0.85),
                z(0.3)
            ]);
        }

        // Update positions relative to camera
        onUpdate(() => {
            const cx = camPos().x;
            farHills.pos.x = cx * 0.7 - cx;
            nearHills.pos.x = cx * 0.5 - cx;
        });
    };

    window.addCyberStars = function (worldWidth) {
        const starLimit = worldWidth || width();
        for (let i = 0; i < 70; i++) {
            const star = add([
                pos(rand(-100, starLimit + 100), rand(-100, height() - 250)),
                rect(rand(2, 4), rand(2, 4)),
                color(255, 255, 255),
                opacity(rand(0.2, 0.7)),
                z(0.1),
                "cyber_star"
            ]);
            star.onUpdate(() => {
                if (rand() > 0.985) {
                    star.opacity = rand(0.1, 0.7);
                }
            });
        }
    };

    // --- VECTOR PLATFORM HELPER (Silhouettes with Neon Tops) ---
    window.addVectorPlatform = function (x, y, w, h, neonColor = rgb(0, 240, 255), tags = []) {
        const isStatic = !tags.includes("moving");
        const block = add([
            pos(x, y),
            rect(w, h),
            color(6, 6, 12), // High-contrast Vector silhouette deep dark core
            area(),
            body({ isStatic: isStatic }),
            z(1),
            ...tags
        ]);

        // Glowing, flowing neon fluid top border
        block.add([
            z(1.1),
            {
                draw() {
                    const steps = Math.ceil(w / 12);
                    const stepW = w / steps;
                    const pts = [];
                    const amp = 3.5; // Wave height
                    const freq = 0.05; // Wave wavelength frequency
                    const spd = 6.0; // Flow speed

                    // 1. Draw main neon wave
                    for (let i = 0; i <= steps; i++) {
                        const wx = i * stepW;
                        const phase = (wx * freq) + (time() * spd);
                        const wy = amp * Math.sin(phase) - 1.5;
                        pts.push(vec2(wx, wy));
                    }
                    for (let i = 0; i < steps; i++) {
                        k.drawLine({
                            p1: pts[i],
                            p2: pts[i+1],
                            color: neonColor,
                            width: 3.0,
                            opacity: 0.85
                        });
                    }

                    // 2. Draw secondary overlapping hot-white core wave
                    const pts2 = [];
                    for (let i = 0; i <= steps; i++) {
                        const wx = i * stepW;
                        const phase = (wx * freq * 0.8) + (time() * spd * 1.2) + Math.PI;
                        const wy = (amp * 0.6) * Math.sin(phase) - 1.0;
                        pts2.push(vec2(wx, wy));
                    }
                    for (let i = 0; i < steps; i++) {
                        k.drawLine({
                            p1: pts2[i],
                            p2: pts2[i+1],
                            color: rgb(255, 255, 255),
                            width: 1.2,
                            opacity: 0.5
                        });
                    }
                }
            }
        ]);


        // Auto-register as fluid ground segment (color 0-255 → 0-1)
        if (window.fluidGroundSegments) {
            window.fluidGroundSegments.push({
                x: x,
                w: w,
                y: y,
                h: h,
                color: [
                    (neonColor.r || 0) / 255,
                    (neonColor.g || 0) / 255,
                    (neonColor.b || 0) / 255
                ]
            });
        }

        return block;
    };

    // --- PERSPECTIVE GRID FLOOR (Dynamic Fluid Grid) ---
    window.addPerspectiveGrid = function () {
        return add([
            z(0.4), // Behind platforms (z=1) but in front of WebGL background
            fixed(),
            "perspective_grid",
            {
                draw() {
                    const horizonY = height() * 0.5; // Vanishing horizon height
                    const floorY = height();
                    const vanishingX = width() / 2;
                    const gridColor = rgb(0, 240, 255);

                    // 1. Draw horizontal waving lines with exponential spacing for depth
                    const numHLines = 12;
                    const steps = 40;
                    const stepW = width() / steps;

                    for (let j = 0; j < numHLines; j++) {
                        const progress = j / numHLines;
                        const baseY = lerp(horizonY, floorY, Math.pow(progress, 2.5));
                        
                        // Scale amplitude/frequency/speed with depth progress
                        const amplitude = 12 * Math.pow(progress, 2); // Flat at horizon, wavy close up
                        const frequency = 0.015;
                        const speed = 2.0 + progress * 2.0;
                        const opacity = progress * 0.25;
                        const thickness = 1.0 + progress * 1.5;

                        const pts = [];
                        for (let i = 0; i <= steps; i++) {
                            const x = i * stepW;
                            const phase = (x * frequency) + (time() * speed) + (j * 0.5);
                            const y = baseY + amplitude * Math.sin(phase);
                            pts.push(vec2(x, y));
                        }

                        for (let i = 0; i < steps; i++) {
                            k.drawLine({
                                p1: pts[i],
                                p2: pts[i+1],
                                color: gridColor,
                                opacity: opacity,
                                width: thickness
                            });
                        }
                    }

                    // 2. Draw vertical wavy perspective lines converging to horizon
                    const numVLines = 24;
                    const vSteps = 20;
                    const stepH = (floorY - horizonY) / vSteps;

                    // Camera relative scroll offset to keep it moving with player
                    const cx = (window.k && k.camPos) ? k.camPos().x : 0;
                    const cameraOffset = (cx * 0.3) % (width() / numVLines);

                    for (let j = -5; j <= numVLines + 5; j++) {
                        const baseX = (j * (width() / numVLines)) - cameraOffset;
                        const pts = [];

                        for (let i = 0; i <= vSteps; i++) {
                            const y = horizonY + (i * stepH);
                            const progress = (y - horizonY) / (floorY - horizonY);
                            const targetX = lerp(vanishingX, baseX, progress);

                            // Wave wobble is larger near the screen and zero at vanishing point
                            const amplitude = 15 * progress;
                            const phase = (y * 0.01) + (time() * 2.5) + (j * 0.3);
                            const wobble = amplitude * Math.sin(phase);

                            pts.push(vec2(targetX + wobble, y));
                        }

                        for (let i = 0; i < vSteps; i++) {
                            const progress = (pts[i].y - horizonY) / (floorY - horizonY);
                            k.drawLine({
                                p1: pts[i],
                                p2: pts[i+1],
                                color: gridColor,
                                opacity: 0.12 * progress,
                                width: 1.0 + progress * 0.8
                            });
                        }
                    }
                }
            }
        ]);
    };


    // --- DYNAMIC FLUID WARNING ALERT SYSTEM ---
    window.showFluidWarning = function (msg) {
        if (window.SFX && window.SFX.playTroll) {
            window.SFX.playTroll(); // Troll buzzer sound
        }

        const banner = add([
            pos(width() / 2, height() * 0.22),
            anchor("center"),
            rect(width() * 0.7, 50, { radius: 6 }),
            color(6, 6, 12),
            outline(3, rgb(255, 0, 127)),
            opacity(0.9),
            z(999),
            fixed()
        ]);

        const textObj = banner.add([
            text(msg, {
                size: 11,
                font: "'Press Start 2P'",
                align: "center",
                width: width() * 0.65
            }),
            anchor("center"),
            pos(0, 0),
            color(255, 0, 127),
            fixed()
        ]);

        // Pop Animation
        tween(0, 1, 0.4, (val) => {
            banner.pos.y = (height() * 0.16) + val * (height() * 0.06);
        }, easings.easeOutBack);

        // Neon blink effect
        let blinkTimer = 0;
        banner.onUpdate(() => {
            blinkTimer += dt() * 8;
            const blinkCol = (Math.floor(blinkTimer) % 2 === 0) ? rgb(255, 255, 255) : rgb(255, 0, 127);
            textObj.color = blinkCol;
            banner.outline.color = blinkCol;
        });

        // Auto destroy
        wait(3.2, () => {
            tween(1, 0, 0.4, (val) => {
                banner.opacity = val;
                textObj.opacity = val;
            }).onEnd(() => {
                destroy(banner);
            });
        });
    };

    // --- RECRUITER MODE (Global Invincibility) ---
    window.RECRUITER_MODE = false;
    window.SCENE_START_TIME = 0;
    if (typeof window.DEATH_COUNT === "undefined") window.DEATH_COUNT = 0;

    // Helper: Returns true ONLY if mode is ON AND 2 seconds have passed in scene
    window.isRecruiterActive = function () {
        if (!window.RECRUITER_MODE) return false;
        // Check if 2 seconds passed since scene start
        // Note: time() is global time.
        return (time() - window.SCENE_START_TIME > 2.0);
    };

    window.addRecruiterUI = function () {
        // Toggle Button (Top Right) - WIDER for longer text
        const toggleBtn = add([
            pos(width() - 280, 20), // Moved left slightly
            rect(260, 40),
            color(0, 0, 0),
            outline(4, rgb(255, 255, 255)),
            area(),
            fixed(),
            z(200), // Max Z
            "recruiter_toggle"
        ]);

        const label = toggleBtn.add([
            text("RECRUITER MODE: OFF", { size: 12, font: "'Press Start 2P'", width: 260, align: "center" }),
            anchor("center"),
            pos(130, 20),
            color(255, 255, 255),
            fixed() // Explicit fixed to prevent drift
        ]);

        // Toggle Logic
        toggleBtn.onClick(() => {
            window.RECRUITER_MODE = !window.RECRUITER_MODE;

            if (window.RECRUITER_MODE) {
                toggleBtn.color = rgb(50, 200, 50); // Green
                label.text = "RECRUITER MODE: ON";
            } else {
                toggleBtn.color = rgb(0, 0, 0); // Black
                label.text = "RECRUITER MODE: OFF";
            }
        });

        // Initialize State (Persist visual state if scene reloads)
        if (window.RECRUITER_MODE) {
            toggleBtn.color = rgb(50, 200, 50);
            label.text = "RECRUITER MODE: ON";
        }
    };

    window.updateRecruiterVisuals = function (player) {
        if (!player || !player.exists()) return;

        const BUBBLE_TAG = "recruiter_bubble";

        // Logic: Use isRecruiterActive() for visuals too?
        // User said "all recruiter mode effects".
        // If visuals appear immediately but mechanics delay, it's confusing.
        // Let's delay visuals too.
        if (window.isRecruiterActive()) {
            let bubble = player.children.find(c => c.is(BUBBLE_TAG));
            if (!bubble) {
                bubble = player.add([
                    circle(50), // Much bigger radius
                    pos(0, -45), // Center on body (assuming anchor bot)
                    color(0, 255, 255), // Cyan
                    opacity(0.4),
                    anchor("center"),
                    z(10), // On top of player
                    BUBBLE_TAG
                ]);
                // Pulse Animation
                bubble.onUpdate(() => {
                    bubble.opacity = map(Math.sin(time() * 10), -1, 1, 0.3, 0.6);
                    bubble.radius = map(Math.sin(time() * 5), -1, 1, 50, 55);
                });
            }
        } else {
            const bubble = player.children.find(c => c.is(BUBBLE_TAG));
            if (bubble) destroy(bubble);
        }
    };

    // --- INTERACTION LOGIC (RESTORED) ---
    const startOverlay = document.getElementById('start-overlay');
    const gameContainer = document.getElementById('game-container');

    if (startOverlay && gameContainer) {
        // Handle Click on HTML Overlay
        startOverlay.addEventListener('click', () => {
            if (window.SFX) window.SFX.init();
            gameContainer.style.pointerEvents = "all";
            const canvas = document.getElementById("game-canvas");
            if (canvas) canvas.focus();

            window.runDevilTransition("intro", () => {
                startOverlay.style.display = 'none';
                const pBtn = document.getElementById('pause-btn');
                if (pBtn) pBtn.style.display = 'block';
            });
        });
    } else {
        console.warn("INT: Start overlay or game container not found");
    }

    // --- DYNAMIC TITLE (User Request) ---
    const originalTitle = "⚠️ Warning: High Skill Required";
    document.title = originalTitle;

    window.addEventListener("blur", () => {
        document.title = "💀 Don't give up yet!";
        // Pause game to prevent physics explosions from large dt
        if (window.k) window.k.debug.paused = true;
    });

    window.addEventListener("focus", () => {
        document.title = originalTitle;
        // Resume game only if project links overlay is NOT open
        const overlayActive = document.getElementById("project-modal-overlay") !== null;
        if (window.k && !overlayActive) window.k.debug.paused = false;
    });

    window.showProjectLinksOverlay = function (projectData, callbackOnClose) {
        if (window.SFX) window.SFX.playCoin();

        // Pause the game loop
        if (window.k) window.k.debug.paused = true;

        // Create overlay container
        const overlay = document.createElement("div");
        overlay.id = "project-modal-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(10, 10, 20, 0.75)";
        overlay.style.backdropFilter = "blur(12px)";
        overlay.style.webkitBackdropFilter = "blur(12px)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "999999";
        overlay.style.fontFamily = "'Press Start 2P', monospace";
        overlay.style.color = "#fff";

        // Create content box
        const box = document.createElement("div");
        box.style.border = "3px solid #00f0ff";
        box.style.padding = "40px";
        box.style.backgroundColor = "rgba(15, 15, 30, 0.9)";
        box.style.textAlign = "center";
        box.style.maxWidth = "550px";
        box.style.boxShadow = "0px 0px 25px rgba(0, 240, 255, 0.4), inset 0px 0px 15px rgba(0, 240, 255, 0.2)";
        box.style.borderRadius = "8px";

        // Title
        const title = document.createElement("h2");
        title.innerText = projectData.title.toUpperCase();
        title.style.color = "#fce566";
        title.style.marginBottom = "30px";
        title.style.fontSize = "1.5rem";
        title.style.lineHeight = "2rem";
        box.appendChild(title);

        // Options list
        const optionsList = document.createElement("div");
        optionsList.style.display = "flex";
        optionsList.style.flexDirection = "column";
        optionsList.style.gap = "15px";
        box.appendChild(optionsList);

        const links = projectData.links;
        const menuOptions = [...links, { name: "BACK TO GAME", isBack: true }];

        let selectedIndex = 0;
        const optionElements = [];

        menuOptions.forEach((opt, idx) => {
            const btn = document.createElement("div");
            btn.style.padding = "12px 20px";
            btn.style.fontSize = "0.9rem";
            btn.style.cursor = "pointer";
            btn.style.transition = "all 0.1s";
            btn.style.userSelect = "none";
            btn.innerText = opt.name.toUpperCase();

            optionsList.appendChild(btn);
            optionElements.push(btn);

            // Click / Hover logic
            btn.addEventListener("click", () => {
                selectOption(idx);
            });

            btn.addEventListener("mouseenter", () => {
                highlightOption(idx);
            });
        });

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        function highlightOption(idx) {
            if (selectedIndex !== idx && window.SFX) {
                window.SFX.playJump();
            }
            selectedIndex = idx;
            optionElements.forEach((el, i) => {
                if (i === idx) {
                    el.style.backgroundColor = "#ff007f";
                    el.style.color = "#000";
                    el.style.boxShadow = "0px 0px 15px #ff007f";
                    el.style.borderRadius = "4px";
                    el.innerText = "> " + menuOptions[i].name.toUpperCase() + " <";
                } else {
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#fff";
                    el.style.boxShadow = "none";
                    el.innerText = menuOptions[i].name.toUpperCase();
                }
            });
        }

        function selectOption(idx) {
            const opt = menuOptions[idx];
            closeModal();

            if (!opt.isBack) {
                if (window.SFX) window.SFX.playCoin();
                setTimeout(() => {
                    window.open(opt.url, "_blank");
                }, 100);
            } else {
                if (window.SFX) window.SFX.playTroll();
            }
        }

        function closeModal() {
            document.body.removeChild(overlay);
            document.removeEventListener("keydown", handleKeyDown);
            if (window.k) window.k.debug.paused = false;
            if (callbackOnClose) callbackOnClose();
        }

        // Initialize highlights
        highlightOption(0);

        // Keyboard controls
        function handleKeyDown(e) {
            if (e.key === "ArrowDown" || e.key === "s") {
                highlightOption((selectedIndex + 1) % menuOptions.length);
                e.preventDefault();
            } else if (e.key === "ArrowUp" || e.key === "w") {
                highlightOption((selectedIndex - 1 + menuOptions.length) % menuOptions.length);
                e.preventDefault();
            } else if (e.key === "Enter" || e.key === "Spacebar" || e.key === " ") {
                selectOption(selectedIndex);
                e.preventDefault();
            } else if (e.key === "Escape") {
                selectOption(menuOptions.length - 1); // Select back
                e.preventDefault();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
    };

    // --- PAUSE MENU SYSTEM ---
    window.isPaused = false;
    window.pauseMenuOverlay = null;
    window.pauseMenuKeyDownHandler = null;

    window.togglePauseMenu = function () {
        const sOverlay = document.getElementById("start-overlay");
        if (sOverlay && sOverlay.style.display !== "none") return;
        if (document.getElementById("project-modal-overlay")) return;

        if (window.isPaused) {
            window.resumeGame();
        } else {
            window.pauseGame();
        }
    };

    window.pauseGame = function () {
        if (window.isPaused) return;
        window.isPaused = true;
        if (window.k) window.k.debug.paused = true;
        if (window.SFX) window.SFX.playTroll();

        const overlay = document.createElement("div");
        overlay.id = "pause-modal-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "999999";
        overlay.style.fontFamily = "'Press Start 2P', monospace";
        overlay.style.color = "#fff";

        const box = document.createElement("div");
        box.style.border = "6px double #fff";
        box.style.padding = "40px";
        box.style.backgroundColor = "#111";
        box.style.textAlign = "center";
        box.style.width = "400px";
        box.style.boxShadow = "0px 0px 20px rgba(255, 255, 255, 0.25)";

        const title = document.createElement("h2");
        title.innerText = "GAME PAUSED";
        title.style.color = "#fce566";
        title.style.marginBottom = "30px";
        title.style.fontSize = "1.5rem";
        box.appendChild(title);

        const optionsList = document.createElement("div");
        optionsList.style.display = "flex";
        optionsList.style.flexDirection = "column";
        optionsList.style.gap = "15px";
        box.appendChild(optionsList);

        const menuOptions = [
            { name: "RESUME", action: () => window.resumeGame() },
            { name: "RESTART LEVEL", action: () => { window.resumeGame(); window.go(window.CURRENT_SCENE || "intro"); } }
        ];

        if (window.CURRENT_SCENE && window.CURRENT_SCENE !== "intro") {
            menuOptions.push({ name: "BACK TO INTRO", action: () => { window.resumeGame(); window.go("intro"); } });
        }

        let selectedIndex = 0;
        const optionElements = [];

        menuOptions.forEach((opt, idx) => {
            const btn = document.createElement("div");
            btn.style.padding = "12px 20px";
            btn.style.fontSize = "0.9rem";
            btn.style.cursor = "pointer";
            btn.style.transition = "all 0.1s";
            btn.style.userSelect = "none";
            btn.innerText = opt.name.toUpperCase();

            optionsList.appendChild(btn);
            optionElements.push(btn);

            btn.addEventListener("click", () => {
                opt.action();
            });

            btn.addEventListener("mouseenter", () => {
                highlightOption(idx);
            });
        });

        overlay.appendChild(box);
        document.body.appendChild(overlay);
        window.pauseMenuOverlay = overlay;

        function highlightOption(idx) {
            if (selectedIndex !== idx && window.SFX) {
                window.SFX.playJump();
            }
            selectedIndex = idx;
            optionElements.forEach((el, i) => {
                if (i === idx) {
                    el.style.backgroundColor = "#ff007f";
                    el.style.color = "#000";
                    el.style.boxShadow = "0px 0px 15px #ff007f";
                    el.style.borderRadius = "4px";
                    el.innerText = "> " + menuOptions[i].name.toUpperCase() + " <";
                } else {
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#fff";
                    el.style.boxShadow = "none";
                    el.innerText = menuOptions[i].name.toUpperCase();
                }
            });
        }

        function handleKeyDown(e) {
            if (e.key === "ArrowDown" || e.key === "s") {
                highlightOption((selectedIndex + 1) % menuOptions.length);
                e.preventDefault();
            } else if (e.key === "ArrowUp" || e.key === "w") {
                highlightOption((selectedIndex - 1 + menuOptions.length) % menuOptions.length);
                e.preventDefault();
            } else if (e.key === "Enter" || e.key === "Spacebar" || e.key === " ") {
                menuOptions[selectedIndex].action();
                e.preventDefault();
            } else if (e.key === "Escape") {
                window.resumeGame();
                e.preventDefault();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        window.pauseMenuKeyDownHandler = handleKeyDown;

        highlightOption(0);
    };

    window.resumeGame = function () {
        if (!window.isPaused) return;
        window.isPaused = false;

        if (window.pauseMenuOverlay) {
            document.body.removeChild(window.pauseMenuOverlay);
            window.pauseMenuOverlay = null;
        }

        if (window.pauseMenuKeyDownHandler) {
            document.removeEventListener("keydown", window.pauseMenuKeyDownHandler);
            window.pauseMenuKeyDownHandler = null;
        }

        if (window.k) window.k.debug.paused = false;
        if (window.SFX) window.SFX.playCoin();
    };

    // Register Escape key listener globally
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (e.defaultPrevented) return;
            window.togglePauseMenu();
        }
    });

    // Create and inject Pause Button
    const pauseBtn = document.createElement("div");
    pauseBtn.id = "pause-btn";
    pauseBtn.innerText = "|| PAUSE";
    pauseBtn.style.position = "fixed";
    pauseBtn.style.top = "20px";
    pauseBtn.style.left = "20px";
    pauseBtn.style.zIndex = "150";
    pauseBtn.style.fontFamily = "'Press Start 2P', monospace";
    pauseBtn.style.fontSize = "12px";
    pauseBtn.style.color = "#fff";
    pauseBtn.style.backgroundColor = "#000";
    pauseBtn.style.border = "4px double #fff";
    pauseBtn.style.padding = "8px 12px";
    pauseBtn.style.cursor = "pointer";
    pauseBtn.style.userSelect = "none";
    pauseBtn.style.display = "none";

    pauseBtn.addEventListener("mouseenter", () => {
        pauseBtn.style.backgroundColor = "#fff";
        pauseBtn.style.color = "#000";
        if (window.SFX) window.SFX.playJump();
    });
    pauseBtn.addEventListener("mouseleave", () => {
        pauseBtn.style.backgroundColor = "#000";
        pauseBtn.style.color = "#fff";
    });
    pauseBtn.addEventListener("click", (e) => {
        window.togglePauseMenu();
        e.stopPropagation();
    });

    document.body.appendChild(pauseBtn);

    // --- STARTUP (Moved from index.html) ---
    // Create empty scene to wait for user interaction
    if (window.scene) {
        console.log("INT: Initializing Empty Scene");
        window.scene("empty", () => { });
        window.go("empty");
    } else {
        console.error("INT: Critical - Scene not globally defined!");
    }

} catch (e) {
    console.error("INT: Critical Error in init.js", e);
    alert("INT: Init Error: " + e.message);
}
