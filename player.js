function createPlayer(x, y) {
    // CONSTANTS
    const SPEED = 200;
    const JUMP = 550;

    // PLAYER OBJECT (Hitbox)
    const guy = add([
        pos(x, y),
        rect(24, 24), // Sized for the rolling disk
        area(),
        body(),
        anchor("bot"),
        rotate(0), // For transitions
        scale(1),  // For transitions
        opacity(0), // Hitbox remains invisible, visuals draw inside/around it
        z(20),
        "guy"
    ]);

    // --- VISUALS (Gyro-Cyber-Disk) ---

    // Shadow (cyan glow underneath)
    const shadow = guy.add([
        rect(20, 6, { radius: 3 }),
        anchor("center"),
        pos(0, 0),
        color(0, 200, 255),
        opacity(0.15),
        z(-1)
    ]);

    const C_BODY = color(8, 8, 16); // Dark core
    const C_OUTLINE = rgb(0, 220, 255); // Neon cyan outline

    // 1. ROLLING INNER DISK (Handles rotation when moving)
    const diskContainer = guy.add([
        pos(0, -12), // Center of the 24px high player
        anchor("center"),
        rotate(0),
        z(1)
    ]);

    // Outer Circle Ring
    diskContainer.add([
        rect(24, 24, { radius: 12 }),
        anchor("center"),
        C_BODY,
        outline(2, C_OUTLINE),
        z(1)
    ]);

    // Inner Neon Grid Spokes (rotating visual cue)
    diskContainer.add([
        rect(2, 24),
        anchor("center"),
        color(0, 240, 255),
        opacity(0.4),
        z(1.5)
    ]);
    diskContainer.add([
        rect(24, 2),
        anchor("center"),
        color(0, 240, 255),
        opacity(0.4),
        z(1.5)
    ]);

    // Pulsing Core Core (Center magenta diamond)
    const core = diskContainer.add([
        rect(10, 10, { radius: 1 }),
        anchor("center"),
        rotate(45),
        color(255, 0, 127),
        z(2)
    ]);
    core.onUpdate(() => {
        core.opacity = map(Math.sin(time() * 10), -1, 1, 0.4, 1.0);
    });

    // 2. GYRO-STABILIZED VISOR (Direct child of guy, stays horizontal)
    const visor = guy.add([
        rect(18, 6, { radius: 3 }),
        pos(0, -12), // Stays at center height
        anchor("center"),
        C_BODY,
        outline(1.5, C_OUTLINE),
        z(3)
    ]);
    const visorLight = visor.add([
        rect(12, 2),
        anchor("center"),
        color(0, 240, 255),
        z(3.5)
    ]);
    visorLight.onUpdate(() => {
        visorLight.opacity = map(Math.sin(time() * 8), -1, 1, 0.6, 1.0);
    });

    // --- UPDATE LOOP ---
    guy.facingLeft = false;
    let lastTrailPos = vec2(x, y);

    guy.onUpdate(() => {
        let isMoving = false;

        // Safety check: key listener when tab active
        if (!document.hasFocus()) return;

        // Horizontal movement
        if (isKeyDown("left") && guy.pos.x > 10) {
            guy.move(-SPEED, 0);
            isMoving = true;
            guy.facingLeft = true;
        }
        const rightLimit = guy.levelWidth || (width() - 10);
        if (isKeyDown("right") && guy.pos.x < rightLimit) {
            guy.move(SPEED, 0);
            isMoving = true;
            guy.facingLeft = false;
        }

        // --- DISK ROLL ROTATION ---
        if (isMoving) {
            const rollDirection = guy.facingLeft ? -1 : 1;
            diskContainer.angle += rollDirection * dt() * 600;
        } else {
            // Idle breathing scale bobbing
            diskContainer.scale = vec2(1 + Math.sin(time() * 4) * 0.03);
        }

        // --- SOLID NEON TRAIL PLATFORMS (Organic Fluid Droplets) ---
        if (guy.pos.dist(lastTrailPos) > 20) {
            const C_TRAIL = (time() % 1.5 > 0.75) ? rgb(0, 240, 255) : rgb(255, 0, 127);
            const currentPos = vec2(lastTrailPos.x, lastTrailPos.y);

            // 1. Solid Hitbox (Flat & thin for perfect gameplay collisions, invisible)
            const trailSeg = add([
                rect(12, 5),
                pos(currentPos.x, currentPos.y),
                anchor("bot"),
                opacity(0), // Hitbox is invisible
                area(),
                body({ isStatic: true }),
                z(12),
                "trail_platform"
            ]);

            // 2. Liquid Wobbly Visual Blob (Pulsing, jelly-like droplet)
            const visualBlob = add([
                rect(14, 14, { radius: 7 }), // Perfect circle
                pos(currentPos.x, currentPos.y - 4),
                anchor("center"),
                color(C_TRAIL),
                scale(1), // Adds scale tracking component
                opacity(0.85),
                z(11) // Behind the player, in front of background
            ]);

            // Inner high-density fluid core
            const innerCore = visualBlob.add([
                rect(6, 6, { radius: 3 }),
                anchor("center"),
                color(255, 255, 255),
                opacity(0.8),
                z(1)
            ]);

            // Jelly wobble script: squash & stretch
            const phaseOffset = rand(0, Math.PI * 2);
            let scaleMult = 1.0;
            visualBlob.onUpdate(() => {
                const t = time() * 12 + phaseOffset;
                visualBlob.scale = vec2(
                    1.0 + Math.sin(t) * 0.22,
                    1.0 - Math.sin(t) * 0.22
                ).scale(scaleMult);
            });

            // 3. Fading and shrinking lifetime
            tween(1.0, 0, 1.2, (val) => {
                visualBlob.opacity = val * 0.85;
                innerCore.opacity = val * 0.8;
                scaleMult = val; // Smoothly shrink the droplet visually
            }, easings.easeInQuad).onEnd(() => {
                destroy(trailSeg);
                destroy(visualBlob);
            });


            // 4. Dripping Liquid Drops
            const numDrops = randi(1, 3);
            for (let i = 0; i < numDrops; i++) {
                const dropColor = C_TRAIL;
                const dropSize = rand(2, 4);
                const drop = add([
                    rect(dropSize, dropSize, { radius: dropSize / 2 }),
                    pos(currentPos.x + rand(-6, 6), currentPos.y - 6),
                    anchor("center"),
                    color(dropColor),
                    opacity(0.85),
                    z(10),
                    "dripping_drop"
                ]);

                const dropSpeedY = rand(40, 70);
                const driftSpeedX = rand(-15, 15);
                const dropWobbleFreq = rand(8, 14);

                drop.onUpdate(() => {
                    drop.pos.y += dt() * dropSpeedY;
                    drop.pos.x += Math.sin(time() * dropWobbleFreq) * dt() * driftSpeedX;
                    drop.opacity -= dt() * 0.9;
                    if (drop.opacity <= 0) {
                        destroy(drop);
                    }
                });
            }

            lastTrailPos = guy.pos;
        }


        // --- FLUID PHYSICS INTERACTION ---
        const px = guy.pos.x - (camPos().x - width() / 2);
        const py = guy.pos.y - (camPos().y - height() / 2);

        if (window.fluidEmitters) {
            window.fluidEmitters.forEach(e => {
                if (e.type === "column") {
                    if (Math.abs(px - e.x) < e.radius && py <= e.y) {
                        guy.move(e.dx * e.force, e.dy * e.force);
                    }
                } else {
                    const dx = px - e.x;
                    const dy = py - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < e.radius) {
                        guy.move(e.dx * e.force, e.dy * e.force);
                    }
                }
            });
        }

        if (window.fluidVortexes) {
            window.fluidVortexes.forEach(v => {
                const dx = v.x - px;
                const dy = v.y - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < v.radius) {
                    const pullFactor = (1.0 - (dist / v.radius)) * v.force;
                    guy.move((dx / dist) * pullFactor, (dy / dist) * pullFactor);
                }
            });
        }

        if (window.triggerFluidSplat) {
            const lastScreen = guy.lastScreenPos || { x: px, y: py };
            const sdx = (px - lastScreen.x) / width();
            const sdy = (py - lastScreen.y) / height();
            guy.lastScreenPos = { x: px, y: py };

            const speedSq = sdx * sdx + sdy * sdy;
            if (speedSq > 0.000001) {
                const ux = px / width();
                const uy = py / height();
                const col = (time() % 1.5 > 0.75) ? [0.0, 0.9, 1.0] : [1.0, 0.0, 0.5];
                window.triggerFluidSplat(ux, 1.0 - uy, sdx, sdy, col, 0.0015);
            }
        }

        // Particle trail
        if (isMoving && rand() > 0.6) {
            const particleX = guy.pos.x + rand(-6, 6);
            const particleY = guy.pos.y - rand(2, 10);
            const trailColor = (rand() > 0.5) ? rgb(0, 240, 255) : rgb(255, 0, 127);
            const pSize = rand(2, 4);
            const trail = add([
                pos(particleX, particleY),
                rect(pSize, pSize),
                color(trailColor),
                opacity(0.8),
                z(18),
                "trail"
            ]);
            trail.onUpdate(() => {
                trail.opacity -= dt() * 2.5;
                trail.pos.y -= dt() * 15;
                if (trail.opacity <= 0) {
                    destroy(trail);
                }
            });
        }

        // Jump Controls
        if ((isKeyPressed("space") || isKeyPressed("up")) && guy.isGrounded()) {
            guy.jump(JUMP);
            if (window.SFX) window.SFX.playJump();
            if (window.triggerFluidSplat) {
                window.triggerFluidSplat(px / width(), 1.0 - (py / height()), 0, 0.25, [1.0, 0.0, 0.5], 0.0035);
            }
            // STRETCH: Tall and Thin
            guy.scale = vec2(0.8, 1.2);
            tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
        }

        // Shadow scale in air
        if (!guy.isGrounded()) {
            shadow.scale = vec2(0.6, 0.6);
            shadow.opacity = 0.15;
        } else {
            shadow.scale = vec2(1, 1);
            shadow.opacity = 0.3;
        }

        // Directional visual flipping
        const currentScaleX = Math.abs(guy.scale.x);
        guy.scale.x = guy.facingLeft ? -currentScaleX : currentScaleX;
    });

    // Landing Squash
    guy.onGround(() => {
        guy.scale = vec2(1.2, 0.8);
        tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutElastic);
        shake(1);
    });

    return guy;
}
