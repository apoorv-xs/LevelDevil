// sfx.js - Web Audio API Synthesizer for retro 8-bit sound effects
const SFX = {
    ctx: null,

    init() {
        // Safe creation of AudioContext on user interaction
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            console.log("SFX: AudioContext initialized successfully.");
        }
    },

    playJump() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);

        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    },

    playDeath() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.35);

        gain.gain.setValueAtTime(0.30, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    },

    playPort() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Double-tone synth chime for portal entry
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + (i * 200), now + delay);
            osc.frequency.exponentialRampToValueAtTime(900 + (i * 100), now + delay + 0.12);

            gain.gain.setValueAtTime(0.15, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.12);
        }
    },

    playCoin() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    },

    playTroll() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.08);
        osc.frequency.linearRampToValueAtTime(70, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    },

    bgmInterval: null,
    bgmNextNoteTime: 0,
    bgmStepCount: 0,
    isMuted: false,
    bgmPlaying: false,

    scheduler() {
        while (this.bgmNextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNote(this.bgmStepCount, this.bgmNextNoteTime);
            this.advanceNote();
        }
    },

    advanceNote() {
        const secondsPerBeat = 60.0 / 125.0; // 125 BPM
        const secondsPerStep = 0.25 * secondsPerBeat; // 16th note steps (120ms per step)
        this.bgmNextNoteTime += secondsPerStep;
        this.bgmStepCount++;
    },

    scheduleNote(step, time) {
        if (this.isMuted) return;

        // 16-step patterns
        // A minor key chord progression: Am -> F -> Dm -> E
        const bassPattern = [
            110.00, 0, 110.00, 130.81, // Am (A2, A2, C3)
            87.31,  0, 87.31,  110.00, // F (F2, F2, A2)
            73.42,  0, 73.42,  87.31,  // Dm (D2, D2, F2)
            82.41,  0, 103.83, 123.47  // E (E2, G#2, B2)
        ];

        const melodyPattern = [
            440.00, 0, 523.25, 0,      // A4, C5
            349.23, 0, 440.00, 0,      // F4, A4
            293.66, 0, 349.23, 0,      // D4, F4
            329.63, 0, 392.00, 493.88  // E4, G4, B4
        ];

        const bassFreq = bassPattern[step % bassPattern.length];
        const melFreq = melodyPattern[step % melodyPattern.length];

        // Play Bass note (Soft triangle wave)
        if (bassFreq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq, time);

            // Soft bass volume
            gain.gain.setValueAtTime(0.045, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.24);
        }

        // Play Melody note (Arpeggio/Chime synth - sine wave)
        const stepInBar = step % 16;
        if (melFreq > 0 && (stepInBar === 0 || stepInBar === 2 || stepInBar === 4 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10 || stepInBar === 12 || stepInBar === 14 || stepInBar === 15)) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melFreq, time);

            // Even softer melody volume
            gain.gain.setValueAtTime(0.02, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.18);
        }
    },

    startBGM() {
        this.init();
        if (!this.ctx) return;
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.bgmNextNoteTime = this.ctx.currentTime;
        this.bgmStepCount = 0;

        // Schedule first batch
        this.scheduler();

        // 25ms timer for advance scheduling
        this.bgmInterval = setInterval(() => {
            this.scheduler();
        }, 25);
    },

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmPlaying = false;
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log("SFX: Mute state is now", this.isMuted);
        return this.isMuted;
    }
};

window.SFX = SFX;
