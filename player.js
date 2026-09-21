function createPlayer(x, y) {
    // CONSTANTS
    const SPEED = 200;
    const JUMP = 550;

    // PLAYER OBJECT
    // Pillar 1 & 2: Match player 2D physics hitbox to rect(36, 70) with anchor("bot")
    const guy = add([
        pos(x, y),
        rect(36, 70),
        area(),
        anchor("bot"),
        rotate(0), // Added for spin transition
        scale(1),  // Added for suck transition
        opacity(0), // Hitbox is invisible
        z(20),
        "guy"
    ]);

    // Explicit vertical velocity and physics state
    guy.vy = 0;
    guy.grounded = false;
    guy.currentRail = null;
    guy.facingLeft = false;
    guy.isMovingThisFrame = false; // Expose to engine

    guy.isGrounded = () => guy.grounded;

    const groundCallbacks = [];
    guy.onGround = (cb) => {
        groundCallbacks.push(cb);
    };

    guy.triggerGround = (rail) => {
        guy.grounded = true;
        guy.currentRail = rail;
        guy.vy = 0;
        groundCallbacks.forEach(cb => {
            try { cb(rail); } catch (e) { console.error(e); }
        });
        guy.trigger("ground", rail);
    };

    guy.jump = (force) => {
        guy.vy = -(force || JUMP);
        guy.grounded = false;
        guy.currentRail = null;
    };

    // Maintain explicit vertical velocity (vy) with proper zeroing on landing, spawn, and respawn
    Object.defineProperty(guy, "vel", {
        get() {
            return {
                x: 0,
                get y() { return guy.vy; },
                set y(val) { guy.vy = val; }
            };
        },
        set(v) {
            if (v && typeof v.y === "number") {
                guy.vy = v.y;
            }
        },
        configurable: true
    });

    // --- UPDATE LOOP ---
    guy.onUpdate(() => {
        // 1. Movement & Input
        let isMoving = guy.isMovingThisFrame;
        guy.isMovingThisFrame = false; // Reset for next frame

        // Safety: Prevent sticky keys running when window loses focus
        if (!document.hasFocus()) return;

        if (window.controlMode === 'manual') {
            if (isKeyDown("left") || isKeyDown("a") || window.mobileLeftDown) {
                guy.move(-SPEED, 0);
                isMoving = true;
                guy.facingLeft = true;
            }
            if (isKeyDown("right") || isKeyDown("d") || window.mobileRightDown) {
                guy.move(SPEED, 0);
                isMoving = true;
                guy.facingLeft = false;
            }

            if ((isKeyPressed("space") || isKeyPressed("w") || isKeyPressed("up") || window.mobileJumpPressed) && guy.isGrounded()) {
                guy.jump(JUMP);
                if (window.SFX && window.SFX.playJump) window.SFX.playJump();
                guy.scale = vec2(0.8, 1.2);
                tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
            }
            window.mobileJumpPressed = false;
        }

        guy.isMovingThisFrame = isMoving;

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
        if (typeof shake === "function") shake(1); // Tiny thud feeling
    });

    return guy;
}
