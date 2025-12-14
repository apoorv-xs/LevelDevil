scene("about", () => {
    // --- SETUP ---
    // Background Color (Matches Intro) - EXTENDED for Scroll
    add([
        rect(width() * 4, height()),
        color(233, 180, 90), // #E9B45A
        pos(0, 0),
        z(0)
    ]);

    const C_FLOOR = rgb(176, 113, 29); // #B0711D
    const C_TEXT = rgb(44, 44, 44); // #2C2C2C

    // Floor - SPLIT for Pit
    const floorHeight = height() * 0.2;

    const LEFT_MARGIN_CALC = (width() * 0.05) + 150;
    const startX_CALC = LEFT_MARGIN_CALC + 460 + 350;
    const startX = startX_CALC; // Alias for compatibility
    const gap_CALC = 120;
    const cratesCenterX_CALC = startX_CALC + (gap_CALC * 1.5);
    const chestX = cratesCenterX_CALC + 500; // Old gate position
    const gatesStartX_CALC = chestX + 300; // Gap reduced to 300px

    // Pit Config (Trap Door)
    const pitWidth = 60; // Narrower
    const pitX = chestX - 180; // Moved before the chest

    // Floor 1: Start to Pit
    add([
        rect(pitX, floorHeight),
        pos(0, height() - floorHeight),
        color(C_FLOOR),
        z(1), // LAYER 1
        area(),
        body({ isStatic: true }),
        "floor"
    ]);

    // Floor 2: Pit End to Infinity (Width * 4)
    add([
        rect((width() * 4) - (pitX + pitWidth), floorHeight),
        pos(pitX + pitWidth, height() - floorHeight),
        color(C_FLOOR),
        z(1), // LAYER 1
        area(),
        body({ isStatic: true }),
        "floor"
    ]);




    // --- CLOUDS (FIXED) ---
    function addFixedCloud(x, y, speed) {
        const cloud = add([
            pos(x, y),
            rect(60, 20),
            color(255, 255, 255),
            opacity(0.8),
            z(2),
            fixed(), // HUD COMPONENT
            "cloud"
        ]);
        cloud.add([rect(30, 20), pos(15, -15), color(255, 255, 255), fixed()]);
        cloud.add([rect(20, 10), pos(40, 5), color(255, 255, 255), fixed()]);

        // Manual Loop for fixed elements
        const screenW = width();
        cloud.onUpdate(() => {
            cloud.move(-speed, 0);
            if (cloud.pos.x < -100) {
                cloud.pos.x = screenW + 100;
            }
        });
    }

    addFixedCloud(width() * 0.2, height() * 0.15, 20);
    addFixedCloud(width() * 0.5, height() * 0.1, 15);
    addFixedCloud(width() * 0.8, height() * 0.2, 25);

    // --- RECRUITER MODE UI ---
    if (window.addRecruiterUI) window.addRecruiterUI();

    // --- CONTENT ---
    add([
        text("ABOUT ME", { size: 40, font: "'Press Start 2P'" }),
        pos(width() / 2, height() * 0.15),
        anchor("center"),
        color(C_TEXT),
        z(10),
        fixed() // HUD COMPONENT
    ]);


    // --- RETRO ID CARD (Left Side) ---
    const cardW = 460;
    const cardH = 320;
    const LEFT_MARGIN = (width() * 0.05) + 150;
    const cardX = LEFT_MARGIN;
    const cardY = height() * 0.25;

    // 1. Black Background (Shadow/Border)
    add([
        rect(cardW + 16, cardH + 16),
        pos(cardX - 8, cardY - 8),
        color(0, 0, 0),
        z(4)
    ]);

    // 2. White Card Base (No rounded corners for retro look)
    const card = add([
        rect(cardW, cardH),
        pos(cardX, cardY),
        color(255, 255, 240), // Off-white/Cream for retro paper feel
        z(5),
        "id_card"
    ]);

    // 3. Inner Pixel Border (Chunky)
    card.add([rect(cardW - 8, 2), pos(4, 4), color(0, 0, 0), z(6)]);
    card.add([rect(cardW - 8, 2), pos(4, cardH - 6), color(0, 0, 0), z(6)]);
    card.add([rect(2, cardH - 8), pos(4, 4), color(0, 0, 0), z(6)]);
    card.add([rect(2, cardH - 8), pos(cardW - 6, 4), color(0, 0, 0), z(6)]);

    // 4. Scanline/Grid Effect
    for (let y = 0; y < cardH; y += 4) {
        card.add([
            rect(cardW, 1),
            pos(0, y),
            color(0, 0, 0),
            opacity(0.05), // Very faint
            z(5)
        ]);
    }

    // --- HEADER ---
    card.add([
        text("PLAYER : APOORV A. S.", { size: 16, font: "'Press Start 2P'", align: "left" }),
        pos(24, 28),
        color(44, 44, 44)
    ]);
    card.add([
        text("CLASS  : Creative Tinkerer", { size: 12, font: "'Press Start 2P'", align: "left" }),
        pos(24, 55),
        color(44, 44, 44)
    ]);

    // Divider
    card.add([rect(cardW - 48, 4), pos(24, 80), color(0, 0, 0)]);

    // --- PHOTO / AVATAR (Left) ---
    // 100x100 Pixel Avatar Placeholder
    const avX = 24;
    const avY = 100;
    card.add([rect(100, 100), pos(avX, avY), color(200, 200, 200)]);
    card.add([rect(100, 100), pos(avX, avY), outline(4, color(0, 0, 0))]);
    // Pixel Face (Simple)
    card.add([rect(60, 60), pos(avX + 20, avY + 20), color(255, 200, 150)]); // Face
    card.add([rect(10, 10), pos(avX + 35, avY + 40), color(0, 0, 0)]); // Left Eye
    card.add([rect(10, 10), pos(avX + 65, avY + 40), color(0, 0, 0)]); // Right Eye
    card.add([rect(40, 10), pos(avX + 30, avY + 70), color(0, 0, 0)]); // Mouth


    // --- BODY STATS (Right of Avatar) ---
    const statsX = 140; // Clean separation from avatar

    // LEVEL
    card.add([
        text("LEVEL: 3 (Years Exp)", { size: 12, font: "'Press Start 2P'" }),
        pos(statsX, 100),
        color(60, 60, 60)
    ]);

    // LOCATION
    card.add([
        text("LOCATION: India", { size: 12, font: "'Press Start 2P'" }),
        pos(statsX, 120), // Spaced down
        color(60, 60, 60)
    ]);

    // STATUS
    card.add([
        text("STATUS: Available", { size: 12, font: "'Press Start 2P'" }),
        pos(statsX, 140),
        color(60, 60, 60)
    ]);

    // Blinking Dot (Next to Status)
    const dot = card.add([
        rect(8, 8),
        pos(statsX + 220, 140), // Adjusted X again
        color(0, 200, 0)
    ]);

    loop(0.8, () => {
        dot.opacity = dot.opacity === 1 ? 0 : 1;
    });

    // --- SKILLS / SPECS ---
    card.add([
        text("SPECIALITY:", { size: 12, font: "'Press Start 2P'" }),
        pos(statsX, 180), // New section
        color(150, 60, 60)
    ]);

    const skills = [
        "Visual Design (UI/UX)",
        "Rapid Prototyping",
        "Workflow Optimization"
    ];

    skills.forEach((skill, idx) => {
        card.add([
            text(skill, { size: 12, font: "'Press Start 2P'" }),
            pos(statsX, 205 + (idx * 25)), // List items
            color(44, 44, 44)
        ]);
    });

    // --- FOOTER ---
    // Divider
    card.add([rect(cardW - 48, 4), pos(24, 275), color(0, 0, 0)]);

    card.add([
        text("\"High fidelity design. Speedrunner efficiency.\"", {
            size: 11,
            font: "'Press Start 2P'",
            align: "center",
            width: cardW - 48
        }),
        pos(cardW / 2, 300),
        anchor("center"),
        color(44, 44, 44, 0.7) // Italic/Grey
    ]);


    // --- PLAYER SPAWN ---
    const guy = createPlayer(100, height() - floorHeight - 100);

    // --- OBSTACLES ---
    createSpikes(LEFT_MARGIN + 350, height() - floorHeight, 3, C_FLOOR);

    // More spikes further down
    const movingSpikes = createSpikes(LEFT_MARGIN + 350 + 220, height() - floorHeight, 3, C_FLOOR);

    // --- PIT TRAP ---
    createPit(pitX, height() - floorHeight, pitWidth, floorHeight, C_FLOOR, guy);

    // Trap Logic
    let spikeTrapTriggered = false;
    const spikeTriggerX = LEFT_MARGIN + 350 + 160;

    onUpdate(() => {
        if (!spikeTrapTriggered && guy.pos.x > spikeTriggerX) {
            spikeTrapTriggered = true;
            movingSpikes.forEach(s => {
                tween(s.pos.x, s.pos.x - 40, 0.1, (val) => s.pos.x = val, easings.easeOutQuad);
            });
            console.log("Spike Trap Triggered!");
        }
    });


    // Collision with Danger
    guy.onCollide("danger", () => {
        if (window.RECRUITER_MODE) return; // Immune
        shake(20);
        wait(0.2, () => {
            go("about");
        });
    });

    // Collision with Void
    guy.onCollide("void", () => {
        if (window.RECRUITER_MODE) return; // Immune (Should you survive void? Maybe wrap around? For now, just don't die means stuck falling? No, void usually is death plane. Let's keep immunity but maybe bounce up? Or just don't reset. If you fall forever, that's a bug. Okay, let's allow void death OR bounce back up. Invincibility usually implies not restarting level. Let's make void bounce you up.)

        if (window.RECRUITER_MODE) {
            guy.pos.y = height() - floorHeight - 100; // Teleport back up
            guy.vel.y = 0;
            return;
        }

        shake(20);
        wait(0.5, () => {
            go("about");
        });
    });

    // --- CRATES (Skills) ---
    const crateSize = 60;
    const skillsList = [
        {
            label: "Fi", color: rgb(242, 78, 30), name: "Figma",
            details: {
                item: "ITEM: Figma Blade",
                mastery: "MASTERY: LVL 4 (Daily Driver)",
                equipped: ["High-Fidelity UI Design", "Rapid Prototyping", "Design Systems"],
                specialName: "SPECIAL MOVE: 'Auto-Layout Ninja'",
                specialDesc: "(I create responsive components that\n never break, no matter the screen size.)"
            }
        },
        {
            label: "Ps", color: rgb(49, 168, 255), name: "Photoshop",
            details: {
                item: "ITEM: Pixel Brush",
                mastery: "MASTERY: LVL 3 (VETERAN)",
                equipped: ["Image Manipulation", "Effect Compositing", "Texture Creation"],
                specialName: "SPECIAL MOVE: 'Non-Destructive'",
                specialDesc: "(I use smart objects and masks so I\n can always change my mind later.)"
            }
        },
        {
            label: "</>", color: rgb(0, 255, 0), name: "Coding",
            details: {
                item: "ITEM: Code Scroll (HTML/CSS/JS)",
                mastery: "MASTERY: LVL 2 (Creative Tinkerer)",
                equipped: ["Bridging Design & Dev", "Interactive Portfolios", "Game Logic"],
                specialName: "SPECIAL MOVE: 'The Gluemaker'",
                specialDesc: "(I write just enough code to make\n my designs actually work.)"
            }
        },
        {
            label: "AI", color: rgb(147, 51, 234), name: "AI Tools",
            details: {
                item: "ITEM: Neural Lantern",
                mastery: "MASTERY: LVL 5 (Augmented)",
                equipped: ["LLM Whispering", "Generative Art", "Code Assist"],
                specialName: "SPECIAL MOVE: 'Synthesize'",
                specialDesc: "(Boosting productivity by 10x\n with minimal hallucination.)"
            }
        }
    ];

    const gap = 120;
    const allCrates = [];

    skillsList.forEach((skill, idx) => {
        const cx = startX + (idx * gap);
        const cy = height() - floorHeight;

        // Crate Body
        const crate = add([
            pos(cx, cy),
            rect(crateSize, crateSize),
            anchor("bot"),
            color(51, 51, 51), // Dark Grey #333333
            outline(4, color(0, 0, 0)), // Pitch Black Border
            area(),
            body({ isStatic: true }),
            z(5),
            "crate"
        ]);

        // Crate Detail
        crate.add([
            rect(crateSize - 12, crateSize - 12),
            anchor("center"),
            pos(0, -crateSize / 2),
            color(80, 80, 80),
            z(6)
        ]);
        crate.add([
            rect(crateSize - 20, crateSize - 20),
            anchor("center"),
            pos(0, -crateSize / 2),
            color(51, 51, 51),
            z(6)
        ]);

        // Label
        crate.add([
            text(skill.label, { size: 16, font: "'Press Start 2P'", align: "center" }),
            anchor("center"),
            pos(0, -crateSize / 2),
            color(skill.color),
            z(7)
        ]);

        // --- TOOLTIP ---
        const tooltipW = 400;
        const tooltipH = 280;
        const tip = crate.add([
            rect(tooltipW, tooltipH),
            anchor("bot"),
            pos(0, -crateSize - 30), // Float higher
            color(255, 255, 255),
            outline(4, color(0, 0, 0)),
            z(100)
        ]);
        tip.hidden = true;

        // Tooltip Content logic
        tip.add([
            text(skill.details.item, { size: 14, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 25),
            anchor("top"),
            color(0, 0, 0)
        ]);

        tip.add([
            text(skill.details.mastery, { size: 12, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 60),
            anchor("top"),
            color(100, 100, 100)
        ]);

        tip.add([
            text("EQUIPPED:", { size: 12, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 20, -tooltipH + 100),
            color(150, 60, 60)
        ]);

        tip.add([
            text("> " + skill.details.equipped[0], { size: 10, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 125),
            color(44, 44, 44)
        ]);
        tip.add([
            text("> " + skill.details.equipped[1], { size: 10, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 145),
            color(44, 44, 44)
        ]);
        tip.add([
            text("> " + skill.details.equipped[2], { size: 10, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 165),
            color(44, 44, 44)
        ]);

        tip.add([
            text(skill.details.specialName, { size: 11, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 210), // Pushed down
            anchor("top"),
            color(0, 150, 0)
        ]);

        tip.add([
            text(skill.details.specialDesc, { size: 10, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 235),
            anchor("top"),
            color(80, 80, 80)
        ]);

        allCrates.push({ crate, tip });
    });

    // Global Update to ensure only ONE tooltip is visible (closest one)
    onUpdate(() => {
        let activeCrate = null;
        let minDist = Infinity;

        // Find closest crate
        for (const c of allCrates) {
            const d = guy.pos.dist(c.crate.pos);
            if (d < minDist) {
                minDist = d;
                activeCrate = c;
            }
        }

        // Hide all first
        allCrates.forEach(c => c.tip.hidden = true);

        // Show closest ONLY if within range
        if (activeCrate && minDist < 80) {
            activeCrate.tip.hidden = false;
        }
    });

    const cratesCenterX = startX + (gap * 1.5);
    const gatesStartX = gatesStartX_CALC;

    // --- TREASURE CHEST ---
    const resumePaper = add([
        rect(30, 40),
        pos(chestX, height() - floorHeight - 20),
        anchor("bot"),
        color(255, 255, 255), // White paper
        outline(2, color(0, 0, 0)),
        z(4), // Behind chest initially
        "resume_paper"
    ]);
    resumePaper.add([rect(20, 2), pos(0, -30), anchor("center"), color(200, 200, 200)]);
    resumePaper.add([rect(20, 2), pos(0, -25), anchor("center"), color(200, 200, 200)]);
    resumePaper.add([rect(20, 2), pos(0, -20), anchor("center"), color(200, 200, 200)]);


    const chestBody = add([
        rect(50, 40),
        pos(chestX, height() - floorHeight),
        anchor("bot"),
        color(192, 57, 43), // Deep Red / Maroon
        outline(4, color(0, 0, 0)), // Thick Black Outline
        area(),
        z(5),
        "chest"
    ]);
    chestBody.add([rect(50, 6), pos(0, -17), anchor("center"), color(241, 196, 15), z(6)]);
    chestBody.add([rect(12, 12), pos(0, -5), anchor("center"), color(241, 196, 15), outline(2, color(0, 0, 0)), z(7)]);
    chestBody.add([rect(4, 6), pos(0, -5), anchor("center"), color(0, 0, 0), z(8)]); // Keyhole

    const chestLid = add([
        rect(50, 15),
        pos(chestX, height() - floorHeight - 40),
        anchor("bot"),
        color(192, 57, 43), // Deep Red
        outline(4, color(0, 0, 0)),
        rotate(0),
        z(6)
    ]);
    chestLid.add([rect(40, 8), pos(0, -15), anchor("bot"), color(192, 57, 43), outline(4, color(0, 0, 0)), z(6)]);
    chestLid.add([rect(54, 4), pos(0, -2), anchor("bot"), color(241, 196, 15), z(7)]);

    const chestHint = add([
        text("PRESS ENTER", { size: 10, font: "'Press Start 2P'" }),
        pos(chestX, height() - floorHeight - 80),
        anchor("bot"),
        color(255, 255, 255),
        z(10)
    ]);
    chestHint.hidden = true;

    let chestOpened = false;

    // Interaction with Chest
    onUpdate(() => {
        if (chestOpened) return;

        const d = guy.pos.dist(chestBody.pos);
        if (d < 80) {
            chestHint.hidden = false;
            if (isKeyPressed("enter")) {
                chestOpened = true;
                chestHint.text = "DOWNLOADING...";
                shake(5);
                tween(chestLid.pos.y, chestLid.pos.y - 20, 0.5, (val) => chestLid.pos.y = val, easings.easeOutBounce);
                tween(chestLid.angle, -45, 0.5, (val) => chestLid.angle = val, easings.easeOutBack);
                wait(0.2, () => {
                    resumePaper.z = 8;
                    tween(resumePaper.pos.y, height() - floorHeight - 80, 0.5, (val) => resumePaper.pos.y = val, easings.easeOutElastic);

                    // TRIGGER DOWNLOAD
                    const link = document.createElement('a');
                    link.href = 'resume.pdf';
                    link.download = 'resume.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    chestHint.text = "RESUME ACQUIRED!";
                });
            }
        } else {
            chestHint.hidden = true;
        }
    });

    guy.levelWidth = gatesStartX + 600;

    // --- DIRECTIONAL HINT ---
    const arrowX = cratesCenterX;
    const arrowY = height() * 0.35;

    const hint = add([
        pos(arrowX, arrowY),
        anchor("center"),
        z(10),
        "hint",
        {
            dir: 1
        }
    ]);
    // Draw Arrow Shape
    hint.add([
        rect(40, 10),
        pos(0, 0),
        anchor("center"),
        color(255, 255, 255),
        outline(2, color(0, 0, 0))
    ]);
    hint.add([
        rect(10, 10), // Tip
        pos(25, 0),
        anchor("center"),
        rotate(45), // Does not make a triangle easily with rect...
        // Let's use polygon drawing if possible, or composed rects
        color(255, 255, 255),
        outline(2, color(0, 0, 0))
    ]);

    // Redrawing Arrow (Unified Pixel Shape)
    hint.removeAll();

    // Config for Pixel Arrow
    const borderC = rgb(0, 0, 0);
    const fillC = rgb(255, 255, 255);

    // Define Shapes relative to center (0,0)
    // Shaft: 40x12. Head connects.
    // Let's center the visual weight.

    // LAYERS function to avoid repetition
    function drawLayer(color, offset) {
        // Shaft
        hint.add([rect(40 + offset, 12 + offset), pos(-20, 0), anchor("center"), color, z(10)]);
        // Head Steps (Connected)
        hint.add([rect(10 + offset, 30 + offset), pos(5, 0), anchor("center"), color, z(10)]);
        hint.add([rect(10 + offset, 20 + offset), pos(15, 0), anchor("center"), color, z(10)]);
        hint.add([rect(10 + offset, 10 + offset), pos(25, 0), anchor("center"), color, z(10)]);
    }

    // 1. Border Layer (Draw first, larger)
    // We can simulate border by drawing black slightly larger? 
    // Or just draw black rects behind with slightly larger size.
    // Offset size by +4px (2px border on each side)

    const b = 4;
    hint.add([rect(40 + b, 12 + b), pos(-20, 0), anchor("center"), color(borderC), z(9)]);
    hint.add([rect(10 + b, 30 + b), pos(5, 0), anchor("center"), color(borderC), z(9)]);
    hint.add([rect(10 + b, 20 + b), pos(15, 0), anchor("center"), color(borderC), z(9)]);
    hint.add([rect(10 + b, 10 + b), pos(25, 0), anchor("center"), color(borderC), z(9)]);

    // 2. Fill Layer (White, normal size)
    hint.add([rect(40, 12), pos(-20, 0), anchor("center"), color(fillC), z(10)]);
    hint.add([rect(10, 30), pos(5, 0), anchor("center"), color(fillC), z(10)]);
    hint.add([rect(10, 20), pos(15, 0), anchor("center"), color(fillC), z(10)]);
    hint.add([rect(10, 10), pos(25, 0), anchor("center"), color(fillC), z(10)]);

    // Animate Arrow
    let arrowBaseX = arrowX;
    loop(1, () => {
        tween(hint.pos.x, arrowBaseX + 10, 0.4, (val) => hint.pos.x = val, easings.easeOutQuad)
            .onEnd(() => {
                wait(0.2, () => {
                    tween(hint.pos.x, arrowBaseX, 0.4, (val) => hint.pos.x = val, easings.easeOutQuad);
                });
            });
    });

    hint.onUpdate(() => {
        const distToCrates = Math.abs(guy.pos.x - cratesCenterX);
        if (distToCrates < 300) {
            hint.hidden = true;
        } else {
            hint.hidden = false;
        }
    });

    // --- RECRUITER VISUALS ---
    guy.onUpdate(() => {
        if (window.updateRecruiterVisuals) window.updateRecruiterVisuals(guy);
    });

    // --- LIGHTNING TRAP ---
    if (window.createLightningCloud) {
        // Start at the END (gatesStartX_CALC)
        createLightningCloud(gatesStartX_CALC, height() * 0.15, guy, height() - floorHeight, () => {
            if (window.RECRUITER_MODE) return;
            go("about");
        });
    }

    // --- OBSTACLES ---
    createSpikes(LEFT_MARGIN + 350, height() - floorHeight, 3, C_FLOOR);


    // --- EXIT GATES ---
    const gateBack = createRetroGate(LEFT_MARGIN - 80, "BACK", "gate_back");
    const gateProj = createRetroGate(gatesStartX, "PROJECTS", "gate_proj");

    add([
        text('" I don\'t just paint the level;\nI solve the puzzle. "', {
            size: 16,
            font: "'Press Start 2P'",
            align: "center",
            width: 600
        }),
        pos(gatesStartX, height() - floorHeight - 150),
        anchor("bot"), // Changed from center to bot to stack nicely? Or center? 
        // If I use center, I need to guess the height. 
        // Let's use bot anchor so I know exactly where the bottom is relative to gate top.
        // Gate top label is at -90. So -150 gives 60px gap.
        color(44, 44, 44),
        z(10)
    ]);

    onUpdate(() => {
        checkGate("gate_back", "intro");
        checkGate("gate_proj", "projects");
    });

    // --- CAMERA LOGIC ---
    const defaultCamX = width() / 2;
    const maxCamX = chestX;

    onUpdate(() => {
        let targetCamX = guy.pos.x;
        if (targetCamX < defaultCamX) targetCamX = defaultCamX;
        if (targetCamX > maxCamX) targetCamX = maxCamX;

        const currCamX = camPos().x;
        const lerpSpeed = 4 * dt();

        if (Math.abs(currCamX - targetCamX) > 1) {
            camPos(lerp(currCamX, targetCamX, lerpSpeed), height() / 2);
        }
    });

    const topJaw = window.g_TransitionJaws.top;
    const botJaw = window.g_TransitionJaws.bot;
    const halfH = height() / 2;

    if (topJaw && botJaw) {
        wait(0.2, () => {
            tween(topJaw.pos.y, -halfH - 200, 0.5, (val) => topJaw.pos.y = val, easings.easeInQuad);
            tween(botJaw.pos.y, height() + 200, 0.5, (val) => botJaw.pos.y = val, easings.easeInQuad)
                .onEnd(() => {
                    destroy(topJaw);
                    destroy(botJaw);
                    window.g_TransitionJaws.top = null;
                    window.g_TransitionJaws.bot = null;
                });
        });
    }
});

// --- EXIT GATES ---
function createRetroGate(x, label, tag, gateColor) {
    const gate = add([
        pos(x, height() - height() * 0.2), // floorHeight is inconsistent variable scoping, hardcalc. NO, must match floorHeight inside specific closure? Wait, this function is outside scene.
        // The scene defines floorHeight = height * 0.2. So use height * 0.8.
        area({ shape: new Rect(vec2(0, -40), 60, 80) }),
        anchor("bot"),
        z(5),
        tag
    ]);
    gate.add([
        text(label, { size: 10, font: "'Press Start 2P'" }),
        pos(0, -90),
        anchor("bot"),
        color(44, 44, 44),
        z(10)
    ]);
    const borderC = rgb(176, 113, 29);
    gate.add([rect(60, 50), pos(0, 0), anchor("bot"), color(borderC), z(6)]);
    gate.add([rect(60, 10), pos(0, -50), anchor("bot"), color(borderC), z(6)]);
    gate.add([rect(50, 6), pos(0, -60), anchor("bot"), color(borderC), z(6)]);
    gate.add([rect(30, 4), pos(0, -66), anchor("bot"), color(borderC), z(6)]);
    gate.add([rect(52, 50), pos(0, 0), anchor("bot"), color(180, 180, 180), z(7)]);
    gate.add([rect(52, 10), pos(0, -50), anchor("bot"), color(180, 180, 180), z(7)]);
    gate.add([rect(42, 6), pos(0, -60), anchor("bot"), color(180, 180, 180), z(7)]);
    gate.add([rect(22, 4), pos(0, -66), anchor("bot"), color(180, 180, 180), z(7)]);
    return gate;
}

function checkGate(triggerName, targetScene) {
    const gates = get(triggerName);
    for (const g of gates) {
        if (get("guy")[0] && get("guy")[0].isColliding(g)) { // Fix: helper access to guy
            if (isKeyPressed("up") || isKeyPressed("enter")) {
                window.enterGate(get("guy")[0], g, targetScene);
            }
        }
    }
}
