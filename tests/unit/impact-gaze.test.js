import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Sentient BB-8 Gaze Tracking & Visceral Camera Impact Physics", () => {
  let mockCamera, Engine3D;

  beforeEach(() => {
    mockCamera = {
      position: { x: 0, y: 0, z: 80, set: vi.fn() },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 16.04,
      aspect: 16 / 9,
      updateProjectionMatrix: vi.fn()
    };

    Engine3D = {
      camera: mockCamera,
      cameraShake: {
        springY: 0,
        springVelY: 0,
        springRotZ: 0,
        springVelRotZ: 0,
        isSettled: true
      },
      triggerImpact(intensity = 1.0) {
        if (!this.camera) return;
        const clamped = Math.min(Math.max(intensity, 0.15), 2.2);
        this.cameraShake.springVelY = -0.45 * clamped;
        this.cameraShake.springVelRotZ = 0.012 * clamped;
        this.cameraShake.isSettled = false;
      },
      updateCameraSpring(dt) {
        if (!this.camera || this.cameraShake.isSettled) return;
        const cs = this.cameraShake;

        const stiffness = 220;
        const damping = 22;

        const forceY = -stiffness * cs.springY - damping * cs.springVelY;
        cs.springVelY += forceY * dt;
        cs.springY += cs.springVelY * dt;

        const forceRot = -stiffness * cs.springRotZ - damping * cs.springVelRotZ;
        cs.springVelRotZ += forceRot * dt;
        cs.springRotZ += cs.springVelRotZ * dt;

        if (
          Math.abs(cs.springY) < 0.0005 &&
          Math.abs(cs.springVelY) < 0.0005 &&
          Math.abs(cs.springRotZ) < 0.0001 &&
          Math.abs(cs.springVelRotZ) < 0.0001
        ) {
          cs.springY = 0;
          cs.springVelY = 0;
          cs.springRotZ = 0;
          cs.springVelRotZ = 0;
          cs.isSettled = true;
          this.camera.position.y = 0;
          this.camera.rotation.z = 0;
        } else {
          this.camera.position.y = cs.springY;
          this.camera.rotation.z = cs.springRotZ;
        }
      }
    };
  });

  describe("Visceral Camera Impact Spring Engine", () => {
    it("initializes camera shake in settled state at rest", () => {
      expect(Engine3D.cameraShake.isSettled).toBe(true);
      expect(Engine3D.cameraShake.springY).toBe(0);
      expect(Engine3D.cameraShake.springVelY).toBe(0);
    });

    it("triggers downward camera compression impulse on impact", () => {
      Engine3D.triggerImpact(1.0);
      expect(Engine3D.cameraShake.isSettled).toBe(false);
      expect(Engine3D.cameraShake.springVelY).toBeCloseTo(-0.45);
      expect(Engine3D.cameraShake.springVelRotZ).toBeCloseTo(0.012);
    });

    it("clamps intensity between 0.15 and 2.2", () => {
      // Very low intensity clamped to 0.15
      Engine3D.triggerImpact(0.01);
      expect(Engine3D.cameraShake.springVelY).toBeCloseTo(-0.45 * 0.15);

      // Extreme intensity clamped to 2.2
      Engine3D.triggerImpact(10.0);
      expect(Engine3D.cameraShake.springVelY).toBeCloseTo(-0.45 * 2.2);
    });

    it("simulates critically damped spring oscillation and returns smoothly to rest", () => {
      Engine3D.triggerImpact(1.0);
      expect(Engine3D.cameraShake.isSettled).toBe(false);

      // Step physics at 60 FPS (dt = 0.016) over ~500ms (35 frames)
      for (let i = 0; i < 40; i++) {
        Engine3D.updateCameraSpring(0.016);
      }

      expect(Engine3D.cameraShake.isSettled).toBe(true);
      expect(Engine3D.camera.position.y).toBe(0);
      expect(Engine3D.camera.rotation.z).toBe(0);
    });
  });

  describe("Sentient BB-8 Gaze & Antenna Interaction", () => {
    let mockPlayer3D, mockAntennaLed;

    beforeEach(() => {
      vi.useFakeTimers();
      mockAntennaLed = {
        material: { color: { hex: 0x00ffff, setHex: vi.fn(function (h) { this.hex = h; }) } },
        scale: { x: 1, y: 1, z: 1, set: vi.fn(function (x, y, z) { this.x = x; this.y = y; this.z = z; }) }
      };

      mockPlayer3D = {
        isCreated: true,
        antennaLed: mockAntennaLed,
        pulseAntenna(colorHex = 0xffd700, duration = 220) {
          if (!this.isCreated || !this.antennaLed) return;
          this.antennaLed.material.color.setHex(colorHex);
          this.antennaLed.scale.set(1.85, 1.85, 1.85);
          if (this._antennaPulseTimeout) clearTimeout(this._antennaPulseTimeout);
          this._antennaPulseTimeout = setTimeout(() => {
            if (this.antennaLed) {
              this.antennaLed.material.color.setHex(0x00ffff);
              this.antennaLed.scale.set(1.0, 1.0, 1.0);
            }
          }, duration);
        }
      };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("pulses antenna LED with gold flash and scale boost on interaction", () => {
      mockPlayer3D.pulseAntenna(0xffd700, 200);

      expect(mockAntennaLed.material.color.setHex).toHaveBeenCalledWith(0xffd700);
      expect(mockAntennaLed.scale.set).toHaveBeenCalledWith(1.85, 1.85, 1.85);

      // Advance timers by duration
      vi.advanceTimersByTime(250);

      expect(mockAntennaLed.material.color.setHex).toHaveBeenCalledWith(0x00ffff);
      expect(mockAntennaLed.scale.set).toHaveBeenCalledWith(1.0, 1.0, 1.0);
    });

    it("clamps gaze look angles to natural anatomical boundaries", () => {
      const calculateLookAngles = (dx, dy) => {
        const pitch = Math.abs(dy) < 1e-6 ? 0 : Math.max(-0.45, Math.min(0.45, -dy * 0.08));
        const yaw = Math.abs(dx) < 1e-6 ? 0 : Math.max(-0.75, Math.min(0.75, dx * 0.05));
        const roll = Math.abs(yaw) < 1e-6 ? 0 : -yaw * 0.18;
        return { pitch, yaw, roll };
      };

      // Extreme left/up
      const extreme = calculateLookAngles(-100, 100);
      expect(extreme.pitch).toBe(-0.45);
      expect(extreme.yaw).toBe(-0.75);
      expect(extreme.roll).toBeCloseTo(0.75 * 0.18);

      // Centered
      const center = calculateLookAngles(0, 0);
      expect(center.pitch).toBe(0);
      expect(center.yaw).toBe(0);
      expect(center.roll).toBe(0);

      // Extreme right/down
      const rightDown = calculateLookAngles(100, -100);
      expect(rightDown.pitch).toBe(0.45);
      expect(rightDown.yaw).toBe(0.75);
      expect(rightDown.roll).toBeCloseTo(-0.75 * 0.18);
    });
  });
});
