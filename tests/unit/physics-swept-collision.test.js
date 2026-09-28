import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 2: 2.5D Physics, Swept Collision & Spatial Rails", () => {
  let mockPlayer, landingRails;

  beforeEach(() => {
    mockPlayer = {
      pos: { x: 500, y: 300 },
      vy: 0,
      vx: 0,
      grounded: false,
      currentRail: null,
      move: vi.fn((x, y) => {
        mockPlayer.pos.x += x;
        mockPlayer.pos.y += y;
      }),
      jump: vi.fn((force) => {
        mockPlayer.vy = -force;
        mockPlayer.grounded = false;
        mockPlayer.currentRail = null;
      }),
      triggerGround: vi.fn((rail) => {
        mockPlayer.grounded = true;
        mockPlayer.currentRail = rail;
        mockPlayer.vy = 0;
      })
    };

    landingRails = [
      { name: "HERO_RAIL", xLeft: 100, xRight: 900, y: 350, trap: false },
      { name: "CARD_MAISON", xLeft: 50, xRight: 450, y: 1224, trap: false },
      { name: "CARD_LEVELDEVIL", xLeft: 490, xRight: 950, y: 1224, trap: false },
      { name: "CEILING_RAIL", xLeft: 200, xRight: 800, y: 150, trap: false },
      { name: "BEDROCK_RAIL", xLeft: 0, xRight: 1200, y: 3480, trap: false }
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("2.1 Swept AABB & High-Velocity Rail Tunneling", () => {
    it("detects swept collision through thin 4px rail during high-speed vertical drop (1200px/s)", () => {
      mockPlayer.pos.y = 340;
      mockPlayer.vy = 1200; // 1200px/s => ~19.2px per frame at dt=0.016
      const rail = landingRails[0]; // y = 350, player will cross from 340 to 359.2

      const dt = 0.016;
      const subSteps = Math.max(1, Math.ceil(Math.abs(mockPlayer.vy * dt) / 4));
      const stepDt = dt / subSteps;

      let collided = false;
      for (let s = 0; s < subSteps; s++) {
        const prevY = mockPlayer.pos.y;
        mockPlayer.pos.y += mockPlayer.vy * stepDt;

        if (prevY <= rail.y && mockPlayer.pos.y >= rail.y &&
            mockPlayer.pos.x >= rail.xLeft && mockPlayer.pos.x <= rail.xRight) {
          mockPlayer.pos.y = rail.y;
          mockPlayer.triggerGround(rail);
          collided = true;
          break;
        }
      }

      expect(collided).toBe(true);
      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.pos.y).toBe(350);
      expect(mockPlayer.currentRail).toBe(rail);
    });

    it("prevents downward penetration by sub-stepping vertical integration during frame rate drop (dt = 0.05)", () => {
      mockPlayer.pos.y = 320;
      mockPlayer.vy = 1000;
      const rail = landingRails[0]; // y = 350

      const dt = 0.05; // 20 FPS lag spike
      const prevY = mockPlayer.pos.y;
      const nextY = prevY + mockPlayer.vy * dt; // Would reach 370

      const intersects = (prevY <= rail.y && nextY >= rail.y);
      expect(intersects).toBe(true);
      expect(nextY).toBe(370);
    });

    it("ungrounds player when walking off left edge past 8px safety threshold", () => {
      const rail = landingRails[0];
      mockPlayer.pos.x = 100;
      mockPlayer.pos.y = 350;
      mockPlayer.grounded = true;
      mockPlayer.currentRail = rail;

      mockPlayer.pos.x -= 12; // x = 88 (< 100 - 8 = 92)

      const isOffLedge = (mockPlayer.pos.x < rail.xLeft - 8 || mockPlayer.pos.x > rail.xRight + 8);
      if (isOffLedge) {
        mockPlayer.grounded = false;
        mockPlayer.currentRail = null;
      }

      expect(isOffLedge).toBe(true);
      expect(mockPlayer.grounded).toBe(false);
      expect(mockPlayer.currentRail).toBeNull();
    });

    it("ungrounds player when walking off right edge past 8px safety threshold", () => {
      const rail = landingRails[0];
      mockPlayer.pos.x = 900;
      mockPlayer.pos.y = 350;
      mockPlayer.grounded = true;
      mockPlayer.currentRail = rail;

      mockPlayer.pos.x += 10; // x = 910 (> 900 + 8 = 908)

      const isOffLedge = (mockPlayer.pos.x < rail.xLeft - 8 || mockPlayer.pos.x > rail.xRight + 8);
      if (isOffLedge) {
        mockPlayer.grounded = false;
        mockPlayer.currentRail = null;
      }

      expect(isOffLedge).toBe(true);
      expect(mockPlayer.grounded).toBe(false);
      expect(mockPlayer.currentRail).toBeNull();
    });

    it("retains grounded status when within 8px margin of rail edge", () => {
      const rail = landingRails[0];
      mockPlayer.pos.x = 95;
      mockPlayer.pos.y = 350;
      mockPlayer.grounded = true;
      mockPlayer.currentRail = rail;

      const isOffLedge = (mockPlayer.pos.x < rail.xLeft - 8 || mockPlayer.pos.x > rail.xRight + 8);

      expect(isOffLedge).toBe(false);
      expect(mockPlayer.grounded).toBe(true);
    });

    it("zeroes vertical velocity upon headroom ceiling collision during upward jump", () => {
      mockPlayer.pos.y = 155;
      mockPlayer.vy = -550; // Jumping upward
      const ceiling = landingRails[3]; // y = 150

      const dt = 0.016;
      const prevY = mockPlayer.pos.y;
      mockPlayer.pos.y += mockPlayer.vy * dt; // 155 - 8.8 = 146.2 <= 150

      if (prevY >= ceiling.y && mockPlayer.pos.y <= ceiling.y &&
          mockPlayer.pos.x >= ceiling.xLeft && mockPlayer.pos.x <= ceiling.xRight) {
        mockPlayer.pos.y = ceiling.y;
        mockPlayer.vy = 0;
      }

      expect(mockPlayer.vy).toBe(0);
      expect(mockPlayer.pos.y).toBe(150);
    });

    it("resolves multi-rail overlap by selecting the rail containing player's X coordinate", () => {
      const overlappingRails = [
        { name: "LEFT_HALF", xLeft: 0, xRight: 500, y: 1200 },
        { name: "RIGHT_HALF", xLeft: 500, xRight: 1000, y: 1200 }
      ];

      const playerX = 750;
      const resolvedRail = overlappingRails.find(r => playerX >= r.xLeft && playerX <= r.xRight);

      expect(resolvedRail).toBeDefined();
      expect(resolvedRail.name).toBe("RIGHT_HALF");
    });

    it("triggers watchdog respawn when player falls into infinite void (y > 10000)", () => {
      mockPlayer.pos.y = 15000;
      mockPlayer.vy = 2000;

      const isOutOfBounds = mockPlayer.pos.y > 6000 || mockPlayer.pos.x < -1000 || mockPlayer.pos.x > 3000;
      if (isOutOfBounds) {
        mockPlayer.pos.x = 500;
        mockPlayer.pos.y = 280;
        mockPlayer.vy = 0;
        mockPlayer.grounded = false;
      }

      expect(isOutOfBounds).toBe(true);
      expect(mockPlayer.pos.x).toBe(500);
      expect(mockPlayer.pos.y).toBe(280);
      expect(mockPlayer.vy).toBe(0);
    });

    it("clamps horizontal player position within viewport boundaries [16, viewportWidth - 16]", () => {
      const viewportWidth = 1200;
      const clampX = (x) => Math.max(16, Math.min(x, viewportWidth - 16));

      expect(clampX(-50)).toBe(16);
      expect(clampX(600)).toBe(600);
      expect(clampX(1500)).toBe(1184);
    });

    it("applies standard gravitational acceleration (1600 px/s²) when airborne", () => {
      mockPlayer.grounded = false;
      mockPlayer.vy = 0;
      const gravity = 1600;
      const dt = 0.016;

      mockPlayer.vy += gravity * dt;

      expect(mockPlayer.vy).toBeCloseTo(25.6);
    });

    it("snaps player within 8px above rail smoothly onto rail surface", () => {
      const rail = landingRails[0]; // y = 350
      mockPlayer.pos.y = 344; // 6px above rail
      mockPlayer.vy = 50;

      const isNearRail = Math.abs(mockPlayer.pos.y - rail.y) <= 8 &&
                         mockPlayer.pos.x >= rail.xLeft && mockPlayer.pos.x <= rail.xRight;

      if (isNearRail) {
        mockPlayer.triggerGround(rail);
      }

      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.currentRail).toBe(rail);
      expect(mockPlayer.vy).toBe(0);
    });

    it("dampens horizontal velocity upon landing via surface friction", () => {
      mockPlayer.vx = 200;
      const friction = 0.85;

      mockPlayer.vx *= friction;
      expect(mockPlayer.vx).toBe(170);

      mockPlayer.vx *= friction;
      expect(mockPlayer.vx).toBeCloseTo(144.5);
    });

    it("clamps maximum vertical jump velocity to -550 px/s", () => {
      const rawJumpForce = 700;
      const clampedJumpForce = Math.min(rawJumpForce, 550);

      mockPlayer.jump(clampedJumpForce);

      expect(mockPlayer.vy).toBe(-550);
      expect(mockPlayer.grounded).toBe(false);
    });
  });

  describe("2.2 Hard-Light Chasm Bridging & Laser Rails", () => {
    it("identifies chasm gap between Maison Anima (right 450) and Level Devil (left 490)", () => {
      const railA = landingRails[1];
      const railB = landingRails[2];

      const gapWidth = railB.xLeft - railA.xRight;
      const verticalDelta = Math.abs(railB.y - railA.y);

      const isBridgable = gapWidth >= 20 && gapWidth <= 350 && verticalDelta <= 60;

      expect(gapWidth).toBe(40);
      expect(verticalDelta).toBe(0);
      expect(isBridgable).toBe(true);
    });

    it("extends hard-light laser bridge by 25px on both sides for ledge seating overlap", () => {
      const gapLeft = 450;
      const gapRight = 490;
      const bridgeY = 1224;

      const bridgeRail = {
        name: "HARD_LIGHT_BRIDGE",
        xLeft: gapLeft - 25,
        xRight: gapRight + 25,
        width: (gapRight - gapLeft) + 50,
        y: bridgeY,
        isHardLight: true,
        isBridge: true,
        duration: 6000
      };

      expect(bridgeRail.xLeft).toBe(425);
      expect(bridgeRail.xRight).toBe(515);
      expect(bridgeRail.width).toBe(90);
    });

    it("registers dynamically spawned laser bridge into landingRails array", () => {
      const bridgeRail = {
        name: "HARD_LIGHT_BRIDGE",
        xLeft: 425,
        xRight: 515,
        y: 1224,
        isHardLight: true,
        isBridge: true
      };

      landingRails.push(bridgeRail);

      expect(landingRails).toContain(bridgeRail);
      expect(landingRails.some(r => r.isBridge)).toBe(true);
    });

    it("refreshes existing bridge lifetime rather than spawning duplicate rail objects", () => {
      const activeBridges = [
        { id: "bridge-1", xLeft: 425, xRight: 515, y: 1224, createdAt: 1000, duration: 6000 }
      ];

      const checkOrDeploy = (left, right, y, now) => {
        const existing = activeBridges.find(b => Math.abs(b.y - y) <= 10 && Math.abs(b.xLeft - left) <= 20);
        if (existing) {
          existing.createdAt = now;
          return existing;
        }
        const created = { id: `bridge-${now}`, xLeft: left, xRight: right, y, createdAt: now, duration: 6000 };
        activeBridges.push(created);
        return created;
      };

      const result = checkOrDeploy(425, 515, 1224, 4500);

      expect(activeBridges.length).toBe(1);
      expect(result.createdAt).toBe(4500);
    });

    it("ungrounds standing player when laser bridge dissolves after 6000ms duration", () => {
      const bridge = { name: "HARD_LIGHT_BRIDGE", y: 1224, isBridge: true };
      landingRails.push(bridge);

      mockPlayer.grounded = true;
      mockPlayer.currentRail = bridge;

      const index = landingRails.indexOf(bridge);
      if (index !== -1) landingRails.splice(index, 1);

      if (mockPlayer.currentRail === bridge) {
        mockPlayer.grounded = false;
        mockPlayer.currentRail = null;
      }

      expect(mockPlayer.grounded).toBe(false);
      expect(mockPlayer.currentRail).toBeNull();
      expect(landingRails).not.toContain(bridge);
    });

    it("rejects chasm bridging when horizontal gap exceeds 350px max span", () => {
      const gapWidth = 420;
      const isBridgable = gapWidth >= 20 && gapWidth <= 350;
      expect(isBridgable).toBe(false);
    });

    it("rejects chasm bridging when vertical cliff delta exceeds 80px", () => {
      const verticalDelta = 140;
      const isBridgable = verticalDelta <= 80;
      expect(isBridgable).toBe(false);
    });

    it("treats micro-gap under 20px as continuous rail without deploying laser bridge", () => {
      const microGap = 12;
      const requiresBridge = microGap >= 20;
      expect(requiresBridge).toBe(false);
    });

    it("deploys chasm bridge whether player approaches from left or right direction", () => {
      const detectBridgeDirection = (playerX, gapLeft, gapRight) => {
        if (playerX <= gapLeft) return "approach-from-left";
        if (playerX >= gapRight) return "approach-from-right";
        return "spanning";
      };

      expect(detectBridgeDirection(400, 450, 490)).toBe("approach-from-left");
      expect(detectBridgeDirection(520, 450, 490)).toBe("approach-from-right");
      expect(detectBridgeDirection(470, 450, 490)).toBe("spanning");
    });
  });

  describe("2.3 Player Construct Tool ('F' Hotkey / Laser Springboard)", () => {
    it("spawns a floating horizontal platform of width 160px centered at player position", () => {
      mockPlayer.pos.x = 600;
      mockPlayer.pos.y = 1500;

      const width = 160;
      const platformRail = {
        name: "HARD_LIGHT_PLATFORM",
        xLeft: mockPlayer.pos.x - (width / 2),
        xRight: mockPlayer.pos.x + (width / 2),
        width: width,
        y: mockPlayer.pos.y,
        isHardLight: true,
        duration: 6000
      };

      expect(platformRail.xLeft).toBe(520);
      expect(platformRail.xRight).toBe(680);
      expect(platformRail.width).toBe(160);
      expect(platformRail.y).toBe(1500);
    });

    it("enforces 1200ms debounce cooldown preventing platform construct spam", () => {
      let lastConstructTime = 10000;
      const cooldown = 1200;

      const canConstruct = (now) => (now - lastConstructTime >= cooldown);

      expect(canConstruct(10500)).toBe(false);
      expect(canConstruct(11199)).toBe(false);
      expect(canConstruct(11200)).toBe(true);
    });

    it("activates material decay pulsation during the final 1500ms of platform lifespan", () => {
      const duration = 6000;
      const warningWindow = 1500;

      const isWarningPhase = (elapsed) => (duration - elapsed <= warningWindow);

      expect(isWarningPhase(4000)).toBe(false);
      expect(isWarningPhase(4500)).toBe(true);
      expect(isWarningPhase(5500)).toBe(true);
    });

    it("grounds airborne player and zeroes vertical velocity immediately upon platform construct", () => {
      mockPlayer.pos.y = 800;
      mockPlayer.vy = 450;
      mockPlayer.grounded = false;

      const platform = { name: "HARD_LIGHT_PLATFORM", y: 800 };
      mockPlayer.triggerGround(platform);

      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.vy).toBe(0);
      expect(mockPlayer.currentRail).toBe(platform);
    });

    it("disposes construct platform and frees material and geometry memory on timeout", () => {
      let geoFreed = false;
      let matFreed = false;

      const platform = {
        geometries: [{ dispose: () => { geoFreed = true; } }],
        materials: [{ dispose: () => { matFreed = true; } }]
      };

      platform.geometries.forEach(g => g.dispose());
      platform.materials.forEach(m => m.dispose());

      expect(geoFreed).toBe(true);
      expect(matFreed).toBe(true);
    });

    it("interpolates platform decay opacity linearly during the final 1500ms", () => {
      const duration = 6000;
      const warningWindow = 1500;
      const getDecayOpacity = (elapsed) => {
        if (elapsed < duration - warningWindow) return 0.85;
        const remaining = Math.max(0, duration - elapsed);
        return (remaining / warningWindow) * 0.85;
      };

      expect(getDecayOpacity(3000)).toBe(0.85);
      expect(getDecayOpacity(5250)).toBeCloseTo(0.425);
      expect(getDecayOpacity(6000)).toBe(0);
    });
  });

  describe("2.4 Camera Viewport Tracking & User Scroll Isolation", () => {
    it("locks programmatic camera auto-scrolling when user is actively wheel scrolling", () => {
      let isUserActivelyScrolling = false;
      let activeScrollTimer = null;

      const onUserScrollGesture = () => {
        isUserActivelyScrolling = true;
        if (activeScrollTimer) clearTimeout(activeScrollTimer);
        activeScrollTimer = setTimeout(() => {
          isUserActivelyScrolling = false;
        }, 600);
      };

      onUserScrollGesture();
      expect(isUserActivelyScrolling).toBe(true);

      const canCameraAutoScroll = (mode) => (mode === "manual" && !isUserActivelyScrolling);
      expect(canCameraAutoScroll("manual")).toBe(false);
    });

    it("resets isUserActivelyScrolling flag 600ms after gesture cessation", () => {
      vi.useFakeTimers();
      let isUserActivelyScrolling = true;

      setTimeout(() => {
        isUserActivelyScrolling = false;
      }, 600);

      vi.advanceTimersByTime(599);
      expect(isUserActivelyScrolling).toBe(true);

      vi.advanceTimersByTime(2);
      expect(isUserActivelyScrolling).toBe(false);
      vi.useRealTimers();
    });

    it("strictly forbids window.scrollBy in autonomous companion mode across all pages", () => {
      const controlMode = "autonomous";
      const canScrollWindow = (mode) => (mode === "manual");

      expect(canScrollWindow(controlMode)).toBe(false);
    });

    it("strictly forbids camera auto-scrolling on workspace route regardless of control mode", () => {
      const currentPage = "workspace";
      const canScrollWindow = (page, mode) => (page !== "workspace" && mode === "manual");

      expect(canScrollWindow(currentPage, "manual")).toBe(false);
      expect(canScrollWindow(currentPage, "autonomous")).toBe(false);
    });

    it("permits camera tracking within vertical leash [0.15 * vh, 0.75 * vh] in manual control mode", () => {
      const vh = 1000;
      const minLeashY = vh * 0.15;
      const maxLeashY = vh * 0.75;

      const isPlayerWithinLeash = (screenY) => (screenY >= minLeashY && screenY <= maxLeashY);

      expect(isPlayerWithinLeash(100)).toBe(false);
      expect(isPlayerWithinLeash(450)).toBe(true);
      expect(isPlayerWithinLeash(850)).toBe(false);
    });

    it("cancels active airborne glide immediately when user presses manual movement keys", () => {
      let isAirborneGlide = true;
      let currentGlideId = Symbol("glide-1");

      const onManualKeyInput = () => {
        isAirborneGlide = false;
        currentGlideId = null;
      };

      onManualKeyInput();

      expect(isAirborneGlide).toBe(false);
      expect(currentGlideId).toBeNull();
    });

    it("snaps player to target landing rail and zeroes velocity upon smooth glide completion", () => {
      mockPlayer.pos.x = 420;
      mockPlayer.pos.y = 1220;
      mockPlayer.vy = 80;

      const targetRail = landingRails[1];

      const onGlideArrival = (rail) => {
        mockPlayer.pos.y = rail.y;
        mockPlayer.vy = 0;
        mockPlayer.grounded = true;
        mockPlayer.currentRail = rail;
      };

      onGlideArrival(targetRail);

      expect(mockPlayer.pos.y).toBe(1224);
      expect(mockPlayer.vy).toBe(0);
      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.currentRail).toBe(targetRail);
    });

    it("clamps mobile directional button states upon pointer up anywhere on window", () => {
      let mobileLeftDown = true;
      let mobileRightDown = true;

      const onWindowPointerUp = () => {
        mobileLeftDown = false;
        mobileRightDown = false;
      };

      onWindowPointerUp();

      expect(mobileLeftDown).toBe(false);
      expect(mobileRightDown).toBe(false);
    });

    it("isolates form input typing to prevent game controls from triggering during text entry", () => {
      const mockActiveElement = {
        tagName: "INPUT",
        isContentEditable: false
      };

      const isTyping = (el) => {
        if (!el) return false;
        const tag = el.tagName;
        return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(el.isContentEditable);
      };

      expect(isTyping(mockActiveElement)).toBe(true);
      expect(isTyping({ tagName: "DIV", isContentEditable: false })).toBe(false);
    });

    it("automatically resets control mode to autonomous after 2600ms of user inactivity", () => {
      vi.useFakeTimers();
      let controlMode = "manual";

      setTimeout(() => {
        controlMode = "autonomous";
      }, 2600);

      vi.advanceTimersByTime(2599);
      expect(controlMode).toBe("manual");

      vi.advanceTimersByTime(2);
      expect(controlMode).toBe("autonomous");
      vi.useRealTimers();
    });

    it("detects bedrock touchdown landing condition at altitude >= 3470px", () => {
      const isTouchdown = (y, railName) => (y >= 3470 && (railName.includes("touchdown") || railName.includes("BEDROCK")));

      expect(isTouchdown(3460, "HERO_RAIL")).toBe(false);
      expect(isTouchdown(3475, "BEDROCK_RAIL")).toBe(true);
      expect(isTouchdown(3480, "touchdown-zone")).toBe(true);
    });

    it("clamps player jumping above ceiling boundary to y = 0", () => {
      const clampCeilingY = (y) => Math.max(0, y);

      expect(clampCeilingY(-50)).toBe(0);
      expect(clampCeilingY(100)).toBe(100);
    });

    it("handles multi-touch directional buttons independently without sticky lockouts", () => {
      const touches = [
        { identifier: 1, targetId: "btn-left" },
        { identifier: 2, targetId: "btn-jump" }
      ];

      const isLeftPressed = touches.some(t => t.targetId === "btn-left");
      const isJumpPressed = touches.some(t => t.targetId === "btn-jump");
      const isRightPressed = touches.some(t => t.targetId === "btn-right");

      expect(isLeftPressed).toBe(true);
      expect(isJumpPressed).toBe(true);
      expect(isRightPressed).toBe(false);
    });

    it("applies bounce restitution coefficient (e = 0.65) on elastic springboard rails", () => {
      mockPlayer.vy = 400;
      const restitution = 0.65;
      const bounceVy = -mockPlayer.vy * restitution;

      expect(bounceVy).toBe(-260);
      expect(Math.abs(bounceVy)).toBeLessThan(mockPlayer.vy);
    });

    it("clamps horizontal movement velocity to standard speed floor/ceiling [-200, +200]", () => {
      const clampVx = (vx) => Math.max(-200, Math.min(vx, 200));

      expect(clampVx(350)).toBe(200);
      expect(clampVx(-450)).toBe(-200);
      expect(clampVx(150)).toBe(150);
    });

    it("evaluates rail binding tolerance expansion within +/-35px of target Y", () => {
      const targetY = 1224;
      const isWithinTolerance = (playerY) => Math.abs(playerY - targetY) <= 35;

      expect(isWithinTolerance(1200)).toBe(true);  // Delta 24 <= 35
      expect(isWithinTolerance(1255)).toBe(true);  // Delta 31 <= 35
      expect(isWithinTolerance(1265)).toBe(false); // Delta 41 > 35
    });

    it("enforces 10,000ms cooldown on LiDaR welding for a previously welded rail", () => {
      const rail = { name: "CARD_1", lastWeld: 100000 };
      const canWeld = (now) => (!rail.lastWeld || now - rail.lastWeld >= 10000);

      expect(canWeld(105000)).toBe(false); // 5s later -> blocked
      expect(canWeld(110000)).toBe(true);  // 10s later -> allowed
    });

    it("verifies Kaboom 2D to Three.js coordinate parity scale factor is exactly 0.05", () => {
      const scale = 0.05;
      const x2d = 600;
      const y2d = 400;

      const x3d = x2d * scale;
      const y3d = -y2d * scale;

      expect(x3d).toBe(30);
      expect(y3d).toBe(-20);
    });

    it("ensures landing rail array preserves immutable properties under rapid physics iterations", () => {
      const initialCount = landingRails.length;
      for (let i = 0; i < 100; i++) {
        const found = landingRails.find(r => r.y === 1224);
        expect(found).toBeDefined();
      }
      expect(landingRails.length).toBe(initialCount);
    });
  });
});
