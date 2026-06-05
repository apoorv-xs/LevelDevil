scene("contact", () => {
    // --- CLEAR RESIDUAL FLUID FORCES ---
    if (window.clearFluidEmitters) window.clearFluidEmitters();
    if (window.clearFluidVortexes) window.clearFluidVortexes();
    if (window.clearFluidGround) window.clearFluidGround();

    // Let the background WebGL fluid canvas show through — NO opaque background rect!
    window.SCENE_START_TIME = time(); // Reset Timer for Delay

    // --- COLORS ---
    const C_TEXT = rgb(240, 240, 240); // Off-white
    const C_NEON = rgb(0, 240, 255); // Cyan neon

    // --- HEIGHT CONFIG ---
    const floorHeight = height() * 0.2;
    const groundY = height() - floorHeight;

    // Safe zones (60px higher for chasm floating stones)
    const safeFloorHeight = floorHeight + 60;
    const safeGroundY = height() - safeFloorHeight;

    let worldWidth = 3500;

    // --- RECRUITER MODE UI ---
    if (window.addRecruiterUI) window.addRecruiterUI();

    // --- CONTENT TITLE (Fixed UI) ---
    add([
        text("CONTACT ME", { size: 40, font: "'Press Start 2P'" }),
        pos(width() / 2, height() * 0.2),
        anchor("center"),
        color(C_TEXT),
        z(10),
        fixed()
    ]);

    // --- VECTOR SILHOUETTE PLATFORMS ---
    // 1. Safe Zone Start (0 to 400)
    window.addVectorPlatform(0, safeGroundY, 400, safeFloorHeight, C_NEON, ["floor"]);

    // --- BACK GATE (Start) ---
    const backGate = add([
        pos(100, safeGroundY),
        area({ shape: new Rect(vec2(0, -40), 60, 80) }),
        body({ isStatic: true }),
        anchor("bot"),
        z(5),
        "back_gate"
    ]);

    // Fluid Portal Style (dark core + cyan neon glow)
    backGate.add([rect(60, 70), pos(0, 0), anchor("bot"), color(6, 6, 12), z(6)]);
    backGate.add([rect(52, 62), pos(0, -4), anchor("bot"), color(0, 240, 255), opacity(0.12), z(6.5)]);
    backGate.add([rect(64, 5), pos(0, -70), anchor("bot"), color(0, 240, 255), z(7)]);
    backGate.add([rect(4, 70), pos(-30, 0), anchor("bot"), color(0, 240, 255), z(7)]);
    backGate.add([rect(4, 70), pos(26, 0), anchor("bot"), color(0, 240, 255), z(7)]);

    backGate.add([
        text("BACK", { size: 10, font: "'Press Start 2P'", align: "center" }),
        pos(0, -90),
        anchor("bot"),
        color(C_TEXT),
        z(10)
    ]);

    // --- PLAYER (created early so gate/trap hooks can reference it) ---
    setGravity(1600);
    const guy = createPlayer(100, safeGroundY - 100);
    guy.levelWidth = worldWidth;

    // Back gate interaction
    backGate.onUpdate(() => {
        if (!guy.exists()) return;
        if (guy.isColliding(backGate)) {
            if (isKeyPressed("up") || isKeyPressed("enter") || isKeyPressed("w")) {
                window.enterGate(guy, backGate, "intro");
            }
        }
    });

    // --- RECRUITER VISUALS ---
    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    // 2. Chasm Floating Platform Stepping Stones (400 to 2000)
    const plat1 = window.addVectorPlatform(650, safeGroundY - 45, 120, 20, rgb(255, 0, 127), ["floor"]);
    const plat2 = window.addVectorPlatform(1050, safeGroundY - 80, 120, 20, rgb(255, 0, 127), ["floor"]);
    const plat3 = window.addVectorPlatform(1450, safeGroundY - 60, 120, 20, rgb(255, 0, 127), ["floor"]);
    const plat4 = window.addVectorPlatform(1850, safeGroundY - 30, 120, 20, rgb(255, 0, 127), ["floor"]);

    // 3. Ending Safe Zone (2000 onwards)
    const finishX = 2000;
    worldWidth = finishX + 1100;
    guy.levelWidth = worldWidth; // Update after recalc
    window.addVectorPlatform(finishX, safeGroundY, 8000, safeFloorHeight, C_NEON, ["floor"]);

    // --- PERSPECTIVE GRID FLOOR ---
    if (window.addPerspectiveGrid) {
        window.addPerspectiveGrid();
    }

    // --- FLUID ATMOSPHERE EMITTERS ---
    // Ambient side-scroll draft across the chasm (left-to-right current)
    if (window.addFluidEmitter) {
        window.addFluidEmitter("contact_drift", 300, safeGroundY + 80, 1.5, -0.3, [0.0, 0.7, 1.0], 180, 90);
    }

    // Pulsing pink glow near the floating platforms for atmosphere
    if (window.addFluidEmitter) {
        window.addFluidEmitter("contact_pink_glow", 1100, safeGroundY - 120, 0.2, -0.8, [0.8, 0.0, 0.5], 100, 50);
    }

    // --- RECRUITER DIGITAL BRIDGE (Recruiter Mode Shortcut) ---
    const recruiterBridge = add([
        rect(finishX - 400, 20),
        pos(400, safeGroundY),
        color(0, 255, 255),
        area(),
        body({ isStatic: true }),
        z(2),
        opacity(1),
        "floor"
    ]);

    recruiterBridge.onUpdate(() => {
        if (window.isRecruiterActive()) {
            recruiterBridge.opacity = 0.6;
            if (recruiterBridge.pos.y !== safeGroundY) recruiterBridge.pos.y = safeGroundY;
        } else {
            recruiterBridge.opacity = 0;
            recruiterBridge.pos.y = -9999;
        }
    });

    // --- INITIAL GRAVITATIONAL VORTEX PULL ---
    if (window.addFluidVortex) {
        // Active whirlpool below Platform 2
        window.addFluidVortex("contact_vortex", 1110, safeGroundY + 120, 230, 280);
    }

    // --- SHIFTING VORTEX TRAP LOGIC ---
    let vortexShifted = false;
    let vortexCollapsed = false;

    guy.onUpdate(() => {
        // Phase 1: Shift vortex when player reaches Platform 2
        if (!vortexShifted && guy.pos.x > 1000) {
            vortexShifted = true;
            window.showFluidWarning("WARNING: CORE VORTEX COLLAPSE!");
            wait(0.75, () => {
                if (window.addFluidVortex) {
                    // Shift suction center to Platform 3
                    window.clearFluidVortexes();
                    window.addFluidVortex("contact_vortex", 1510, safeGroundY + 120, 260, 320);
                    if (window.SFX && window.SFX.playTroll) window.SFX.playTroll();
                }
            });
        }

        // Phase 2: Second vortex shift when approaching Platform 4
        if (vortexShifted && !vortexCollapsed && guy.pos.x > 1650) {
            vortexCollapsed = true;
            window.showFluidWarning("VORTEX DESTABILIZED — BRACE!");
            wait(0.5, () => {
                if (window.addFluidVortex) {
                    window.clearFluidVortexes();
                    // Double vortex - one pulling down, one pushing sideways
                    window.addFluidVortex("contact_vortex_a", 1750, safeGroundY + 200, 300, 350);
                    window.addFluidVortex("contact_vortex_b", 1900, safeGroundY - 50, 150, 200);
                    if (window.SFX && window.SFX.playTroll) window.SFX.playTroll();
                }
            });
        }
    });

    // --- VOID DEATH LOGIC ---
    guy.onUpdate(() => {
        if (guy.isDead) return;
        if (guy.pos.y > safeGroundY + 180) {
            if (window.isRecruiterActive()) {
                guy.pos.y = safeGroundY - 200;
                guy.vel.y = 0;
                return;
            }
            guy.isDead = true;
            if (window.SFX && window.SFX.playDeath) window.SFX.playDeath();
            window.DEATH_COUNT = (window.DEATH_COUNT || 0) + 1;
            go("contact");
        }
    });

    // --- DANGER COLLISION ---
    let playerFrozen = false;

    guy.onCollide("danger", () => {
        if (window.isRecruiterActive()) return;
        if (guy.isDead) return;
        guy.isDead = true;
        if (typeof window.DEATH_COUNT !== "undefined") {
            window.DEATH_COUNT++;
        }
        if (window.SFX) window.SFX.playDeath();
        addKaboom(guy.pos);
        shake(20);
        destroy(guy);
        wait(1, () => go("contact"));
    });

    // --- MARIO PIPES ENDING (RETRO PIXEL STYLE) ---
    const pipeStartX = finishX + 150;
    const pipeGap = 140;

    // --- PROFESSOR NPC (Helper) ---
    function createProfessor(x, y, defaultMsg) {
        const prof = add([
            rect(30, 50),
            pos(x, y),
            anchor("bot"),
            color(6, 6, 12),
            outline(2, rgb(0, 240, 255)),
            z(15),
            area(),
            "professor"
        ]);

        // Neon-styled NPC parts
        prof.add([rect(20, 20), pos(0, -50), anchor("bot"), color(6, 6, 12), outline(2, rgb(0, 240, 255))]);
        prof.add([rect(24, 8), pos(0, -66), anchor("bot"), color(0, 200, 220)]);
        prof.add([rect(20, 10), pos(0, -35), anchor("bot"), color(6, 6, 12)]);
        // Visor eyes (neon)
        prof.add([rect(16, 3), pos(0, -55), anchor("center"), color(0, 240, 255)]);

        // Speech bubble (dark + neon border)
        const bubble = add([
            rect(250, 50, { radius: 4 }),
            pos(x, y - 85),
            anchor("bot"),
            color(6, 6, 12),
            outline(2, rgb(0, 240, 255)),
            z(20),
            opacity(0)
        ]);

        const label = bubble.add([
            text(defaultMsg, { size: 8, font: "'Press Start 2P'", align: "center", width: 230 }),
            pos(0, -25),
            anchor("center"),
            color(0, 240, 255),
            opacity(0),
            z(21)
        ]);

        prof.onUpdate(() => {
            if (!guy || !guy.exists()) return;
            label.text = defaultMsg;

            const dist = guy.pos.dist(prof.pos);
            if (dist < 150) {
                bubble.opacity = lerp(bubble.opacity ?? 0, 0.9, dt() * 10);
                label.opacity = lerp(label.opacity ?? 0, 1, dt() * 10);
            } else {
                bubble.opacity = lerp(bubble.opacity ?? 0, 0, dt() * 10);
                label.opacity = lerp(label.opacity ?? 0, 0, dt() * 10);
            }
        });
    }

    function createPipe(x, label, url, colorBase, colorHighlight, wBonus = 0, hBonus = 0) {
        const baseW = 50;
        const baseH = 40;
        const pipeW = baseW + wBonus;
        const pipeH = baseH + hBonus;
        const lipH = 20;
        const lipOverhang = 4;

        // Pipe Column (Cyber Pod Body)
        const pipeBody = add([
            rect(pipeW, pipeH),
            pos(x - pipeW / 2, safeGroundY - pipeH),
            color(8, 8, 16), // Dark void core
            outline(2.5, colorHighlight), // Glowing border matching the target link color
            area(),
            body({ isStatic: true }),
            z(2),
            "pipe_body"
        ]);

        // Pipe Lip (Warp Platform)
        const lipW = pipeW + (lipOverhang * 2);
        const lipY = safeGroundY - pipeH - lipH;

        const pipeLip = add([
            rect(lipW, lipH),
            pos(x - lipW / 2, lipY),
            color(8, 8, 16),
            outline(2.5, colorHighlight),
            area(),
            body({ isStatic: true }),
            z(3),
            "pipe_lip",
            { url: url, entered: false, isLip: true, parentX: x, parentY: safeGroundY }
        ]);

        // Glowing neon core panels inside column
        add([
            rect(4, pipeH - 6),
            pos(x - pipeW / 2 + 6, safeGroundY - pipeH + 3),
            color(colorHighlight),
            opacity(0.8),
            z(2.5)
        ]);
        add([
            rect(4, pipeH - 6),
            pos(x + pipeW / 2 - 10, safeGroundY - pipeH + 3),
            color(colorHighlight),
            opacity(0.8),
            z(2.5)
        ]);

        // Lip accent core
        add([
            rect(lipW - 8, lipH - 6),
            pos(x - lipW / 2 + 4, lipY + 3),
            color(colorHighlight),
            opacity(0.12),
            z(3.1)
        ]);

        // Label (Glowing text color)
        add([
            text(label, { size: 9, font: "'Press Start 2P'", width: pipeW + 120, align: "center" }),
            pos(x, lipY - 20),
            anchor("center"),
            color(colorHighlight), // Text glows in the link's signature color
            z(10)
        ]);

        return pipeLip;
    }

    // PIPE COLORS
    const cBlue = rgb(41, 128, 185);
    const cBlueHi = rgb(93, 173, 226);
    const cRed = rgb(192, 57, 43);
    const cRedHi = rgb(231, 76, 60);
    const cPurp = rgb(142, 68, 173);
    const cPurpHi = rgb(175, 122, 197);

    // PROFESSOR HINT
    createProfessor(pipeStartX - 180, safeGroundY, "Try diving into the pipes! (Press DOWN)");

    // 1. LEFT: Blue Pipe (LINKEDIN)
    const p1 = createPipe(pipeStartX, "LINKEDIN", "https://www.linkedin.com/in/apoorv-a-s", cBlue, cBlueHi);
    // 2. CENTER: Red Pipe (MAIL)
    const p2 = createPipe(pipeStartX + pipeGap, "MAIL", "mailto:asapoorv8@gmail.com", cRed, cRedHi, 20, 20);
    // 3. RIGHT: Purple Pipe (INSTAGRAM)
    const p3 = createPipe(pipeStartX + pipeGap * 2, "INSTAGRAM", "https://www.instagram.com/apoorv.x.s?igsh=amxlOWplaHNnZHJ2", cPurp, cPurpHi);

    // --- RESTART SYSTEM BUTTON ---
    const btnX = pipeStartX + pipeGap * 3.5;
    const btnY = safeGroundY;

    // --- EXTRAVAGANT DEATH TOLL (Holographic Cyber Tombstone) ---
    const deathX = btnX;
    const deathY = btnY - 150;
    const boneC = rgb(230, 230, 230);

    // 1. Backing Plate (Cyber Grid style)
    add([
        rect(140, 70),
        pos(deathX, deathY),
        anchor("center"),
        color(8, 8, 16), // Dark void
        outline(2, rgb(255, 0, 127)), // Glowing magenta border
        z(2)
    ]);

    // 2. Skull Icon (Pixel Art)
    const skullX = deathX - 40;
    const skullY = deathY;

    add([rect(24, 20), pos(skullX, skullY - 5), anchor("center"), color(boneC), z(3)]);
    add([rect(16, 10), pos(skullX, skullY + 8), anchor("center"), color(boneC), z(3)]);
    add([rect(6, 6), pos(skullX - 5, skullY - 5), anchor("center"), color(8, 8, 16), z(4)]);
    add([rect(6, 6), pos(skullX + 5, skullY - 5), anchor("center"), color(8, 8, 16), z(4)]);

    // 3. Text Label
    add([
        text("DEATHS", { size: 10, font: "'Press Start 2P'", align: "left" }),
        pos(deathX - 10, deathY - 15),
        anchor("left"),
        color(255, 0, 127), // Neon magenta
        z(3)
    ]);

    // 4. The Count (Big & Red)
    add([
        text((window.DEATH_COUNT || 0).toString(), { size: 28, font: "'Press Start 2P'", align: "left" }),
        pos(deathX - 10, deathY + 10),
        anchor("left"),
        color(255, 50, 50), // Pulsing neon red
        z(3)
    ]);

    // Base System Unit
    const sysBase = add([
        rect(80, 20),
        pos(btnX, btnY),
        anchor("bot"),
        color(8, 8, 16),
        outline(2, rgb(0, 240, 255)), // Cyan neon border
        area(),
        body({ isStatic: true }),
        z(2),
        "floor"
    ]);

    // Red Button Top
    const btnTop = add([
        rect(60, 15),
        pos(btnX, btnY - 20),
        anchor("bot"),
        color(231, 76, 60), // Red button
        outline(2, rgb(255, 255, 255)), // White neon outline
        area(),
        z(1.5),
        "restart_btn"
    ]);

    // Button Shine
    const btnShine = btnTop.add([
        rect(50, 3),
        pos(0, -10),
        anchor("bot"),
        color(255, 120, 100),
        z(1.6)
    ]);

    // Label
    add([
        text("SYSTEM RESTART", { size: 8, font: "'Press Start 2P'", width: 200, align: "center" }),
        pos(btnX, btnY - 45),
        anchor("bot"),
        color(0, 240, 255), // Cyan neon prompt
        z(1)
    ]);

    let isRestarting = false;

    // --- THUNDERBOLT CLOUD ---
    if (window.createLightningCloud) {
        createLightningCloud(width() / 2, 100, guy, safeGroundY, () => {
            go("contact");
        }, 0.7);
    }

    // Interaction Logic (Stomp to Restart)
    guy.onCollide("restart_btn", (btn) => {
        if (isRestarting) return;

        if ((guy.vel && guy.vel.y > 0) || (guy.pos && btn.pos && guy.pos.y < btn.pos.y)) {
            isRestarting = true;
            shake(10);

            tween(btn.pos.y, btnY - 5, 0.1, (val) => btn.pos.y = val, easings.easeOutQuad);

            const txt = add([
                text("REBOOTING...", { size: 20, font: "'Press Start 2P'" }),
                pos(guy.pos.x, guy.pos.y - 100),
                anchor("center"),
                color(255, 0, 0),
                z(100)
            ]);

            wait(0.5, () => {
                window.location.reload();
            });
        }
    });

    // --- PIPE ENTER LOGIC ---
    onUpdate(() => {
        if (!guy.exists() || playerFrozen) return;

        if (guy.isGrounded()) {
            [p1, p2, p3].forEach(pipe => {
                if (pipe.entered) return;
                if (Math.abs(guy.pos.x - pipe.parentX) < 30) {
                    if (isKeyPressed("down") || isKeyPressed("s") || isKeyPressed("enter")) {
                        pipe.entered = true;
                        enterPipe(pipe);
                    }
                }
            });
        }
    });

    function enterPipe(pipe) {
        if (window.SFX) window.SFX.playPort();
        playerFrozen = true;
        guy.use(body({ isStatic: true }));

        const originalZ = guy.z;
        guy.use(z(pipe.z - 2));

        tween(guy.pos.x, pipe.parentX, 0.2, (val) => guy.pos.x = val, easings.easeOutQuad);

        tween(guy.pos.y, pipe.pos.y + 60, 1.0, (val) => guy.pos.y = val, easings.easeInOutCubic)
            .onEnd(() => {
                debug.log("Entered Pipe: " + pipe.url);
                wait(0.5, () => {
                    window.open(pipe.url, '_blank');
                    playerFrozen = false;
                    if (window.SFX) window.SFX.playPort();
                    tween(guy.pos.y, pipe.pos.y - 120, 0.5, (v) => guy.pos.y = v, easings.easeOutBack)
                        .onEnd(() => {
                            guy.use(body({ isStatic: false }));
                            guy.use(z(originalZ));
                            pipe.entered = false;
                        });
                });
            });
    }

    // --- CAMERA TRACKING ---
    const centerY = height() / 2;
    onUpdate(() => {
        if (!guy.exists()) return;
        let camX = guy.pos.x;
        const minCam = width() / 2;
        const maxCam = worldWidth - width() / 2;

        if (camX < minCam) camX = minCam;
        if (camX > maxCam) camX = maxCam;

        const currentCam = camPos();
        const lerpSpeed = 4 * dt();
        camPos(lerp(currentCam.x, camX, lerpSpeed), centerY);
    });

    // --- TRANSITION ENTRY ---
    if (window.g_IsTransitioning) {
        window.g_IsTransitioning = false;
        const topJaw = window.g_TransitionJaws ? window.g_TransitionJaws.top : null;
        const botJaw = window.g_TransitionJaws ? window.g_TransitionJaws.bot : null;
        const halfH = height() / 2;
        if (topJaw && botJaw) {
            wait(0.2, () => {
                tween(topJaw.pos.y, -halfH - 200, 0.5, (val) => topJaw.pos.y = val, easings.easeInQuad);
                tween(botJaw.pos.y, height() + 300, 0.5, (val) => botJaw.pos.y = val, easings.easeInQuad)
                    .onEnd(() => {
                        destroy(topJaw);
                        destroy(botJaw);
                        if (window.g_TransitionJaws) {
                            window.g_TransitionJaws.top = null;
                            window.g_TransitionJaws.bot = null;
                        }
                    });
            });
        }
    } else {
        // Immediate cleanup of jaws on manual restart or death
        if (window.g_TransitionJaws) {
            if (window.g_TransitionJaws.top) destroy(window.g_TransitionJaws.top);
            if (window.g_TransitionJaws.bot) destroy(window.g_TransitionJaws.bot);
            window.g_TransitionJaws.top = null;
            window.g_TransitionJaws.bot = null;
        }
    }

});
