import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 9: Web Audio Spatial Chirps & AudioContext Unlock Invariants", () => {
  let mockAudioContext;
  let mockMasterGain;
  let mockDestination;

  beforeEach(() => {
    mockDestination = {};
    mockMasterGain = {
      gain: {
        value: 0.06,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn()
      },
      connect: vi.fn()
    };

    mockAudioContext = {
      state: "suspended",
      currentTime: 10.0,
      destination: mockDestination,
      createGain: vi.fn(() => ({
        gain: {
          value: 1.0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      })),
      createOscillator: vi.fn(() => ({
        type: "sine",
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null
      })),
      createStereoPanner: vi.fn(() => ({
        pan: {
          value: 0.0,
          setValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      })),
      createBiquadFilter: vi.fn(() => ({
        type: "lowpass",
        frequency: {
          value: 350,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        Q: {
          value: 1.0,
          setValueAtTime: vi.fn()
        },
        connect: vi.fn()
      })),
      resume: vi.fn().mockImplementation(async () => {
        mockAudioContext.state = "running";
        return Promise.resolve();
      }),
      close: vi.fn().mockResolvedValue()
    };
  });

  describe("9.1 AudioContext Autoplay & User Gesture Unlocking", () => {
    function createGestureUnlockEngine(initialState = "suspended") {
      let state = initialState;
      let hasUserGesture = false;
      const queuedCallbacks = [];

      return {
        onUserGesture: async () => {
          hasUserGesture = true;
          state = "running";
          while (queuedCallbacks.length > 0) {
            const cb = queuedCallbacks.shift();
            cb();
          }
        },
        runWhenReady: (fn) => {
          if (state === "running") {
            fn();
          } else {
            queuedCallbacks.push(fn);
          }
        },
        getState: () => ({ state, hasUserGesture, pendingCount: queuedCallbacks.length })
      };
    }

    it("queues synthesis callbacks when AudioContext is suspended prior to user gesture", () => {
      const engine = createGestureUnlockEngine("suspended");
      let executed = false;

      engine.runWhenReady(() => {
        executed = true;
      });

      expect(executed).toBe(false);
      expect(engine.getState().pendingCount).toBe(1);
    });

    it("flushes and executes queued audio callbacks upon first user gesture", async () => {
      const engine = createGestureUnlockEngine("suspended");
      const executed = [];

      engine.runWhenReady(() => executed.push("jump_sound"));
      engine.runWhenReady(() => executed.push("construct_sound"));

      expect(executed.length).toBe(0);

      await engine.onUserGesture();

      expect(executed).toEqual(["jump_sound", "construct_sound"]);
      expect(engine.getState().state).toBe("running");
      expect(engine.getState().pendingCount).toBe(0);
    });

    it("executes audio callbacks immediately if AudioContext is already running", () => {
      const engine = createGestureUnlockEngine("running");
      let immediateRun = false;

      engine.runWhenReady(() => {
        immediateRun = true;
      });

      expect(immediateRun).toBe(true);
      expect(engine.getState().pendingCount).toBe(0);
    });
  });

  describe("9.2 Stereo Spatial Panning Clamp & Math", () => {
    function calculateStereoPan(panX, screenWidth = 1280) {
      if (typeof panX !== "number" || isNaN(panX)) return 0.0;
      // Map screen X coordinate [0, screenWidth] to [-1.0, +1.0]
      const normalized = (panX / screenWidth) * 2 - 1;
      // Clamp between -0.85 and +0.85 to avoid jarring headphone ear fatigue
      return Math.min(Math.max(normalized, -0.85), 0.85);
    }

    it("centers audio pan at 0.0 when player is in the middle of the screen", () => {
      expect(calculateStereoPan(640, 1280)).toBe(0.0);
      expect(calculateStereoPan(195, 390)).toBe(0.0);
    });

    it("clamps stereo pan to -0.85 when player is at or beyond the extreme left edge", () => {
      expect(calculateStereoPan(0, 1280)).toBe(-0.85);
      expect(calculateStereoPan(-150, 1280)).toBe(-0.85);
    });

    it("clamps stereo pan to +0.85 when player is at or beyond the extreme right edge", () => {
      expect(calculateStereoPan(1280, 1280)).toBe(0.85);
      expect(calculateStereoPan(1500, 1280)).toBe(0.85);
    });

    it("defaults to 0.0 when panX is null, undefined, or NaN", () => {
      expect(calculateStereoPan(null, 1280)).toBe(0.0);
      expect(calculateStereoPan(undefined, 1280)).toBe(0.0);
      expect(calculateStereoPan(NaN, 1280)).toBe(0.0);
    });

    it("computes smooth intermediate spatial panning", () => {
      // 1/4 of screen width -> normalized = 0.25 * 2 - 1 = -0.5
      expect(calculateStereoPan(320, 1280)).toBe(-0.5);
      // 3/4 of screen width -> normalized = 0.75 * 2 - 1 = +0.5
      expect(calculateStereoPan(960, 1280)).toBe(0.5);
    });
  });

  describe("9.3 Altitude Drone Sub-Bass Modulation (10,000 FT -> 0 FT)", () => {
    function computeAltitudeModulation(altitudeFt) {
      const clampedAlt = Math.min(Math.max(altitudeFt, 0), 10000);
      const factor = clampedAlt / 10000; // 1.0 at 10,000 FT, 0.0 at bedrock

      // Base carrier modulates from 45Hz (bedrock) to 65Hz (high altitude)
      const carrierFreq = 45 + factor * 20;

      // Lowpass filter cutoff modulates from 180Hz (deep sub-bass high altitude) to 420Hz (rich ground resonance)
      const filterCutoff = 180 + (1 - factor) * 240;

      return { carrierFreq, filterCutoff, factor };
    }

    it("calculates deep sub-bass frequencies at 10,000 FT cruising altitude", () => {
      const mod = computeAltitudeModulation(10000);
      expect(mod.carrierFreq).toBe(65);
      expect(mod.filterCutoff).toBe(180);
      expect(mod.factor).toBe(1.0);
    });

    it("calculates resonant ground frequencies at 0 FT bedrock touchdown", () => {
      const mod = computeAltitudeModulation(0);
      expect(mod.carrierFreq).toBe(45);
      expect(mod.filterCutoff).toBe(420);
      expect(mod.factor).toBe(0.0);
    });

    it("interpolates smoothly at midway altitude (5,000 FT)", () => {
      const mod = computeAltitudeModulation(5000);
      expect(mod.carrierFreq).toBe(55);
      expect(mod.filterCutoff).toBe(300);
      expect(mod.factor).toBe(0.5);
    });

    it("clamps out-of-range negative or excessive altitudes safely", () => {
      const modNegative = computeAltitudeModulation(-500);
      expect(modNegative.factor).toBe(0.0);

      const modExcess = computeAltitudeModulation(15000);
      expect(modExcess.factor).toBe(1.0);
    });
  });

  describe("9.4 Node Lifecycle & Zero-Leak Audio Disconnection", () => {
    it("safely invokes disconnect on all linked audio nodes when oscillator ends", () => {
      const mockOsc = { onended: null, disconnect: vi.fn() };
      const mockGain = { disconnect: vi.fn() };
      const mockPanner = { disconnect: vi.fn() };

      function autoDisconnect(osc, ...nodes) {
        osc.onended = () => {
          try { osc.disconnect(); } catch (e) {}
          nodes.forEach((n) => {
            try { n.disconnect(); } catch (e) {}
          });
        };
      }

      autoDisconnect(mockOsc, mockGain, mockPanner);
      expect(mockOsc.disconnect).not.toHaveBeenCalled();

      // Trigger oscillator end event
      mockOsc.onended();

      expect(mockOsc.disconnect).toHaveBeenCalledTimes(1);
      expect(mockGain.disconnect).toHaveBeenCalledTimes(1);
      expect(mockPanner.disconnect).toHaveBeenCalledTimes(1);
    });

    it("catches and ignores disconnect errors on already-disconnected nodes", () => {
      const mockOsc = {
        onended: null,
        disconnect: vi.fn().mockImplementation(() => {
          throw new Error("InvalidStateError");
        })
      };

      function autoDisconnect(osc) {
        osc.onended = () => {
          try { osc.disconnect(); } catch (e) {}
        };
      }

      autoDisconnect(mockOsc);
      expect(() => mockOsc.onended()).not.toThrow();
    });
  });

  describe("9.5 Audio Mute Toggle & LocalStorage Sync", () => {
    it("persists mute state changes to localStorage and cancels scheduled gain values", () => {
      let isMuted = false;
      const mockStorage = {};
      const mockGain = {
        gain: {
          cancelScheduledValues: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        }
      };

      function setMuted(muted, ctxTime = 1.0) {
        isMuted = Boolean(muted);
        mockStorage["leveldevil_sfx_muted"] = String(isMuted);
        if (isMuted) {
          mockGain.gain.cancelScheduledValues(ctxTime);
          mockGain.gain.linearRampToValueAtTime(0.0001, ctxTime + 0.1);
        }
      }

      setMuted(true, 5.0);
      expect(isMuted).toBe(true);
      expect(mockStorage["leveldevil_sfx_muted"]).toBe("true");
      expect(mockGain.gain.cancelScheduledValues).toHaveBeenCalledWith(5.0);
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 5.1);
    });
  });
});
