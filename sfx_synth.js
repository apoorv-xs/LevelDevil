// sfx_synth.js - Procedural Droid Synth Sound Engine (0 KB Audio Payload)
// Synthesizes authentic Star Wars BB-8 astromech chirps, laser pings, and telemetry audio in real-time via Web Audio API.

(function () {
  "use strict";

  const STORAGE_KEY = "leveldevil_sfx_muted";

  class DroidSynthEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.muted = false;
      this.initialized = false;
      this._firstGestureBound = false;
      this.ambientOsc1 = null;
      this.ambientOsc2 = null;
      this.ambientFilter = null;
      this.ambientGain = null;
      this.ambientActive = false;
      this.currentAltitude = 10000;
      this._hasUserGesture = false;

      // Load initial mute state from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          this.muted = window.localStorage.getItem(STORAGE_KEY) === "true";
        } catch (e) {
          this.muted = false;
        }
      }

      this.bindGestureListeners();
    }

    bindGestureListeners() {
      if (typeof window === "undefined" || this._firstGestureBound) return;
      this._firstGestureBound = true;

      const unlock = () => {
        this._hasUserGesture = true;
        const ctx = this.getAudioContext(true);
        if (ctx && !this.muted && !this.ambientActive) {
          this.startAmbient();
        }
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("click", unlock);
      };

      window.addEventListener("pointerdown", unlock, { passive: true, once: true });
      window.addEventListener("keydown", unlock, { passive: true, once: true });
      window.addEventListener("touchstart", unlock, { passive: true, once: true });
      window.addEventListener("click", unlock, { passive: true, once: true });
    }

    getAudioContext(force = false) {
      if (this.ctx) {
        if (this.ctx.state === "suspended" && (this._hasUserGesture || force)) {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      }

      // Defer AudioContext instantiation until first user gesture in browser environments to avoid autoplay violations
      const isTestEnv = typeof process !== "undefined" && process.env && (process.env.VITEST || process.env.NODE_ENV === "test");
      if (!this._hasUserGesture && !force && !isTestEnv && typeof window !== "undefined") {
        return null;
      }

      const AudioCtxClass = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AudioCtxClass) return null;

      try {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Gentle non-intrusive volume
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;

        if (this.ctx.state === "suspended" && (this._hasUserGesture || force || isTestEnv)) {
          this.ctx.resume().catch(() => {});
        }
      } catch (err) {
        return null;
      }

      return this.ctx;
    }

    isMuted() {
      return this.muted;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, String(this.muted));
        } catch (e) {}
      }
      if (this.muted) {
        if (this.ambientGain && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            this.ambientGain.gain.cancelScheduledValues(now);
            this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
          } catch (e) {}
        }
      } else {
        if (this.ambientActive && this.ambientGain && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            this.ambientGain.gain.cancelScheduledValues(now);
            this.ambientGain.gain.linearRampToValueAtTime(0.018, now + 0.3);
          } catch (e) {}
        } else if (!this.ambientActive && this.ctx) {
          this.startAmbient();
        }
      }
      this.updateUI();
    }

    toggle() {
      this._hasUserGesture = true;
      this.setMuted(!this.muted);
      if (!this.muted) {
        this.getAudioContext(true);
        // Play gentle click confirmation when unmuting
        this.playClick();
      }
      return !this.muted;
    }

    updateUI() {
      if (typeof document === "undefined") return;
      const buttons = document.querySelectorAll("#sfx-toggle-btn, .sfx-toggle-btn, .sfx-btn");
      buttons.forEach((btn) => {
        if (this.muted) {
          btn.textContent = "[ 🔇 SFX ]";
          btn.setAttribute("aria-pressed", "false");
          btn.classList.add("sfx-muted");
        } else {
          btn.textContent = "[ 🔊 SFX ]";
          btn.setAttribute("aria-pressed", "true");
          btn.classList.remove("sfx-muted");
        }
      });
    }

    initUI() {
      this.updateUI();
      if (typeof document === "undefined") return;
      const buttons = document.querySelectorAll("#sfx-toggle-btn, .sfx-toggle-btn, .sfx-btn");
      buttons.forEach((btn) => {
        if (!btn._sfxBound) {
          btn._sfxBound = true;
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            this.toggle();
          });
        }
      });
    }

    // --- PROCEDURAL ATMOSPHERIC ALTITUDE DRONE (0 KB PAYLOAD) ---

    /**
     * Starts dual-oscillator sub-bass drone with resonant altitude-reactive biquad filtering
     */
    startAmbient() {
      if (this.ambientActive || this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }
      if (this.ambientActive) return;

      try {
        const now = ctx.currentTime;

        // Sub-bass fundamental oscillator (45Hz base)
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(45, now);

        // Harmonic overtone (67.5Hz - perfect 5th)
        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(67.5, now);

        // Sub-overtone balance gain
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.22, now);
        osc2.connect(overtoneGain);

        // Atmospheric Biquad Filter (dynamic altitude resonance)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.setValueAtTime(1.4, now);

        // Ambient Master Gain (subtle, non-fatiguing bed: 0.018 target)
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.018, now + 1.2);

        // Routing
        osc1.connect(filter);
        overtoneGain.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);

        this.ambientOsc1 = osc1;
        this.ambientOsc2 = osc2;
        this.ambientFilter = filter;
        this.ambientGain = gain;
        this.ambientActive = true;

        // Apply initial altitude modulation
        this.updateAltitude(this.currentAltitude);
      } catch (e) {
        this.ambientActive = false;
      }
    }

    /**
     * Smoothly stops and cleans up ambient drone nodes to guarantee zero memory leaks
     */
    stopAmbient() {
      if (!this.ambientActive) return;
      const ctx = this.ctx;
      const now = ctx ? ctx.currentTime : 0;

      if (this.ambientGain && ctx) {
        try {
          this.ambientGain.gain.cancelScheduledValues(now);
          this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        } catch (e) {}
      }

      const osc1 = this.ambientOsc1;
      const osc2 = this.ambientOsc2;
      const filter = this.ambientFilter;
      const gain = this.ambientGain;

      setTimeout(() => {
        try { if (osc1) { osc1.stop(); osc1.disconnect(); } } catch (e) {}
        try { if (osc2) { osc2.stop(); osc2.disconnect(); } } catch (e) {}
        try { if (filter) { filter.disconnect(); } } catch (e) {}
        try { if (gain) { gain.disconnect(); } } catch (e) {}
      }, 200);

      this.ambientOsc1 = null;
      this.ambientOsc2 = null;
      this.ambientFilter = null;
      this.ambientGain = null;
      this.ambientActive = false;
    }

    /**
     * Dynamically shifts drone filter resonance and base pitch based on vertical descent (10,000 FT -> 0 FT)
     */
    updateAltitude(altitudeFt) {
      if (typeof altitudeFt !== "number" || isNaN(altitudeFt)) return;
      this.currentAltitude = Math.max(0, Math.min(10000, altitudeFt));

      if (!this.ambientActive || !this.ambientFilter || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        // Altitude ratio: 1.0 at 10,000 FT (stratosphere), 0.0 at 0 FT (Terra Firma)
        const ratio = this.currentAltitude / 10000;

        // Stratosphere (10k FT): 380Hz cutoff (airy, thin wind hiss)
        // Terra Firma (0 FT): 75Hz cutoff (dense, deep grounded reactor drone)
        const cutoff = 75 + ratio * 305;
        this.ambientFilter.frequency.cancelScheduledValues(now);
        this.ambientFilter.frequency.linearRampToValueAtTime(cutoff, now + 0.15);

        // Base frequency subtly deepens as air density increases on descent
        if (this.ambientOsc1) {
          const baseFreq = 42 + ratio * 6; // 48Hz at 10,000 FT -> 42Hz at 0 FT
          this.ambientOsc1.frequency.cancelScheduledValues(now);
          this.ambientOsc1.frequency.linearRampToValueAtTime(baseFreq, now + 0.15);
        }
        if (this.ambientOsc2) {
          const harmFreq = (42 + ratio * 6) * 1.5;
          this.ambientOsc2.frequency.cancelScheduledValues(now);
          this.ambientOsc2.frequency.linearRampToValueAtTime(harmFreq, now + 0.15);
        }
      } catch (e) {}
    }

    getPanX(worldX) {
      if (typeof window === "undefined") return 0;
      let x = typeof worldX === "number" ? worldX : null;
      if (x === null) {
        if (window.player && window.player.pos && typeof window.player.pos.x === "number") {
          x = window.player.pos.x;
        } else if (window.guy && window.guy.pos && typeof window.guy.pos.x === "number") {
          x = window.guy.pos.x;
        }
      }
      if (typeof x !== "number" || isNaN(x)) return 0;

      const screenWidth = window.innerWidth || 1200;
      const normalized = (x / screenWidth) * 2 - 1;
      return Math.max(-0.85, Math.min(0.85, normalized));
    }

    _createPanner(ctx, panX, now) {
      if (!ctx || typeof ctx.createStereoPanner !== "function") {
        return null;
      }
      try {
        const panner = ctx.createStereoPanner();
        const panVal = this.getPanX(panX);
        panner.pan.setValueAtTime(panVal, now);
        panner.connect(this.masterGain);
        return panner;
      } catch (e) {
        return null;
      }
    }

    _autoDisconnect(osc, ...nodes) {
      if (!osc) return;
      osc.onended = () => {
        try { osc.disconnect(); } catch (e) {}
        for (let i = 0; i < nodes.length; i++) {
          try {
            if (nodes[i] && typeof nodes[i].disconnect === "function") {
              nodes[i].disconnect();
            }
          } catch (e) {}
        }
      };
    }

    // --- PROCEDURAL DROID SFX SYNTHESIS PRESETS ---

    /**
     * Jump: Playful ascending BB-8 chirping whistle glide (520Hz -> 880Hz)
     */
    playJump(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        // Soft attack, crisp decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, gain);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    /**
     * Land: Low-pass cushioned mechanical contact thud (180Hz -> 80Hz)
     */
    playLand(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, filter, gain);
        osc.start(now);
        osc.stop(now + 0.10);
      } catch (e) {}
    }

    /**
     * Construct: High-tech hard-light laser springboard deployment ping (1400Hz -> 450Hz)
     */
    playConstruct(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        // Primary laser beam carrier
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.16);

        // Sub-harmonic resonant body
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(700, now);
        sub.frequency.exponentialRampToValueAtTime(225, now + 0.16);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(900, now);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        subGain.gain.setValueAtTime(0.08, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, sub, filter, gain, subGain);
        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.19);
        sub.stop(now + 0.19);
      } catch (e) {}
    }

    /**
     * Weld: Modulated electrical spark sizzle crackle
     */
    playWeld(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.setValueAtTime(2400, now + 0.03);
        osc.frequency.setValueAtTime(1200, now + 0.06);

        filter.type = "highpass";
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, filter, gain);
        osc.start(now);
        osc.stop(now + 0.11);
      } catch (e) {}
    }

    /**
     * Thought: Inquisitive conversational droid double-warble
     */
    playThought(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(740, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        gain1.gain.setValueAtTime(0.07, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc1.connect(gain1);
        gain1.connect(dest);
        this._autoDisconnect(osc1, panner, gain1);
        osc1.start(now);
        osc1.stop(now + 0.09);

        // Tone 2 (flutter response)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(940, now + 0.09);
        osc2.frequency.exponentialRampToValueAtTime(680, now + 0.18);
        gain2.gain.setValueAtTime(0.08, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc2.connect(gain2);
        gain2.connect(dest);
        this._autoDisconnect(osc2, panner, gain2);
        osc2.start(now + 0.09);
        osc2.stop(now + 0.20);
      } catch (e) {}
    }

    /**
     * Celebrate: Triumphant 4-tone ascending pentatonic fanfare (C5 -> E5 -> G5 -> C6)
     */
    playCelebrate(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const panner = this._createPanner(ctx, panX, ctx.currentTime);
        const dest = panner || this.masterGain;

        notes.forEach((freq, i) => {
          const now = ctx.currentTime + i * 0.075;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.10, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(dest);

          this._autoDisconnect(osc, panner, gain);
          osc.start(now);
          osc.stop(now + 0.30);
        });
      } catch (e) {}
    }

    /**
     * Alert: Caution dual-tone warning boop
     */
    playAlert(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, gain);
        osc.start(now);
        osc.stop(now + 0.19);
      } catch (e) {}
    }

    /**
     * Click: Tactile retro mechanical switch click
     */
    playClick(panX) {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state !== "running") {
        ctx.resume().catch(() => {});
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = this._createPanner(ctx, panX, now);
        const dest = panner || this.masterGain;

        osc.type = "sine";
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(dest);

        this._autoDisconnect(osc, panner, gain);
        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }
    
    dispose() {
      if (this.ctx) {
        this.ctx.close().catch(() => {});
        this.ctx = null;
      }
    }
  }

  // Instantiate singleton
  const sfxInstance = new DroidSynthEngine();

  // Expose to window, globalThis, and CommonJS / ES modules
  if (typeof window !== "undefined") {
    window.SFX = sfxInstance;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => sfxInstance.initUI());
    } else {
      sfxInstance.initUI();
    }
  }

  if (typeof globalThis !== "undefined") {
    globalThis.DroidSynthEngine = DroidSynthEngine;
    globalThis.SFX = sfxInstance;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { DroidSynthEngine, SFX: sfxInstance };
  }
})();
