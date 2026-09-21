// sky_engine.js - "Level Devil Airspace" 5-Strata Atmospheric Sky & Aviation Telemetry Engine
(function () {
    "use strict";

    // --- COLOR MATH & STRATA INTERPOLATION ---
    function hexToRgb(hex) {
        const c = hex.replace("#", "");
        const num = parseInt(c, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function lerpColor(c1, c2, t) {
        const clampedT = Math.max(0, Math.min(1, t));
        const r = Math.round(c1.r + (c2.r - c1.r) * clampedT);
        const g = Math.round(c1.g + (c2.g - c1.g) * clampedT);
        const b = Math.round(c1.b + (c2.b - c1.b) * clampedT);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 5 Cohesive Warm Golden-Amber Strata (100% Brand-Locked to Level Devil --amber #e6a83b)
    const STRATA_PALETTES = [
        // Stratum 1 (0 - 650px / 10,000 - 8,000 FT): Bright Golden Dawn Stratosphere
        { y: 0, top: hexToRgb("#f6c962"), mid: hexToRgb("#f0b849"), bot: hexToRgb("#e6a83b") },
        // Stratum 2 (650 - 1450px / 8,000 - 5,500 FT): Signature Level Devil Amber Flight Corridor
        { y: 700, top: hexToRgb("#f0b849"), mid: hexToRgb("#e6a83b"), bot: hexToRgb("#e6a83b") },
        // Stratum 3 (1450 - 2250px / 5,500 - 3,000 FT): Warm Troposphere Sunlight & Contours
        { y: 1500, top: hexToRgb("#e6a83b"), mid: hexToRgb("#f6c962"), bot: hexToRgb("#fff1bd") },
        // Stratum 4 (2250 - 3050px / 3,000 - 1,000 FT): Mountain Approach Warm Golden Ochre
        { y: 2300, top: hexToRgb("#f6c962"), mid: hexToRgb("#e6a83b"), bot: hexToRgb("#d98f2d") },
        // Stratum 5 (3050 - 3700px / 1,000 - 0 FT): Bedrock Touchdown Warm Terra Amber
        { y: 3200, top: hexToRgb("#e6a83b"), mid: hexToRgb("#d98f2d"), bot: hexToRgb("#c87a22") }
    ];

    function getStrataGradient(scrollY, maxScroll, h) {
        let p1 = STRATA_PALETTES[0];
        let p2 = STRATA_PALETTES[1];
        let factor = 0;

        for (let i = 0; i < STRATA_PALETTES.length - 1; i++) {
            const cur = STRATA_PALETTES[i];
            const next = STRATA_PALETTES[i + 1];
            if (scrollY >= cur.y && scrollY <= next.y) {
                p1 = cur;
                p2 = next;
                factor = (scrollY - cur.y) / (next.y - cur.y);
                break;
            } else if (scrollY > next.y && i === STRATA_PALETTES.length - 2) {
                p1 = next;
                p2 = next;
                factor = 1;
            }
        }

        return {
            top: lerpColor(p1.top, p2.top, factor),
            mid: lerpColor(p1.mid, p2.mid, factor),
            bot: lerpColor(p1.bot, p2.bot, factor)
        };
    }

    // --- TACTILE BRUTALIST PAPER CLOUDS ---
    class SkyCloud {
        constructor(w, h, baseY, pRatio, driftSpeed, seed = 0) {
            this.w = w;
            this.h = h;
            this.baseY = baseY;
            this.pRatio = pRatio;
            this.driftSpeed = driftSpeed;
            this.seed = seed;
            this.x = Math.random() * (window.innerWidth || 1200);
            this.cachedCanvas = null;
            this.renderCache();
        }

        renderCache() {
            const c = document.createElement("canvas");
            c.width = this.w;
            c.height = this.h;
            const ctx = c.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = "#fffdf1";
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";

            const w = this.w;
            const h = this.h;

            ctx.beginPath();
            if (this.seed === 0) {
                // Classic chunky retro cloud
                ctx.moveTo(w * 0.15, h * 0.85);
                ctx.bezierCurveTo(w * 0.05, h * 0.65, w * 0.15, h * 0.40, w * 0.35, h * 0.45);
                ctx.bezierCurveTo(w * 0.40, h * 0.20, w * 0.65, h * 0.15, w * 0.75, h * 0.38);
                ctx.bezierCurveTo(w * 0.85, h * 0.30, w * 0.98, h * 0.50, w * 0.92, h * 0.75);
                ctx.lineTo(w * 0.15, h * 0.85);
            } else if (this.seed === 1) {
                // Stratified cloud deck
                ctx.moveTo(w * 0.10, h * 0.80);
                ctx.bezierCurveTo(w * 0.05, h * 0.55, w * 0.22, h * 0.45, w * 0.38, h * 0.52);
                ctx.bezierCurveTo(w * 0.48, h * 0.28, w * 0.72, h * 0.25, w * 0.82, h * 0.48);
                ctx.bezierCurveTo(w * 0.95, h * 0.52, w * 0.96, h * 0.75, w * 0.88, h * 0.82);
                ctx.lineTo(w * 0.10, h * 0.80);
            } else {
                // High cirrus feather
                ctx.moveTo(w * 0.12, h * 0.75);
                ctx.bezierCurveTo(w * 0.10, h * 0.45, w * 0.35, h * 0.38, w * 0.52, h * 0.50);
                ctx.bezierCurveTo(w * 0.65, h * 0.35, w * 0.88, h * 0.38, w * 0.95, h * 0.68);
                ctx.lineTo(w * 0.12, h * 0.75);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Tactile ink crosshatch shading
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(w * 0.45, h * 0.60, h * 0.22, 0.1 * Math.PI, 0.85 * Math.PI);
            ctx.moveTo(w * 0.70, h * 0.55);
            ctx.arc(w * 0.70, h * 0.55, h * 0.18, 0.1 * Math.PI, 0.80 * Math.PI);
            ctx.stroke();

            this.cachedCanvas = c;
        }

        update(dt, screenW) {
            this.x += this.driftSpeed * dt;
            if (this.x - this.w > screenW + 150) {
                this.x = -this.w - 100;
            }
        }

        draw(ctx, scrollY, screenH) {
            if (!this.cachedCanvas) return;
            const drawY = this.baseY - scrollY * this.pRatio;
            // Frustum cull
            if (drawY + this.h < -50 || drawY > screenH + 50) return;
            ctx.drawImage(this.cachedCanvas, Math.round(this.x), Math.round(drawY));
        }
    }

    // --- SKY ENGINE CORE ---
    const SkyEngine = {
        canvas: null,
        ctx: null,
        clouds: [],
        stars: [],
        _rAF: null,
        isRunning: false,
        lastTime: 0,
        mountainCanvas: null,

        init() {
            // Guard: SkyEngine atmospheric flight engine is strictly for the Home platformer route ("/")
            const pathname = typeof window !== "undefined" ? window.location.pathname : "";
            const isNonHome = pathname.includes("sales") || 
                              pathname.includes("workspace") || 
                              (typeof document !== "undefined" && (
                                document.body.classList.contains("sales-page") || 
                                document.body.classList.contains("retro-workspace")
                              ));

            if (isNonHome) {
                console.log("SkyEngine: Inactive on non-home route (" + pathname + ").");
                const existing = document.getElementById("sky-canvas");
                if (existing) existing.remove();
                return;
            }

            this.canvas = document.getElementById("sky-canvas");
            if (!this.canvas) {
                this.canvas = document.createElement("canvas");
                this.canvas.id = "sky-canvas";
                document.body.insertBefore(this.canvas, document.body.firstChild);
            }

            this.ctx = this.canvas.getContext("2d", { alpha: false });
            if (!this.ctx) return;

            this.resize();
            window.addEventListener("resize", () => this.resize());

            this.initClouds();
            this.initStars();
            this.initMountains();

            this.isRunning = true;
            this.lastTime = performance.now();
            const loop = (now) => {
                if (!this.isRunning) return;
                this._rAF = requestAnimationFrame(loop);
                const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0.001), 0.1);
                this.lastTime = now;
                this.render(dt);
            };
            this._rAF = requestAnimationFrame(loop);
            console.log("SkyEngine: Level Devil Airspace 5-Strata Background Engine active (60 FPS).");
        },

        resize() {
            if (!this.canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.round(window.innerWidth * dpr);
            this.canvas.height = Math.round(window.innerHeight * dpr);
            this.canvas.style.width = "100vw";
            this.canvas.style.height = "100vh";
            if (this.ctx) {
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        },

        initStars() {
            // High altitude stratosphere vector star telemetry ticks
            this.stars = [];
            for (let i = 0; i < 45; i++) {
                this.stars.push({
                    x: Math.random(),
                    y: Math.random() * 550, // Only visible in stratosphere
                    size: Math.random() > 0.8 ? 3 : 2,
                    blinkRate: 1.5 + Math.random() * 2.5
                });
            }
        },

        initClouds() {
            const sw = window.innerWidth || 1200;
            this.clouds = [
                // Layer 1: Near Fast Clouds (Parallax 0.55) - Below hero corridor (baseY >= 650)
                new SkyCloud(340, 170, 680, 0.55, 22, 0),
                new SkyCloud(420, 200, 1100, 0.55, 28, 1),
                new SkyCloud(360, 180, 1550, 0.55, 24, 2),
                new SkyCloud(400, 190, 2000, 0.55, 26, 0),
                new SkyCloud(350, 175, 2450, 0.55, 20, 1),
                new SkyCloud(380, 190, 2900, 0.55, 25, 2),

                // Layer 2: Mid Slower Cloud Banks (Parallax 0.30)
                new SkyCloud(520, 240, 720, 0.30, 12, 1),
                new SkyCloud(560, 250, 1200, 0.30, 15, 2),
                new SkyCloud(480, 220, 1680, 0.30, 11, 0),
                new SkyCloud(540, 240, 2150, 0.30, 14, 1),
                new SkyCloud(500, 230, 2600, 0.30, 12, 2),
                new SkyCloud(560, 260, 3050, 0.30, 13, 0),

                // Layer 3: Far Atmospheric Haze Whispers (Parallax 0.15)
                new SkyCloud(680, 280, 800, 0.15, 6, 2),
                new SkyCloud(720, 300, 1500, 0.15, 7, 0),
                new SkyCloud(650, 270, 2300, 0.15, 5, 1)
            ];
        },

        initMountains() {
            const mc = document.createElement("canvas");
            mc.width = 1920;
            mc.height = 420;
            const mctx = mc.getContext("2d");
            if (!mctx) return;

            mctx.fillStyle = "#fffdf1";
            mctx.strokeStyle = "#17120f";
            mctx.lineWidth = 3;
            mctx.lineJoin = "round";

            // Jagged mountain ridge
            mctx.beginPath();
            mctx.moveTo(0, 420);
            mctx.lineTo(0, 290);
            mctx.lineTo(180, 220);
            mctx.lineTo(340, 280);
            mctx.lineTo(540, 110); // Peak 1
            mctx.lineTo(660, 220);
            mctx.lineTo(820, 80);  // High Peak 2
            mctx.lineTo(980, 230);
            mctx.lineTo(1150, 120); // Peak 3
            mctx.lineTo(1320, 260);
            mctx.lineTo(1500, 150); // Peak 4
            mctx.lineTo(1720, 280);
            mctx.lineTo(1920, 200);
            mctx.lineTo(1920, 420);
            mctx.closePath();
            mctx.fill();
            mctx.stroke();

            // Radio transmission mast on High Peak 2 (820, 80)
            mctx.lineWidth = 2;
            mctx.beginPath();
            mctx.moveTo(820, 80);
            mctx.lineTo(820, 20);
            mctx.moveTo(805, 38);
            mctx.lineTo(835, 38);
            mctx.moveTo(810, 56);
            mctx.lineTo(830, 56);
            mctx.stroke();

            // Beacon light
            mctx.beginPath();
            mctx.arc(820, 17, 4, 0, Math.PI * 2);
            mctx.fillStyle = "#eb5e28";
            mctx.fill();
            mctx.stroke();

            // Ink crosshatch shading on ridges
            mctx.lineWidth = 1.4;
            mctx.beginPath();
            for (let x = 540; x <= 640; x += 12) {
                mctx.moveTo(x, 110 + (x - 540) * 1.1);
                mctx.lineTo(x - 25, 110 + (x - 540) * 1.1 + 45);
            }
            for (let x = 820; x <= 950; x += 14) {
                mctx.moveTo(x, 80 + (x - 820) * 1.15);
                mctx.lineTo(x - 30, 80 + (x - 820) * 1.15 + 50);
            }
            mctx.stroke();

            this.mountainCanvas = mc;
        },

        render(dt) {
            const ctx = this.ctx;
            if (!ctx || !this.canvas) return;

            const w = window.innerWidth;
            const h = window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - h);
            const scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));

            // 1. DYNAMIC 5-STRATA ATMOSPHERIC GRADIENT
            const gradientColors = getStrataGradient(scrollY, maxScroll, h);
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, gradientColors.top);
            skyGrad.addColorStop(0.55, gradientColors.mid);
            skyGrad.addColorStop(1, gradientColors.bot);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. RETRO HORIZONTAL SCANLINES (Warm tactile paper grain)
            ctx.fillStyle = "rgba(23, 18, 15, 0.035)";
            for (let y = 0; y < h; y += 4) {
                ctx.fillRect(0, y, w, 1.5);
            }

            // 3. HIGH ALTITUDE STRATOSPHERE STARS & TELEMETRY TICKS (ALT: 10,000 - 8,000 FT)
            if (scrollY < 750) {
                const alpha = Math.max(0, 1 - scrollY / 650);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = "#fffdf1";
                const now = performance.now() * 0.002;
                for (const s of this.stars) {
                    const sx = s.x * w;
                    const sy = s.y - scrollY * 0.2;
                    if (sy >= 0 && sy <= h) {
                        const blink = 0.5 + 0.5 * Math.sin(now * s.blinkRate);
                        ctx.fillRect(Math.round(sx), Math.round(sy), s.size * blink, s.size * blink);
                    }
                }
                ctx.restore();
            }

            // 4. TOPOGRAPHICAL ELEVATION CONTOUR LINES (Mid Troposphere)
            if (scrollY > 600 && scrollY < 3200) {
                ctx.save();
                ctx.strokeStyle = "rgba(23, 18, 15, 0.065)";
                ctx.lineWidth = 1.2;
                const waveT = performance.now() * 0.0003;
                for (let i = 0; i < 4; i++) {
                    const lineBaseY = (i * 220 + 100) - ((scrollY * 0.22) % 300);
                    ctx.beginPath();
                    for (let x = 0; x <= w; x += 40) {
                        const waveY = lineBaseY + Math.sin(x * 0.003 + waveT + i) * 35 + Math.cos(x * 0.006) * 15;
                        if (x === 0) ctx.moveTo(x, waveY);
                        else ctx.lineTo(x, waveY);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 5. PARALLAX PAPER CLOUDS (DRIFTING BEHIND CARDS)
            for (const cloud of this.clouds) {
                cloud.update(dt, w);
                cloud.draw(ctx, scrollY, h);
            }

            // 6. RISING MOUNTAIN SILHOUETTES (Stratum 4 & 5 / Approaching Earth)
            if (scrollY > 1200 && this.mountainCanvas) {
                const alpha = Math.min(1, Math.max(0, (scrollY - 1200) / 1000));
                ctx.save();
                ctx.globalAlpha = alpha;
                // Parallax rise from bottom: as scrollY increases, mountain rises into view
                const mountainY = h - (scrollY - 1200) * 0.18 + 120;
                ctx.drawImage(this.mountainCanvas, 0, Math.round(mountainY), w, (w / 1920) * 420);
                ctx.restore();
            }

            // 7. BEDROCK TOUCHDOWN RUNWAY MARKINGS (Stratum 5 / Ground Approach)
            if (scrollY > 2800) {
                const groundProgress = Math.min(1, (scrollY - 2800) / 700);
                const runwayY = h - groundProgress * 180;
                ctx.save();
                ctx.fillStyle = "#17120f";
                ctx.fillRect(0, runwayY, w, 200);

                // Zebra threshold approach bars
                ctx.fillStyle = "#fce566";
                const barW = 24;
                const barGap = 20;
                const totalBars = Math.floor(w / (barW + barGap));
                for (let i = 0; i < totalBars; i++) {
                    ctx.fillRect(i * (barW + barGap) + 12, runwayY + 20, barW, 45);
                }

                // Runway centerline dashes
                ctx.fillStyle = "#fffdf1";
                for (let x = 30; x < w; x += 90) {
                    ctx.fillRect(x, runwayY + 90, 50, 6);
                }
                ctx.restore();
            }

            // 8. TACTICAL AVIATION MARGIN RULERS (LEFT & RIGHT SCREEN BORDERS)
            // Rendered along the margins (desktop only, w >= 960px)
            if (w >= 960) {
                this.renderAviationTelemetryRulers(ctx, w, h, scrollY, maxScroll, scrollProgress);
            }
        },

        renderAviationTelemetryRulers(ctx, w, h, scrollY, maxScroll, scrollProgress) {
            ctx.save();
            ctx.font = "8px 'Press Start 2P', monospace";
            ctx.fillStyle = "rgba(23, 18, 15, 0.45)";
            ctx.strokeStyle = "rgba(23, 18, 15, 0.35)";
            ctx.lineWidth = 1.5;

            // --- LEFT GUTTER: ALTITUDE FLIGHT RULER ---
            const leftX = 24;
            ctx.beginPath();
            ctx.moveTo(leftX, 70);
            ctx.lineTo(leftX, h - 35);
            ctx.stroke();

            // Real-time altitude calculation: 10,000 FT at top down to 0 FT at bottom
            const curAlt = Math.max(0, Math.round(10000 * (1 - scrollProgress)));
            const stepY = (h - 110) / 10;

            for (let i = 0; i <= 10; i++) {
                const tickY = 70 + i * stepY;
                const altVal = 10 - i;
                ctx.beginPath();
                ctx.moveTo(leftX, tickY);
                ctx.lineTo(leftX + (i % 2 === 0 ? 12 : 7), tickY);
                ctx.stroke();

                if (i % 2 === 0) {
                    ctx.fillText(`${altVal}K`, leftX + 16, tickY + 3);
                }
            }

            // Dynamic Altimeter Pointer Bug on Left Ruler
            const bugY = 70 + scrollProgress * (h - 110);
            ctx.fillStyle = "#eb5e28";
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(leftX - 4, bugY - 5);
            ctx.lineTo(leftX + 8, bugY);
            ctx.lineTo(leftX - 4, bugY + 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // --- RIGHT GUTTER: FLIGHT VELOCITY & VECTOR TELEMETRY ---
            const rightX = w - 24;
            ctx.beginPath();
            ctx.moveTo(rightX, 70);
            ctx.lineTo(rightX, h - 35);
            ctx.stroke();

            for (let i = 0; i <= 10; i++) {
                const tickY = 70 + i * stepY;
                ctx.beginPath();
                ctx.moveTo(rightX, tickY);
                ctx.lineTo(rightX - (i % 2 === 0 ? 12 : 7), tickY);
                ctx.stroke();
            }

            // Tactical Avionics Readout Card (Right bottom margin)
            ctx.fillStyle = "rgba(255, 253, 241, 0.85)";
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 2;
            const cardW = 140;
            const cardH = 80;
            const cardX = w - cardW - 36;
            const cardY = h - cardH - 45;

            ctx.fillRect(cardX, cardY, cardW, cardH);
            ctx.strokeRect(cardX, cardY, cardW, cardH);

            ctx.fillStyle = "#17120f";
            ctx.font = "7px 'Press Start 2P', monospace";
            ctx.fillText("AIRSPACE HUD", cardX + 10, cardY + 16);
            ctx.fillText(`ALT : ${curAlt} FT`, cardX + 10, cardY + 32);
            ctx.fillText(`VSI : -1200 FPM`, cardX + 10, cardY + 46);
            ctx.fillText(`WND : 24 KT 270°`, cardX + 10, cardY + 60);
            ctx.fillText(`AIR : 60.0 FPS`, cardX + 10, cardY + 74);

            ctx.restore();
        },

        dispose() {
            if (this._rAF) {
                cancelAnimationFrame(this._rAF);
                this._rAF = null;
            }
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = null;
            }
            this.isRunning = false;
            this.clouds = [];
            this.stars = [];
            this.mountainCanvas = null;
        }
    };

    window.SkyEngine = SkyEngine;

    // Auto-init on page load
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => SkyEngine.init());
        } else {
            SkyEngine.init();
        }
    }
})();
