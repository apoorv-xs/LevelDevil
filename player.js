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
    // (Omitted: Babylon.js 3D character takes over visuals)

        // --- UPDATE LOOP ---
    guy.facingLeft = false;
    guy.isMovingThisFrame = false; // Expose to engine
    
    guy.onUpdate(() => {
        // 1. Movement & Input
        let isMoving = guy.isMovingThisFrame;
        guy.isMovingThisFrame = false; // Reset for next frame

        // Safety: Prevent sticky keys running when window loses focus
        if (!document.hasFocus()) return;

        if (window.controlMode === 'manual') {
            if (isKeyDown("left") || isKeyDown("a")) {
                guy.move(-SPEED, 0);
                isMoving = true;
                guy.facingLeft = true;
            }
            if (isKeyDown("right") || isKeyDown("d")) {
                guy.move(SPEED, 0);
                isMoving = true;
                guy.facingLeft = false;
            }

            if ((isKeyPressed("space") || isKeyPressed("w") || isKeyPressed("up")) && guy.isGrounded()) {
                guy.jump(JUMP);
                if (window.SFX) window.SFX.playJump();
                guy.scale = vec2(0.8, 1.2);
                tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
            }
        }

        // (Omitted: Babylon.js handles 3D animations)

        // 4. Directional Flipping
        const currentScaleX = Math.abs(guy.scale.x);
        guy.scale.x = guy.facingLeft ? -currentScaleX : currentScaleX;
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
