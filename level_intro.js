scene("intro", () => {
    // OPAQUE BACKGROUND (#E9B45A)
    add([
        rect(width(), height()),
        color(233, 180, 90), // #E9B45A
        pos(0, 0),
        z(0)
    ]);

    // Colors
    const C_FLOOR = rgb(176, 113, 29); // #B0711D
    const C_TEXT = rgb(44, 44, 44); // #2C2C2C

    // BLUE FLOOR (Bottom ~35% of screen) - NOW DARKER ORANGE/BROWN
    // NOTE: height() varies on resize, but fine for static scene
    const floorHeight = height() * 0.35;
    add([
        rect(width(), floorHeight),
        pos(0, height() - floorHeight),
        color(C_FLOOR),
        z(1),
        area(),
        body({ isStatic: true }),
        "floor"
    ]);




    // --- ANIMATED CLOUDS ---
    window.addGlobalClouds();

    // --- RECRUITER MODE UI ---
    if (window.addRecruiterUI) window.addRecruiterUI();

    // PLAYER CHARACTER
    setGravity(1600);
    const guy = createPlayer(width() * 0.1, height() - floorHeight - 100);

    // --- RECRUITER VISUALS ---
    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    // TEXT: "Hey I'm Apoorv"
    add([
        text("Hey I'm Apoorv", { size: 26, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.2),
        color(C_TEXT),
        z(10)
    ]);

    // TEXT: "A visual designer & a creative tinkerer"
    add([
        text("A visual designer & a creative tinkerer", { size: 14, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.2 + 50),
        color(C_TEXT),
        z(10)
    ]);

    // TEXT: Instruction
    add([
        text("[ Use ARROWS to Move. Trust nothing. ]", { size: 10, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.2 + 80),
        color(C_TEXT),
        opacity(0.7), // Slightly dimmer
        z(10)
    ]);

    // --- GATE CONSTANTS ---
    const gateY = height() - floorHeight - 60;
    const startX = width() * 0.55;
    const gap = 220;
    const gNames = ["About Me", "Projects", "Contact Me"];

    // --- LIGHTNING TRAP (HARD MODE) ---
    if (window.createLightningCloud) {
        // Start from CENTER (width() * 0.5)
        // Patrols back and forth
        createLightningCloud(width() * 0.5, height() * 0.15, guy, height() - floorHeight, () => {
            if (window.RECRUITER_MODE) return; // Immune
            go("intro");
        });
    }

    // --- PROFESSOR NPC (Helper for Intro) ---
    function createProfessor(x, y, defaultMsg) {
        // Professor Sprite
        const prof = add([
            rect(30, 50),
            pos(x, y),
            anchor("bot"),
            color(100, 80, 200),
            outline(4, color(0, 0, 0)),
            z(15),
            area(),
            "professor"
        ]);

        // Parts
        prof.add([rect(20, 20), pos(0, -50), anchor("bot"), color(255, 200, 150)]);
        prof.add([rect(24, 8), pos(0, -66), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(20, 10), pos(0, -35), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(6, 4), pos(-5, -55), anchor("center"), color(0, 0, 0)]);
        prof.add([rect(6, 4), pos(5, -55), anchor("center"), color(0, 0, 0)]);

        // Bubble
        const bubble = add([
            rect(250, 60),
            pos(x, y - 90),
            anchor("bot"),
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(20),
            opacity(0) // Start hidden
        ]);

        // Tail
        bubble.add([
            rect(20, 20),
            pos(0, 10),
            anchor("center"),
            rotate(45),
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(20)
        ]);

        // Text
        const label = bubble.add([
            text(defaultMsg, { size: 9, font: "'Press Start 2P'", align: "center", width: 230 }),
            pos(0, -30),
            anchor("center"),
            color(0, 0, 0),
            opacity(0), // Start hidden
            z(21)
        ]);

        // Logic: Fade bubble
        prof.onUpdate(() => {
            if (!guy.exists()) return;
            const dist = guy.pos.dist(prof.pos);
            if (dist < 200) {
                bubble.opacity = lerp(bubble.opacity, 1, dt() * 10);
                label.opacity = lerp(label.opacity, 1, dt() * 10);
            } else {
                bubble.opacity = lerp(bubble.opacity, 0, dt() * 10);
                label.opacity = lerp(label.opacity, 0, dt() * 10);
            }
        });
    }

    // Spawn Professor a bit before the dates
    // startX is where "About Me" gate is. 
    createProfessor(startX - 180, height() - floorHeight, "Try jumping into the gates( Press UP)");

    // GATES (Standardized Retro Style - Silver)
    for (let i = 0; i < 3; i++) {
        const gx = startX + (i * gap);
        const gy = height() - floorHeight;

        const gate = add([
            pos(gx, gy),
            area({ shape: new Rect(vec2(0, -40), 60, 80) }),
            body({ isStatic: true }),
            anchor("bot"),
            z(5),
            "gate",
            { gateName: gNames[i] }
        ]);

        // Gate Label
        gate.add([
            text(gNames[i], {
                size: 10,
                font: "'Press Start 2P'",
                width: 100,
                align: "center"
            }),
            pos(0, -90),
            anchor("bot"),
            color(C_TEXT),
            z(10)
        ]);

        // VISUALS: Matches About/Projects Level (Silver + Floor Outline)
        // 1. Base/Outline (Floor Color)
        gate.add([rect(60, 50), pos(0, 0), anchor("bot"), color(C_FLOOR), z(6)]);
        gate.add([rect(60, 10), pos(0, -50), anchor("bot"), color(C_FLOOR), z(6)]);
        gate.add([rect(50, 6), pos(0, -60), anchor("bot"), color(C_FLOOR), z(6)]);
        gate.add([rect(30, 4), pos(0, -66), anchor("bot"), color(C_FLOOR), z(6)]);

        // 2. Inner/Front (Silver)
        gate.add([rect(52, 50), pos(0, 0), anchor("bot"), color(180, 180, 180), z(7)]);
        gate.add([rect(52, 10), pos(0, -50), anchor("bot"), color(180, 180, 180), z(7)]);
        gate.add([rect(42, 6), pos(0, -60), anchor("bot"), color(180, 180, 180), z(7)]);
        gate.add([rect(22, 4), pos(0, -66), anchor("bot"), color(180, 180, 180), z(7)]);

        // Interaction Hint
        gate.add([
            text("PRESS UP", { size: 6, font: "'Press Start 2P'" }),
            pos(0, -60),
            anchor("bot"),
            color(255, 255, 255),
            opacity(0), // Fades in on collision
            "hint",
            { isHint: true }
        ]);

    }

    // GATE INTERACTION LOGIC
    onUpdate(() => {
        const gates = get("gate");
        let activeGate = null;

        for (const g of gates) {
            // Check collision with player
            if (guy.isColliding(g)) {
                activeGate = g;
            }

            // Manage Hint Visibility
            const hint = g.children.find(c => c.isHint);
            if (hint) {
                if (guy.isColliding(g)) {
                    hint.opacity = lerp(hint.opacity, 1, dt() * 10);
                } else {
                    hint.opacity = lerp(hint.opacity, 0, dt() * 10);
                }
            }
        }

        if (activeGate) {
            if (isKeyPressed("up") || isKeyPressed("enter") || isKeyPressed("space")) {
                const name = activeGate.gateName;
                window.enterGate(guy, activeGate, name === "About Me" ? "about" : name === "Projects" ? "projects" : "contact");
            }
        }
    });

    // --- TRANSITION: OPEN JAWS ---
    const topJaw = window.g_TransitionJaws ? window.g_TransitionJaws.top : null;
    const botJaw = window.g_TransitionJaws ? window.g_TransitionJaws.bot : null;
    const halfH = height() / 2;

    if (topJaw && botJaw) {
        wait(0.5, () => {
            tween(topJaw.pos.y, -halfH - 200, 1.0, (val) => topJaw.pos.y = val, easings.easeOutExpo);
            tween(botJaw.pos.y, height() + 200, 1.0, (val) => botJaw.pos.y = val, easings.easeOutExpo)
                .onEnd(() => {
                    destroy(topJaw);
                    destroy(botJaw);
                    // Clear global refs
                    if (window.g_TransitionJaws) {
                        window.g_TransitionJaws.top = null;
                        window.g_TransitionJaws.bot = null;
                    }
                });
        });
    }

});
