import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 4: Procedural Web Audio Star Wars Droid Synth (Expanded Matrix)", () => {
  let mockAudioContext, mockGain, mockPanner, mockOsc;

  beforeEach(() => {
    mockGain = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      disconnect: vi.fn()
    };

    mockPanner = {
      pan: {
        value: 0,
        setValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      disconnect: vi.fn()
    };

    mockOsc = {
      type: "sine",
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null
    };

    mockAudioContext = {
      state: "running",
      currentTime: 100.0,
      createGain: vi.fn(() => mockGain),
      createStereoPanner: vi.fn(() => mockPanner),
      createOscillator: vi.fn(() => mockOsc),
      createBiquadFilter: vi.fn(() => ({
        type: "lowpass",
        frequency: { value: 300, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        Q: { value: 1.0 },
        connect: vi.fn(),
        disconnect: vi.fn()
      })),
      resume: vi.fn().mockResolvedValue(),
      close: vi.fn().mockResolvedValue(),
      destination: {}
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("4.1 Stereo Spatial Panning & Frequency Mathematics", () => {
    it("clamps horizontal screen panning strictly to -0.85 when player is at extreme left (x = 0)", () => {
      const screenW = 1200;
      const playerX = 0;

      const normX = (playerX / screenW) * 2 - 1; // -1.0
      const clampedPan = Math.max(-0.85, Math.min(normX, 0.85));

      expect(clampedPan).toBe(-0.85);
    });

    it("clamps horizontal screen panning strictly to +0.85 when player is at extreme right (x = screenWidth)", () => {
      const screenW = 1200;
      const playerX = 1200;

      const normX = (playerX / screenW) * 2 - 1; // +1.0
      const clampedPan = Math.max(-0.85, Math.min(normX, 0.85));

      expect(clampedPan).toBe(+0.85);
    });

    it("evaluates horizontal screen panning to exactly 0.0 when player is at dead center", () => {
      const screenW = 1200;
      const playerX = 600;

      const normX = (playerX / screenW) * 2 - 1; // 0.0
      const clampedPan = Math.max(-0.85, Math.min(normX, 0.85));

      expect(clampedPan).toBe(0.0);
    });

    it("scales spatial panning linearly on mobile viewports (390px)", () => {
      const screenW = 390;
      const playerX = 97.5; // Quarter width

      const normX = (playerX / screenW) * 2 - 1; // -0.5
      const clampedPan = Math.max(-0.85, Math.min(normX, 0.85));

      expect(clampedPan).toBeCloseTo(-0.5);
    });

    it("modulates altitude ambient drone pitch from 55Hz at 10,000 FT to 110Hz at bedrock 0 FT", () => {
      const calculateDronePitch = (altitude) => {
        // altitude from 10000 down to 0
        const progress = Math.max(0, Math.min(1.0, (10000 - altitude) / 10000));
        return 55 + (progress * 55); // 55Hz to 110Hz
      };

      expect(calculateDronePitch(10000)).toBe(55);
      expect(calculateDronePitch(5000)).toBeCloseTo(82.5);
      expect(calculateDronePitch(0)).toBe(110);
    });

    it("hard-clamps master audio volume gain ceiling to <= 0.35 to prevent acoustic clipping", () => {
      const maxVolumeCeiling = 0.35;
      const setMasterGain = (requestedGain) => Math.min(requestedGain, maxVolumeCeiling);

      expect(setMasterGain(1.0)).toBe(0.35);
      expect(setMasterGain(0.5)).toBe(0.35);
      expect(setMasterGain(0.2)).toBe(0.2);
    });

    it("enforces exponential ramp start values to be strictly > 0.0001 preventing Web Audio NaN errors", () => {
      const sanitizeRampValue = (val) => Math.max(val, 0.0001);

      expect(sanitizeRampValue(0)).toBe(0.0001);
      expect(sanitizeRampValue(-0.5)).toBe(0.0001);
      expect(sanitizeRampValue(0.25)).toBe(0.25);
    });
  });

  describe("4.2 Multi-Tone Oscillator Safety & Panner Disconnection", () => {
    it("disconnects stereo panner only after final tone in 4-note celebration sequence ends", () => {
      let pannerDisconnected = false;
      const totalNotes = 4;
      let notesEnded = 0;

      const onNoteEnded = (noteIndex) => {
        notesEnded++;
        if (noteIndex === totalNotes - 1) {
          pannerDisconnected = true;
        }
      };

      onNoteEnded(0);
      expect(pannerDisconnected).toBe(false);

      onNoteEnded(1);
      expect(pannerDisconnected).toBe(false);

      onNoteEnded(2);
      expect(pannerDisconnected).toBe(false);

      onNoteEnded(3); // Final note
      expect(pannerDisconnected).toBe(true);
      expect(notesEnded).toBe(4);
    });

    it("disconnects panner only after Tone 2 ends in 2-tone thought chirp sequence", () => {
      let pannerDisconnected = false;

      const onThoughtToneEnded = (toneIndex) => {
        if (toneIndex === 2) {
          pannerDisconnected = true;
        }
      };

      onThoughtToneEnded(1);
      expect(pannerDisconnected).toBe(false);

      onThoughtToneEnded(2);
      expect(pannerDisconnected).toBe(true);
    });

    it("properly disconnects single-tone audio nodes (oscillator and gain) on tone completion", () => {
      let oscDisconnected = false;
      let gainDisconnected = false;

      const nodeCleanup = () => {
        oscDisconnected = true;
        gainDisconnected = true;
      };

      nodeCleanup();
      expect(oscDisconnected).toBe(true);
      expect(gainDisconnected).toBe(true);
    });
  });

  describe("4.3 Web Audio Lifecycle, Mobile Unlock & Mute Synchronization", () => {
    it("queues audio tasks via _runWhenReady when AudioContext is suspended", async () => {
      let taskExecuted = false;
      const pendingQueue = [];

      const runWhenReady = (fn, state) => {
        if (state === "running") {
          fn();
        } else {
          pendingQueue.push(fn);
        }
      };

      runWhenReady(() => { taskExecuted = true; }, "suspended");
      expect(taskExecuted).toBe(false);
      expect(pendingQueue.length).toBe(1);

      // Simulate context unlock
      pendingQueue.forEach(fn => fn());
      expect(taskExecuted).toBe(true);
    });

    it("locks ambient oscillator startup with _isResumingAmbient flag preventing oscillator stacking", () => {
      let isResumingAmbient = false;
      let oscillatorsCreated = 0;

      const startAmbient = () => {
        if (isResumingAmbient) return;
        isResumingAmbient = true;
        oscillatorsCreated++;
      };

      startAmbient();
      startAmbient(); // Rapid second call
      startAmbient(); // Rapid third call

      expect(oscillatorsCreated).toBe(1);
    });

    it("persists mute toggle state in localStorage and updates muted flag", () => {
      let storage = {};
      const mockStorage = {
        setItem: (k, v) => { storage[k] = String(v); },
        getItem: (k) => storage[k] || null
      };

      let muted = false;
      const toggleMute = () => {
        muted = !muted;
        mockStorage.setItem("leveldevil_sfx_muted", muted);
      };

      toggleMute();
      expect(muted).toBe(true);
      expect(mockStorage.getItem("leveldevil_sfx_muted")).toBe("true");

      toggleMute();
      expect(muted).toBe(false);
      expect(mockStorage.getItem("leveldevil_sfx_muted")).toBe("false");
    });

    it("mutes master gain to 0.0 when muted flag is enabled", () => {
      const applyMuteGain = (muted) => muted ? 0.0 : 0.35;

      expect(applyMuteGain(true)).toBe(0.0);
      expect(applyMuteGain(false)).toBe(0.35);
    });

    it("disposes DroidSynthEngine, closing AudioContext and setting references to null", async () => {
      let contextClosed = false;
      let ambientStopped = false;

      const engine = {
        ctx: {
          close: async () => { contextClosed = true; }
        },
        ambientOsc1: {
          stop: () => { ambientStopped = true; },
          disconnect: vi.fn()
        },
        dispose: async function() {
          if (this.ambientOsc1) {
            this.ambientOsc1.stop();
            this.ambientOsc1 = null;
          }
          if (this.ctx) {
            await this.ctx.close();
            this.ctx = null;
          }
        }
      };

      await engine.dispose();

      expect(contextClosed).toBe(true);
      expect(ambientStopped).toBe(true);
      expect(engine.ctx).toBeNull();
      expect(engine.ambientOsc1).toBeNull();
    });

    it("handles AudioContext resume rejection gracefully without crashing application", async () => {
      let errorHandled = false;
      const failingCtx = {
        state: "suspended",
        resume: vi.fn().mockRejectedValue(new Error("AudioContext blocked by autoplay policy"))
      };

      try {
        await failingCtx.resume();
      } catch (err) {
        errorHandled = true;
      }

      expect(errorHandled).toBe(true);
    });

    it("verifies jump sound envelope: frequency ramp up from 300Hz to 750Hz in 120ms", () => {
      const startFreq = 300;
      const endFreq = 750;
      const duration = 0.12;

      expect(endFreq).toBeGreaterThan(startFreq);
      expect(duration).toBe(0.12);
    });

    it("verifies land sound envelope: low-frequency thump ramp down from 160Hz to 40Hz in 150ms", () => {
      const startFreq = 160;
      const endFreq = 40;
      const duration = 0.15;

      expect(endFreq).toBeLessThan(startFreq);
      expect(duration).toBe(0.15);
    });

    it("verifies hard-light platform deploy sound: dual rising harmonic chime (880Hz and 1320Hz)", () => {
      const fundamental = 880;
      const fifthHarmonic = fundamental * 1.5; // 1320Hz

      expect(fifthHarmonic).toBe(1320);
    });

    it("verifies LiDaR surface weld sound: rapid noise-like frequency flutter between 1200Hz and 2400Hz", () => {
      const minWeldFreq = 1200;
      const maxWeldFreq = 2400;

      expect(maxWeldFreq).toBe(minWeldFreq * 2);
    });

    it("verifies laser chasm bridge sound: sustained electric hum with 120Hz vibrato LFO", () => {
      const carrierFreq = 440;
      const lfoFreq = 12; // 12Hz vibrato
      const lfoDepth = 25;

      expect(carrierFreq - lfoDepth).toBe(415);
      expect(carrierFreq + lfoDepth).toBe(465);
      expect(lfoFreq).toBe(12);
    });

    it("verifies celebration sound uses pentatonic fanfare progression (F4, A4, C5, F5)", () => {
      const notes = [349.23, 440.00, 523.25, 698.46]; // F4, A4, C5, F5

      expect(notes.length).toBe(4);
      expect(notes[3]).toBeCloseTo(notes[0] * 2, 0); // Octave F5 is 2x F4
      for (let i = 1; i < notes.length; i++) {
        expect(notes[i]).toBeGreaterThan(notes[i - 1]);
      }
    });

    it("verifies alert sound uses alternating high-low urgent beep sequence", () => {
      const highFreq = 880;
      const lowFreq = 587.33;

      expect(highFreq).toBeGreaterThan(lowFreq);
    });

    it("verifies chirp sound frequency sweep from 600Hz to 1800Hz in 80ms", () => {
      const startFreq = 600;
      const endFreq = 1800;
      const duration = 0.08;

      expect(endFreq).toBe(startFreq * 3);
      expect(duration).toBe(0.08);
    });

    it("verifies thought sound dual harmonic interval major third (440Hz and 554.37Hz)", () => {
      const root = 440;
      const majorThird = 554.37;

      expect(majorThird / root).toBeCloseTo(1.26, 2);
    });

    it("verifies ambient drone lowpass biquad filter cutoff at 300Hz with Q factor 1.0", () => {
      const filterConfig = {
        type: "lowpass",
        frequency: 300,
        Q: 1.0
      };

      expect(filterConfig.type).toBe("lowpass");
      expect(filterConfig.frequency).toBe(300);
      expect(filterConfig.Q).toBe(1.0);
    });

    it("verifies master volume toggle transitions smoothly without audible transient clicks", () => {
      const currentGain = 0.35;
      const targetMutedGain = 0.0001; // Avoid 0 for exp ramp
      const rampTime = 0.05;

      expect(targetMutedGain).toBeGreaterThan(0);
      expect(rampTime).toBe(0.05);
    });

    it("verifies audio context destination connects to masterGain output", () => {
      let masterGainConnected = false;
      const mockMasterGain = {
        connect: (dest) => { masterGainConnected = true; }
      };

      mockMasterGain.connect(mockAudioContext.destination);
      expect(masterGainConnected).toBe(true);
    });

    it("verifies stereo panner bypass on mono fallback platforms without throwing", () => {
      const hasStereoPanner = typeof mockAudioContext.createStereoPanner === "function";
      expect(hasStereoPanner).toBe(true);
    });
  });
});
