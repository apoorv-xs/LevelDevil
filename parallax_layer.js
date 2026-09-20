// parallax_layer.js - 2D Procedural Parallax Background World Engine
// Delivers multi-layered silhouettes (Far: 0.25x, Mid: 0.50x) across the 5 Story Sectors.

(function () {
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
        console.log("2D Procedural Parallax Background Engine Initialized.");
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

    // --- PROCEDURAL SILHOUETTE ASSETS ---

    // 1. Jakku Star Destroyer Wreckage & Sand Dunes
    function drawJakkuFar(ctx, scrollY) {
        const offset = -(scrollY * FAR_RATIO) % (height * 2);
        const yBase = height * 0.45 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(180, 83, 9, 0.22)"; // Warm amber-brown silhouette

        // Giant tilted Star Destroyer Superstructure hull
        ctx.beginPath();
        const hullX = width * 0.55;
        ctx.moveTo(hullX - 220, yBase + 180);
        ctx.lineTo(hullX - 60, yBase - 40);   // Towering bridge neck
        ctx.lineTo(hullX + 20, yBase - 45);
        ctx.lineTo(hullX + 45, yBase - 25);
        ctx.lineTo(hullX + 60, yBase - 15);
        ctx.lineTo(hullX + 260, yBase + 210); // Wedge command deck
        ctx.lineTo(hullX - 220, yBase + 210);
        ctx.closePath();
        ctx.fill();

        // 3 Giant Sublight Engine Nozzle Cylinders buried in sand
        for (let i = 0; i < 3; i++) {
            const ex = hullX - 160 + i * 110;
            const ey = yBase + 160;
            ctx.beginPath();
            ctx.ellipse(ex, ey, 38, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Rolling distant sand dunes
        ctx.fillStyle = "rgba(217, 119, 6, 0.28)";
        ctx.beginPath();
        ctx.moveTo(0, yBase + 220);
        ctx.bezierCurveTo(width * 0.3, yBase + 150, width * 0.6, yBase + 260, width, yBase + 180);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawJakkuMid(ctx, scrollY) {
        const offset = -(scrollY * MID_RATIO) % (height * 2);
        const yBase = height * 0.60 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(146, 64, 14, 0.38)";
        ctx.strokeStyle = "rgba(23, 18, 15, 0.5)";
        ctx.lineWidth = 2;

        // Moisture Vaporators & Scavenger Antennae
        const vaporators = [width * 0.12, width * 0.82];
        vaporators.forEach((vx) => {
            ctx.beginPath();
            ctx.rect(vx - 3, yBase - 90, 6, 90); // Central mast
            ctx.rect(vx - 14, yBase - 60, 28, 6); // Disc 1
            ctx.rect(vx - 20, yBase - 35, 40, 8); // Disc 2
            ctx.rect(vx - 8, yBase - 15, 16, 15); // Base condenser
            ctx.fill();
            ctx.stroke();
        });

        // Foreground dune crest
        ctx.beginPath();
        ctx.moveTo(0, yBase + 30);
        ctx.quadraticCurveTo(width * 0.45, yBase - 40, width, yBase + 50);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // 2. The Forge Industrial Girders, Smoke Stacks & Hanging Chains
    function drawForgeFar(ctx, scrollY) {
        const offset = -((scrollY - 700) * FAR_RATIO) % (height * 2);
        const yBase = height * 0.25 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(124, 45, 18, 0.26)"; // Deep industrial bronze

        // Giant smelting smokestacks
        const stacks = [width * 0.08, width * 0.28, width * 0.72, width * 0.90];
        stacks.forEach((sx, idx) => {
            const h = 260 + (idx % 2) * 60;
            ctx.beginPath();
            ctx.moveTo(sx - 25, yBase + h);
            ctx.lineTo(sx - 18, yBase);
            ctx.lineTo(sx + 18, yBase);
            ctx.lineTo(sx + 25, yBase + h);
            ctx.closePath();
            ctx.fill();

            // Stack rim
            ctx.fillRect(sx - 24, yBase - 6, 48, 8);
        });

        // Overhead structural crane truss
        ctx.fillRect(0, yBase + 40, width, 16);
        ctx.strokeStyle = "rgba(124, 45, 18, 0.35)";
        ctx.lineWidth = 3;
        for (let x = 0; x < width; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, yBase + 40);
            ctx.lineTo(x + 30, yBase + 56);
            ctx.lineTo(x + 60, yBase + 40);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawForgeMid(ctx, scrollY) {
        const offset = -((scrollY - 700) * MID_RATIO) % (height * 2);
        const yBase = height * 0.35 + offset;

        ctx.save();
        ctx.strokeStyle = "rgba(194, 65, 12, 0.45)"; // Copper orange
        ctx.fillStyle = "rgba(67, 20, 7, 0.45)";
        ctx.lineWidth = 3;

        // Heavy industrial pipe lines
        ctx.beginPath();
        ctx.arc(width * 0.15, yBase + 120, 80, Math.PI, 1.5 * Math.PI);
        ctx.lineTo(width * 0.45, yBase + 40);
        ctx.stroke();

        // Hanging chains and foundry hook
        const chainX = width * 0.85;
        ctx.beginPath();
        for (let cy = yBase - 40; cy < yBase + 120; cy += 14) {
            ctx.ellipse(chainX, cy, 4, 8, 0, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Anchor Hook
        ctx.beginPath();
        ctx.arc(chainX - 8, yBase + 130, 14, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    // 3. Cyber Core Isometric Digital Matrix & Cyan Bus Lines
    function drawCyberCoreFar(ctx, scrollY) {
        const offset = -((scrollY - 1900) * FAR_RATIO) % (height * 2);
        const yBase = height * 0.20 + offset;

        ctx.save();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.16)"; // Cyan matrix grid
        ctx.lineWidth = 1;

        // Perspective grid lines
        const vanishingX = width * 0.50;
        const vanishingY = yBase + 150;

        for (let x = -width; x < width * 2; x += 100) {
            ctx.beginPath();
            ctx.moveTo(vanishingX, vanishingY);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal circuit rails
        for (let y = vanishingY + 30; y < height + 200; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawCyberCoreMid(ctx, scrollY) {
        const offset = -((scrollY - 1900) * MID_RATIO) % (height * 2);
        const yBase = height * 0.25 + offset;

        ctx.save();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.35)"; // Vibrant cyan
        ctx.fillStyle = "rgba(6, 182, 212, 0.55)";
        ctx.lineWidth = 2;

        // Vertical Data Conduits with node pulses
        const busLines = [width * 0.05, width * 0.20, width * 0.80, width * 0.95];
        busLines.forEach((bx, idx) => {
            ctx.beginPath();
            ctx.moveTo(bx, yBase - 100);
            ctx.lineTo(bx, yBase + 350);
            ctx.stroke();

            // Circuit nodes
            for (let ny = yBase - 60; ny < yBase + 300; ny += 80) {
                ctx.beginPath();
                ctx.arc(bx, ny, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(bx, ny);
                ctx.lineTo(bx + ((idx % 2 === 0) ? 25 : -25), ny + 25);
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    // 4. Reactor Pit Conduits & Hazard Caution Stripes
    function drawReactorFar(ctx, scrollY) {
        const offset = -((scrollY - 2400) * FAR_RATIO) % (height * 2);
        const yBase = height * 0.20 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(69, 10, 10, 0.40)"; // Deep vulcan crimson

        // Massive Geothermal Cooling Towers
        const towers = [width * 0.15, width * 0.85];
        towers.forEach(tx => {
            ctx.beginPath();
            ctx.moveTo(tx - 70, yBase + 280);
            ctx.quadraticCurveTo(tx - 35, yBase + 120, tx - 50, yBase);
            ctx.lineTo(tx + 50, yBase);
            ctx.quadraticCurveTo(tx + 35, yBase + 120, tx + 70, yBase + 280);
            ctx.closePath();
            ctx.fill();

            // Glowing reactor vent rim
            ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
            ctx.fillRect(tx - 48, yBase - 4, 96, 8);
            ctx.fillStyle = "rgba(69, 10, 10, 0.40)";
        });

        ctx.restore();
    }

    function drawReactorMid(ctx, scrollY) {
        const offset = -((scrollY - 2400) * MID_RATIO) % (height * 2);
        const yBase = height * 0.30 + offset;

        ctx.save();
        // Diagonal Hazard Caution Bar
        const barY = yBase + 180;
        ctx.fillStyle = "rgba(23, 18, 15, 0.65)";
        ctx.fillRect(0, barY, width, 16);

        ctx.fillStyle = "rgba(239, 68, 68, 0.75)";
        for (let x = -50; x < width + 50; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, barY);
            ctx.lineTo(x + 14, barY);
            ctx.lineTo(x + 24, barY + 16);
            ctx.lineTo(x + 10, barY + 16);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    // 5. Transmission Beacon Celestial Nebulae & Satellite Dish Arrays
    function drawBeaconFar(ctx, scrollY) {
        const offset = -((scrollY - 2850) * FAR_RATIO) % (height * 2);
        const yBase = height * 0.15 + offset;

        ctx.save();
        // Cosmic Nebulae Dust Clouds
        const radGrad = ctx.createRadialGradient(width * 0.7, yBase + 100, 20, width * 0.7, yBase + 100, 240);
        radGrad.addColorStop(0, "rgba(99, 102, 241, 0.25)");
        radGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.12)");
        radGrad.addColorStop(1, "rgba(7, 4, 13, 0)");

        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);

        // Constellation Star Clusters
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        const stars = [
            [width * 0.15, yBase + 40], [width * 0.18, yBase + 65], [width * 0.25, yBase + 50],
            [width * 0.40, yBase + 90], [width * 0.65, yBase + 30], [width * 0.80, yBase + 75]
        ];
        stars.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Connect constellation lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(stars[0][0], stars[0][1]);
        for (let i = 1; i < stars.length; i++) {
            ctx.lineTo(stars[i][0], stars[i][1]);
        }
        ctx.stroke();

        ctx.restore();
    }

    function drawBeaconMid(ctx, scrollY) {
        const offset = -((scrollY - 2850) * MID_RATIO) % (height * 2);
        const yBase = height * 0.25 + offset;

        ctx.save();
        ctx.fillStyle = "rgba(30, 27, 75, 0.55)";
        ctx.strokeStyle = "rgba(129, 140, 248, 0.65)";
        ctx.lineWidth = 2;

        // Satellite Communications Dish Silhouettes
        const dishX = width * 0.85;
        const dishY = yBase + 90;

        // Dish Mast
        ctx.beginPath();
        ctx.moveTo(dishX - 15, dishY + 80);
        ctx.lineTo(dishX, dishY);
        ctx.lineTo(dishX + 15, dishY + 80);
        ctx.stroke();

        // Parabolic Dish Curvature
        ctx.beginPath();
        ctx.ellipse(dishX, dishY, 45, 20, -0.4, 0, Math.PI);
        ctx.stroke();

        // Pulsing Aircraft Warning Beacon Light
        const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(dishX, dishY - 25, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // --- MAIN RENDER LOOP ---
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const scrollY = window.scrollY || window.pageYOffset || 0;
        const effectiveY = Math.max(scrollY, (window.player && window.player.pos) ? window.player.pos.y - height * 0.4 : scrollY);

        // Render appropriate sector silhouettes based on scroll / player depth
        if (effectiveY < 900) {
            drawJakkuFar(ctx, scrollY);
            drawJakkuMid(ctx, scrollY);
        }
        if (effectiveY >= 450 && effectiveY < 2100) {
            drawForgeFar(ctx, scrollY);
            drawForgeMid(ctx, scrollY);
        }
        if (effectiveY >= 1700 && effectiveY < 2600) {
            drawCyberCoreFar(ctx, scrollY);
            drawCyberCoreMid(ctx, scrollY);
        }
        if (effectiveY >= 2200 && effectiveY < 3050) {
            drawReactorFar(ctx, scrollY);
            drawReactorMid(ctx, scrollY);
        }
        if (effectiveY >= 2650) {
            drawBeaconFar(ctx, scrollY);
            drawBeaconMid(ctx, scrollY);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
