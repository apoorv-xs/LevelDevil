// parallax_layer.js - 2D Procedural Parallax World Engine
// Delivers multi-layered silhouettes (Far: 0.25x, Mid: 0.50x) across the 5 Strata:
// Stratum 1 (10,000m): The Golden Cirrus - Retro pixel clouds, Zephyr-01 airship, weather balloons, drones
// Stratum 2 (7,500m): Cloudbreak & Peaks - Sharp mountain peaks, cumulus banks, radio broadcast masts
// Stratum 3 (4,500m): Sky-Girders - Suspended sky-cranes, lattice bridge trusses, industrial steam pipes
// Stratum 4 (2,000m): City Spires & Rooftops - City skyline spires, water towers, telephone poles, streetlamps
// Stratum 5 (0m): Terra Firma / Terminal - Runway tarmac, chevron arrows, control tower, windsocks, radar

(function () {
    "use strict";

    const FAR_RATIO = 0.25;
    const MID_RATIO = 0.50;

    let canvas = null;
    let ctx = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function init() {
        canvas = document.getElementById("game-parallax-canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "game-parallax-canvas";
            canvas.style.position = "fixed";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100vw";
            canvas.style.height = "100vh";
            canvas.style.pointerEvents = "none";
            canvas.style.zIndex = "0"; // Behind DOM content and Kaboom/Three canvas
            document.body.prepend(canvas);
        }

        ctx = canvas.getContext("2d", { alpha: true });
        resize();
        window.addEventListener("resize", resize);

        requestAnimationFrame(renderLoop);
        console.log("2D Procedural Parallax Stratospheric Plunge Engine Initialized.");
    }

    function resize() {
        if (!canvas || !ctx) return;
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    // --- REUSABLE PROCEDURAL CLOUD PRIMITIVES ---
    function drawRetroCloud(ctx, x, y, scale = 1.0, fillColor = "rgba(255, 244, 201, 0.45)", strokeColor = "rgba(23, 18, 15, 0.65)") {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(-40, 10, 24, Math.PI * 0.7, Math.PI * 1.8);
        ctx.arc(-15, -12, 32, Math.PI * 0.9, Math.PI * 1.9);
        ctx.arc(25, -16, 36, Math.PI * 1.1, Math.PI * 2.0);
        ctx.arc(60, 6, 26, Math.PI * 1.2, Math.PI * 0.3);
        ctx.lineTo(-40, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // STRATUM 1 (10,000m): THE GOLDEN CIRRUS
    // =========================================================================
    function drawCirrusFar(ctx, scrollY) {
        const offset = -(scrollY * FAR_RATIO) % (height * 2.5);
        const yBase = height * 0.30 + offset;
        const now = Date.now();

        ctx.save();

        // 1. High-altitude fluffy retro pixel clouds (butter cream fills, ink outlines)
        const cloudStops = [
            { x: width * 0.10, y: yBase - 80, s: 1.1 },
            { x: width * 0.42, y: yBase - 40, s: 1.4 },
            { x: width * 0.80, y: yBase - 100, s: 0.95 },
            { x: width * 0.92, y: yBase + 30, s: 1.2 }
        ];
        cloudStops.forEach(c => {
            drawRetroCloud(ctx, c.x, c.y, c.s, "rgba(255, 244, 201, 0.38)", "rgba(23, 18, 15, 0.40)");
        });

        // 2. Floating Zephyr-01 Airship Silhouette
        const airshipX = ((width * 0.60) + (now * 0.02)) % (width + 360) - 180;
        const airshipY = yBase - 30 + Math.sin(now * 0.0015) * 8;

        ctx.fillStyle = "rgba(180, 83, 9, 0.45)"; // Deep warm bronze-amber silhouette
        ctx.strokeStyle = "rgba(23, 18, 15, 0.70)";
        ctx.lineWidth = 2;

        // Dirigible Hull
        ctx.beginPath();
        ctx.ellipse(airshipX, airshipY, 78, 26, 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stabilizer tail fins
        ctx.beginPath();
        ctx.moveTo(airshipX - 70, airshipY - 14);
        ctx.lineTo(airshipX - 94, airshipY - 26);
        ctx.lineTo(airshipX - 74, airshipY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(airshipX - 70, airshipY + 14);
        ctx.lineTo(airshipX - 94, airshipY + 26);
        ctx.lineTo(airshipX - 74, airshipY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Underslung Passenger & Navigation Gondola
        ctx.fillStyle = "rgba(23, 18, 15, 0.75)";
        ctx.fillRect(airshipX - 32, airshipY + 22, 54, 11);
        ctx.strokeRect(airshipX - 32, airshipY + 22, 54, 11);

        // Illuminated gondola observation ports
        ctx.fillStyle = "#fce566";
        for (let wx = airshipX - 26; wx <= airshipX + 14; wx += 8) {
            ctx.fillRect(wx, airshipY + 25, 4, 5);
        }

        // Twin Spinning Propellers on Outrigger Pylons
        const propAngle = now * 0.035;
        const propHeight = Math.cos(propAngle) * 14;

        ctx.strokeStyle = "rgba(23, 18, 15, 0.85)";
        ctx.lineWidth = 2.5;

        // Engine pylon
        ctx.beginPath();
        ctx.moveTo(airshipX - 10, airshipY + 22);
        ctx.lineTo(airshipX - 10, airshipY + 36);
        ctx.stroke();

        // Propeller blades
        ctx.beginPath();
        ctx.moveTo(airshipX - 10, airshipY + 36 - propHeight);
        ctx.lineTo(airshipX - 10, airshipY + 36 + propHeight);
        ctx.stroke();

        // Flashing amber navigation strobe on top mast
        const strobePulse = Math.sin(now * 0.007) > 0.2;
        if (strobePulse) {
            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.arc(airshipX + 2, airshipY - 28, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. High-Altitude Weather Balloons
        const balloons = [
            { x: width * 0.25, y: yBase - 110, phase: 0 },
            { x: width * 0.88, y: yBase - 60, phase: 2.5 }
        ];

        balloons.forEach((b) => {
            const by = b.y + Math.sin(now * 0.002 + b.phase) * 10;
            const bx = b.x + Math.cos(now * 0.001 + b.phase) * 6;

            ctx.fillStyle = "rgba(255, 244, 201, 0.55)";
            ctx.strokeStyle = "rgba(23, 18, 15, 0.65)";
            ctx.lineWidth = 1.5;

            // Spherical balloon envelope
            ctx.beginPath();
            ctx.arc(bx, by, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Tether line & sensor box
            ctx.beginPath();
            ctx.moveTo(bx, by + 14);
            ctx.lineTo(bx, by + 34);
            ctx.stroke();

            // Sensor payload box
            ctx.fillStyle = "rgba(180, 83, 9, 0.70)";
            ctx.fillRect(bx - 3, by + 34, 6, 6);
            ctx.strokeRect(bx - 3, by + 34, 6, 6);
        });

        ctx.restore();
    }

    function drawCirrusMid(ctx, scrollY) {
        const offset = -(scrollY * MID_RATIO) % (height * 2.5);
        const yBase = height * 0.45 + offset;
        const now = Date.now();

        ctx.save();

        // Mid-ground fluffy clouds with bold ink outlines
        drawRetroCloud(ctx, width * 0.25, yBase + 20, 1.35, "rgba(253, 224, 71, 0.30)", "rgba(23, 18, 15, 0.60)");
        drawRetroCloud(ctx, width * 0.70, yBase - 30, 1.60, "rgba(255, 244, 201, 0.42)", "rgba(23, 18, 15, 0.60)");

        // Tiny Drone / Bird Wisps (V-formation gliding across)
        const vBaseX = ((width * 0.35) + (now * 0.035)) % (width + 300) - 150;
        const vBaseY = yBase - 70;

        const droneOffsets = [
            { dx: 0, dy: 0 },
            { dx: -24, dy: 14 },
            { dx: -48, dy: 28 },
            { dx: 24, dy: 14 },
            { dx: 48, dy: 28 }
        ];

        ctx.strokeStyle = "rgba(23, 18, 15, 0.75)";
        ctx.fillStyle = "rgba(23, 18, 15, 0.85)";
        ctx.lineWidth = 2;

        droneOffsets.forEach((d, idx) => {
            const bx = vBaseX + d.dx;
            const wingFlap = Math.sin(now * 0.008 + idx * 0.6) * 4;
            const by = vBaseY + d.dy + Math.sin(now * 0.002 + idx) * 3;

            ctx.beginPath();
            ctx.moveTo(bx - 7, by - wingFlap);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + 7, by - wingFlap);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // =========================================================================
    // STRATUM 2 (7,500m): CLOUDBREAK & MOUNTAIN PEAKS
    // =========================================================================
    function drawCloudbreakFar(ctx, scrollY) {
        const offset = -((scrollY - 550) * FAR_RATIO) % (height * 2.5);
        const yBase = height * 0.35 + offset;

        ctx.save();

        // Majestic Sharp Mountain Peaks Piercing the Mist
        const peaks = [
            { x: width * 0.12, w: 220, h: 260 },
            { x: width * 0.36, w: 280, h: 320 },
            { x: width * 0.62, w: 240, h: 280 },
            { x: width * 0.86, w: 260, h: 340 }
        ];

        peaks.forEach(p => {
            const peakTopY = yBase - p.h * 0.45;
            const peakBaseY = yBase + p.h * 0.65;
            const ridgeX = p.x - p.w * 0.08;

            // Left Sunlit Face (Warm Amber)
            ctx.fillStyle = "rgba(245, 158, 11, 0.32)";
            ctx.beginPath();
            ctx.moveTo(p.x, peakTopY);
            ctx.lineTo(ridgeX, peakBaseY);
            ctx.lineTo(p.x - p.w * 0.5, peakBaseY);
            ctx.closePath();
            ctx.fill();

            // Right Shadow Face (Bronze Haze)
            ctx.fillStyle = "rgba(180, 83, 9, 0.42)";
            ctx.beginPath();
            ctx.moveTo(p.x, peakTopY);
            ctx.lineTo(p.x + p.w * 0.5, peakBaseY);
            ctx.lineTo(ridgeX, peakBaseY);
            ctx.closePath();
            ctx.fill();

            // Sharp ink ridge outline
            ctx.strokeStyle = "rgba(23, 18, 15, 0.55)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p.x - p.w * 0.5, peakBaseY);
            ctx.lineTo(p.x, peakTopY);
            ctx.lineTo(p.x + p.w * 0.5, peakBaseY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(p.x, peakTopY);
            ctx.lineTo(ridgeX, peakBaseY);
            ctx.stroke();
        });

        // Dense Cumulus Cloud Banks swaddling the valleys
        ctx.fillStyle = "rgba(217, 119, 6, 0.30)";
        ctx.beginPath();
        ctx.moveTo(0, yBase + 120);
        ctx.bezierCurveTo(width * 0.25, yBase + 60, width * 0.55, yBase + 160, width, yBase + 90);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawCloudbreakMid(ctx, scrollY) {
        const offset = -((scrollY - 550) * MID_RATIO) % (height * 2.5);
        const yBase = height * 0.45 + offset;
        const now = Date.now();

        ctx.save();

        // Radio Broadcast Masts perched on the mountain ridge
        const masts = [width * 0.36, width * 0.86];
        masts.forEach(mx => {
            const my = yBase - 150;
            const mastHeight = 110;

            ctx.strokeStyle = "rgba(23, 18, 15, 0.70)";
            ctx.lineWidth = 2;

            // Triangular lattice tower
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx - 14, my + mastHeight);
            ctx.lineTo(mx + 14, my + mastHeight);
            ctx.closePath();
            ctx.stroke();

            // Horizontal cross-bars & diagonal lattice
            for (let ly = my + 20; ly < my + mastHeight; ly += 18) {
                ctx.beginPath();
                ctx.moveTo(mx - 8, ly);
                ctx.lineTo(mx + 8, ly);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(mx - 8, ly);
                ctx.lineTo(mx + 8, ly + 18);
                ctx.stroke();
            }

            // Guy wires anchored to the mountain ridge
            ctx.strokeStyle = "rgba(23, 18, 15, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mx, my + 30);
            ctx.lineTo(mx - 55, my + mastHeight + 20);
            ctx.moveTo(mx, my + 30);
            ctx.lineTo(mx + 55, my + mastHeight + 20);
            ctx.stroke();

            // Pulsing red/amber aviation beacon light on top
            const beaconPulse = Math.sin(now * 0.006) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + beaconPulse * 0.6})`;
            ctx.beginPath();
            ctx.arc(mx, my - 3, 4.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Mid-ground billowing cumulus cloud shelves
        drawRetroCloud(ctx, width * 0.15, yBase + 70, 1.4, "rgba(253, 224, 71, 0.28)", "rgba(23, 18, 15, 0.50)");
        drawRetroCloud(ctx, width * 0.65, yBase + 90, 1.7, "rgba(245, 158, 11, 0.32)", "rgba(23, 18, 15, 0.50)");

        ctx.restore();
    }

    // =========================================================================
    // STRATUM 3 (4,500m): INDUSTRIAL SKY-GIRDERS
    // =========================================================================
    function drawGirdersFar(ctx, scrollY) {
        const offset = -((scrollY - 1500) * FAR_RATIO) % (height * 2.5);
        const yBase = height * 0.25 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(180, 83, 9, 0.35)"; // Terracotta ochre
        ctx.strokeStyle = "rgba(120, 53, 15, 0.55)";
        ctx.lineWidth = 2.5;

        // 1. Massive Suspended Lattice Bridge Trusses crossing the horizon
        const trussY = yBase + 50;
        ctx.fillRect(0, trussY, width, 14);
        ctx.fillRect(0, trussY + 60, width, 14);

        // Warren Truss diagonal members
        const step = 64;
        ctx.beginPath();
        for (let x = -step; x < width + step; x += step) {
            ctx.moveTo(x, trussY + 14);
            ctx.lineTo(x + step * 0.5, trussY + 60);
            ctx.lineTo(x + step, trussY + 14);
        }
        ctx.stroke();

        // 2. Suspended Sky-Cranes Holding Modular Cargo Containers
        const craneX = width * 0.72;
        const craneY = yBase - 40;

        // Crane Tower & Jib Truss
        ctx.fillRect(craneX - 10, craneY, 20, 160);
        ctx.fillRect(craneX - 120, craneY, 260, 12);

        // Crane diagonal tie rods
        ctx.beginPath();
        ctx.moveTo(craneX, craneY - 30);
        ctx.lineTo(craneX + 130, craneY);
        ctx.lineTo(craneX - 110, craneY);
        ctx.closePath();
        ctx.stroke();

        // Hoist cable & Suspended Cargo Box
        ctx.beginPath();
        ctx.moveTo(craneX + 80, craneY + 12);
        ctx.lineTo(craneX + 80, craneY + 90);
        ctx.stroke();

        // Cargo Container Box
        ctx.fillStyle = "rgba(146, 64, 14, 0.65)";
        ctx.fillRect(craneX + 55, craneY + 90, 50, 24);
        ctx.strokeRect(craneX + 55, craneY + 90, 50, 24);

        ctx.restore();
    }

    function drawGirdersMid(ctx, scrollY) {
        const offset = -((scrollY - 1500) * MID_RATIO) % (height * 2.5);
        const yBase = height * 0.35 + offset;
        const now = Date.now();

        ctx.save();
        ctx.strokeStyle = "rgba(194, 65, 12, 0.65)"; // Copper orange
        ctx.fillStyle = "rgba(67, 20, 7, 0.55)";
        ctx.lineWidth = 4;

        // Heavy Industrial Steam Pipelines Routing Through Space
        ctx.beginPath();
        ctx.arc(width * 0.20, yBase + 80, 70, Math.PI, 1.5 * Math.PI);
        ctx.lineTo(width * 0.50, yBase + 10);
        ctx.stroke();

        // Pipe Joint Flange Rings & Valves
        const flanges = [width * 0.20, width * 0.35, width * 0.50];
        flanges.forEach(fx => {
            ctx.fillStyle = "rgba(120, 53, 15, 0.85)";
            ctx.fillRect(fx - 4, yBase + 6, 8, 22);
            ctx.strokeRect(fx - 4, yBase + 6, 8, 22);

            // Valve hand-wheel
            ctx.beginPath();
            ctx.arc(fx, yBase - 4, 10, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Animated Steam Vent Relief (Puffing warm cream vapor)
        const steamPhase = (now * 0.003) % 1;
        const steamY = yBase + 10 - steamPhase * 35;
        const steamAlpha = (1 - steamPhase) * 0.45;
        ctx.fillStyle = `rgba(255, 244, 201, ${steamAlpha})`;
        ctx.beginPath();
        ctx.arc(width * 0.35, steamY, 12 + steamPhase * 16, 0, Math.PI * 2);
        ctx.fill();

        // Hanging Chains with Cargo Hook
        const chainX = width * 0.82;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(23, 18, 15, 0.70)";
        for (let cy = yBase - 20; cy < yBase + 110; cy += 12) {
            ctx.beginPath();
            ctx.ellipse(chainX, cy, 3.5, 7, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Heavy Foundry Hook
        ctx.beginPath();
        ctx.arc(chainX - 8, yBase + 120, 12, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // STRATUM 4 (2,000m): CITY SPIRES & ROOFTOPS
    // =========================================================================
    function drawCityFar(ctx, scrollY) {
        const offset = -((scrollY - 2200) * FAR_RATIO) % (height * 2.5);
        const yBase = height * 0.20 + offset;
        const now = Date.now();

        ctx.save();
        ctx.fillStyle = "rgba(69, 26, 3, 0.58)"; // Dark umber earth & charcoal brown
        ctx.strokeStyle = "rgba(23, 18, 15, 0.65)";
        ctx.lineWidth = 2;

        // Metropolis Skyline Spires (Layered skyscrapers with stepped crowns)
        const buildings = [
            { x: 0, w: 100, h: 240, spire: false },
            { x: 90, w: 80, h: 320, spire: true },
            { x: 160, w: 120, h: 280, spire: false },
            { x: 270, w: 90, h: 380, spire: true },
            { x: 350, w: 140, h: 260, spire: false },
            { x: 480, w: 110, h: 340, spire: true },
            { x: 580, w: 130, h: 300, spire: false },
            { x: 700, w: 85, h: 410, spire: true },
            { x: 775, w: 135, h: 290, spire: false },
            { x: 900, w: 100, h: 360, spire: true },
            { x: 990, w: 140, h: 270, spire: false },
            { x: 1120, w: 120, h: 390, spire: true },
            { x: 1230, w: 160, h: 310, spire: false },
            { x: 1380, w: 110, h: 370, spire: true }
        ];

        buildings.forEach(b => {
            const bx = (b.x / 1400) * width;
            const bw = (b.w / 1400) * width + 10;
            const topY = yBase + 360 - b.h;

            ctx.fillRect(bx, topY, bw, b.h + 200);
            ctx.strokeRect(bx, topY, bw, b.h + 200);

            // Stepped Crown Spire
            if (b.spire) {
                const midX = bx + bw * 0.5;
                ctx.fillRect(midX - 10, topY - 24, 20, 24);
                ctx.beginPath();
                ctx.moveTo(midX, topY - 70);
                ctx.lineTo(midX, topY - 24);
                ctx.stroke();

                // Blinking aircraft warning light at spire tip
                const spPulse = Math.sin(now * 0.005 + b.x) > 0.1;
                if (spPulse) {
                    ctx.fillStyle = "#f59e0b";
                    ctx.beginPath();
                    ctx.arc(midX, topY - 70, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(69, 26, 3, 0.58)";
                }
            }

            // Scatter of illuminated warm amber office window dots
            ctx.fillStyle = "rgba(252, 229, 102, 0.40)";
            for (let wy = topY + 20; wy < topY + b.h - 30; wy += 26) {
                for (let wx = bx + 12; wx < bx + bw - 14; wx += 18) {
                    if ((Math.sin(wx * 11 + wy * 7) > -0.2)) {
                        ctx.fillRect(wx, wy, 6, 8);
                    }
                }
            }
            ctx.fillStyle = "rgba(69, 26, 3, 0.58)";
        });

        ctx.restore();
    }

    function drawCityMid(ctx, scrollY) {
        const offset = -((scrollY - 2200) * MID_RATIO) % (height * 2.5);
        const yBase = height * 0.35 + offset;

        ctx.save();

        // 1. Classic Rooftop Wooden Water Towers on 4-Legged Stilt Frames
        const waterTowers = [width * 0.18, width * 0.68];
        waterTowers.forEach(tx => {
            const ty = yBase + 40;

            ctx.strokeStyle = "rgba(23, 18, 15, 0.85)";
            ctx.fillStyle = "rgba(41, 16, 3, 0.75)";
            ctx.lineWidth = 2.5;

            // 4-legged stilt trestle
            ctx.beginPath();
            ctx.moveTo(tx - 18, ty + 80);
            ctx.lineTo(tx - 10, ty + 24);
            ctx.lineTo(tx + 10, ty + 24);
            ctx.lineTo(tx + 18, ty + 80);
            ctx.stroke();

            // Cross bracing on legs
            ctx.beginPath();
            ctx.moveTo(tx - 16, ty + 60);
            ctx.lineTo(tx + 16, ty + 35);
            ctx.moveTo(tx + 16, ty + 60);
            ctx.lineTo(tx - 16, ty + 35);
            ctx.stroke();

            // Cylindrical Wooden Barrel
            ctx.fillRect(tx - 24, ty - 18, 48, 42);
            ctx.strokeRect(tx - 24, ty - 18, 48, 42);

            // Conical Roof Cap
            ctx.beginPath();
            ctx.moveTo(tx - 26, ty - 18);
            ctx.lineTo(tx, ty - 38);
            ctx.lineTo(tx + 26, ty - 18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        // 2. Telephone Poles with Hanging Sagging Power Cables
        const poles = [width * 0.08, width * 0.45, width * 0.88];
        ctx.strokeStyle = "rgba(23, 18, 15, 0.80)";
        ctx.lineWidth = 2.5;

        poles.forEach(px => {
            const py = yBase + 10;
            // Central wooden pole
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py + 140);
            ctx.stroke();

            // Horizontal cross-arms with insulator pegs
            ctx.fillRect(px - 22, py + 14, 44, 5);
            ctx.strokeRect(px - 22, py + 14, 44, 5);
        });

        // Drooping Catenary Power Cables looping between poles
        ctx.lineWidth = 1.5;
        for (let i = 0; i < poles.length - 1; i++) {
            const p1 = poles[i];
            const p2 = poles[i + 1];
            const midP = (p1 + p2) * 0.5;

            ctx.beginPath();
            ctx.moveTo(p1 - 18, yBase + 24);
            ctx.quadraticCurveTo(midP, yBase + 55, p2 - 18, yBase + 24);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(p1 + 18, yBase + 24);
            ctx.quadraticCurveTo(midP, yBase + 62, p2 + 18, yBase + 24);
            ctx.stroke();
        }

        // 3. Streetlamps with Amber Light Cones
        const lamps = [width * 0.32, width * 0.78];
        lamps.forEach(lx => {
            const ly = yBase + 30;

            // Gooseneck arm
            ctx.strokeStyle = "rgba(23, 18, 15, 0.85)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lx, ly + 110);
            ctx.lineTo(lx, ly);
            ctx.arc(lx + 14, ly, 14, Math.PI, 1.5 * Math.PI);
            ctx.lineTo(lx + 28, ly);
            ctx.stroke();

            // Downward conical amber light cone
            const grad = ctx.createLinearGradient(lx + 28, ly, lx + 28, ly + 140);
            grad.addColorStop(0, "rgba(252, 229, 102, 0.32)");
            grad.addColorStop(1, "rgba(252, 229, 102, 0.0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(lx + 24, ly + 6);
            ctx.lineTo(lx - 25, ly + 140);
            ctx.lineTo(lx + 80, ly + 140);
            ctx.closePath();
            ctx.fill();
        });

        ctx.restore();
    }

    // =========================================================================
    // STRATUM 5 (0m): TERRA FIRMA / THE LANDING TERMINAL
    // =========================================================================
    function drawTerminalFar(ctx, scrollY) {
        const offset = -((scrollY - 2750) * FAR_RATIO) % (height * 2.5);
        const yBase = height * 0.15 + offset;
        const now = Date.now();

        ctx.save();
        ctx.fillStyle = "rgba(23, 18, 15, 0.88)"; // Slate bedrock ink
        ctx.strokeStyle = "rgba(28, 25, 23, 0.95)";
        ctx.lineWidth = 2.5;

        // Terminal Control Tower Silhouette
        const towerX = width * 0.78;
        const towerY = yBase + 40;

        // Tapered tower shaft
        ctx.beginPath();
        ctx.moveTo(towerX - 22, towerY + 240);
        ctx.lineTo(towerX - 16, towerY + 50);
        ctx.lineTo(towerX + 16, towerY + 50);
        ctx.lineTo(towerX + 22, towerY + 240);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cantilevered Observation Cab Glass deck
        ctx.beginPath();
        ctx.moveTo(towerX - 42, towerY + 50);
        ctx.lineTo(towerX - 32, towerY + 14);
        ctx.lineTo(towerX + 32, towerY + 14);
        ctx.lineTo(towerX + 42, towerY + 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Illuminated golden observation deck windows
        ctx.fillStyle = "#fce566";
        ctx.beginPath();
        ctx.moveTo(towerX - 36, towerY + 44);
        ctx.lineTo(towerX - 28, towerY + 20);
        ctx.lineTo(towerX + 28, towerY + 20);
        ctx.lineTo(towerX + 36, towerY + 44);
        ctx.closePath();
        ctx.fill();

        // Rotating Radar Dish on Tower Roof
        const radarAngle = now * 0.003;
        const dishSpan = Math.cos(radarAngle) * 24;

        ctx.strokeStyle = "rgba(252, 229, 102, 0.90)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(towerX, towerY + 4, Math.abs(dishSpan) + 6, 8, 0, 0, Math.PI);
        ctx.stroke();

        // Radar feed horn
        ctx.beginPath();
        ctx.moveTo(towerX, towerY + 4);
        ctx.lineTo(towerX + Math.sin(radarAngle) * 12, towerY - 8);
        ctx.stroke();

        // Fluttering Fabric Aviation Windsock
        const sockX = width * 0.22;
        const sockY = yBase + 120;

        // Mast
        ctx.strokeStyle = "rgba(23, 18, 15, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sockX, sockY);
        ctx.lineTo(sockX, sockY + 90);
        ctx.stroke();

        // Segmented windsock cone fluttering in wind
        const sockFlutter = Math.sin(now * 0.006) * 6;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(sockX, sockY + 4);
        ctx.lineTo(sockX + 44, sockY + 12 + sockFlutter);
        ctx.lineTo(sockX + 42, sockY + 22 + sockFlutter);
        ctx.lineTo(sockX, sockY + 26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    function drawTerminalMid(ctx, scrollY) {
        const offset = -((scrollY - 2750) * MID_RATIO) % (height * 2.5);
        const yBase = height * 0.40 + offset;
        const now = Date.now();

        ctx.save();

        // Solid Bedrock Slate Landing Tarmac Apron
        const tarmacY = yBase + 110;
        ctx.fillStyle = "rgba(23, 18, 15, 0.95)";
        ctx.fillRect(0, tarmacY, width, height - tarmacY + 400);

        // Runway Yellow Chevron Arrows (>>>) painted with ink borders
        const chevronWidth = 60;
        const chevronHeight = 28;
        const startX = width * 0.50 - 150;

        for (let i = 0; i < 4; i++) {
            const cx = startX + i * 85;
            const cy = tarmacY + 36;

            ctx.fillStyle = "#fce566";
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + chevronWidth * 0.5, cy + chevronHeight * 0.5);
            ctx.lineTo(cx, cy + chevronHeight);
            ctx.lineTo(cx + 18, cy + chevronHeight);
            ctx.lineTo(cx + chevronWidth * 0.5 + 18, cy + chevronHeight * 0.5);
            ctx.lineTo(cx + 18, cy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Runway Centerline Dashes
        ctx.fillStyle = "#fce566";
        for (let dx = 40; dx < width - 40; dx += 90) {
            ctx.fillRect(dx, tarmacY + 80, 50, 6);
        }

        // Brilliant Runway Strip Lights & Beacons (Alternating Yellow & Cyan)
        const lightCount = 14;
        const lightStep = width / lightCount;

        for (let i = 0; i <= lightCount; i++) {
            const lx = i * lightStep;
            const ly = tarmacY - 4;
            const isYellow = (i % 2 === 0);
            const pulse = Math.sin(now * 0.008 + i * 0.8) * 0.5 + 0.5;

            // Light stanchion post
            ctx.fillStyle = "#17120f";
            ctx.fillRect(lx - 2, ly, 4, 10);

            // Glowing Beacon Lens
            const color = isYellow ? `rgba(252, 229, 102, ${0.55 + pulse * 0.45})` : `rgba(0, 229, 255, ${0.50 + pulse * 0.50})`;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(lx, ly - 2, 4 + pulse * 2, 0, Math.PI * 2);
            ctx.fill();

            // Radiant ground halo
            const haloGrad = ctx.createRadialGradient(lx, ly - 2, 1, lx, ly - 2, 16);
            haloGrad.addColorStop(0, color);
            haloGrad.addColorStop(1, "transparent");
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(lx, ly - 2, 16, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // --- MAIN RENDER LOOP ---
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const scrollY = window.scrollY || window.pageYOffset || 0;
        const effectiveY = Math.max(scrollY, (window.player && window.player.pos) ? window.player.pos.y - height * 0.4 : scrollY);

        // Stratum 1: The Golden Cirrus (10,000m)
        if (effectiveY < 800) {
            drawCirrusFar(ctx, scrollY);
            drawCirrusMid(ctx, scrollY);
        }

        // Stratum 2: Cloudbreak & Mountain Peaks (7,500m)
        if (effectiveY >= 450 && effectiveY < 1850) {
            drawCloudbreakFar(ctx, scrollY);
            drawCloudbreakMid(ctx, scrollY);
        }

        // Stratum 3: Industrial Sky-Girders (4,500m)
        if (effectiveY >= 1550 && effectiveY < 2450) {
            drawGirdersFar(ctx, scrollY);
            drawGirdersMid(ctx, scrollY);
        }

        // Stratum 4: City Spires & Rooftops (2,000m)
        if (effectiveY >= 2150 && effectiveY < 2950) {
            drawCityFar(ctx, scrollY);
            drawCityMid(ctx, scrollY);
        }

        // Stratum 5: Terra Firma / The Landing Terminal (0m)
        if (effectiveY >= 2700) {
            drawTerminalFar(ctx, scrollY);
            drawTerminalMid(ctx, scrollY);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
