scene("about", () => {
    // --- SETUP ---
    // Let the background WebGL fluid canvas show through — NO opaque background rect!

    const C_FLOOR = rgb(24, 24, 38); // Dark indigo-slate
    const C_TEXT = rgb(240, 240, 240); // Off-white

    // Clear any residual fluid dynamics forces
    if (window.clearFluidEmitters) window.clearFluidEmitters();
    if (window.clearFluidVortexes) window.clearFluidVortexes();
    if (window.clearFluidGround) window.clearFluidGround();

    // Let the background WebGL canvas show through by NOT drawing an opaque rectangle!

    // Floor
    const floorHeight = height() * 0.2;
    const groundY = height() - floorHeight;

    const LEFT_MARGIN_CALC = (width() * 0.05) + 150;
    const startX_CALC = LEFT_MARGIN_CALC + 460 + 350;
    const startX = startX_CALC; // Alias for compatibility
    const gap_CALC = 120;
    const cratesCenterX_CALC = startX_CALC + (gap_CALC * 1.5);
    const chestX = cratesCenterX_CALC + 500; // Old gate position
    const gatesStartX_CALC = chestX + 300; // Gap reduced to 300px

    // Define Updraft Chasm coordinates
    const chasmX = LEFT_MARGIN_CALC + 280;
    const chasmWidth = 180;

    // --- VECTOR SILHOUETTE PLATFORMS ---
    // Floor 1: Start to Chasm
    window.addVectorPlatform(0, groundY, chasmX, floorHeight, rgb(0, 240, 255), ["floor"]);

    // Floor 2: Chasm End to Infinity (Width * 4)
    window.addVectorPlatform(chasmX + chasmWidth, groundY, (width() * 4) - (chasmX + chasmWidth), floorHeight, rgb(0, 240, 255), ["floor"]);

    // --- PERSPECTIVE GRID FLOOR ---
    if (window.addPerspectiveGrid) {
        window.addPerspectiveGrid();
    }

    // --- FLUID PHYSICS TUNNEL (UP-DRAFT ENGINE) ---
    if (window.addFluidEmitter) {
        // Upward current in the middle of Gap 1
        window.addFluidEmitter("about_updraft", chasmX + chasmWidth / 2, groundY + 30, 0, -1, [0.0, 0.9, 1.0], 520, 65);
        const em = window.fluidEmitters.find(e => e.id === "about_updraft");
        if (em) em.type = "column";
    }




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
    const guy = createPlayer(100, groundY - 100);

    // --- FLUID PHYSICS UP-DRAFT TRAP LOGIC ---
    let updraftShifted = false;
    guy.onUpdate(() => {
        const px = guy.pos.x - (camPos().x - width() / 2);
        // Trigger flow shift when player floats in the gap
        if (!updraftShifted && guy.pos.x > chasmX + 25 && guy.pos.x < chasmX + chasmWidth - 25 && guy.pos.y > groundY - 180) {
            updraftShifted = true;
            window.showFluidWarning("WARNING: DRAFT PRESSURE REVERSAL!");
            wait(0.65, () => {
                if (window.updateFluidEmitter) {
                    // Reverse draft to pull down!
                    window.updateFluidEmitter("about_updraft", undefined, undefined, 0, 1);
                    const em = window.fluidEmitters.find(e => e.id === "about_updraft");
                    if (em) {
                        em.force = 360;
                        em.color = [1.0, 0.0, 0.5]; // Hot Pink / Red
                    }
                    if (window.SFX && window.SFX.playTroll) window.SFX.playTroll();
                }
            });
        }
    });

    // --- CORROSIVE SPLAT DROPLET TRAP ---
    loop(2.4, () => {
        // Only drop if player is near the skills crates (between startX and startX + 480)
        if (guy.pos.x > startX - 80 && guy.pos.x < startX + 520) {
            const dropX = guy.pos.x + rand(-100, 100);
            
            // Flashing warning laser
            const laser = add([
                rect(2, groundY),
                pos(dropX, 0),
                color(255, 0, 127),
                opacity(0.4),
                z(2)
            ]);

            let blink = 0;
            const laserBlink = laser.onUpdate(() => {
                blink += dt() * 12;
                laser.opacity = (Math.floor(blink) % 2 === 0) ? 0.6 : 0.08;
            });

            wait(0.8, () => {
                destroy(laser);
                laserBlink.cancel();

                // Drop droplet
                const droplet = add([
                    circle(8),
                    pos(dropX, 0),
                    color(255, 0, 127),
                    outline(2, rgb(255, 255, 255)),
                    area(),
                    z(15),
                    "danger",
                    "droplet"
                ]);

                droplet.onUpdate(() => {
                    droplet.move(0, 380);
                    if (droplet.pos.y >= groundY) {
                        const splatX = droplet.pos.x;
                        destroy(droplet);

                        // Trigger WebGL splat in background
                        if (window.triggerFluidSplat) {
                            const ux = splatX / width();
                            const uy = groundY / height();
                            window.triggerFluidSplat(ux, 1.0 - uy, 0, 0.25, [1.0, 0.0, 0.5], 0.005);
                        }

                        // Play buzzer sfx
                        if (window.SFX && window.SFX.playTroll) {
                            // Quick buzz
                        }

                        // Spawn temporary floor hazard zone
                        const hazard = add([
                            rect(36, 12),
                            pos(splatX, groundY - 12),
                            anchor("bot"),
                            color(255, 0, 127),
                            area(),
                            z(12),
                            "danger",
                            "splash"
                        ]);

                        // Fade hazard out
                        tween(1, 0, 0.7, (v) => hazard.opacity = v).onEnd(() => destroy(hazard));
                    }
                });
            });
        }
    });

    // Collision with Danger
    guy.onCollide("danger", () => {
        if (window.RECRUITER_MODE) return; // Immune
        if (guy.isDead) return;
        guy.isDead = true;
        if (window.SFX) window.SFX.playDeath();
        shake(20);
        wait(0.2, () => {
            go("about");
        });
    });

    // --- VOID DEATH CHECK ---
    guy.onUpdate(() => {
        if (guy.isDead) return;
        if (guy.pos.y > groundY + 180) {
            if (window.RECRUITER_MODE) {
                guy.pos.y = groundY - 100;
                guy.vel.y = 0;
                return;
            }
            guy.isDead = true;
            if (window.SFX) window.SFX.playDeath();
            shake(20);
            wait(0.2, () => {
                go("about");
            });
        }
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

        // Crate Body -> Holographic Skill Terminal
        const crate = add([
            pos(cx, cy),
            rect(crateSize, crateSize),
            anchor("bot"),
            color(8, 8, 16), // Dark void core
            outline(2, skill.color), // Neon border
            area(),
            body({ isStatic: true }),
            z(5),
            "crate"
        ]);

        // Pulsing inner colored core
        crate.add([
            rect(crateSize - 10, crateSize - 10),
            anchor("center"),
            pos(0, -crateSize / 2),
            color(skill.color),
            opacity(0.08),
            z(6)
        ]);

        // Cyber accents (vertical neon side bars)
        crate.add([
            rect(2, crateSize - 20),
            anchor("center"),
            pos(-crateSize / 2 + 5, -crateSize / 2),
            color(skill.color),
            z(6.5)
        ]);
        crate.add([
            rect(2, crateSize - 20),
            anchor("center"),
            pos(crateSize / 2 - 5, -crateSize / 2),
            color(skill.color),
            z(6.5)
        ]);

        // Label
        crate.add([
            text(skill.label, { size: 12, font: "'Press Start 2P'", align: "center" }),
            anchor("center"),
            pos(0, -crateSize / 2),
            color(255, 255, 255), // High-contrast white label
            z(7)
        ]);

        // --- TOOLTIP (Holographic Panel) ---
        const tooltipW = 400;
        const tooltipH = 280;
        const tip = crate.add([
            rect(tooltipW, tooltipH),
            anchor("bot"),
            pos(0, -crateSize - 30), // Float higher
            color(8, 8, 20), // Dark cyber navy background
            outline(2, skill.color), // Glowing neon outline matching the skill
            z(100)
        ]);
        tip.hidden = true;

        // Tooltip Content logic
        tip.add([
            text(skill.details.item, { size: 12, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 25),
            anchor("top"),
            color(255, 255, 255) // White text
        ]);

        tip.add([
            text(skill.details.mastery, { size: 10, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 60),
            anchor("top"),
            color(0, 240, 255) // Neon Cyan
        ]);

        tip.add([
            text("EQUIPPED:", { size: 10, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 20, -tooltipH + 95),
            color(255, 0, 127) // Neon Pink
        ]);

        tip.add([
            text("> " + skill.details.equipped[0], { size: 8, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 120),
            color(220, 220, 240)
        ]);
        tip.add([
            text("> " + skill.details.equipped[1], { size: 8, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 140),
            color(220, 220, 240)
        ]);
        tip.add([
            text("> " + skill.details.equipped[2], { size: 8, font: "'Press Start 2P'" }),
            pos(-tooltipW / 2 + 30, -tooltipH + 160),
            color(220, 220, 240)
        ]);

        tip.add([
            text(skill.details.specialName, { size: 9, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 200),
            anchor("top"),
            color(0, 255, 128) // Neon Green
        ]);

        tip.add([
            text(skill.details.specialDesc, { size: 8, font: "'Press Start 2P'", width: tooltipW - 30, align: "center" }),
            pos(0, -tooltipH + 225),
            anchor("top"),
            color(160, 160, 180)
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

    // --- TREASURE CHEST (Cyber Data Vault) ---
    const resumePaper = add([
        rect(30, 40),
        pos(chestX, height() - floorHeight - 20),
        anchor("bot"),
        color(8, 8, 16), // Dark void data card
        outline(2, rgb(0, 240, 255)), // Glowing cyan border
        z(4), // Behind chest initially
        "resume_paper"
    ]);
    resumePaper.add([rect(20, 2), pos(0, -30), anchor("center"), color(0, 240, 255)]); // Glowing cyan lines
    resumePaper.add([rect(20, 2), pos(0, -25), anchor("center"), color(0, 240, 255)]);
    resumePaper.add([rect(20, 2), pos(0, -20), anchor("center"), color(0, 240, 255)]);


    const chestBody = add([
        rect(50, 40),
        pos(chestX, height() - floorHeight),
        anchor("bot"),
        color(8, 8, 16), // Dark void base
        outline(2.5, rgb(0, 240, 255)), // Glowing cyan neon outline
        area(),
        z(5),
        "chest"
    ]);
    // Pulsing core details
    chestBody.add([rect(50, 3), pos(0, -17), anchor("center"), color(0, 240, 255), z(6)]);
    chestBody.add([rect(12, 12), pos(0, -5), anchor("center"), color(255, 0, 127), outline(1.5, rgb(255, 255, 255)), z(7)]);

    const chestLid = add([
        rect(50, 15),
        pos(chestX, height() - floorHeight - 40),
        anchor("bot"),
        color(8, 8, 16),
        outline(2.5, rgb(0, 240, 255)),
        rotate(0),
        z(6)
    ]);
    chestLid.add([rect(40, 8), pos(0, -15), anchor("bot"), color(12, 12, 24), outline(2, rgb(0, 240, 255)), z(6)]);
    chestLid.add([rect(54, 3), pos(0, -2), anchor("bot"), color(255, 0, 127), z(7)]);

    const chestHint = add([
        text("PRESS ENTER", { size: 10, font: "'Press Start 2P'" }),
        pos(chestX, height() - floorHeight - 80),
        anchor("bot"),
        color(0, 240, 255), // Cyan neon prompt
        z(10)
    ]);
    chestHint.onUpdate(() => {
        chestHint.opacity = map(Math.sin(time() * 6), -1, 1, 0.4, 1.0);
    });
    chestHint.hidden = true;

    let chestOpened = false;
    let chestTrollTriggered = false;

    let chestVortexActive = false;

    // Interaction with Chest
    onUpdate(() => {
        const d = guy.pos.dist(chestBody.pos);

        if (!chestOpened) {
            // Trigger vortex pull when player approaches chest
            if (!chestVortexActive && d < 180) {
                chestVortexActive = true;
                window.showFluidWarning("WARNING: GRAVITATIONAL VORTEX ENGAGED!");
                if (window.addFluidVortex) {
                    window.addFluidVortex("chest_vortex", chestX, groundY - 140, 220, 280);
                }
            }

            if (d < 80) {
                chestHint.hidden = false;
                if (isKeyPressed("enter")) {
                    chestOpened = true;
                    // Disable vortex
                    if (window.clearFluidVortexes) window.clearFluidVortexes();

                    if (window.SFX) window.SFX.playCoin();
                    chestHint.text = "DOWNLOADING...";
                    shake(5);
                    tween(chestLid.pos.y, chestLid.pos.y - 20, 0.5, (val) => chestLid.pos.y = val, easings.easeOutBounce);
                    tween(chestLid.angle, -45, 0.5, (val) => chestLid.angle = val, easings.easeOutBack);
                    wait(0.2, () => {
                        resumePaper.z = 8;
                        tween(resumePaper.pos.y, groundY - 80, 0.5, (val) => resumePaper.pos.y = val, easings.easeOutElastic);

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
            if (guy.isDead) return;
            guy.isDead = true;
            go("about");
        });
    }




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
        if (!guy.exists()) return;
        let targetCamX = guy.pos.x;
        if (targetCamX < defaultCamX) targetCamX = defaultCamX;
        if (targetCamX > maxCamX) targetCamX = maxCamX;

        const currCamX = camPos().x;
        const lerpSpeed = 4 * dt();

        if (Math.abs(currCamX - targetCamX) > 1) {
            camPos(lerp(currCamX, targetCamX, lerpSpeed), height() / 2);
        }
    });

    // --- TRANSITION ENTRY ---
    if (window.g_IsTransitioning) {
        window.g_IsTransitioning = false;
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
        color(0, 240, 255),
        z(10)
    ]);
    // Fluid Portal Style (dark core + cyan glow)
    gate.add([rect(60, 70), pos(0, 0), anchor("bot"), color(6, 6, 12), z(6)]);
    gate.add([rect(52, 62), pos(0, -4), anchor("bot"), color(0, 240, 255), opacity(0.12), z(6.5)]);
    gate.add([rect(64, 5), pos(0, -70), anchor("bot"), color(0, 240, 255), z(7)]);
    gate.add([rect(4, 70), pos(-30, 0), anchor("bot"), color(0, 240, 255), z(7)]);
    gate.add([rect(4, 70), pos(26, 0), anchor("bot"), color(0, 240, 255), z(7)]);
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
