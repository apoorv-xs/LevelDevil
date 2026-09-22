import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DroidSynthEngine, SFX } from "../../sfx_synth.js";
import fs from "node:fs";

describe("Procedural Droid Synth Sound Engine (0 KB Audio Payload)", () => {
  let mockStorage = {};
  let elements = [];
  const originalWindow = global.window;
  const originalDocument = global.document;

  beforeEach(() => {
    mockStorage = {};
    elements = [];

    const mockDocument = {
      createElement: (tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          textContent: "",
          classList: {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            contains(c) { return this._classes.has(c); },
            toggle(c, force) {
              if (force === undefined) {
                if (this._classes.has(c)) this._classes.delete(c);
                else this._classes.add(c);
              } else if (force) {
                this._classes.add(c);
              } else {
                this._classes.delete(c);
              }
            }
          },
          attributes: {},
          setAttribute(k, v) { this.attributes[k] = String(v); },
          getAttribute(k) { return this.attributes[k] || null; },
          listeners: {},
          addEventListener(event, fn) {
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(fn);
          },
          click() {
            if (this.listeners["click"]) {
              this.listeners["click"].forEach(fn => fn({ preventDefault: () => {} }));
            }
          },
          remove() {
            const idx = elements.indexOf(this);
            if (idx !== -1) elements.splice(idx, 1);
          }
        };
        return el;
      },
      querySelectorAll: (sel) => {
        return elements.filter(el => {
          if (sel.includes("#sfx-toggle-btn") && el.id === "sfx-toggle-btn") return true;
          if (sel.includes(".sfx-btn") && el.classList.contains("sfx-btn")) return true;
          return false;
        });
      },
      body: {
        appendChild: (el) => elements.push(el)
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: "complete"
    };

    const mockWindow = {
      localStorage: {
        getItem: (key) => mockStorage[key] || null,
        setItem: (key, val) => { mockStorage[key] = String(val); },
        removeItem: (key) => { delete mockStorage[key]; }
      },
      AudioContext: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.window = mockWindow;
    global.document = mockDocument;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  it("exports DroidSynthEngine and a default singleton SFX instance", () => {
    expect(DroidSynthEngine).toBeDefined();
    expect(SFX).toBeDefined();
    expect(typeof SFX.playJump).toBe("function");
    expect(typeof SFX.playLand).toBe("function");
    expect(typeof SFX.playConstruct).toBe("function");
    expect(typeof SFX.playWeld).toBe("function");
    expect(typeof SFX.playThought).toBe("function");
    expect(typeof SFX.playCelebrate).toBe("function");
    expect(typeof SFX.playAlert).toBe("function");
    expect(typeof SFX.playClick).toBe("function");
    expect(typeof SFX.toggle).toBe("function");
    expect(typeof SFX.setMuted).toBe("function");
    expect(typeof SFX.isMuted).toBe("function");
  });

  it("initializes mute state and persists changes to localStorage", () => {
    const engine = new DroidSynthEngine();
    expect(engine.isMuted()).toBe(false);

    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
    expect(mockStorage["leveldevil_sfx_muted"]).toBe("true");

    engine.setMuted(false);
    expect(engine.isMuted()).toBe(false);
    expect(mockStorage["leveldevil_sfx_muted"]).toBe("false");
  });

  it("toggles mute state and returns active sound state", () => {
    const engine = new DroidSynthEngine();
    engine.setMuted(false);

    const activeAfterFirstToggle = engine.toggle();
    expect(activeAfterFirstToggle).toBe(false);
    expect(engine.isMuted()).toBe(true);

    const activeAfterSecondToggle = engine.toggle();
    expect(activeAfterSecondToggle).toBe(true);
    expect(engine.isMuted()).toBe(false);
  });

  it("updates DOM buttons on mute toggle", () => {
    const btn = document.createElement("button");
    btn.id = "sfx-toggle-btn";
    btn.className = "topbar-btn sfx-btn";
    document.body.appendChild(btn);

    const engine = new DroidSynthEngine();
    engine.setMuted(false);
    engine.updateUI();
    expect(btn.textContent).toBe("[ 🔊 SFX ]");
    expect(btn.classList.contains("sfx-muted")).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("true");

    engine.setMuted(true);
    engine.updateUI();
    expect(btn.textContent).toBe("[ 🔇 SFX ]");
    expect(btn.classList.contains("sfx-muted")).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    btn.remove();
  });

  it("binds click listener on initUI without duplicate event listeners", () => {
    const btn = document.createElement("button");
    btn.id = "sfx-toggle-btn";
    document.body.appendChild(btn);

    const engine = new DroidSynthEngine();
    engine.initUI();
    expect(btn._sfxBound).toBe(true);

    // Click triggers toggle
    btn.click();
    expect(engine.isMuted()).toBe(true);

    btn.remove();
  });

  describe("Synthesis Presets (Zero Audio File Payload)", () => {
    let mockOsc, mockGain, mockFilter, mockCtx;

    beforeEach(() => {
      mockOsc = {
        type: "sine",
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };

      mockGain = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      mockFilter = {
        type: "lowpass",
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      mockCtx = {
        state: "running",
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn(() => ({ ...mockOsc })),
        createGain: vi.fn(() => ({ ...mockGain })),
        createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
        resume: vi.fn().mockResolvedValue()
      };

      global.window.AudioContext = vi.fn(function () {
        return mockCtx;
      });
    });

    it("synthesizes playJump with ascending BB-8 chirping whistle glide", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playJump();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it("synthesizes playLand with low-pass cushioned mechanical contact thud", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playLand();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
    });

    it("synthesizes playConstruct with dual-oscillator laser deployment ping", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playConstruct();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
    });

    it("synthesizes playWeld with modulated spark sizzle crackle", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playWeld();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
    });

    it("synthesizes playThought with conversational dual-tone droid flutter", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playThought();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it("synthesizes playCelebrate with 4-tone ascending pentatonic fanfare", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playCelebrate();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it("synthesizes playAlert with dual-tone warning boop", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playAlert();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it("synthesizes playClick with crisp mechanical switch click", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      engine.playClick();

      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it("attaches onended lifecycle hook to cleanly disconnect nodes and prevent memory leaks", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);
      let capturedOsc = null;
      let capturedGain = null;
      mockCtx.createOscillator = vi.fn(() => {
        capturedOsc = { ...mockOsc, disconnect: vi.fn() };
        return capturedOsc;
      });
      mockCtx.createGain = vi.fn(() => {
        capturedGain = { ...mockGain, disconnect: vi.fn() };
        return capturedGain;
      });

      engine.playJump();
      expect(capturedOsc.onended).toBeDefined();

      // Trigger onended callback
      capturedOsc.onended();
      expect(capturedOsc.disconnect).toHaveBeenCalled();
      expect(capturedGain.disconnect).toHaveBeenCalled();
    });

    it("suppresses all audio when muted is true", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(true);

      engine.playJump();
      engine.playLand();
      engine.playConstruct();
      engine.playWeld();
      engine.playThought();
      engine.playCelebrate();
      engine.playAlert();
      engine.playClick();

      expect(mockCtx.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe("Spatial Audio Doppler Panning Engine (0 KB Payload)", () => {
    let mockOsc, mockGain, mockPanner, mockCtx;

    beforeEach(() => {
      mockOsc = {
        type: "sine",
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };

      mockGain = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      mockPanner = {
        pan: {
          setValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      mockCtx = {
        state: "running",
        currentTime: 10,
        destination: {},
        createOscillator: vi.fn(() => ({ ...mockOsc })),
        createGain: vi.fn(() => ({ ...mockGain })),
        createBiquadFilter: vi.fn(() => ({
          type: "lowpass",
          frequency: { setValueAtTime: vi.fn() },
          Q: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn()
        })),
        createStereoPanner: vi.fn(() => ({ ...mockPanner, pan: { setValueAtTime: vi.fn() } })),
        resume: vi.fn().mockResolvedValue()
      };

      global.window.AudioContext = vi.fn(function () {
        return mockCtx;
      });
      global.window.innerWidth = 1000;
    });

    it("calculates normalized stereo pan between -0.85 and +0.85 based on screen width", () => {
      const engine = new DroidSynthEngine();
      global.window.innerWidth = 1000;

      // Far left (0px) -> normalized -1.0 -> clamped to -0.85
      expect(engine.getPanX(0)).toBeCloseTo(-0.85);

      // Center (500px on 1000px screen) -> normalized 0
      expect(engine.getPanX(500)).toBeCloseTo(0);

      // Quarter left (250px) -> normalized -0.5
      expect(engine.getPanX(250)).toBeCloseTo(-0.5);

      // Quarter right (750px) -> normalized +0.5
      expect(engine.getPanX(750)).toBeCloseTo(0.5);

      // Far right (1000px) -> normalized +1.0 -> clamped to +0.85
      expect(engine.getPanX(1000)).toBeCloseTo(0.85);

      // Extreme out of bounds clamped strictly
      expect(engine.getPanX(-500)).toBe(-0.85);
      expect(engine.getPanX(2500)).toBe(0.85);
    });

    it("falls back to window.player.pos.x or window.guy.pos.x when coordinate is omitted", () => {
      const engine = new DroidSynthEngine();
      global.window.innerWidth = 1000;

      // window.player fallback
      global.window.player = { pos: { x: 250 } };
      expect(engine.getPanX()).toBeCloseTo(-0.5);

      // window.guy fallback
      delete global.window.player;
      global.window.guy = { pos: { x: 750 } };
      expect(engine.getPanX()).toBeCloseTo(0.5);

      // Neither present -> center (0)
      delete global.window.guy;
      expect(engine.getPanX()).toBe(0);
      expect(engine.getPanX(NaN)).toBe(0);
    });

    it("routes sound through StereoPannerNode connected to masterGain", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);

      let createdPanner = null;
      mockCtx.createStereoPanner = vi.fn(() => {
        createdPanner = {
          pan: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn()
        };
        return createdPanner;
      });

      engine.playJump(250);

      expect(mockCtx.createStereoPanner).toHaveBeenCalled();
      expect(createdPanner).not.toBeNull();
      // Pan value for 250px on 1000px screen is -0.5
      expect(createdPanner.pan.setValueAtTime).toHaveBeenCalledWith(
        expect.closeTo(-0.5, 2),
        mockCtx.currentTime
      );
      expect(createdPanner.connect).toHaveBeenCalledWith(engine.masterGain);
    });

    it("cleans up StereoPannerNode in _autoDisconnect on osc.onended", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);

      let capturedOsc = null;
      let capturedPanner = null;

      mockCtx.createOscillator = vi.fn(() => {
        capturedOsc = { ...mockOsc, disconnect: vi.fn() };
        return capturedOsc;
      });
      mockCtx.createStereoPanner = vi.fn(() => {
        capturedPanner = {
          pan: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn()
        };
        return capturedPanner;
      });

      engine.playLand(800);
      expect(capturedOsc.onended).toBeDefined();

      capturedOsc.onended();
      expect(capturedOsc.disconnect).toHaveBeenCalled();
      expect(capturedPanner.disconnect).toHaveBeenCalled();
    });

    it("gracefully falls back to masterGain when StereoPannerNode is unsupported", () => {
      const engine = new DroidSynthEngine();
      engine.setMuted(false);

      // Browser lacks createStereoPanner
      mockCtx.createStereoPanner = undefined;

      let capturedGain = null;
      mockCtx.createGain = vi.fn(() => {
        capturedGain = { ...mockGain, connect: vi.fn(), disconnect: vi.fn() };
        return capturedGain;
      });

      expect(() => {
        engine.playJump(250);
        engine.playConstruct(500);
        engine.playCelebrate(900);
      }).not.toThrow();

      // Gain connects directly to masterGain
      expect(capturedGain.connect).toHaveBeenCalledWith(engine.masterGain);
    });
  });

  describe("HTML & Shell Invariants", () => {
    it("includes sfx-toggle-btn in index.html, sales.html, and workspace/index.html", () => {
      const indexHtml = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");
      const salesHtml = fs.readFileSync(new URL("../../sales.html", import.meta.url), "utf8");
      const wsHtml = fs.readFileSync(new URL("../../workspace/index.html", import.meta.url), "utf8");

      expect(indexHtml).toContain('id="sfx-toggle-btn"');
      expect(salesHtml).toContain('id="sfx-toggle-btn"');
      expect(wsHtml).toContain('id="sfx-toggle-btn"');
    });

    it("includes sfx_synth.js in shell.js portfolioScripts", () => {
      const shellJs = fs.readFileSync(new URL("../../shell.js", import.meta.url), "utf8");
      expect(shellJs).toContain("sfx_synth.js");
    });

    it("styles .sfx-btn in shell.css", () => {
      const shellCss = fs.readFileSync(new URL("../../shell.css", import.meta.url), "utf8");
      expect(shellCss).toContain(".sfx-btn");
      expect(shellCss).toContain(".sfx-muted");
    });
  });
});
