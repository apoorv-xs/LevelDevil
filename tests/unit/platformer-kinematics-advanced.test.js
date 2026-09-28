import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 3: Platformer Kinematics (Coyote Time, Jump Buffering & Ledges)", () => {
  describe("3.1 Coyote Time (Grace Period on Ledge Walk-off)", () => {
    function createCoyoteEngine(coyoteDurationMs = 80) {
      let isGrounded = true;
      let lastGroundedTime = 0;
      let vy = 0;
      let hasJumped = false;

      return {
        step: (nowMs, groundedState) => {
          if (groundedState) {
            isGrounded = true;
            lastGroundedTime = nowMs;
            hasJumped = false;
          } else {
            isGrounded = false;
          }
        },
        attemptJump: (nowMs, jumpForce = -350) => {
          const withinCoyoteWindow = !hasJumped && (nowMs - lastGroundedTime <= coyoteDurationMs);
          if (isGrounded || withinCoyoteWindow) {
            vy = jumpForce;
            hasJumped = true;
            isGrounded = false;
            return { success: true, vy };
          }
          return { success: false, vy };
        },
        getState: () => ({ isGrounded, vy, hasJumped })
      };
    }

    it("allows jumping immediately while firmly grounded", () => {
      const engine = createCoyoteEngine(80);
      engine.step(1000, true);
      const res = engine.attemptJump(1000);
      expect(res.success).toBe(true);
      expect(res.vy).toBe(-350);
    });

    it("allows jumping within 80ms coyote grace window after walking off a ledge", () => {
      const engine = createCoyoteEngine(80);
      engine.step(1000, true);
      engine.step(1010, false); // Walks off ledge at t = 1010ms

      // Attempt jump at t = 1050ms (40ms after losing ground contact -> within 80ms window)
      const res = engine.attemptJump(1050);
      expect(res.success).toBe(true);
      expect(res.vy).toBe(-350);
    });

    it("blocks jumping when attempted after coyote time has expired (e.g. 100ms later)", () => {
      const engine = createCoyoteEngine(80);
      engine.step(1000, true);
      engine.step(1010, false); // Walks off ledge at t = 1010ms

      // Attempt jump at t = 1100ms (90ms after losing ground contact -> exceeds 80ms window)
      const res = engine.attemptJump(1100);
      expect(res.success).toBe(false);
      expect(res.vy).toBe(0);
    });

    it("prevents double jumping from mid-air using coyote window twice", () => {
      const engine = createCoyoteEngine(80);
      engine.step(1000, true);
      engine.step(1010, false);

      const firstJump = engine.attemptJump(1030);
      expect(firstJump.success).toBe(true);

      const secondJump = engine.attemptJump(1050);
      expect(secondJump.success).toBe(false);
    });
  });

  describe("3.2 Jump Buffering (Pre-Landing Input Queue)", () => {
    function createJumpBufferEngine(bufferDurationMs = 50) {
      let bufferedJumpTime = null;
      let isGrounded = false;
      let vy = 0;

      return {
        pressJump: (nowMs) => {
          bufferedJumpTime = nowMs;
        },
        touchdown: (nowMs, jumpForce = -350) => {
          isGrounded = true;
          if (bufferedJumpTime !== null && (nowMs - bufferedJumpTime <= bufferDurationMs)) {
            vy = jumpForce;
            bufferedJumpTime = null;
            isGrounded = false; // Immediately airborne
            return { consumedBuffer: true, vy };
          }
          return { consumedBuffer: false, vy };
        },
        getState: () => ({ isGrounded, vy, bufferedJumpTime })
      };
    }

    it("consumes buffered jump input if landing occurs within 50ms of button press", () => {
      const engine = createJumpBufferEngine(50);
      engine.pressJump(2000); // User presses jump while still 20px above ground

      // Lands 30ms later at t = 2030ms
      const res = engine.touchdown(2030);
      expect(res.consumedBuffer).toBe(true);
      expect(res.vy).toBe(-350);
      expect(engine.getState().bufferedJumpTime).toBeNull();
    });

    it("discards buffered jump input if landing occurs more than 50ms after button press", () => {
      const engine = createJumpBufferEngine(50);
      engine.pressJump(2000);

      // Lands 80ms later at t = 2080ms (stale buffer)
      const res = engine.touchdown(2080);
      expect(res.consumedBuffer).toBe(false);
      expect(res.vy).toBe(0);
      expect(engine.getState().isGrounded).toBe(true);
    });
  });

  describe("3.3 Variable Jump Height & Apex Gravity Damping", () => {
    function simulateJumpStep(state, isHoldingJump, dt = 0.016) {
      let { vy, gravity } = state;

      // Variable jump: when releasing jump early during ascent, double effective gravity
      if (!isHoldingJump && vy < 0) {
        gravity *= 1.8;
      }

      // Apex damping: near jump peak (|vy| < 25), reduce gravity by 30% for floaty responsiveness
      if (Math.abs(vy) < 25) {
        gravity *= 0.7;
      }

      vy += gravity * dt;
      return { vy, gravity };
    }

    it("cuts vertical velocity faster when jump key is released early (short hop)", () => {
      const baseGravity = 800;
      const initialVy = -350;

      // Full hold jump for 5 frames
      let holdState = { vy: initialVy, gravity: baseGravity };
      for (let i = 0; i < 5; i++) {
        holdState = simulateJumpStep(holdState, true, 0.016);
      }

      // Early release jump for 5 frames
      let releaseState = { vy: initialVy, gravity: baseGravity };
      for (let i = 0; i < 5; i++) {
        releaseState = simulateJumpStep(releaseState, false, 0.016);
      }

      // Release state should have ascended less (vy closer to 0 / positive)
      expect(releaseState.vy).toBeGreaterThan(holdState.vy);
    });

    it("applies apex floatiness when vertical velocity is near zero", () => {
      const apexState = simulateJumpStep({ vy: 5, gravity: 800 }, true, 0.016);
      expect(apexState.gravity).toBeCloseTo(800 * 0.7, 1);
    });
  });

  describe("3.4 Rail Seam Crossing & Surface Overlap Stability", () => {
    function resolveRailGrounding(playerX, playerY, rails) {
      // Find all overlapping rails beneath player within vertical snap tolerance (8px)
      const matching = rails.filter((r) => {
        return playerX >= r.xLeft - 10 && playerX <= r.xRight + 10 && Math.abs(r.y - playerY) <= 8;
      });

      if (matching.length === 0) return null;

      // Pick highest rail (smallest Y value in screen coordinates)
      matching.sort((a, b) => a.y - b.y);
      return matching[0];
    }

    it("smoothly transitions across adjacent rail seam with 0px gap without falling", () => {
      const railA = { name: "RAIL_A", xLeft: 100, xRight: 250, y: 1200 };
      const railB = { name: "RAIL_B", xLeft: 250, xRight: 400, y: 1200 };
      const rails = [railA, railB];

      // At seam (x = 250)
      const groundedAtSeam = resolveRailGrounding(250, 1200, rails);
      expect(groundedAtSeam).not.toBeNull();
      expect(groundedAtSeam.y).toBe(1200);

      // Firmly on Rail B (x = 270)
      const groundedOnRailB = resolveRailGrounding(270, 1200, rails);
      expect(groundedOnRailB).not.toBeNull();
      expect(groundedOnRailB.name).toBe("RAIL_B");
    });

    it("resolves to highest surface when a hard-light construct platform overlaps a DOM rail", () => {
      const domRail = { name: "DOM_CARD_TOP", xLeft: 100, xRight: 400, y: 1500 };
      const hardLightRail = { name: "HARD_LIGHT_PLATFORM", xLeft: 150, xRight: 310, y: 1496 }; // 4px above
      const rails = [domRail, hardLightRail];

      const grounded = resolveRailGrounding(200, 1498, rails);
      expect(grounded).not.toBeNull();
      expect(grounded.name).toBe("HARD_LIGHT_PLATFORM");
      expect(grounded.y).toBe(1496);
    });
  });

  describe("3.5 Infinite Chasm Watchdog & Out-of-Bounds Respawn", () => {
    function checkWatchdogBounds(pos, lastKnownSafePos, bottomCeiling = 10000) {
      if (pos.y > bottomCeiling || pos.x < -200 || pos.x > 3000) {
        return {
          tripped: true,
          respawnPos: { x: lastKnownSafePos.x, y: lastKnownSafePos.y - 10 },
          resetVy: 0
        };
      }
      return { tripped: false, respawnPos: pos, resetVy: null };
    }

    it("triggers watchdog respawn when player falls beyond y = 10,000", () => {
      const safePos = { x: 300, y: 2400 };
      const fallenPos = { x: 300, y: 10500 };

      const watchdog = checkWatchdogBounds(fallenPos, safePos);
      expect(watchdog.tripped).toBe(true);
      expect(watchdog.respawnPos.y).toBe(2390);
      expect(watchdog.resetVy).toBe(0);
    });

    it("triggers watchdog respawn when player horizontal position clips beyond left screen edge", () => {
      const safePos = { x: 200, y: 500 };
      const clippedPos = { x: -350, y: 500 };

      const watchdog = checkWatchdogBounds(clippedPos, safePos);
      expect(watchdog.tripped).toBe(true);
      expect(watchdog.respawnPos.x).toBe(200);
    });

    it("does not trip watchdog when player is within legitimate stage boundaries", () => {
      const safePos = { x: 400, y: 1200 };
      const normalPos = { x: 450, y: 1350 };

      const watchdog = checkWatchdogBounds(normalPos, safePos);
      expect(watchdog.tripped).toBe(false);
      expect(watchdog.respawnPos.y).toBe(1350);
    });
  });
});
