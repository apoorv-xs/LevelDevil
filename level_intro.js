scene("intro", () => {
    // Clear any residual fluid dynamics forces
    if (window.clearFluidEmitters) window.clearFluidEmitters();
    if (window.clearFluidVortexes) window.clearFluidVortexes();
    if (window.clearFluidGround) window.clearFluidGround();

    // Let the background WebGL canvas show through by NOT drawing an opaque rectangle!

    // Colors
    const C_TEXT = rgb(240, 240, 240); // Off-white
    const C_FLOOR = rgb(6, 6, 12); // Deep dark vector core color

    const floorHeight = height() * 0.35;
    const groundY = height() - floorHeight;

    // --- VECTOR SILHOUETTE PLATFORMS ---
    // Left Start Zone (0 to 30% of screen)
    const leftW = width() * 0.3;
    window.addVectorPlatform(0, groundY, leftW, floorHeight, rgb(0, 240, 255), ["floor"]);

    // Right Gate Zone (42% to 150% of screen)
    const rightX = width() * 0.42;
    const rightW = width() * 1.5;
    window.addVectorPlatform(rightX, groundY, rightW, floorHeight, rgb(0, 240, 255), ["floor"]);

    // --- PERSPECTIVE GRID FLOOR ---
    if (window.addPerspectiveGrid) {
        window.addPerspectiveGrid();
    }

    // --- FLUID PHYSICS TUNNEL (UP-DRAFT ENGINE) ---
    if (window.addFluidEmitter) {
        // Upward current in the middle of the gap
        window.addFluidEmitter("intro_updraft", width() * 0.36, groundY + 50, 0, -1, [0.0, 0.9, 1.0], 520, 75);
        const em = window.fluidEmitters.find(e => e.id === "intro_updraft");
        if (em) em.type = "column";
    }

    // --- ANIMATED CLOUDS ---
    window.addGlobalClouds();

    // --- RECRUITER MODE UI ---
    if (window.addRecruiterUI) window.addRecruiterUI();

    // PLAYER CHARACTER
    setGravity(1600);
    // Spawn safely on the left platform
    const guy = createPlayer(width() * 0.1, groundY - 100);

    // --- RECRUITER VISUALS ---
    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    // TEXT: "Hey I'm Apoorv"
    add([
        text("Hey I'm Apoorv", { size: 26, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.18),
        color(C_TEXT),
        z(10)
    ]);

    // TEXT: "A visual designer & a creative tinkerer"
    add([
        text("A visual designer & a creative tinkerer", { size: 14, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.18 + 50),
        color(C_TEXT),
        z(10)
    ]);

    // TEXT: Instruction
    add([
        text("[ Use ARROWS to Move. Trust nothing. ]", { size: 10, font: "'Press Start 2P'" }),
        pos(width() * 0.1, height() * 0.18 + 80),
        color(C_TEXT),
        opacity(0.7),
        z(10)
    ]);

    // --- GATE CONSTANTS ---
    const gateY = groundY - 60;
    const startX = width() * 0.55;
    const gap = 220;
    const gNames = ["About Me", "Projects", "Contact Me"];

    // --- LIGHTNING TRAP ---
    if (window.createLightningCloud) {
        createLightningCloud(width() * 0.5, height() * 0.12, guy, groundY, () => {
            if (window.RECRUITER_MODE) return;
            go("intro");
        });
    }

    // --- NPC (Helper for Intro) ---
    function createProfessor(x, y, defaultMsg) {
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

        prof.add([rect(20, 20), pos(0, -50), anchor("bot"), color(255, 200, 150)]);
        prof.add([rect(24, 8), pos(0, -66), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(20, 10), pos(0, -35), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(6, 4), pos(-5, -55), anchor("center"), color(0, 0, 0)]);
        prof.add([rect(6, 4), pos(5, -55), anchor("center"), color(0, 0, 0)]);

        const bubble = add([
            rect(250, 60),
            pos(x, y - 90),
            anchor("bot"),
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(20),
            opacity(0)
        ]);

        bubble.add([
            rect(20, 20),
            pos(0, 10),
            anchor("center"),
            rotate(45),
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(20)
        ]);

        const label = bubble.add([
            text(defaultMsg, { size: 9, font: "'Press Start 2P'", align: "center", width: 230 }),
            pos(0, -30),
            anchor("center"),
            color(0, 0, 0),
            opacity(0),
            z(21)
        ]);

        prof.onUpdate(() => {
            if (!guy.exists()) return;
            const dist = guy.pos.dist(prof.pos);
            if (dist < 180) {
                bubble.opacity = lerp(bubble.opacity ?? 0, 1, dt() * 10);
                label.opacity = lerp(label.opacity ?? 0, 1, dt() * 10);
            } else {
                bubble.opacity = lerp(bubble.opacity ?? 0, 0, dt() * 10);
                label.opacity = lerp(label.opacity ?? 0, 0, dt() * 10);
            }
        });
    }

    // Spawn tutorial NPC on the left platform
    createProfessor(width() * 0.22, groundY, "Jump into the neon fluid draft to float across!");

    // Spawn gate guide NPC on the right platform
    createProfessor(startX - 180, groundY, "Press UP to enter gates! Watch the storm above.");

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
            { gateName: gNames[i], trollTriggered: false }
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

            // Troll Logic: Runaway gate when player gets close (< 180px)
            if (g.gateName === "About Me" && !g.trollTriggered) {
                const dist = guy.pos.dist(g.pos);
                if (dist < 180) {
                    g.trollTriggered = true;
                    // Play Troll SFX
                    if (window.SFX) window.SFX.playTroll();

                    // Slide the gate 120px to the right
                    tween(g.pos.x, g.pos.x + 120, 0.4, (val) => g.pos.x = val, easings.easeOutElastic);

                    // Show Floating Text "NOPE!"
                    const nopeText = add([
                        text("NOPE!", { size: 14, font: "'Press Start 2P'" }),
                        pos(g.pos.x, g.pos.y - 120),
                        anchor("center"),
                        color(255, 0, 0),
                        opacity(1),
                        z(30)
                    ]);

                    // Make the text float up and fade
                    tween(nopeText.pos.y, nopeText.pos.y - 40, 0.8, (val) => nopeText.pos.y = val, easings.easeOutQuad);
                    tween(1, 0, 0.8, (val) => nopeText.opacity = val, easings.easeInQuad)
                        .onEnd(() => destroy(nopeText));
                }
            }

            // Manage Hint Visibility
            const hint = g.children.find(c => c.isHint);
            if (hint) {
                if (guy.isColliding(g)) {
                    hint.opacity = lerp(hint.opacity ?? 0, 1, dt() * 10);
                } else {
                    hint.opacity = lerp(hint.opacity ?? 0, 0, dt() * 10);
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
