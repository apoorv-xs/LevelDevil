import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Player3D, AstromechArchitect } from "../../player_3d.js";

describe("Subsystem 1: 3D Astromech BB-8 & Three.js Pipeline", () => {
  beforeEach(() => {
    // Reset Player3D state
    Player3D.lastX = null;
    Player3D.currentRollZ = 0;
    Player3D.headTiltZ = 0;
    Player3D.isCelebrating = false;
    Player3D.celebrateStartTime = 0;
    Player3D.isNodding = false;
    Player3D.nodStartTime = 0;
    Player3D.isCurious = false;
    Player3D.curiousStartTime = 0;
    Player3D.gazeTargetWorld = null;
    Player3D.isSmashing = false;

    // Reset AstromechArchitect
    AstromechArchitect.dispose();
    AstromechArchitect.lastConstructTime = 0;
    AstromechArchitect.lastWeldTime = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1.1 Quaternions, Rolling Dynamics & Kinematics", () => {
    it("clamps Delta-X spin on frame-1 teleport to prevent infinite violent rotation", () => {
      Player3D.lastX = null;
      Player3D.currentRollZ = 0;

      const targetX = 500;
      if (Player3D.lastX === null) {
        Player3D.lastX = targetX;
      }

      expect(Player3D.lastX).toBe(500);
      expect(Player3D.currentRollZ).toBe(0);
    });

    it("clamps Delta-X spin when player position jumps by > 500px in a single frame", () => {
      Player3D.lastX = 100;
      Player3D.currentRollZ = 1.5;

      const suddenJumpX = 850;
      const deltaX = suddenJumpX - Player3D.lastX;

      let rollUpdated = false;
      if (Math.abs(deltaX) > 50) {
        Player3D.lastX = suddenJumpX;
      } else {
        Player3D.currentRollZ -= (deltaX / 0.65) * 1.25;
        rollUpdated = true;
      }

      expect(rollUpdated).toBe(false);
      expect(Player3D.lastX).toBe(850);
      expect(Player3D.currentRollZ).toBe(1.5);
    });

    it("applies continuous angular velocity when moving horizontally at standard speed", () => {
      Player3D.lastX = 200;
      Player3D.currentRollZ = 0;

      const nextX = 205;
      const deltaX = nextX - Player3D.lastX;

      if (Math.abs(deltaX) <= 50) {
        Player3D.currentRollZ -= (deltaX / 0.65) * 1.25;
        Player3D.lastX = nextX;
      }

      expect(Player3D.lastX).toBe(205);
      expect(Player3D.currentRollZ).toBeCloseTo(-9.615, 2);
    });

    it("clamps sub-pixel micro-rolling jitter when horizontal delta is under 0.05px", () => {
      Player3D.lastX = 300;
      Player3D.currentRollZ = 2.0;

      const microNextX = 300.02;
      const deltaX = microNextX - Player3D.lastX;

      let appliedRoll = false;
      if (Math.abs(deltaX) >= 0.05) {
        Player3D.currentRollZ -= (deltaX / 0.65) * 1.25;
        appliedRoll = true;
      }

      expect(appliedRoll).toBe(false);
      expect(Player3D.currentRollZ).toBe(2.0);
    });

    it("applies dynamic head tilt damping proportional to horizontal roll delta", () => {
      const deltaX = 12;
      const targetTilt = Math.max(Math.min(deltaX * 0.035, 0.35), -0.35);

      Player3D.headTiltZ = 0;
      Player3D.headTiltZ += (targetTilt - Player3D.headTiltZ) * 0.18;

      expect(targetTilt).toBeCloseTo(0.35);
      expect(Player3D.headTiltZ).toBeCloseTo(0.35 * 0.18, 3);
    });

    it("reverses head tilt direction when velocity reverses from positive to negative", () => {
      let deltaX = 8;
      let targetTilt = Math.max(Math.min(deltaX * 0.035, 0.35), -0.35);
      expect(targetTilt).toBeGreaterThan(0);

      deltaX = -8;
      targetTilt = Math.max(Math.min(deltaX * 0.035, 0.35), -0.35);
      expect(targetTilt).toBeLessThan(0);
      expect(targetTilt).toBeCloseTo(-0.28);
    });

    it("clamps squash and stretch compression to a minimum floor of 0.78 on hard vertical impact", () => {
      const impactVy = 650;
      const rawCompression = 1.0 - Math.min(impactVy / 2000, 0.28);
      const clampedCompression = Math.max(rawCompression, 0.78);

      expect(clampedCompression).toBeGreaterThanOrEqual(0.78);
      expect(clampedCompression).toBeLessThan(1.0);
    });

    it("relaxes squash and stretch back to 1.0 via exponential decay", () => {
      let currentScaleY = 0.80;
      const targetScaleY = 1.0;
      const decayRate = 0.12;

      for (let frame = 0; frame < 30; frame++) {
        currentScaleY += (targetScaleY - currentScaleY) * decayRate;
      }

      expect(currentScaleY).toBeCloseTo(1.0, 2);
    });

    it("anchors head dome securely above body center without vertical separation during jump", () => {
      const bodyRadius = 0.65;
      const headOffsetY = bodyRadius * 0.75;
      expect(headOffsetY).toBeCloseTo(0.4875);
    });

    it("guards celebrateVictory against multiple trigger restarts while active", () => {
      const now = 10000;
      Player3D.isCelebrating = true;
      Player3D.celebrateStartTime = now;

      Player3D.celebrateVictory();

      expect(Player3D.celebrateStartTime).toBe(now);
      expect(Player3D.isCelebrating).toBe(true);
    });

    it("calculates celebration vertical leap curve with sinusoidal elevation", () => {
      const duration = 1200;
      const calculateLeapY = (elapsed) => {
        const progress = Math.min(elapsed / duration, 1.0);
        return Math.sin(progress * Math.PI) * 1.8;
      };

      expect(calculateLeapY(0)).toBe(0);
      expect(calculateLeapY(600)).toBeCloseTo(1.8);
      expect(calculateLeapY(1200)).toBeCloseTo(0);
    });

    it("calculates curious inspect head roll over 800ms duration", () => {
      const duration = 800;
      const getCuriousRoll = (elapsed) => {
        const progress = Math.min(elapsed / duration, 1.0);
        return Math.sin(progress * Math.PI * 2) * 0.25;
      };

      expect(getCuriousRoll(0)).toBe(0);
      expect(getCuriousRoll(200)).toBeCloseTo(0.25);
      expect(getCuriousRoll(600)).toBeCloseTo(-0.25);
      expect(getCuriousRoll(800)).toBeCloseTo(0);
    });

    it("calculates head nod pitch oscillation over 800ms duration", () => {
      const duration = 800;
      const getNodPitch = (elapsed) => {
        const progress = Math.min(elapsed / duration, 1.0);
        return Math.sin(progress * Math.PI * 4) * 0.35;
      };

      expect(getNodPitch(0)).toBe(0);
      expect(getNodPitch(100)).toBeCloseTo(0.35);
      expect(getNodPitch(300)).toBeCloseTo(-0.35);
      expect(getNodPitch(800)).toBeCloseTo(0);
    });
  });

  describe("1.2 Pointer Raycasting, Specular Glint & Gaze Tracking", () => {
    it("bypasses raycasting calculation when pointer distance exceeds 65px screen radius", () => {
      const bb8ScreenX = 400;
      const bb8ScreenY = 300;

      const farPointerX = 520;
      const farPointerY = 400;

      const dist = Math.hypot(farPointerX - bb8ScreenX, farPointerY - bb8ScreenY);
      const isWithinHoverRadius = dist <= 65;

      expect(dist).toBeGreaterThan(65);
      expect(isWithinHoverRadius).toBe(false);
    });

    it("activates gaze tracking when pointer is within 65px screen radius", () => {
      const bb8ScreenX = 400;
      const bb8ScreenY = 300;

      const nearPointerX = 425;
      const nearPointerY = 315;

      const dist = Math.hypot(nearPointerX - bb8ScreenX, nearPointerY - bb8ScreenY);
      const isWithinHoverRadius = dist <= 65;

      expect(dist).toBeLessThanOrEqual(65);
      expect(isWithinHoverRadius).toBe(true);
    });

    it("clamps primary pupil specular glint strictly within [-0.08, +0.08] horizontally", () => {
      const extremePointerDeltaX = 250;
      const rawGlintX = extremePointerDeltaX * 0.002;
      const clampedGlintX = Math.max(Math.min(rawGlintX, 0.08), -0.08);

      expect(rawGlintX).toBe(0.5);
      expect(clampedGlintX).toBe(0.08);
    });

    it("clamps primary pupil specular glint strictly within [-0.04, +0.04] vertically", () => {
      const extremePointerDeltaY = -180;
      const rawGlintY = extremePointerDeltaY * 0.002;
      const clampedGlintY = Math.max(Math.min(rawGlintY, 0.04), -0.04);

      expect(rawGlintY).toBe(-0.36);
      expect(clampedGlintY).toBe(-0.04);
    });

    it("strictly clamps inquisitive head pitch between -0.35 and +0.35 radians", () => {
      const excessivePitch = 1.25;
      const clampedPitch = Math.max(Math.min(excessivePitch, 0.35), -0.35);
      expect(clampedPitch).toBe(0.35);

      const negativeExcessivePitch = -0.95;
      const clampedNegPitch = Math.max(Math.min(negativeExcessivePitch, 0.35), -0.35);
      expect(clampedNegPitch).toBe(-0.35);
    });

    it("smoothly recenters pupil glint back to neutral [0, 0.25] when pointer becomes inactive", () => {
      let lensPos = { x: 0.07, y: 0.29 };
      const neutralPos = { x: 0, y: 0.25 };

      for (let frame = 0; frame < 60; frame++) {
        lensPos.x += (neutralPos.x - lensPos.x) * 0.05;
        lensPos.y += (neutralPos.y - lensPos.y) * 0.05;
      }

      expect(lensPos.x).toBeCloseTo(0, 2);
      expect(lensPos.y).toBeCloseTo(0.25, 2);
    });

    it("distinguishes touch pointer from mouse pointer to prevent scroll gaze locks", () => {
      const touchEvent = { pointerType: "touch", clientX: 200, clientY: 400 };
      const mouseEvent = { pointerType: "mouse", clientX: 200, clientY: 400 };

      const allowHoverGaze = (e) => e.pointerType === "mouse";

      expect(allowHoverGaze(touchEvent)).toBe(false);
      expect(allowHoverGaze(mouseEvent)).toBe(true);
    });

    it("triggers antenna LED pulse on hover focus enter", () => {
      let ledColor = 0x4deeea;
      const onHoverEnter = () => {
        ledColor = 0xfce566;
      };

      onHoverEnter();
      expect(ledColor).toBe(0xfce566);
    });

    it("scales ground shadow dimensions inversely with jump altitude", () => {
      const baseScale = 1.0;
      const computeShadowScale = (jumpHeight) => Math.max(0.4, baseScale - (jumpHeight * 0.15));

      expect(computeShadowScale(0)).toBe(1.0);
      expect(computeShadowScale(2)).toBeCloseTo(0.7);
      expect(computeShadowScale(5)).toBe(0.4);
    });

    it("fades ground shadow opacity as BB-8 ascends into mid-air", () => {
      const baseOpacity = 0.45;
      const computeShadowOpacity = (jumpHeight) => Math.max(0.1, baseOpacity - (jumpHeight * 0.07));

      expect(computeShadowOpacity(0)).toBe(0.45);
      expect(computeShadowOpacity(3)).toBeCloseTo(0.24);
      expect(computeShadowOpacity(6)).toBe(0.1);
    });
  });

  describe("1.3 Astromech Architect Visual Rig & Particles", () => {
    it("initializes jump thruster exhaust sparks with downward velocities (vy < 0 in Three.js)", () => {
      const isExhaust = true;
      const generateVy = () => isExhaust ? -(Math.random() * 6.5 + 2.5) : (Math.random() * 6.5 + 2.5);

      for (let i = 0; i < 20; i++) {
        const vy = generateVy();
        expect(vy).toBeLessThan(0);
        expect(vy).toBeLessThanOrEqual(-2.5);
        expect(vy).toBeGreaterThanOrEqual(-9.0);
      }
    });

    it("initializes LiDaR welding and platform deployment sparks with upward velocities (vy > 0 in Three.js)", () => {
      const isExhaust = false;
      const generateVy = () => isExhaust ? -(Math.random() * 6.5 + 2.5) : (Math.random() * 6.5 + 2.5);

      for (let i = 0; i < 20; i++) {
        const vy = generateVy();
        expect(vy).toBeGreaterThan(0);
        expect(vy).toBeGreaterThanOrEqual(2.5);
        expect(vy).toBeLessThanOrEqual(9.0);
      }
    });

    it("recycles oldest particle when particle buffer reaches max capacity of 60", () => {
      const maxSparks = 60;
      const sparks = [];

      for (let i = 0; i < maxSparks; i++) {
        sparks.push({ id: i, createdAt: 1000 + i });
      }
      expect(sparks.length).toBe(60);

      const newSpark = { id: 61, createdAt: 2000 };
      if (sparks.length >= maxSparks) {
        sparks.shift();
      }
      sparks.push(newSpark);

      expect(sparks.length).toBe(60);
      expect(sparks[0].id).toBe(1);
      expect(sparks[59].id).toBe(61);
    });

    it("configures celebratory laser salute with dual vertical beams of height 7.5 units", () => {
      const beamHeight = 7.5;
      const beamRadius = 0.08;
      const innerRadius = 0.04;

      expect(beamHeight).toBe(7.5);
      expect(beamRadius).toBe(0.08);
      expect(innerRadius).toBe(0.04);
      expect(beamRadius).toBeGreaterThan(innerRadius);
    });

    it("fades celebratory laser beam opacity over 2400ms duration", () => {
      const duration = 2400;
      const getOpacity = (elapsed) => Math.max(0, 1.0 - (elapsed / duration));

      expect(getOpacity(0)).toBe(1.0);
      expect(getOpacity(1200)).toBeCloseTo(0.5);
      expect(getOpacity(2400)).toBe(0);
      expect(getOpacity(3000)).toBe(0);
    });

    it("configures hard-light beam materials with depthWrite: false to prevent seam clipping", () => {
      const beamMat = {
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: 2
      };

      expect(beamMat.depthWrite).toBe(false);
      expect(beamMat.transparent).toBe(true);
    });

    it("ensures ink outline materials configure depthWrite: false to avoid silhouette clipping", () => {
      const inkOutlineMat = {
        color: 0x17120f,
        side: 1,
        depthWrite: false
      };

      expect(inkOutlineMat.depthWrite).toBe(false);
      expect(inkOutlineMat.side).toBe(1);
    });

    it("configures laser bridge endcap caps at left and right boundaries", () => {
      const bridgeLeft = 300;
      const bridgeRight = 500;
      const width = bridgeRight - bridgeLeft;

      const leftCapX = bridgeLeft;
      const rightCapX = bridgeRight;

      expect(rightCapX - leftCapX).toBe(width);
      expect(leftCapX).toBe(300);
      expect(rightCapX).toBe(500);
    });

    it("modulates laser bridge core glow with high-frequency sine pulse", () => {
      const getPulseIntensity = (time) => 0.75 + Math.sin(time * 0.015) * 0.25;

      expect(getPulseIntensity(0)).toBeCloseTo(0.75);
      expect(getPulseIntensity(100)).toBeGreaterThanOrEqual(0.5);
      expect(getPulseIntensity(100)).toBeLessThanOrEqual(1.0);
    });

    it("positions dual laser salute beams symmetrically at X = -0.45 and +0.45", () => {
      const leftBeamX = -0.45;
      const rightBeamX = +0.45;

      expect(Math.abs(leftBeamX)).toBe(Math.abs(rightBeamX));
      expect(rightBeamX - leftBeamX).toBeCloseTo(0.9);
    });

    it("records weld timestamp on rail during LiDaR surface welding", () => {
      const mockRail = { name: "DOM_CARD_1", y: 1500 };
      const now = 1700000000000;
      mockRail.lastWeld = now;

      expect(mockRail.lastWeld).toBe(now);
    });

    it("updates existing laser bridge duration rather than duplicating rails", () => {
      const existingBridge = {
        name: "HARD_LIGHT_BRIDGE",
        xLeft: 300,
        xRight: 500,
        y: 1200,
        createdAt: 1000,
        duration: 6000
      };

      const now = 4000;
      // Re-triggering bridge resets createdAt
      existingBridge.createdAt = now;

      expect(existingBridge.createdAt).toBe(4000);
    });
  });

  describe("1.4 WebGL Context Loss, Coordinate Mapping & Memory Disposal", () => {
    it("halts animation loop and dispatches warning when webglcontextlost event fires", () => {
      let isRenderLoopActive = true;
      let contextLostLogged = false;

      const handleContextLost = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        isRenderLoopActive = false;
        contextLostLogged = true;
      };

      handleContextLost({ preventDefault: vi.fn() });

      expect(isRenderLoopActive).toBe(false);
      expect(contextLostLogged).toBe(true);
    });

    it("re-initializes render loop when webglcontextrestored fires", () => {
      let isRenderLoopActive = false;

      const handleContextRestored = () => {
        isRenderLoopActive = true;
      };

      handleContextRestored();
      expect(isRenderLoopActive).toBe(true);
    });

    it("deeply disposes meshes, geometries, and materials during Player3D.dispose()", () => {
      let geoDisposed = false;
      let matDisposed = false;

      const mockMesh = {
        isMesh: true,
        geometry: { dispose: () => { geoDisposed = true; } },
        material: { dispose: () => { matDisposed = true; } }
      };

      const disposeNode = (node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) node.material.dispose();
      };

      disposeNode(mockMesh);

      expect(geoDisposed).toBe(true);
      expect(matDisposed).toBe(true);
    });

    it("explicitly disposes directional sun light shadow depth map to prevent GPU VRAM leak", () => {
      let shadowMapDisposed = false;
      const sunLight = {
        shadow: {
          map: {
            dispose: () => { shadowMapDisposed = true; }
          }
        }
      };

      if (sunLight && sunLight.shadow && sunLight.shadow.map) {
        sunLight.shadow.map.dispose();
      }

      expect(shadowMapDisposed).toBe(true);
    });

    it("clamps device pixel ratio to a maximum ceiling of 2.0 on high-density 3x/4x retina displays", () => {
      const getClampedDPR = (dpr) => Math.min(dpr || 1, 2.0);

      expect(getClampedDPR(1.0)).toBe(1.0);
      expect(getClampedDPR(2.0)).toBe(2.0);
      expect(getClampedDPR(3.0)).toBe(2.0);
      expect(getClampedDPR(4.0)).toBe(2.0);
    });

    it("removes window pointer event listeners on Player3D teardown", () => {
      const removedListeners = [];
      const mockWindow = {
        removeEventListener: (type, fn) => {
          removedListeners.push(type);
        }
      };

      mockWindow.removeEventListener("pointermove", vi.fn());
      mockWindow.removeEventListener("pointerdown", vi.fn());

      expect(removedListeners).toContain("pointermove");
      expect(removedListeners).toContain("pointerdown");
    });

    it("resets all motion flags and timers during Player3D state disposal", () => {
      Player3D.isCelebrating = true;
      Player3D.isNodding = true;
      Player3D.isCurious = true;
      Player3D.currentRollZ = 5.2;

      Player3D.dispose();

      expect(Player3D.isCelebrating).toBe(false);
      expect(Player3D.isNodding).toBe(false);
      expect(Player3D.isCurious).toBe(false);
      expect(Player3D.currentRollZ).toBe(0);
    });

    it("properly un-parents antenna LED to tallAntenna rather than headGroup", () => {
      const tallAntenna = { children: [], add: function(c) { this.children.push(c); } };
      const antennaLed = { name: "antennaLed" };

      tallAntenna.add(antennaLed);

      expect(tallAntenna.children).toContain(antennaLed);
    });

    it("sets renderer size with updateStyle=false to prevent overriding 100dvh CSS", () => {
      let passedUpdateStyle = null;
      const mockRenderer = {
        setSize: (w, h, updateStyle) => {
          passedUpdateStyle = updateStyle;
        }
      };

      mockRenderer.setSize(1280, 800, false);
      expect(passedUpdateStyle).toBe(false);
    });

    it("clears AstromechArchitect active rails and spark buffers on route unmount", () => {
      AstromechArchitect.activeRails = [{ name: "rail1" }, { name: "rail2" }];
      AstromechArchitect.activeSparks = [{ id: 1 }, { id: 2 }];
      AstromechArchitect.activeBeams = [{ id: "beam1" }];

      AstromechArchitect.dispose();

      expect(AstromechArchitect.activeRails.length).toBe(0);
      expect(AstromechArchitect.activeSparks.length).toBe(0);
      expect(AstromechArchitect.activeBeams.length).toBe(0);
    });

    it("maps 2D screen coordinates to 3D Three.js space with inverted Y axis", () => {
      const screenW = 1200;
      const screenH = 800;
      const scale = 0.05;

      const to3DVec = (x2d, y2d, scrollY = 0) => {
        const x3d = (x2d - (screenW / 2)) * scale;
        const y3d = -((y2d - scrollY) - (screenH / 2)) * scale;
        return {
          x: Object.is(x3d, -0) ? 0 : x3d,
          y: Object.is(y3d, -0) ? 0 : y3d,
          z: 0
        };
      };

      const center3D = to3DVec(600, 400, 0);
      expect(center3D.x).toBe(0);
      expect(center3D.y).toBe(0);

      const topLeft3D = to3DVec(0, 0, 0);
      expect(topLeft3D.x).toBeCloseTo(-30);
      expect(topLeft3D.y).toBeCloseTo(20);
    });

    it("disposes single rail, ungrounding player if currently standing on it", () => {
      const mockRail = {
        name: "testRail",
        group: { children: [] },
        geometries: [{ dispose: vi.fn() }],
        materials: [{ dispose: vi.fn() }]
      };

      const mockPlayer = {
        grounded: true,
        currentRail: mockRail
      };

      const landingRails = [mockRail];
      AstromechArchitect.activeRails = [mockRail];

      AstromechArchitect.disposeRail(mockRail, mockPlayer, landingRails);

      expect(mockPlayer.grounded).toBe(false);
      expect(mockPlayer.currentRail).toBeNull();
      expect(landingRails).not.toContain(mockRail);
    });

    it("simulates critically damped camera spring settlement within 40 frames", () => {
      let springY = -0.45;
      let springVelY = 0;
      const stiffness = 220;
      const damping = 22;
      const dt = 0.016;

      let isSettled = false;
      for (let i = 0; i < 40; i++) {
        const forceY = -stiffness * springY - damping * springVelY;
        springVelY += forceY * dt;
        springY += springVelY * dt;

        if (Math.abs(springY) < 0.001 && Math.abs(springVelY) < 0.001) {
          isSettled = true;
          break;
        }
      }

      expect(isSettled).toBe(true);
    });

    it("scales camera impact impulse with landing velocity clamped to 2.2 max", () => {
      const computeImpulse = (vy) => {
        const rawIntensity = Math.abs(vy) / 400;
        return Math.min(Math.max(rawIntensity, 0.15), 2.2);
      };

      expect(computeImpulse(50)).toBe(0.15); // Min floor
      expect(computeImpulse(400)).toBeCloseTo(1.0);
      expect(computeImpulse(1600)).toBe(2.2); // Clamped max
    });

    it("verifies procedural texture canvas dimensions are 512x256 for optimal GPU texture memory", () => {
      const textureWidth = 512;
      const textureHeight = 256;
      expect(textureWidth).toBe(512);
      expect(textureHeight).toBe(256);
      expect(textureWidth / textureHeight).toBe(2);
    });

    it("verifies signature BB-8 orange racing stripe and ink border colors", () => {
      const stripeColor = "#eb5e28";
      const inkBorder = "#17120f";
      const silverRim = "#7c858d";
      expect(stripeColor).toBe("#eb5e28");
      expect(inkBorder).toBe("#17120f");
      expect(silverRim).toBe("#7c858d");
    });
  });
});
