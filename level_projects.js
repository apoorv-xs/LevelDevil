scene("projects", () => {
    // --- SETUP ---
    window.SCENE_START_TIME = time(); // Reset Timer for Delay

    // Global state for this scene
    let islandsMoving = false;
    let spikesTriggered = false;

    // Background (Opaque color to match intro, extended bounds)
    const C_BG = color(233, 180, 90); // #E9B45A

    add([
        rect(width() * 20, height() * 10), // Extremely wide bg
        C_BG,
        pos(-width() * 5, -height() * 5),
        z(0)
    ]);

    // Palette
    const C_FLOOR = rgb(176, 113, 29); // #B0711D
    const C_TEXT = rgb(44, 44, 44); // #2C2C2C
    const C_OUTLINE = color(0, 0, 0); // Thick Black
    const C_TECH_BASE = rgb(100, 100, 100); // Dark Grey

    // Using Global Recruiter UI
    if (window.addRecruiterUI) window.addRecruiterUI();

    // Floor Base
    const floorHeight = height() * 0.2;
    const groundY = height() - floorHeight;
    // Hardcoded huge width to prevent "invisible wall" camera limits
    const worldWidth = 10000;

    // Ground
    add([
        rect(worldWidth, floorHeight),
        pos(0, groundY),
        color(C_FLOOR),
        z(1),
        area(),
        body({ isStatic: true }),
        "floor"
    ]);

    // --- CLOUDS ---
    function addWideClouds() {
        const cloudCount = 50;
        const cloudLimit = 4000; // Limit to playable area approx
        for (let i = 0; i < cloudCount; i++) {
            const x = rand(0, cloudLimit);
            // Spawn high up: groundY - 400 is roughly above the first jump pads.
            // groundY - 2000 is very high.
            // This leaves the ground floor clear.
            const y = rand(groundY - 2000, groundY - 400);
            const speed = rand(5, 40);
            const scaleFactor = rand(0.5, 1.5);

            const cloud = add([
                pos(x, y),
                rect(60 * scaleFactor, 20 * scaleFactor),
                color(255, 255, 255),
                opacity(rand(0.3, 0.7)),
                z(0.5),
                "cloud"
            ]);
            cloud.add([rect(30 * scaleFactor, 20 * scaleFactor), pos(15 * scaleFactor, -15 * scaleFactor), color(255, 255, 255)]);
            cloud.add([rect(20 * scaleFactor, 10 * scaleFactor), pos(40 * scaleFactor, 5 * scaleFactor), color(255, 255, 255)]);

            cloud.onUpdate(() => {
                cloud.move(-speed, 0);
                if (cloud.pos.x < -200) {
                    cloud.pos.x = cloudLimit; // Recycle closer
                    cloud.pos.y = rand(groundY - 2000, groundY - 400);
                }
            });
        }
    }
    addWideClouds();


    // --- PLAYER ---
    // Spawn at 150
    const guy = createPlayer(150, groundY - 100);
    guy.levelWidth = worldWidth;

    // --- RECRUITER MODE PLAYER LOGIC ---
    guy.onUpdate(() => {
        // RECRUITER VISUALS (Now handles delay internally via isRecruiterActive)
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });


    // --- LIGHTNING TRAP ---
    if (window.createLightningCloud) {
        createLightningCloud(1000, height() * 0.15, guy, groundY, () => {
            // IMMUNITY CHECK (Delayed)
            if (window.isRecruiterActive()) return;
            go("projects");
        });
    }

    // --- VOID CHECK ---
    // Safety net: if player somehow falls below floor or off map
    guy.onUpdate(() => {
        if (guy.pos.y > groundY + 200) {
            // RECRUITER MODE: Teleport up instead of dying?
            // Delayed
            if (window.isRecruiterActive()) {
                guy.pos.y = groundY - 200;
                return;
            }
            go("projects");
        }
    });

    // --- LAVA ---
    // Function to spawn lava segments between safe zones
    function spawnLava() {
        // Colors
        const C_LAVA_BASE = rgb(180, 20, 20); // Darker Magma
        const C_LAVA_TOP = rgb(255, 69, 0);   // Hot Orange Surface
        const C_BUBBLE = rgb(255, 220, 50);   // White Hot

        const padWidth = 40;
        const zones = [400, 800, 1200, 1600];

        const segments = [];
        // Start after the FIRST pad
        let startX = zones[0] + padWidth / 2;

        zones.forEach(zoneX => {
            const endX = zoneX - padWidth / 2;
            if (endX > startX) {
                segments.push({ start: startX, width: endX - startX });
            }
            startX = zoneX + padWidth / 2;
        });

        const LAVA_END_X = 2650;
        if (startX < LAVA_END_X) {
            segments.push({ start: startX, width: LAVA_END_X - startX });
        }

        const h = 40;
        const targetBotY = groundY - 8 + h;
        const initialBotY = groundY + h;

        // Create Lava Objects
        segments.forEach(seg => {
            const lava = add([
                rect(seg.width, h),
                pos(seg.start, initialBotY), // Start buried
                color(C_LAVA_BASE),
                anchor("botleft"),
                area(),
                z(0.95),
                "lava",
                {
                    targetY: targetBotY,
                    initialY: initialBotY
                }
            ]);

            lava.add([
                rect(seg.width, 6), // Thicker surface
                pos(0, -h),
                color(C_LAVA_TOP),
                opacity(1)
            ]);

            // Bubbles System
            let bubbleTimer = 0;
            lava.onUpdate(() => {
                if (Math.abs(lava.pos.y - lava.initialY) < 5) return; // Almost buried
                bubbleTimer += dt();
                if (bubbleTimer > rand(0.3, 1.0)) {
                    bubbleTimer = 0;
                    const bX = rand(0, seg.width);
                    const bSize = rand(2, 6);
                    const bubble = lava.add([
                        rect(bSize, bSize),
                        pos(bX, -h + 2),
                        color(C_BUBBLE),
                        opacity(1),
                        anchor("center"),
                        move(UP, rand(10, 30)),
                        "bubble"
                    ]);

                    bubble.onUpdate(() => {
                        bubble.opacity -= dt();
                        if (bubble.opacity <= 0) destroy(bubble);
                    });
                }
            });
        });
    }
    spawnLava();


    // --- JUMP PADS (Embedded Plate Style) ---
    function createJumpPad(x, y, parent = null) {
        // Base
        const padConfig = [
            pos(x, y),
            rect(40, 5),
            anchor("top"),
            color(0, 0, 0),
            z(1.5),
            "jump_pad_base"
        ];

        let pad;
        if (parent) {
            pad = parent.add(padConfig);
        } else {
            pad = add(padConfig);
        }

        // Plate
        const plateConfig = [
            rect(36, 8),
            pos(0, 0),
            anchor("bot"),
            color(200, 50, 50),
            outline(2, C_OUTLINE),
            area(),
            z(1.6),
            "jump_pad",
            "spring_top"
        ];

        const plate = pad.add(plateConfig);

        // RECRUITER MODE LOGIC for PADS (Delayed)
        plate.onUpdate(() => {
            if (window.isRecruiterActive()) {
                plate.opacity = 0;
                pad.opacity = 0;
            } else {
                plate.opacity = 1;
                pad.opacity = 1;
            }
        });

        return plate;
    }

    // Logic for Jump Pads
    guy.onCollide("jump_pad", (plate) => {
        // IGNORE in Recruiter Mode (Delayed)
        if (window.isRecruiterActive()) return;

        // ACTIVATE ISLANDS & SPIKES on first touch
        if (!islandsMoving) {
            islandsMoving = true;

            // Trigger Lava
            if (!spikesTriggered) {
                spikesTriggered = true;
                // Tween all lava UP
                get("lava").forEach((l) => {
                    tween(l.pos.y, l.targetY, 0.4, (v) => l.pos.y = v, easings.easeOutBack);
                });
            }
        }

        if (guy.vel && guy.vel.y < 0) return;

        shake(2);
        guy.jump(1200);

        tween(plate.pos.y, plate.pos.y + 5, 0.05, (v) => plate.pos.y = v, easings.easeOutQuad)
            .onEnd(() => {
                tween(plate.pos.y, plate.pos.y - 5, 0.2, (v) => plate.pos.y = v, easings.easeOutElastic);
            });
    });

    // --- ICONS ---
    function drawPaw(obj) {
        const c = rgb(139, 69, 19);
        obj.add([rect(20, 16), pos(0, 4), anchor("center"), color(c)]);
        obj.add([rect(6, 6), pos(-12, -8), anchor("center"), color(c)]);
        obj.add([rect(6, 6), pos(-4, -14), anchor("center"), color(c)]);
        obj.add([rect(6, 6), pos(4, -14), anchor("center"), color(c)]);
        obj.add([rect(6, 6), pos(12, -8), anchor("center"), color(c)]);
    }
    function drawCart(obj) {
        const c = rgb(80, 80, 80);
        obj.add([rect(24, 14), pos(0, -2), anchor("center"), color(200, 200, 200), outline(2, C_OUTLINE)]);
        obj.add([rect(4, 16), pos(-16, -6), anchor("center"), color(c), rotate(-20)]);
        obj.add([rect(6, 6), pos(-8, 10), anchor("center"), color(50, 50, 50)]);
        obj.add([rect(6, 6), pos(8, 10), anchor("center"), color(50, 50, 50)]);
    }
    function drawGlobe(obj) {
        const water = rgb(0, 191, 255);
        const line = rgb(255, 255, 255);
        obj.add([rect(28, 28), pos(0, 0), anchor("center"), color(water), outline(2, C_OUTLINE)]);
        obj.add([rect(28, 2), pos(0, 0), anchor("center"), color(line)]);
        obj.add([rect(2, 28), pos(0, 0), anchor("center"), color(line)]);
        obj.add([rect(36, 2), pos(0, 0), anchor("center"), color(line), rotate(45)]);
        obj.add([rect(36, 2), pos(0, 0), anchor("center"), color(line), rotate(-45)]);
    }

    // --- MOVING ISLAND BUILDER ---
    function createIsland(x, y, type, project = null, moveConfig = null) {

        const island = add([
            pos(x, y),
            z(2),
            {
                initialX: x,
                initialY: y,
                // Last pos for delta calc
                lastX: x
            }
        ]);

        // Island Height - used for landing target
        const islandH = 30;

        // MOVEMENT LOGIC
        let activeTime = 0;
        island.onUpdate(() => {
            // 1. Capture OLD position
            const oldX = island.pos.x;
            const oldY = island.pos.y;

            // 2. Determine Movement
            // RECRUITER MODE: DESCEND TO GROUND (Delayed)
            if (window.isRecruiterActive()) {
                const targetY = groundY - islandH;

                // Lerp Y
                island.pos.y = lerp(island.pos.y, targetY, dt() * 3);

                // Lerp X back to initial (center)
                island.pos.x = lerp(island.pos.x, island.initialX, dt() * 3);

            } else if (moveConfig && islandsMoving) {
                // NORMAL MODE: Move in pattern
                activeTime += dt();
                const t = activeTime * moveConfig.speed;
                const setX = moveConfig.dist * Math.sin(t);
                const targetX = island.initialX + setX;

                island.pos.x = lerp(island.pos.x, targetX, dt() * 5);
                island.pos.y = lerp(island.pos.y, island.initialY, dt() * 5);

                if (Math.abs(island.pos.y - island.initialY) < 10) {
                    island.pos.x = targetX;
                    island.pos.y = island.initialY;
                }

            } else {
                // Static islands return to start
                island.pos.y = lerp(island.pos.y, island.initialY, dt() * 5);
                island.pos.x = lerp(island.pos.x, island.initialX, dt() * 5);
            }

            // 3. Calculate DELTA from actual moves
            const dx = island.pos.x - oldX;
            const dy = island.pos.y - oldY; // Optional if vertical moving needs stickiness too

            // 4. APPLY TO PLAYER (Using Standard Kaboom 'curPlatform')
            // This decouples "Stickiness" from "Movement Logic"
            // If player is standing on this island's base, move him.
            if (guy.exists() && guy.isGrounded() && guy.curPlatform() === island.baseObj) {
                guy.pos.x += dx;
                guy.pos.y += dy;
            }
        });


        const islandW = 160;
        let baseColor = C_FLOOR;
        if (type === "tech") baseColor = C_TECH_BASE;

        // Base - ATTACH TO ISLAND CONTAINER
        // Note: we can skip adding 'pos' to child if we want it at 0,0, but here we offset it.
        const base = island.add([
            rect(islandW, islandH),
            pos(-islandW / 2, 0),
            color(baseColor),
            outline(4, C_OUTLINE),
            area(),
            body({ isStatic: true }),
            "wall"
        ]);

        island.baseObj = base;

        // Decos
        island.add([rect(15, 15), pos(-islandW / 4, islandH), color(baseColor), outline(4, C_OUTLINE), z(-1)]);
        island.add([rect(20, 8), pos(10, islandH), color(baseColor), outline(4, C_OUTLINE), z(-1)]);
        island.add([rect(10, 20), pos(islandW / 3, islandH), color(baseColor), outline(4, C_OUTLINE), z(-1)]);

        // IF NO PROJECT, JUST RETURN PLATFORM
        if (!project) return island;

        // Door
        const doorColor = project.doorColor;
        const doorH = 70;
        const doorW = 45;
        const door = island.add([
            rect(doorW, doorH),
            pos(0, 0),
            anchor("bot", "center"),
            color(doorColor),
            outline(4, C_OUTLINE),
            z(1),
            area(),
            "project_door",
            { projectData: project }
        ]);
        door.add([rect(doorW - 12, doorH - 12), pos(0, 0), anchor("center"), color(0, 0, 0), opacity(0.1)]);
        door.add([rect(6, 6), pos(doorW / 2 - 10, -doorH / 2), anchor("center"), color(255, 235, 59), outline(2, C_OUTLINE)]);

        // Icon
        const iconBaseY = -doorH - 40;
        const icon = island.add([
            pos(0, iconBaseY),
            z(5),
            "icon"
        ]);
        if (project.icon === "paw") drawPaw(icon);
        else if (project.icon === "cart") drawCart(icon);
        else if (project.icon === "globe") drawGlobe(icon);

        let iconTime = 0;
        icon.onUpdate(() => {
            iconTime += dt() * 3;
            icon.pos.y = iconBaseY + Math.sin(iconTime) * 6;
        });

        return island;
    }

    // --- DATA ---
    const projects = [
        {
            id: "pet",
            title: "Pet Adoption",
            type: "earth",
            doorColor: rgb(255, 140, 0),
            icon: "paw",
            desc: "Helping paws find homes.",
            link: "https://www.figma.com/design/mKajJpIhWmZbKDm1mwcaZ6/Untitled?node-id=0-1&t=RWvLvXejy9jmVpEL-1"
        },
        {
            id: "radar",
            title: "Radarhire",
            type: "tech",
            doorColor: rgb(0, 191, 255),
            icon: "globe",
            desc: "GitHub Project",
            link: "https://github.com/apoorv-xs/Radarhire"
        },
        {
            id: "ecom",
            title: "Ecommerce",
            type: "earth",
            doorColor: rgb(102, 51, 153),
            icon: "cart",
            desc: "Shop everything.",
            link: "https://www.figma.com/proto/o0Wrqa5hwpm1owt6Bdi03b/The-FIND?node-id=0-1&t=1SWjUK1wz2e0ZZlc-1"
        },
        // NEW PROJECT
        {
            id: "portfolio",
            title: "Live Portfolio",
            type: "tech",
            doorColor: rgb(50, 205, 50), // Lime Green
            icon: "globe",
            desc: "Personal Website",
            link: "https://red-meadow-01ad20b00.2.azurestaticapps.net/"
        }
    ];

    // --- LEVEL LAYOUT ---

    // 1. START BACK GATE (Retro Style from About Level)
    const backGate = add([
        pos(80, groundY),  // Moved to 80
        area({ shape: new Rect(vec2(0, -40), 60, 80) }),
        anchor("bot"),
        z(1),
        "back_gate"
    ]);

    // Label
    backGate.add([
        text("BACK", { size: 10, font: "'Press Start 2P'" }),
        pos(0, -90),
        anchor("bot"),
        color(C_TEXT),
        z(10)
    ]);

    // Visuals for Back Gate (Intro/Retro style)
    backGate.add([rect(60, 50), pos(0, 0), anchor("bot"), color(C_FLOOR), z(0)]);
    backGate.add([rect(60, 10), pos(0, -50), anchor("bot"), color(C_FLOOR), z(0)]);
    backGate.add([rect(50, 6), pos(0, -60), anchor("bot"), color(C_FLOOR), z(0)]);
    backGate.add([rect(30, 4), pos(0, -66), anchor("bot"), color(C_FLOOR), z(0)]);
    backGate.add([rect(52, 50), pos(0, 0), anchor("bot"), color(180, 180, 180), z(1)]);
    backGate.add([rect(52, 10), pos(0, -50), anchor("bot"), color(180, 180, 180), z(1)]);
    backGate.add([rect(42, 6), pos(0, -60), anchor("bot"), color(180, 180, 180), z(7)]);
    backGate.add([rect(22, 4), pos(0, -66), anchor("bot"), color(180, 180, 180), z(7)]);


    // 1. Ground Pads
    createJumpPad(400, groundY);
    createJumpPad(800, groundY);
    createJumpPad(1200, groundY);
    createJumpPad(1600, groundY);

    // 2. Islands Sequence

    // Island 1 (Pet): 600
    const i1 = createIsland(600, groundY - 200, projects[0].type, projects[0]);
    createJumpPad(60, 0, i1);

    // Island 2 (NEW PORTFOLIO): 950
    // Replaced null with projects[3]
    const i2 = createIsland(950, groundY - 400, "tech", projects[3], { dist: 150, speed: 1.5 });
    createJumpPad(60, 0, i2);

    // Island 3 (Radar): 1300
    // Note: Projects[1] is Radarhire
    const i3 = createIsland(1300, groundY - 550, projects[1].type, projects[1], { dist: 200, speed: 1.2 });
    // REMOVED JUMP PAD AS PADS REQUEST
    // createJumpPad(-60, 0, i3); 

    // Island 4 (EMPTY): 1650
    const i4 = createIsland(1650, groundY - 300, "earth", null, { dist: 100, speed: 2 });
    createJumpPad(60, 0, i4);

    // Island 5 (Ecom): 2000
    // Note: Projects[2] is Ecom
    const i5 = createIsland(2000, groundY - 500, projects[2].type, projects[2]);
    createJumpPad(-60, 0, i5);

    // Island 6 (EMPTY): 2350
    const i6 = createIsland(2350, groundY - 350, "tech", null, { dist: 120, speed: 1.8 });
    createJumpPad(60, 0, i6);

    // Island 7 (FINAL): 2700
    const i7 = createIsland(2700, groundY - 250, "earth", null);

    // REMOVE TOP BORDER for i7: Add cover rect
    i7.add([
        rect(152, 6),
        pos(-76, -3),
        color(rgb(176, 113, 29)),
        z(2.1)
    ]);

    // CONTACT GATE - Ported from Intro Level
    // Placed on Platform (2700, groundY - 250) -> Attached to i7
    // UPDATED: Now added as child of i7
    const contactGate = i7.add([
        pos(0, 0), // Relative to i7
        area({ shape: new Rect(vec2(0, -40), 60, 80) }),
        anchor("bot"),
        z(5),
        "gate", // Using generic 'gate' tag like intro, or specific if needed
        { gateName: "Contact Me" }
    ]);

    // Gate Label
    contactGate.add([
        text("Contact Me", {
            size: 10,
            font: "'Press Start 2P'",
        }),
        pos(0, -90),
        anchor("bot"),
        color(C_TEXT),
        z(10)
    ]);

    // LOGIC: Check for Player Entry (Exact Intro Code Pattern)
    contactGate.onUpdate(() => {
        if (guy.isColliding(contactGate)) {
            // Intro uses isKeyPressed. 
            if (isKeyPressed("up") || isKeyPressed("enter")) {
                console.log("Attempting enter: " + contactGate.gateName);
                window.enterGate(guy, contactGate, "contact");
            }
        }
    });

    // --- LAYER 1: THE BORDER (C_FLOOR) - PIXELATED ---
    contactGate.add([rect(60, 50), pos(0, 0), anchor("bot"), color(C_FLOOR), z(6)]);
    contactGate.add([rect(60, 10), pos(0, -50), anchor("bot"), color(C_FLOOR), z(6)]);
    contactGate.add([rect(50, 6), pos(0, -60), anchor("bot"), color(C_FLOOR), z(6)]);
    contactGate.add([rect(30, 4), pos(0, -66), anchor("bot"), color(C_FLOOR), z(6)]);

    // --- LAYER 2: THE DOOR (GREY) - PIXELATED ---
    contactGate.add([rect(52, 50), pos(0, 0), anchor("bot"), color(180, 180, 180), z(7)]);
    contactGate.add([rect(52, 10), pos(0, -50), anchor("bot"), color(180, 180, 180), z(7)]);
    contactGate.add([rect(42, 6), pos(0, -60), anchor("bot"), color(180, 180, 180), z(7)]);
    contactGate.add([rect(22, 4), pos(0, -66), anchor("bot"), color(180, 180, 180), z(7)]);


    // --- UI / HUD ---
    add([
        text("PROJECTS", { size: 30, font: "'Press Start 2P'" }),
        pos(width() / 2, 50),
        anchor("center"),
        fixed(),
        color(C_TEXT),
        z(100)
    ]);

    const infoText = add([
        text("", { size: 14, font: "'Press Start 2P'", align: "center", width: 600 }),
        pos(width() / 2, height() - 80),
        anchor("center"),
        fixed(),
        color(0, 0, 0),
        z(100)
    ]);

    // --- CAMERA ---
    onUpdate(() => {
        let camX = guy.pos.x;
        if (camX < 0) camX = 0;
        else if (camX < width() / 2) camX = width() / 2;

        // Limit camera right:
        if (camX > worldWidth - width() / 2) camX = worldWidth - width() / 2;

        let camY = height() / 2;
        if (guy.pos.y < groundY - 200) {
            camY = guy.pos.y + 100;
        }
        if (camY > height() / 2) camY = height() / 2;

        camPos(lerp(camPos().x, camX, 3 * dt()), lerp(camPos().y, camY, 3 * dt()));
    });


    // --- INTERACTIONS ---
    guy.onCollideUpdate("project_door", (d) => {
        infoText.text = d.projectData.title.toUpperCase() + "\n[ENTER] TO VIEW";
        // Also make doors responsive
        if (isKeyPressed("enter")) {
            // Simple open, no effects
            setTimeout(() => {
                window.open(d.projectData.link, "_blank");
            }, 50);
        }
    });

    guy.onCollideUpdate("contact_gate", () => {
        // Standard collider logic (fallback)
        infoText.text = "CONTACT ME\n[ENTER]";
    });

    guy.onCollideUpdate("back_gate", () => {
        infoText.text = "BACK TO INTRO\n[ENTER]";
        if (isKeyPressed("up") || isKeyPressed("enter")) {
            window.enterGate(guy, backGate, "intro");
        }
    });

    // Lava Collision (Delayed Immunity Check)
    guy.onCollide("lava", (l) => {
        // RECRUITER MODE: Immunity
        if (window.isRecruiterActive()) return;

        // Updated safety check:
        // If we are more than 2px away from target (below it), assume safe
        if (l.pos.y > l.targetY + 2) return;

        shake(10);
        addKaboom(guy.pos); // Explosion
        go("projects"); // Instant restart
    });

    onUpdate(() => {
        if (!guy.isColliding("project_door") && !guy.isColliding("contact_gate") && !guy.isColliding("back_gate")) {
            infoText.text = "";
        }
    });

    // --- TRANSITION ENTRY ---
    const topJaw = window.g_TransitionJaws.top;
    const botJaw = window.g_TransitionJaws.bot;
    const halfH = height() / 2;
    if (topJaw && botJaw) {
        wait(0.2, () => {
            tween(topJaw.pos.y, -halfH - 200, 0.5, (val) => topJaw.pos.y = val, easings.easeInQuad);
            tween(botJaw.pos.y, height() + 300, 0.5, (val) => botJaw.pos.y = val, easings.easeInQuad)
                .onEnd(() => {
                    destroy(topJaw);
                    destroy(botJaw);
                    window.g_TransitionJaws.top = null;
                    window.g_TransitionJaws.bot = null;
                });
        });
    }
});
