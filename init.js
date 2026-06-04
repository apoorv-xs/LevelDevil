console.log("INT: init.js loaded");

try {
    // --- CONFIGURATION ---
    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    const C_DEVIL_SKIN = "#5A1C12";
    const C_DEVIL_EYES = "#D05A3A";

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
    window.go = k.go;
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

    // --- TRANSITION ANIMATION ---
    window.runDevilTransition = function (nextSceneName, onBiteClose) {
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

        const farHillColor = rgb(215, 165, 75); // Lighter desaturated orange-brown
        const nearHillColor = rgb(195, 135, 45); // Closer to floor color

        const segmentW = 400;
        const totalSegments = Math.ceil(worldWidth / segmentW) + 5;

        for (let i = -2; i < totalSegments; i++) {
            // Far hill
            farHills.add([
                rect(segmentW + 100, 240),
                pos(i * segmentW, 0),
                anchor("botleft"),
                color(farHillColor),
                opacity(0.35)
            ]);

            // Near hill
            nearHills.add([
                rect(segmentW, 140),
                pos(i * segmentW + segmentW * 0.5, 0),
                anchor("botleft"),
                color(nearHillColor),
                opacity(0.45)
            ]);
        }

        // Update positions relative to camera
        onUpdate(() => {
            const cx = camPos().x;
            farHills.pos.x = cx * 0.7 - cx;
            nearHills.pos.x = cx * 0.5 - cx;
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
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "999999";
        overlay.style.fontFamily = "'Press Start 2P', monospace";
        overlay.style.color = "#fff";

        // Create content box
        const box = document.createElement("div");
        box.style.border = "6px double #fff";
        box.style.padding = "40px";
        box.style.backgroundColor = "#111";
        box.style.textAlign = "center";
        box.style.maxWidth = "550px";
        box.style.boxShadow = "0px 0px 20px rgba(255, 255, 255, 0.25)";

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
                    el.style.backgroundColor = "#fff";
                    el.style.color = "#000";
                    el.innerText = "> " + menuOptions[i].name.toUpperCase() + " <";
                } else {
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#fff";
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
