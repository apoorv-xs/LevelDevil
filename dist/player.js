function createPlayer(x, y) {
    // CONSTANTS
    const SPEED = 200;
    const JUMP = 550;

    // PLAYER OBJECT
    const guy = add([
        pos(x, y),
        rect(20, 40),
        area(),
        body(),
        anchor("bot"),
        rotate(0), // Added for spin transition
        scale(1),  // Added for suck transition
        opacity(0), // Hitbox is invisible
        z(20),
        "guy"
    ]);

    // --- VISUALS ---

    // Shadow
    const shadow = guy.add([
        rect(16, 6),
        anchor("center"),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0.3),
        z(-1) // Behind/Below player
    ]);

    const skin = color(44, 44, 44);

    // Body
    const torso = guy.add([
        rect(16, 20),
        pos(0, -14),
        anchor("bot"),
        skin
    ]);

    // Head
    const head = guy.add([
        rect(12, 12),
        pos(0, -34),
        anchor("bot"),
        skin
    ]);

    // Arms
    const lArm = guy.add([
        rect(6, 16),
        pos(-6, -30),
        anchor("top"),
        skin
    ]);
    const rArm = guy.add([
        rect(6, 16),
        pos(6, -30),
        anchor("top"),
        skin
    ]);

    // Legs
    const lLeg = guy.add([
        rect(6, 18),
        pos(-4, -18),
        anchor("top"),
        skin
    ]);
    const rLeg = guy.add([
        rect(6, 18),
        pos(4, -18),
        anchor("top"),
        skin
    ]);

    // --- UPDATE LOOP ---
    guy.onUpdate(() => {
        // 1. Movement & Input
        let isMoving = false;

        // Note: isKeyDown/isKeyPressed are global Kaboom functions
        if (isKeyDown("left") && guy.pos.x > 10) {
            guy.move(-SPEED, 0);
            isMoving = true;
        }
        // Limit right movement: use custom levelWidth if set, otherwise default to screen width
        const rightLimit = guy.levelWidth || (width() - 10);
        if (isKeyDown("right") && guy.pos.x < rightLimit) {
            guy.move(SPEED, 0);
            isMoving = true;
        }

        if (isKeyPressed("space") && guy.isGrounded()) {
            guy.jump(JUMP);
            // STRETCH: Tall and Thin
            guy.scale = vec2(0.8, 1.2);
            tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
        }
        if (isKeyPressed("up") && guy.isGrounded()) {
            guy.jump(JUMP);
            // STRETCH: Tall and Thin
            guy.scale = vec2(0.8, 1.2);
            tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
        }

        // 2. Animation
        if (!guy.isGrounded() && !guy.isOnRamp) {
            // Jump Pose
            lLeg.angle = 45;
            rLeg.angle = -45;
            // Arms Up Sideways ("Cheer" Pose)
            lArm.angle = 135;
            rArm.angle = -135;
        } else if (isMoving) {
            // Run Cycle (Sine Wave)
            const t = time() * 15;
            lLeg.angle = Math.sin(t) * 45;
            rLeg.angle = Math.sin(t + Math.PI) * 45;
            lArm.angle = Math.sin(t + Math.PI) * 45;
            rArm.angle = Math.sin(t) * 45;
        } else {
            // Idle (Subtle Breathing)
            lLeg.angle = 0;
            rLeg.angle = 0;
            lArm.angle = Math.sin(time() * 2) * 5;
            rArm.angle = -Math.sin(time() * 2) * 5;
            head.pos.y = -34 + Math.sin(time() * 5) * 1; // Bobbing head
        }

        // 3. Shadow Logic (Dynamic sizing based on height)
        if (!guy.isGrounded()) {
            // Shrink when in air
            const heightOffset = Math.min(Math.abs(guy.pos.y), 100) / 100; // Rough estimation if needed, or just simpler
            // Just hardcode shrink for jump state for simplicity as we don't strictly track floor distance easily everywhere
            shadow.scale = vec2(0.6, 0.6);
            shadow.opacity = 0.15;
        } else {
            // Shadow reset on ground
            shadow.scale = vec2(1, 1);
            shadow.opacity = 0.3;
        }
    });

    // --- SQUASH AND STRETCH EVENTS ---
    // Land (Squash)
    guy.onGround(() => {
        // SQUASH: Short and Wide
        guy.scale = vec2(1.2, 0.8);
        tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutElastic);
        shake(1); // Tiny thud feeling
    });

    return guy;
}
