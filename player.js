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
    let lastAirJumpTime = 0;

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

        // Safety: Prevent sticky keys running when window loses focus, but allow active key presses and touch controls
        const hasFocus = typeof document !== "undefined" && typeof document.hasFocus === "function" ? document.hasFocus() : true;
        const hasActiveKeys = (typeof window !== "undefined" && typeof window.isPhysicalKeyDown === "function") && (
            window.isPhysicalKeyDown("left") || window.isPhysicalKeyDown("right") ||
            window.isPhysicalKeyDown("up") || window.isPhysicalKeyDown("down") ||
            window.isPhysicalKeyDown("space") ||
            window.isPhysicalKeyDown("a") || window.isPhysicalKeyDown("d") || window.isPhysicalKeyDown("w") || window.isPhysicalKeyDown("s")
        );
        if (!hasFocus && !hasActiveKeys && !window.mobileLeftDown && !window.mobileRightDown && !window.mobileJumpPressed) return;

        const activeEl = document.activeElement;
        const isTyping = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT" || activeEl.isContentEditable);

        if (window.controlMode === 'manual' && !isTyping) {
            const hasLeft = (typeof isKeyDown === "function" && (isKeyDown("left") || isKeyDown("a"))) ||
                (typeof window.isPhysicalKeyDown === "function" && (window.isPhysicalKeyDown("left") || window.isPhysicalKeyDown("a"))) ||
                Boolean(window.mobileLeftDown);
            const hasRight = (typeof isKeyDown === "function" && (isKeyDown("right") || isKeyDown("d"))) ||
                (typeof window.isPhysicalKeyDown === "function" && (window.isPhysicalKeyDown("right") || window.isPhysicalKeyDown("d"))) ||
                Boolean(window.mobileRightDown);
            const hasJump = (typeof isKeyPressed === "function" && (isKeyPressed("space") || isKeyPressed("w") || isKeyPressed("up"))) ||
                Boolean(window.mobileJumpPressed);

            if (hasLeft) {
                guy.move(-SPEED, 0);
                isMoving = true;
                guy.facingLeft = true;
            }
            if (hasRight) {
                guy.move(SPEED, 0);
                isMoving = true;
                guy.facingLeft = false;
            }

            if (hasJump) {
                if (guy.isGrounded()) {
                    guy.jump(JUMP);
                    if (window.SFX && window.SFX.playJump) window.SFX.playJump(guy.pos.x);
                    guy.scale = vec2(0.8, 1.2);
                    tween(guy.scale, vec2(1, 1), 0.2, (val) => guy.scale = val, easings.easeOutQuad);
                    lastAirJumpTime = 0;
                } else {
                    const now = (typeof performance !== "undefined") ? performance.now() : Date.now();
                    if (lastAirJumpTime > 0 && (now - lastAirJumpTime < 450)) {
                        const arch = window.AstromechArchitect || (window.Player3D && window.Player3D.architect);
                        if (arch && typeof arch.constructPlatform === "function") {
                            arch.constructPlatform(guy, window.landingRails);
                        }
                        lastAirJumpTime = 0;
                    } else {
                        lastAirJumpTime = now;
                    }
                }
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
        if (window.SFX && typeof window.SFX.playLand === "function") {
            window.SFX.playLand(guy.pos.x);
        }
        if (typeof window !== "undefined" && window.Engine3D && typeof window.Engine3D.triggerImpact === "function") {
            const fallSpeed = Math.abs(guy.vy || 0);
            const intensity = fallSpeed > 300 ? Math.min(2.0, fallSpeed / 350) : 0.65;
            window.Engine3D.triggerImpact(intensity);
        }
    });

    return guy;
}
