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
        this.getAudioContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
      };

      window.addEventListener("pointerdown", unlock, { passive: true, once: true });
      window.addEventListener("keydown", unlock, { passive: true, once: true });
      window.addEventListener("touchstart", unlock, { passive: true, once: true });
    }

    getAudioContext() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      }

      const AudioCtxClass = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AudioCtxClass) return null;

      try {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Gentle non-intrusive volume
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;

        if (this.ctx.state === "suspended") {
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
      this.updateUI();
    }

    toggle() {
      this.setMuted(!this.muted);
      if (!this.muted) {
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

    // --- PROCEDURAL DROID SFX SYNTHESIS PRESETS ---

    /**
     * Jump: Playful ascending BB-8 chirping whistle glide (520Hz -> 880Hz)
     */
    playJump() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        // Soft attack, crisp decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    /**
     * Land: Low-pass cushioned mechanical contact thud (180Hz -> 80Hz)
     */
    playLand() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.10);
      } catch (e) {}
    }

    /**
     * Construct: High-tech hard-light laser springboard deployment ping (1400Hz -> 450Hz)
     */
    playConstruct() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        // Primary laser beam carrier
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

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
        gain.connect(this.masterGain);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.19);
        sub.stop(now + 0.19);
      } catch (e) {}
    }

    /**
     * Weld: Modulated electrical spark sizzle crackle
     */
    playWeld() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

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
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.11);
      } catch (e) {}
    }

    /**
     * Thought: Inquisitive conversational droid double-warble
     */
    playThought() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(740, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        gain1.gain.setValueAtTime(0.07, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
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
        gain2.connect(this.masterGain);
        osc2.start(now + 0.09);
        osc2.stop(now + 0.20);
      } catch (e) {}
    }

    /**
     * Celebrate: Triumphant 4-tone ascending pentatonic fanfare (C5 -> E5 -> G5 -> C6)
     */
    playCelebrate() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const now = ctx.currentTime + i * 0.075;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.10, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.30);
        });
      } catch (e) {}
    }

    /**
     * Alert: Caution dual-tone warning boop
     */
    playAlert() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.19);
      } catch (e) {}
    }

    /**
     * Click: Tactile retro mechanical switch click
     */
    playClick() {
      if (this.muted) return;
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }
  }

  // Instantiate singleton
  const sfxInstance = new DroidSynthEngine();

  // Expose to window and CommonJS / ES modules
  if (typeof window !== "undefined") {
    window.SFX = sfxInstance;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => sfxInstance.initUI());
    } else {
      sfxInstance.initUI();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { DroidSynthEngine, SFX: sfxInstance };
  }
})();
