scene("contact", () => {
    // --- SETUP ---
    window.SCENE_START_TIME = time(); // Reset Timer for Delay

    // 1. SKY COLOR (Reverted)
    add([
        rect(width(), height()),
        color(233, 180, 90), // #E9B45A
        pos(0, 0),
        z(0),
        fixed()
    ]);

    // 2. GROUND COLOR (Reverted)
    const C_FLOOR = rgb(176, 113, 29); // #B0711D
    const C_TEXT = rgb(44, 44, 44); // #2C2C2C

    // Lava Palette
    const C_LAVA_BASE = rgb(200, 40, 0);
    const C_LAVA_SURFACE = rgb(255, 100, 0);
    const C_LAVA_BUBBLE = rgb(255, 200, 50);

    // HEIGHT CONFIG
    const floorHeight = height() * 0.2;
    const groundY = height() - floorHeight;

    // SAFE ZONES HIGHER (60px higher than lava)
    const safeFloorHeight = floorHeight + 60;
    const safeGroundY = height() - safeFloorHeight;




    // --- CLOUDS ---
    window.addGlobalClouds();

    // --- RECRUITER MODE UI ---
    if (window.addRecruiterUI) window.addRecruiterUI();

    // --- CONTENT (Fixed UI) ---
    add([
        text("CONTACT ME", { size: 40, font: "'Press Start 2P'" }),
        pos(width() / 2, height() * 0.2),
        anchor("center"),
        color(C_TEXT),
        z(10),
        fixed() // Stay on screen
    ]);

    // --- FLOOR LOGIC ---

    // DOWNSCALED
    const safeStartWidth = 400;
    const gapSize = 60;
    const bridgeWidth = 80;
    const bridgeCount = 4; // User requested +1 platform & wider lava
    const lavaSectionWidth = (gapSize * (bridgeCount + 1)) + (bridgeWidth * bridgeCount);

    // 1. Safe Zone (Start)
    add([
        rect(safeStartWidth, safeFloorHeight),
        pos(0, safeGroundY),
        color(C_FLOOR),
        z(1),
        area(),
        body({ isStatic: true }),
        "floor"
    ]);

    // --- BACK GATE (Start) ---
    const backGateX = 100;
    const backGate = add([
        pos(backGateX, safeGroundY),
        area({ shape: new Rect(vec2(0, -40), 60, 80) }),
        body({ isStatic: true }),
        anchor("bot"),
        z(5),
        "gate"
    ]);

    // Gate Visuals (Silver Retro)
    backGate.add([rect(60, 50), pos(0, 0), anchor("bot"), color(C_FLOOR), z(6)]);
    backGate.add([rect(60, 10), pos(0, -50), anchor("bot"), color(C_FLOOR), z(6)]);
    backGate.add([rect(50, 6), pos(0, -60), anchor("bot"), color(C_FLOOR), z(6)]);
    backGate.add([rect(30, 4), pos(0, -66), anchor("bot"), color(C_FLOOR), z(6)]);

    // Inner Silver
    backGate.add([rect(52, 50), pos(0, 0), anchor("bot"), color(180, 180, 180), z(7)]);
    backGate.add([rect(52, 10), pos(0, -50), anchor("bot"), color(180, 180, 180), z(7)]);
    backGate.add([rect(42, 6), pos(0, -60), anchor("bot"), color(180, 180, 180), z(7)]);
    backGate.add([rect(22, 4), pos(0, -66), anchor("bot"), color(180, 180, 180), z(7)]);

    // Label
    backGate.add([
        text("BACK", { size: 10, font: "'Press Start 2P'", align: "center" }),
        pos(0, -90),
        anchor("bot"),
        color(C_TEXT),
        z(10)
    ]);



    // Gate Interaction
    backGate.onUpdate(() => {
        if (!guy.exists()) return;

        if (guy.isColliding(backGate)) {
            if (isKeyPressed("up") || isKeyPressed("enter") || isKeyPressed("w")) {
                window.enterGate(guy, backGate, "intro");
            }
        }
    });



    // 2. REALISTIC LAVA (The Danger Zone)
    const lavaX = safeStartWidth;
    const lavaY = groundY;
    const lavaW = lavaSectionWidth;
    const lavaH = floorHeight;

    // Base Lava Object
    const lava = add([
        rect(lavaW, lavaH),
        pos(lavaX, lavaY),
        color(C_LAVA_BASE),
        opacity(0),
        z(1),
        area(),
        "danger"
    ]);

    // --- BRIDGE (Recruiter Exclusive) ---
    // A digital bridge that only exists in Recruiter Mode (Delayed)
    const recruiterBridge = add([
        rect(lavaW, 20),
        pos(lavaX, safeGroundY),
        color(0, 255, 255), // Cyan High-Tech Look
        area(),
        body({ isStatic: true }),
        z(2),
        opacity(1),
        "floor"
    ]);

    recruiterBridge.onUpdate(() => {
        // Use Delayed Helper
        if (window.isRecruiterActive()) {
            recruiterBridge.opacity = 0.6; // Holographic look
            if (recruiterBridge.pos.y !== safeGroundY) {
                recruiterBridge.pos.y = safeGroundY;
            }
        } else {
            recruiterBridge.opacity = 0;
            recruiterBridge.pos.y = -9999; // Disable collision
        }
    });

    // VISUALS
    const particles = [];
    lava.onUpdate(() => {
        if (Math.abs(lavaX - camPos().x) < 1000) {
            if (rand(0, 1) < 0.1) {
                particles.push({ x: rand(0, lavaW), y: rand(0, lavaH), vy: rand(20, 50), life: 0, maxLife: rand(1, 2), type: "ember" });
            }
            if (rand(0, 1) < 0.05) {
                particles.push({ x: rand(0, lavaW), y: 0, vy: 0, radius: 0, life: 0, maxLife: rand(1, 2), type: "bubble" });
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.life += dt();
                if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
                if (p.type === "ember") { p.y -= p.vy * dt(); }
                else if (p.type === "bubble") { if (p.life < p.maxLife * 0.8) { p.radius += dt() * 10; } }
            }
        }
    });

    lava.onDraw(() => {
        if (Math.abs(lavaX - camPos().x) > 1500) return;

        drawRect({ width: lavaW, height: lavaH, color: C_LAVA_BASE });
        const t = time() * 4;
        const waveHeight = 10;
        const segments = 20;
        const segmentWidth = lavaW / segments;

        let pts = [vec2(0, lavaH)];
        for (let i = 0; i <= segments; i++) {
            const x = i * segmentWidth;
            const y = Math.sin(t + i * 0.5) * waveHeight * 0.5;
            pts.push(vec2(x, y + 10));
        }
        pts.push(vec2(lavaW, lavaH));
        drawPolygon({ pts: pts, color: C_LAVA_SURFACE });

        // Particles
        particles.forEach(p => {
            if (p.type === "ember") {
                drawRect({ pos: vec2(p.x, p.y), width: 4, height: 4, color: rgb(255, 200, 50), opacity: 1 - (p.life / p.maxLife) });
            } else if (p.type === "bubble") {
                const myY = Math.sin(t + (p.x / segmentWidth) * 0.5) * waveHeight * 0.5 + 10;
                drawCircle({ pos: vec2(p.x, myY), radius: p.radius, color: C_LAVA_BUBBLE, opacity: 0.8 });
            }
        });
    });

    // --- FLOATING PLATFORMS (Normal Path) ---
    // These are always visible (or maybe visible for everyone?)
    // Yes, users said "normal people have to jump and go", so these must exist.
    const platY = groundY - 40;
    const gapCenters = [];

    for (let i = 0; i < bridgeCount; i++) {
        const px = safeStartWidth + gapSize + (i * (bridgeWidth + gapSize));
        add([
            rect(bridgeWidth, 20),
            pos(px, platY),
            color(C_FLOOR),
            area(),
            body({ isStatic: true }),
            z(2),
            "floor"
        ]);
        gapCenters.push(px - gapSize / 2);
    }
    const endSafeX = lavaX + lavaW;
    gapCenters.push(endSafeX - gapSize / 2);

    // --- FIREBALLS ---
    function spawnFireball(x, y) {
        const speed = rand(550, 700);
        const fb = add([
            circle(12),
            pos(x, y + 20),
            anchor("center"),
            color(255, 220, 50),
            area({ scale: 0.7 }),
            z(3),
            "danger",
            "fireball",
            { vy: -speed }
        ]);
        fb.add([circle(16), color(255, 80, 0), opacity(0.5), z(-1), anchor("center")]);

        fb.onUpdate(() => {
            fb.vy += 1200 * dt();
            fb.pos.y += fb.vy * dt();
            if (rand() < 0.3) {
                add([
                    rect(4, 4), pos(fb.pos), color(255, 100, 0), anchor("center"),
                    opacity(1), lifespan(0.3, { fade: 0.3 }),
                    move(rand(0, 360), 20), z(2)
                ]);
            }
            if (fb.vy > 0 && fb.pos.y > y + 50) destroy(fb);
        });
    }

    loop(1.5, () => {
        gapCenters.forEach((cx) => {
            wait(rand(0, 0.8), () => {
                if (Math.abs(cx - camPos().x) < 800) {
                    spawnFireball(cx, lavaY);
                }
            });
        });
    });


    // --- 3. THE MOUNTAIN ---

    // A. "Flat surface bfr the volcano starts"
    // DOWNSCALED from 400
    const flatBaseWidth = 150;
    add([
        rect(flatBaseWidth, safeFloorHeight),
        pos(endSafeX, safeGroundY),
        color(C_FLOOR),
        area(),
        body({ isStatic: true }),
        z(1),
        "floor"
    ]);



    // B. The Volcano Geometry
    // FIX 1: OVERLAP
    const overlap = 20; // pull it back slightly to cover gap
    const mountainStartX = endSafeX + flatBaseWidth - overlap;

    // DOWNSCALED & FLATTENED
    const mHeight = 220; // Lower
    const mSlopeW = 300; // Wider slope = Less steep
    const mTopW = 150;
    const pitMargin = 30;
    const pitDepth = 40;
    const pitWidth = mTopW - (pitMargin * 2);

    const polyPts = [
        vec2(0, 0),
        vec2(mSlopeW, -mHeight),
        vec2(mSlopeW + pitMargin, -mHeight),
        vec2(mSlopeW + pitMargin, -mHeight + pitDepth),
        vec2(mSlopeW + pitMargin + pitWidth, -mHeight + pitDepth),
        vec2(mSlopeW + pitMargin + pitWidth, -mHeight),
        vec2(mSlopeW + mTopW, -mHeight),
        vec2(mSlopeW + mTopW + mSlopeW, 0),

        vec2(mSlopeW + mTopW + mSlopeW, 350), // Ensure bottom covers
        vec2(0, 350)
    ];

    const mountain = add([
        pos(mountainStartX, safeGroundY),
        area({ shape: new Polygon(polyPts) }),
        body({ isStatic: true }),
        color(C_FLOOR),
        z(1),
        "floor"
    ]);

    // C. Visuals - Gradient Corrected
    mountain.onDraw(() => {
        // Base
        drawPolygon({ pts: polyPts, color: C_FLOOR });

        // "Top Cap"
        const halfSlope = mSlopeW * 0.5;
        const halfH = mHeight * 0.5;

        const capPts = [
            vec2(halfSlope, -halfH),
            vec2(mSlopeW, -mHeight),
            vec2(mSlopeW + mTopW, -mHeight),
            vec2(mSlopeW + mTopW + (mSlopeW * 0.5), -halfH)
        ];

        drawPolygon({
            pts: capPts,
            color: rgb(255, 255, 255), // Snow? No, just lighter brown
            opacity: 0.2
        });

        // "Tip Cap"
        const tipSlope = mSlopeW * 0.8;
        const tipH = mHeight * 0.8;
        const tipPts = [
            vec2(tipSlope, -tipH),
            vec2(mSlopeW, -mHeight),
            vec2(mSlopeW + mTopW, -mHeight),
            vec2(mSlopeW + mTopW + (mSlopeW * 0.2), -tipH)
        ];
        drawPolygon({
            pts: tipPts,
            color: rgb(0, 0, 0),
            opacity: 0.3
        });
    });

    // D. "Lava Pit at Structure"
    const pitX = mountainStartX + mSlopeW + pitMargin;
    const pitY = safeGroundY - mHeight - 10; // Raised ABOVE rim to ensure contact

    add([
        rect(pitWidth, pitDepth),
        pos(pitX, pitY),
        color(C_LAVA_BASE),
        opacity(0.8),
        area(),
        z(2),
        "danger"
    ]);

    loop(0.5, () => {
        const px = pitX + rand(0, pitWidth);
        add([
            circle(rand(2, 5)),
            pos(px, pitY + rand(0, 10)),
            color(C_LAVA_BUBBLE),
            move(270, 20),
            lifespan(0.5, { fade: 0.5 }),
            z(2)
        ]);
    });


    // Final Flat Area after mountain
    const backSlopeEnd = mountainStartX + mSlopeW + mTopW + mSlopeW;

    // --- CUTTERS (Moving Chainsaws) ---
    function createCutter(x, y, range = 100, speed = 2) {
        // Center pivot for movement
        const pivot = add([
            pos(x, y),
            z(2)
        ]);

        // The actual spinning blade
        const cutter = pivot.add([
            circle(25), // Smaller (was 35)
            anchor("center"),
            color(C_FLOOR), // Camouflage
            area({ scale: 0.9 }),
            rotate(0),
            "danger",
            "cutter"
        ]);

        // Visual Teeth (Chainsaw style - dense)
        const teethCount = 16;
        for (let i = 0; i < teethCount; i++) {
            cutter.add([
                rect(12, 12),
                pos(0, -25), // Adjusted for smaller circle
                anchor("center"),
                color(140, 90, 20), // Slightly darker for contrast
                rotate(i * (360 / teethCount))
            ]);
        }

        // Center Bolt
        cutter.add([circle(12), color(80, 50, 10), anchor("center")]);

        // 1. PIN to PIVOT (Already done by hierarchy)

        // 2. SPIN
        cutter.onUpdate(() => {
            cutter.angle += dt() * 800;
        });

        // 3. PATROL (Move Pivot)
        let t = 0;
        pivot.onUpdate(() => {
            t += dt() * speed;
            pivot.pos.x = x + Math.sin(t) * range;
        });
    }

    // Place Cutters: Half-buried (Lower Y)
    // safeGroundY is the surface. We want circle center below it.
    const cutterY = safeGroundY;
    const backEnd = mountainStartX + mSlopeW + mTopW + mSlopeW;

    // Moves closer to the slope (Leftward shift)
    createCutter(backEnd + 150, cutterY, 80, 2);
    createCutter(backEnd + 450, cutterY, 100, 3);

    // Final Flat Area & Buffer
    const finishX = backEnd + 700;
    const worldWidth = finishX + 900;

    add([
        rect(5000, safeFloorHeight + 800),
        pos(backSlopeEnd - 20, safeGroundY),
        color(C_FLOOR),
        area(),
        body({ isStatic: true }),
        z(1),
        "floor"
    ]);



    // --- MARIO PIPES ENDING (RETRO PIXEL STYLE) ---
    const pipeStartX = finishX + 150;
    const pipeGap = 140;

    // --- PROFESSOR NPC (Helper) ---
    function createProfessor(x, y, defaultMsg) {
        // Professor Sprite (Start Invisible)
        const prof = add([
            rect(30, 50),
            pos(x, y),
            anchor("bot"),
            color(100, 80, 200),
            outline(4, color(0, 0, 0)),
            outline(4, color(0, 0, 0)),
            z(15), // High Z
            area(),
            // opacity(0), // REVERTED: Always visible
            "professor"
        ]);

        // Parts
        prof.add([rect(20, 20), pos(0, -50), anchor("bot"), color(255, 200, 150)]);
        prof.add([rect(24, 8), pos(0, -66), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(20, 10), pos(0, -35), anchor("bot"), color(150, 150, 150)]);
        prof.add([rect(6, 4), pos(-5, -55), anchor("center"), color(0, 0, 0)]);
        prof.add([rect(6, 4), pos(5, -55), anchor("center"), color(0, 0, 0)]);

        // Speech Bubble
        const bubble = add([
            rect(250, 60),
            pos(x, y - 90),
            anchor("bot"),
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(20),
            opacity(0) // Hidden
        ]);

        // Triangle tail (Rotated Rect)
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
            opacity(0), // Start hidden
            z(21)
        ]);

        // Logic
        // Logic
        // Logic
        prof.onUpdate(() => {
            if (!guy || !guy.exists()) return;
            // REMOVED TAUNT AS REQUESTED
            label.text = defaultMsg;

            // Keep opacity 1 (Disabled fade logic for Professor)
            prof.opacity = 1;

            const dist = guy.pos.dist(prof.pos);
            if (dist < 150) {
                bubble.opacity = lerp(bubble.opacity, 1, 0.1);
                label.opacity = lerp(label.opacity, 1, 0.1);
            } else {
                bubble.opacity = lerp(bubble.opacity, 0, 0.1);
                label.opacity = lerp(label.opacity, 0, 0.1);
            }
        });
    }




    function createPipe(x, label, url, colorBase, colorHighlight, wBonus = 0, hBonus = 0) {
        // Dimensions: Shorter so you can jump on them!
        const baseW = 50;
        const baseH = 40; // Much shorter

        const pipeW = baseW + wBonus;
        const pipeH = baseH + hBonus;

        const lipH = 20;
        const lipOverhang = 4;

        // --- PHYSICS BODIES (Standard Rects = Reliable Collision) ---

        // 1. Pipe Column
        // Positioned from Bottom Center logic manually
        // x center = x. Left = x - pipeW/2.
        // y bottom = safeGroundY. Top = safeGroundY - pipeH.
        const pipeBody = add([
            rect(pipeW, pipeH),
            pos(x - pipeW / 2, safeGroundY - pipeH),
            color(colorBase),
            outline(4, color(0, 0, 0)),
            area(), // Auto-rect area matching visuals
            body({ isStatic: true }),
            z(2),
            "pipe_body"
        ]);

        // 2. Pipe Lip (The Top Platform)
        // Positioned above body
        // Width = pipeW + overhang*2
        const lipW = pipeW + (lipOverhang * 2);
        const lipY = safeGroundY - pipeH - lipH;

        const pipeLip = add([
            rect(lipW, lipH),
            pos(x - lipW / 2, lipY),
            color(colorBase),
            outline(4, color(0, 0, 0)),
            area(), // Auto-rect area
            body({ isStatic: true }),
            z(3),
            "pipe_lip",
            // Store metadata on the LIP (the part you stand on)
            { url: url, entered: false, isLip: true, parentX: x, parentY: safeGroundY }
        ]);

        // --- VISUAL POLISH (Highlights) ---

        // Body Shine
        add([
            rect(6, pipeH - 4),
            pos(x - pipeW / 2 + 10, safeGroundY - pipeH + 2),
            color(colorHighlight),
            z(2)
        ]);

        // Lip Shine
        add([
            rect(6, lipH - 4),
            pos(x - lipW / 2 + 10, lipY + 2),
            color(colorHighlight),
            z(3)
        ]);

        // Label
        add([
            text(label, { size: 10, font: "'Press Start 2P'", width: pipeW + 100, align: "center" }),
            pos(x, lipY - 15),
            anchor("center"),
            color(50, 50, 50),
            z(2)
        ]);

        // Return the LIP as the main interaction handle 
        // (since it's the top interactivity point)
        return pipeLip;
    }

    // COLORS (Base + Highlight)
    // Blue: #2980B9 -> Highlight #5DADE2
    const cBlue = rgb(41, 128, 185);
    const cBlueHi = rgb(93, 173, 226);

    // Red: #C0392B -> Highlight #E74C3C
    const cRed = rgb(192, 57, 43);
    const cRedHi = rgb(231, 76, 60);

    // Purple: #8E44AD -> Highlight #AF7AC5
    const cPurp = rgb(142, 68, 173);
    const cPurpHi = rgb(175, 122, 197);

    // 1. LEFT: Blue Pipe (LINKEDIN)
    // PROFESSOR HINT (Left of Pipes)
    createProfessor(pipeStartX - 180, safeGroundY, "Try diving into the pipes! (Press DOWN)");

    const p1 = createPipe(pipeStartX, "LINKEDIN", "https://www.linkedin.com/in/apoorv-a-s", cBlue, cBlueHi);

    // 2. CENTER: Red Pipe (MAIL)
    const p2 = createPipe(pipeStartX + pipeGap, "MAIL", "mailto:asapoorv8@gmail.com", cRed, cRedHi, 20, 20);

    // 3. RIGHT: Purple Pipe (INSTAGRAM - UPDATED LINK)
    const p3 = createPipe(pipeStartX + pipeGap * 2, "INSTAGRAM", "https://www.instagram.com/apoorv.x.s?igsh=amxlOWplaHNnZHJ2", cPurp, cPurpHi);

    // --- RESTART SYSTEM BUTTON ---
    const btnX = pipeStartX + pipeGap * 3.5;
    const btnY = safeGroundY; // Floor level

    // --- EXTRAVAGANT DEATH TOLL ---
    const deathX = btnX;
    const deathY = btnY - 150;

    // 1. Backing Plate (Tombstone style)
    add([
        rect(140, 70),
        pos(deathX, deathY),
        anchor("center"),
        color(20, 20, 20),
        outline(4, color(100, 100, 100)),
        z(2)
    ]);

    // 2. Skull Icon (Pixel Art)
    const skullX = deathX - 40;
    const skullY = deathY;
    const boneC = rgb(230, 230, 230);

    // Cranium
    add([rect(24, 20), pos(skullX, skullY - 5), anchor("center"), color(boneC), z(3)]);
    // Jaw
    add([rect(16, 10), pos(skullX, skullY + 8), anchor("center"), color(boneC), z(3)]);
    // Eyes
    add([rect(6, 6), pos(skullX - 5, skullY - 5), anchor("center"), color(0, 0, 0), z(4)]);
    add([rect(6, 6), pos(skullX + 5, skullY - 5), anchor("center"), color(0, 0, 0), z(4)]);

    // 3. Text Label
    add([
        text("DEATHS", { size: 10, font: "'Press Start 2P'", align: "left" }),
        pos(deathX - 10, deathY - 15),
        anchor("left"),
        color(150, 150, 150),
        z(3)
    ]);

    // 4. The Count (Big & Red)
    add([
        text((window.DEATH_COUNT || 0).toString(), { size: 28, font: "'Press Start 2P'", align: "left" }),
        pos(deathX - 10, deathY + 10),
        anchor("left"),
        color(220, 40, 40),
        z(3)
    ]);

    // Base System Unit
    const sysBase = add([
        rect(80, 20),
        pos(btnX, btnY),
        anchor("bot"),
        color(80, 80, 80),
        outline(4, color(0, 0, 0)),
        area(),
        body({ isStatic: true }),
        z(2),
        "floor" // Solid
    ]);

    // Red Button Top
    const btnTop = add([
        rect(60, 15),
        pos(btnX, btnY - 20),
        anchor("bot"),
        color(231, 76, 60), // Red
        outline(4, color(0, 0, 0)),
        area(),
        z(1.5),
        "restart_btn"
    ]);

    // Button Shine
    const btnShine = btnTop.add([
        rect(50, 4),
        pos(0, -10),
        anchor("bot"),
        color(255, 120, 100),
        z(1.6)
    ]);

    // Label
    add([
        text("SYSTEM RESTART", { size: 10, font: "'Press Start 2P'", width: 200, align: "center" }),
        pos(btnX, btnY - 50),
        anchor("bot"),
        color(80, 80, 80),
        z(1)
    ]);

    let isRestarting = false;




    // --- PLAYER ---
    const guy = createPlayer(100, safeGroundY - 100);
    // FIX INVISIBLE WALL
    guy.levelWidth = worldWidth;

    // --- THUNDERBOLT CLOUD (Restored) ---
    // User requested difficulty 70 (0.7)
    if (window.createLightningCloud) {
        // "Middle of the start screen"
        createLightningCloud(width() / 2, 100, guy, safeGroundY, () => {
            go("contact");
        }, 0.7);
    }

    // Interaction Logic (Stomp to Restart)
    guy.onCollide("restart_btn", (btn) => {
        if (isRestarting) return;

        // Simplified Check: Just ensure falling (stomp) OR slightly above
        // We removed the strict 'y < btn.y - 15' check as it might be frame-perfect miss.
        // Just checking velocity is usually enough for a floor button.
        if ((guy.vel && guy.vel.y > 0) || (guy.pos && btn.pos && guy.pos.y < btn.pos.y)) {
            isRestarting = true;
            shake(10);

            // Animation: Squish button
            tween(btn.pos.y, btnY - 5, 0.1, (val) => btn.pos.y = val, easings.easeOutQuad);

            // Audio/Feedback (Visual Text)
            const txt = add([
                text("REBOOTING...", { size: 20, font: "'Press Start 2P'" }),
                pos(guy.pos.x, guy.pos.y - 100),
                anchor("center"),
                color(255, 0, 0),
                z(100)
            ]);

            wait(0.5, () => {
                // Hard Reload
                window.location.reload();
            });
        }
    });

    // --- RECRUITER VISUALS ---
    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    let playerFrozen = false;

    guy.onCollide("danger", () => {
        if (window.isRecruiterActive()) return; // Immune (Delayed)

        // INCREMENT DEATH TOLL
        if (typeof window.DEATH_COUNT !== "undefined") {
            window.DEATH_COUNT++;
        }

        addKaboom(guy.pos);
        shake(20);
        destroy(guy);
        wait(1, () => go("contact"));
    });

    // --- PIPE ENTER LOGIC ---
    onUpdate(() => {
        if (!guy.exists() || playerFrozen) return;

        if (guy.isGrounded()) {
            [p1, p2, p3].forEach(pipe => {
                if (pipe.entered) return;
                // Proximity Check using the stored parentX
                if (Math.abs(guy.pos.x - pipe.parentX) < 30) {
                    // Check key press.
                    if (isKeyPressed("down") || isKeyPressed("s") || isKeyPressed("enter")) {
                        pipe.entered = true;
                        enterPipe(pipe);
                    }
                }
            });
        }
    });

    function enterPipe(pipe) {
        playerFrozen = true;
        // Keep static to prevent physics interference during animation
        guy.use(body({ isStatic: true }));

        // Z-INDEX HACK: Put player behind the pipe so he "goes in"
        const originalZ = guy.z;
        guy.use(z(pipe.z - 2)); // Behind pipe body (z=2)

        // Center 
        tween(guy.pos.x, pipe.parentX, 0.2, (val) => guy.pos.x = val, easings.easeOutQuad);

        // Move Down
        // pipe.pos.y is the top of the lip. We want to go down into it.
        // Target Y = pipe.pos.y + 60 (deep enough)
        tween(guy.pos.y, pipe.pos.y + 60, 1.0, (val) => guy.pos.y = val, easings.easeInOutCubic)
            .onEnd(() => {
                debug.log("Entered Pipe: " + pipe.url);
                wait(0.5, () => {
                    window.open(pipe.url, '_blank');
                    playerFrozen = false;
                    // Pop out
                    // Reset Z after jump
                    tween(guy.pos.y, pipe.pos.y - 120, 0.5, (v) => guy.pos.y = v, easings.easeOutBack)
                        .onEnd(() => {
                            guy.use(body({ isStatic: false }));
                            guy.use(z(originalZ)); // Restore Z
                            pipe.entered = false; // Allow re-entry
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

        // Slightly smoother follow
        camPos(lerp(currentCam.x, camX, lerpSpeed), centerY);
    });

    // --- TRANSITION ENTRY ---
    // NO GATE IN CONTACT?
    // Wait, usually there isn't one. It's the end?
    // User might want to go back.
    // There is no back gate in contact currently?
    // Let's check logic.
    // Ah, previous code didn't have a back gate in contact?
    // Wait, I see "1. START BACK GATE" comment in level_projects.js

    // In level_contact, typically you just quit? Or maybe there IS a back gate at start?
    // Let's ADD one for consistency if user wants "decorations in each floor" implies structural consistency too?
    // No, strictly requested decorations.

    // BUT! I see "scene('contact')" usually implies end of journey.
    // Let's stick to decorations.

    // --- TRANSITION ENTRY ---
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

});
