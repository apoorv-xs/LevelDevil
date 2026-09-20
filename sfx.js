// sfx.js - Lightweight procedural 8-bit Web Audio API sound synthesizer
// Zero external files, zero latency, zero bandwidth overhead.

(function () {
    let audioCtx = null;
    let isMuted = false;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Auto-unlock audio on user interaction
    const unlockAudio = () => {
        getAudioContext();
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    window.SFX = {
        isMuted() {
            return isMuted;
        },

        toggleMute() {
            isMuted = !isMuted;
            const btn = document.getElementById("sfx-toggle-btn");
            if (btn) {
                btn.textContent = isMuted ? "🔇" : "🔊";
                btn.title = isMuted ? "Sound: OFF" : "Sound: ON";
            }
            return isMuted;
        },

        // Punchy 8-bit Jump chirp: rising square wave
        playJump() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "square";
            const now = ctx.currentTime;

            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.14);
        },

        // Data Core Pickup: radiant bright arpeggio chime
        playPickup() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "triangle";
                const start = ctx.currentTime + idx * 0.05;

                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.12, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.20);
            });
        },

        // Trap Trigger / Collision: crunch noise thud
        playTrap() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sawtooth";
            const now = ctx.currentTime;

            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.24);
        },

        // Sector Atmosphere Transition: sci-fi harmonic sweep
        playSectorChange() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            const now = ctx.currentTime;

            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        },

        // Grand Victory Fanfare (All 5 Cores Collected)
        playVictory() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const chords = [
                { f: 523.25, t: 0.00 }, // C5
                { f: 659.25, t: 0.10 }, // E5
                { f: 783.99, t: 0.20 }, // G5
                { f: 1046.50, t: 0.32 }, // C6
                { f: 880.00, t: 0.44 },  // A5
                { f: 1046.50, t: 0.56 }, // C6
                { f: 1318.51, t: 0.70 }  // E6
            ];

            chords.forEach(({ f, t }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "square";
                const start = ctx.currentTime + t;

                osc.frequency.setValueAtTime(f, start);

                gain.gain.setValueAtTime(0.12, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.38);
            });
        }
    };
})();
