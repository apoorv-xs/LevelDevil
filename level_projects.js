scene("projects", () => {
    // --- SETUP ---
    window.SCENE_START_TIME = time(); // Reset Timer for Delay

    // Global state for this scene
    let islandsMoving = false;
    let spikesTriggered = false;

    // Let the background WebGL fluid canvas show through — NO opaque background rect!

    // Palette
    const C_FLOOR = rgb(24, 24, 38); // Dark indigo-slate
    const C_TEXT = rgb(240, 240, 240); // Off-white
    const C_OUTLINE = color(0, 0, 0); // Thick Black
    const C_TECH_BASE = rgb(40, 40, 55); // Dark Grey with blue-navy tint for tech base

    // Using Global Recruiter UI
    if (window.addRecruiterUI) window.addRecruiterUI();

    // Clear fluid forces
    if (window.clearFluidEmitters) window.clearFluidEmitters();
    if (window.clearFluidVortexes) window.clearFluidVortexes();
    if (window.clearFluidGround) window.clearFluidGround();

    // Floor Base Coordinates
    const floorHeight = height() * 0.2;
    const groundY = height() - floorHeight;
    const worldWidth = 10000;

    // --- VECTOR SILHOUETTE SPLIT PLATFORMS ---
    // 1. Start Platform (0 to 350)
    window.addVectorPlatform(0, groundY, 350, floorHeight, rgb(0, 240, 255), ["floor"]);

    // 2. Middle Platform (1200 to 1480)
    window.addVectorPlatform(1200, groundY, 280, floorHeight, rgb(0, 240, 255), ["floor"]);

    // 3. End Platform (2550 to 10000)
    window.addVectorPlatform(2550, groundY, 7450, floorHeight, rgb(0, 240, 255), ["floor"]);

    // --- PERSPECTIVE GRID FLOOR ---
    if (window.addPerspectiveGrid) {
        window.addPerspectiveGrid();
    }

    // --- INITIAL FLUID EMITTER (WEST DRAFT WIND CURRENT) ---
    if (window.addFluidEmitter) {
        // Horizontal draft pushing right to assist jumping across Gap 1
        window.addFluidEmitter("projects_flow", 150, groundY - 140, 1, 0, [0.0, 0.9, 1.0], 230, 150);
        const em = window.fluidEmitters.find(e => e.id === "projects_flow");
        if (em) em.type = "circle";
    }

    // --- CLOUDS ---
    function addWideClouds() {
        const cloudCount = 24;
        const cloudLimit = 3500;
        for (let i = 0; i < cloudCount; i++) {
            const x = rand(0, cloudLimit);
            const y = rand(groundY - 1200, groundY - 300);
            const speed = rand(8, 25);
            const scaleFactor = rand(0.6, 1.2);

            const cloud = add([
                pos(x, y),
                rect(60 * scaleFactor, 20 * scaleFactor),
                color(255, 255, 255),
                opacity(rand(0.2, 0.5)),
                z(0.5),
                "cloud"
            ]);
            cloud.add([rect(30 * scaleFactor, 20 * scaleFactor), pos(15 * scaleFactor, -15 * scaleFactor), color(255, 255, 255)]);
            cloud.add([rect(20 * scaleFactor, 10 * scaleFactor), pos(40 * scaleFactor, 5 * scaleFactor), color(255, 255, 255)]);

            cloud.onUpdate(() => {
                cloud.move(-speed, 0);
                if (cloud.pos.x < -200) {
                    cloud.pos.x = cloudLimit;
                    cloud.pos.y = rand(groundY - 1200, groundY - 300);
                }
            });
        }
    }
    addWideClouds();

    // --- PLAYER ---
    const guy = createPlayer(150, groundY - 100);
    guy.levelWidth = worldWidth;

    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    // --- LIGHTNING TRAP ---
    if (window.createLightningCloud) {
        createLightningCloud(1350, height() * 0.12, guy, groundY, () => {
            if (window.isRecruiterActive()) return;
            go("projects");
        });
    }

    // --- VOID DEATH CHECK ---
    guy.onUpdate(() => {
        if (guy.pos.y > groundY + 180) {
            if (window.isRecruiterActive()) {
                guy.pos.y = groundY - 200;
                guy.vel.y = 0;
                return;
            }
            if (window.SFX && window.SFX.playDeath) window.SFX.playDeath();
            go("projects");
        }
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
    function drawEye(obj) {
        const white = rgb(255, 255, 255);
        const iris = rgb(220, 20, 60);
        const pupil = rgb(0, 0, 0);
        obj.add([rect(24, 16), pos(0, 0), anchor("center"), color(white), outline(2, C_OUTLINE)]);
        obj.add([rect(4, 8), pos(-12, 0), anchor("center"), color(white), outline(2, C_OUTLINE)]);
        obj.add([rect(4, 8), pos(12, 0), anchor("center"), color(white), outline(2, C_OUTLINE)]);
        obj.add([rect(10, 10), pos(0, 0), anchor("center"), color(iris)]);
        obj.add([rect(4, 4), pos(0, 0), anchor("center"), color(pupil)]);
        obj.add([rect(2, 2), pos(-2, -2), anchor("center"), color(white)]);
    }
    function drawRadar(obj) {
        const green = rgb(0, 210, 0);
        const darkGreen = rgb(10, 60, 10);
        const line = rgb(0, 150, 0);
        const blipColor = rgb(255, 255, 0);
        obj.add([rect(28, 28), pos(0, 0), anchor("center"), color(darkGreen), outline(2, C_OUTLINE)]);
        obj.add([rect(20, 20), pos(0, 0), anchor("center"), color(0, 0, 0, 0), outline(1, line)]);
        obj.add([rect(10, 10), pos(0, 0), anchor("center"), color(0, 0, 0, 0), outline(1, line)]);
        obj.add([rect(28, 1), pos(0, 0), anchor("center"), color(line)]);
        obj.add([rect(1, 28), pos(0, 0), anchor("center"), color(line)]);
        obj.add([rect(12, 2), pos(0, 0), anchor("left"), color(green), rotate(-30)]);
        obj.add([rect(4, 4), pos(6, -6), anchor("center"), color(blipColor)]);
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

        // Neon platform line strip (top edge)
        island.add([
            rect(islandW, 3),
            pos(-islandW / 2, 0),
            color(255, 0, 127), // Neon magenta line strip
            z(2.1)
        ]);

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
        else if (project.icon === "eye") drawEye(icon);
        else if (project.icon === "radar") drawRadar(icon);

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
            id: "oversight",
            title: "Oversight",
            type: "tech",
            doorColor: rgb(220, 20, 60),
            icon: "eye",
            desc: "Adaptive Network Threat Detection Engine",
            link: "https://github.com/apoorv-xs/Oversight"
        },
        {
            id: "radar",
            title: "Radarhire",
            type: "tech",
            doorColor: rgb(0, 191, 255),
            icon: "radar",
            desc: "GitHub Project",
            link: "https://github.com/apoorv-xs/Radarhire"
        },
        {
            id: "ecom",
            title: "The Find",
            type: "earth",
            doorColor: rgb(102, 51, 153),
            icon: "cart",
            desc: "Ecommerce Project",
            links: [
                { name: "Figma Prototype", url: "https://www.figma.com/proto/o0Wrqa5hwpm1owt6Bdi03b/The-FIND?node-id=0-1&t=1SWjUK1wz2e0ZZlc-1" },
                { name: "GitHub Repository", url: "https://github.com/apoorv-xs/TheFind-ecommerce" }
            ]
        },
        // NEW PROJECT
        {
            id: "portfolio",
            title: "Live Portfolio",
            type: "tech",
            doorColor: rgb(50, 205, 50), // Lime Green
            icon: "globe",
            desc: "Personal Website",
            links: [
                { name: "Live Website", url: "https://red-meadow-01ad20b00.2.azurestaticapps.net/" },
                { name: "GitHub Repository", url: "https://github.com/apoorv-xs/Portfolio" }
            ]
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

    // Fluid Portal Style (dark core + cyan glow)
    backGate.add([rect(60, 70), pos(0, 0), anchor("bot"), color(6, 6, 12), z(0)]);
    backGate.add([rect(52, 62), pos(0, -4), anchor("bot"), color(0, 240, 255), opacity(0.12), z(0.5)]);
    backGate.add([rect(64, 5), pos(0, -70), anchor("bot"), color(0, 240, 255), z(1)]);
    backGate.add([rect(4, 70), pos(-30, 0), anchor("bot"), color(0, 240, 255), z(1)]);
    backGate.add([rect(4, 70), pos(26, 0), anchor("bot"), color(0, 240, 255), z(1)]);


    // --- JUMP PAD BUILDER ---
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
        plate.basePad = pad;

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

    // 1. Ground Pads
    createJumpPad(400, groundY);
    const trollPad = createJumpPad(800, groundY);
    createJumpPad(1200, groundY);
    createJumpPad(1600, groundY);

    let padTrollTriggered = false;
    onUpdate(() => {
        if (window.isRecruiterActive()) return; // Disable in recruiter mode

        if (!padTrollTriggered && guy.exists() && !guy.isGrounded() && guy.pos.x > 680 && guy.pos.x < 780 && guy.pos.y < groundY - 50) {
            padTrollTriggered = true;
            if (window.SFX) window.SFX.playTroll();

            // Show "WHOOPS!" text
            const textWhoops = add([
                text("WHOOPS!", { size: 12, font: "'Press Start 2P'" }),
                pos(trollPad.basePad.pos.x, trollPad.basePad.pos.y - 60),
                anchor("center"),
                color(255, 0, 0),
                opacity(1),
                z(30)
            ]);
            tween(textWhoops.pos.y, textWhoops.pos.y - 45, 0.8, (v) => textWhoops.pos.y = v, easings.easeOutQuad);
            tween(1, 0, 0.8, (v) => textWhoops.opacity = v, easings.easeInQuad)
                .onEnd(() => destroy(textWhoops));

            // Slide pad to the right by 60px
            tween(trollPad.basePad.pos.x, trollPad.basePad.pos.x + 60, 0.25, (val) => trollPad.basePad.pos.x = val, easings.easeOutQuad);
        }
    });

    // 2. Islands Sequence

    // Island 1 (Pet): 600
    const i1 = createIsland(600, groundY - 200, projects[0].type, projects[0]);
    createJumpPad(60, 0, i1);

    // Island 2 (NEW PORTFOLIO): 950
    const i2 = createIsland(950, groundY - 340, "tech", projects[3], { dist: 140, speed: 1.5 });
    createJumpPad(60, 0, i2);

    // Island 3 (Radar): 1300
    const i3 = createIsland(1300, groundY - 480, projects[1].type, projects[1], { dist: 180, speed: 1.2 });

    // Island 4 (EMPTY): 1650
    const i4 = createIsland(1650, groundY - 300, "earth", null, { dist: 90, speed: 2 });
    createJumpPad(60, 0, i4);

    // Island 5 (Ecom): 2000
    const i5 = createIsland(2000, groundY - 440, projects[2].type, projects[2]);
    createJumpPad(-60, 0, i5);

    // Island 6 (EMPTY): 2350
    const i6 = createIsland(2350, groundY - 320, "tech", null, { dist: 110, speed: 1.8 });
    createJumpPad(60, 0, i6);

    // Island 7 (FINAL): 2700
    const i7 = createIsland(2700, groundY - 250, "earth", null);

    // BORDER cover rect (Vector Silhouette style)
    i7.add([
        rect(152, 6),
        pos(-76, -3),
        color(6, 6, 12),
        z(2.1)
    ]);

    // --- ATMOSPHERIC FLOW REVERSAL TRAP LOGIC ---
    let projectsFlowShifted = false;
    guy.onUpdate(() => {
        if (!projectsFlowShifted && guy.pos.x > 900) {
            projectsFlowShifted = true;
            window.showFluidWarning("WARNING: WIND TUNNEL FLOW REVERSAL!");
            wait(0.75, () => {
                if (window.updateFluidEmitter) {
                    // Emitter shifts to blow backwards (westward) and downwards
                    window.updateFluidEmitter("projects_flow", 2600, groundY - 180, -1, 0.25);
                    const em = window.fluidEmitters.find(e => e.id === "projects_flow");
                    if (em) {
                        em.force = 320;
                        em.color = [1.0, 0.0, 0.5]; // Red/Pink
                    }
                    if (window.SFX && window.SFX.playTroll) window.SFX.playTroll();

                    // Adjust platform target coordinates to change the path layout
                    i2.initialX = 950 - 150;
                    i3.initialX = 1300 + 140;
                    i4.initialX = 1650 - 160;
                    i5.initialX = 2000 + 120;
                    i6.initialX = 2350 - 140;
                }
            });
        }
    });

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

    // Fluid Portal Style (dark core + pink glow)
    contactGate.add([rect(60, 70), pos(0, 0), anchor("bot"), color(6, 6, 12), z(6)]);
    contactGate.add([rect(52, 62), pos(0, -4), anchor("bot"), color(255, 0, 127), opacity(0.12), z(6.5)]);
    contactGate.add([rect(64, 5), pos(0, -70), anchor("bot"), color(255, 0, 127), z(7)]);
    contactGate.add([rect(4, 70), pos(-30, 0), anchor("bot"), color(255, 0, 127), z(7)]);
    contactGate.add([rect(4, 70), pos(26, 0), anchor("bot"), color(255, 0, 127), z(7)]);


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
        if (!guy.exists()) return;
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
        const hasMultiple = d.projectData.links && d.projectData.links.length > 0;
        infoText.text = d.projectData.title.toUpperCase() + "\n[ENTER] TO VIEW";

        if (isKeyPressed("enter")) {
            if (hasMultiple) {
                // Freeze player and show overlay
                guy.paused = true;
                if (guy.body) guy.body.isStatic = true;

                window.showProjectLinksOverlay(d.projectData, () => {
                    guy.paused = false;
                    if (guy.body) guy.body.isStatic = false;
                });
            } else {
                // Simple open, no effects
                setTimeout(() => {
                    window.open(d.projectData.link, "_blank");
                }, 50);
            }
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
