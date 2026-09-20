// player_3d.js - Expressive Cel-Shaded 3D BB-8 Astromech Droid for Level Devil Remaster (Three.js)
(function () {
    "use strict";

    // Helper: Generate procedural high-detail BB-8 body texture with flush panels and ink seams
    function createBB8BodyTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // 1. Base Warm Off-White Ceramic
        ctx.fillStyle = "#f5f2e9";
        ctx.fillRect(0, 0, 1024, 512);

        // 2. Ink Panel Seams (Hand-drawn construction lines)
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3;

        // Horizontal latitude panel lines
        ctx.beginPath();
        ctx.moveTo(0, 128); ctx.lineTo(1024, 128);
        ctx.moveTo(0, 384); ctx.lineTo(1024, 384);
        ctx.stroke();

        // Vertical longitude panel lines connecting panels
        for (let x = 0; x <= 1024; x += 256) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }

        // Secondary subtle diagonal panel seams
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(23, 18, 15, 0.45)";
        for (let x = 0; x < 1024; x += 256) {
            ctx.beginPath();
            ctx.moveTo(x + 64, 128); ctx.lineTo(x + 192, 0);
            ctx.moveTo(x + 64, 384); ctx.lineTo(x + 192, 512);
            ctx.stroke();
        }

        // Helper: Draw an authentic flush BB-8 circular panel at (cx, cy)
        function drawPanel(cx, cy, radius) {
            // Outer Orange Ring
            ctx.fillStyle = "#eb5e28"; // BB-8 Safety Orange
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#17120f";
            ctx.stroke();

            // Inner Ceramic Gap Ring
            ctx.fillStyle = "#f5f2e9";
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#17120f";
            ctx.stroke();

            // Inner Silver Mechanical Ring
            ctx.fillStyle = "#8a939e";
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#17120f";
            ctx.stroke();

            // Center Charcoal Tool Socket Core
            ctx.fillStyle = "#1d2127";
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#17120f";
            ctx.stroke();

            // Technical details: 4 radial crosshair tabs
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 3.5;
            const dist1 = radius * 0.72;
            const dist2 = radius * 0.98;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * dist1, cy + Math.sin(a) * dist1);
                ctx.lineTo(cx + Math.cos(a) * dist2, cy + Math.sin(a) * dist2);
                ctx.stroke();
            }

            // Diagonal mini access notches
            ctx.fillStyle = "#17120f";
            for (let a = Math.PI / 4; a < Math.PI * 2; a += Math.PI / 2) {
                const nx = cx + Math.cos(a) * (radius * 0.85);
                const ny = cy + Math.sin(a) * (radius * 0.85);
                ctx.beginPath();
                ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Center accent amber indicator
            ctx.fillStyle = "#fce566";
            ctx.fillRect(cx - 3, cy - 3, 6, 6);
            ctx.strokeStyle = "#17120f";
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - 3, cy - 3, 6, 6);
        }

        // Draw 4 Equatorial Panels spaced at 90-degree intervals (Y = 256)
        const eqY = 256;
        const panelR = 86;
        drawPanel(128, eqY, panelR);
        drawPanel(384, eqY, panelR);
        drawPanel(640, eqY, panelR);
        drawPanel(896, eqY, panelR);

        // Draw Polar Circular Panels (Top and Bottom caps)
        drawPanel(256, 75, 52);
        drawPanel(768, 75, 52);
        drawPanel(256, 437, 52);
        drawPanel(768, 437, 52);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    // Helper: Generate procedural head dome texture with orange racing stripe and panel seams
    function createBB8HeadTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        // Base Warm Off-White
        ctx.fillStyle = "#f5f2e9";
        ctx.fillRect(0, 0, 512, 256);

        // Signature Orange Racing Stripe around lower dome
        ctx.fillStyle = "#eb5e28";
        ctx.fillRect(0, 165, 512, 48);
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(0, 165, 512, 48);

        // Silver Base Neck Rim
        ctx.fillStyle = "#7c858d";
        ctx.fillRect(0, 222, 512, 34);
        ctx.strokeRect(0, 222, 512, 34);

        // Dome Seams
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 2.5;
        for (let x = 64; x < 512; x += 128) {
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, 165);
            ctx.stroke();

            // Accent silver square on seam
            ctx.fillStyle = "#8a939e";
            ctx.fillRect(x - 5, 95, 10, 8);
            ctx.strokeRect(x - 5, 95, 10, 8);
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Helper: Golden Overcharge Body Texture (24K Gold & Cyan Cyber Circuits)
    function createGoldenBodyTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // 1. Radiant 24K Gold Metallic Base
        const grad = ctx.createLinearGradient(0, 0, 1024, 512);
        grad.addColorStop(0, "#ffd700");
        grad.addColorStop(0.3, "#fff275");
        grad.addColorStop(0.7, "#f59e0b");
        grad.addColorStop(1, "#ffd700");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // 2. Cyan Energy Circuit Lines
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 128); ctx.lineTo(1024, 128);
        ctx.moveTo(0, 384); ctx.lineTo(1024, 384);
        for (let x = 0; x <= 1024; x += 256) {
            ctx.moveTo(x, 0); ctx.lineTo(x, 512);
        }
        ctx.stroke();

        // 3. Golden Astromech Tool Panels with Glowing Cyan Cores
        function drawGoldPanel(cx, cy, radius) {
            ctx.fillStyle = "#b45309"; // Burnished dark gold
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#17120f";
            ctx.stroke();

            ctx.fillStyle = "#fef08a"; // Bright gold ring
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Glowing Cyan Energy Core
            ctx.fillStyle = "#00e5ff";
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.40, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        const eqY = 256;
        const panelR = 86;
        drawGoldPanel(128, eqY, panelR);
        drawGoldPanel(384, eqY, panelR);
        drawGoldPanel(640, eqY, panelR);
        drawGoldPanel(896, eqY, panelR);

        drawGoldPanel(256, 75, 52);
        drawGoldPanel(768, 75, 52);
        drawGoldPanel(256, 437, 52);
        drawGoldPanel(768, 437, 52);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    // Helper: Golden Head Texture
    function createGoldenHeadTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        // 24K Gold Base
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(0, 0, 512, 256);

        // Radiant Cyan Racing Stripe
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(0, 165, 512, 48);
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(0, 165, 512, 48);

        // Dark Gold Rim
        ctx.fillStyle = "#b45309";
        ctx.fillRect(0, 222, 512, 34);
        ctx.strokeRect(0, 222, 512, 34);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    const Player3D = {
        root: null,
        bodyContainer: null,
        bodyBall: null,
        bodyMesh: null,
        domeMesh: null,
        bodyMat: null,
        headMat: null,
        goldenBodyMat: null,
        goldenHeadMat: null,
        goldenHalo: null,
        headGroup: null,
        groundShadow: null,
        primaryLens: null,
        secondarySensor: null,
        tallAntenna: null,
        antennaLed: null,
        shortAntenna: null,
        isCreated: false,
        isSmashing: false,
        isGoldenMode: false,
        lastX: 0,
        currentRollZ: 0,
        headTiltZ: 0,

        setGoldenMode(active) {
            this.isGoldenMode = Boolean(active);
            if (!this.bodyMesh || !this.domeMesh) return;

            if (this.isGoldenMode) {
                if (!this.goldenBodyMat) {
                    this.goldenBodyMat = new THREE.MeshToonMaterial({
                        map: createGoldenBodyTexture(),
                        color: 0xffffff
                    });
                }
                if (!this.goldenHeadMat) {
                    this.goldenHeadMat = new THREE.MeshToonMaterial({
                        map: createGoldenHeadTexture(),
                        color: 0xffffff
                    });
                }
                this.bodyMesh.material = this.goldenBodyMat;
                this.domeMesh.material = this.goldenHeadMat;
                if (this.goldenHalo) this.goldenHalo.visible = true;
                if (this.antennaLed) this.antennaLed.material.color.setHex(0xffd700);
                console.log("Golden Astromech Overcharge Mode ACTIVATED!");
            } else {
                this.bodyMesh.material = this.bodyMat;
                this.domeMesh.material = this.headMat;
                if (this.goldenHalo) this.goldenHalo.visible = false;
                if (this.antennaLed) this.antennaLed.material.color.setHex(0x00ffff);
            }
        },

        smashIntoCamera() {
            if (!this.isCreated || this.isSmashing) return;
            this.isSmashing = true;

            const smashZ = 65; // Camera is at Z = 80, so 65 is right against screen lens glass
            const originalZ = 0;
            const originalY = this.root.position.y;
            const originalScale = this.root.scale.clone();

            const startTime = performance.now();
            const duration = 250; // ms

            const animateSmash = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quad
                const ease = 1 - (1 - progress) * (1 - progress);

                this.root.position.z = originalZ + (smashZ - originalZ) * ease;
                const s = 1 + 2.2 * ease;
                this.root.scale.set(s, s, s);

                if (progress < 1) {
                    requestAnimationFrame(animateSmash);
                } else {
                    // Screen Shake Effect
                    if (typeof shake === "function") shake(15);

                    // Slide down
                    const slideStart = performance.now();
                    const slideDuration = 350;
                    const animateSlide = () => {
                        const sElapsed = performance.now() - slideStart;
                        const sProgress = Math.min(sElapsed / slideDuration, 1);
                        this.root.position.y = originalY - (sProgress * 4);

                        if (sProgress < 1) {
                            requestAnimationFrame(animateSlide);
                        } else {
                            setTimeout(() => {
                                this.isSmashing = false;
                                this.root.position.z = originalZ;
                                this.root.position.y = originalY;
                                this.root.scale.copy(originalScale);
                            }, 300);
                        }
                    };
                    requestAnimationFrame(animateSlide);
                }
            };
            requestAnimationFrame(animateSmash);
        },

        create(scene) {
            if (!scene || this.isCreated) return;
            if (typeof THREE === "undefined") {
                console.warn("Three.js not loaded. Retrying Player3D.create in 100ms...");
                setTimeout(() => this.create(scene), 100);
                return;
            }

            // 1. Root Node
            this.root = new THREE.Group();
            this.root.name = "heroRoot";
            scene.add(this.root);

            // 2. High-Grade Cel-Shaded & Ink Line Materials
            const bodyTexture = createBB8BodyTexture();
            const headTexture = createBB8HeadTexture();

            // Cel-shaded body material with smooth flush painted graphics
            const bodyMat = new THREE.MeshToonMaterial({
                map: bodyTexture,
                color: 0xffffff
            });

            // Cel-shaded head material
            const headMat = new THREE.MeshToonMaterial({
                map: headTexture,
                color: 0xffffff
            });

            // Black ink outline material (Inverted hull technique)
            const inkOutlineMat = new THREE.MeshBasicMaterial({
                color: 0x17120f,
                side: THREE.BackSide
            });

            // Gunmetal / Silver detailing
            const silverMat = new THREE.MeshToonMaterial({
                color: 0x7c858d
            });

            // Glossy black camera photoreceptor lens
            const lensMat = new THREE.MeshStandardMaterial({
                color: 0x050508,
                roughness: 0.05,
                metalness: 0.95
            });

            // Lens reflection pin-point glint
            const glassDotMat = new THREE.MeshBasicMaterial({
                color: 0xffffff
            });

            // Cyan optical sensor
            const cyanSensorMat = new THREE.MeshBasicMaterial({
                color: 0x00e5ff
            });

            // Antenna beacon LED
            const ledMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff
            });

            // 3. Ground Contact Drop Shadow (Ink Ellipse anchored to rail)
            const shadowGeo = new THREE.CircleGeometry(0.70, 32);
            const shadowMat = new THREE.MeshBasicMaterial({
                color: 0x17120f,
                transparent: true,
                opacity: 0.35
            });
            this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
            this.groundShadow.rotation.x = -Math.PI / 2;
            this.groundShadow.position.y = 0.02;
            this.groundShadow.scale.set(1.0, 0.45, 1.0);
            this.root.add(this.groundShadow);

            // 4. Smooth Spherical Rolling Body Construction (Flush, No Stuck-on Donut Rings!)
            const BALL_RADIUS = 0.65;
            this.bodyContainer = new THREE.Group();
            this.bodyContainer.position.y = BALL_RADIUS;
            this.root.add(this.bodyContainer);

            this.bodyBall = new THREE.Group();
            this.bodyContainer.add(this.bodyBall);

            // Core sphere with flush painted BB-8 graphics
            const sphereGeo = new THREE.SphereGeometry(BALL_RADIUS, 36, 28);
            const bodyMesh = new THREE.Mesh(sphereGeo, bodyMat);
            this.bodyMesh = bodyMesh;
            this.bodyMat = bodyMat;
            this.headMat = headMat;
            this.bodyBall.add(bodyMesh);

            // Cel-shaded ink outline hull for body sphere (Matching #17120f border strokes)
            const bodyOutlineGeo = new THREE.SphereGeometry(BALL_RADIUS * 1.035, 36, 28);
            const bodyOutlineMesh = new THREE.Mesh(bodyOutlineGeo, inkOutlineMat);
            this.bodyBall.add(bodyOutlineMesh);

            // 5. Floating Magnetic Dome (Chunky, Expressive Astromech Head)
            // Sits magnetically hovering at Y = 1.28
            this.headGroup = new THREE.Group();
            this.headGroup.position.y = 1.28;
            this.root.add(this.headGroup);

            // Neck base disk (Gunmetal ring)
            const neckGeo = new THREE.CylinderGeometry(0.40, 0.42, 0.06, 32);
            const neckMesh = new THREE.Mesh(neckGeo, silverMat);
            neckMesh.position.y = 0.03;
            this.headGroup.add(neckMesh);

            // Neck ink outline
            const neckOutlineGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.065, 32);
            const neckOutlineMesh = new THREE.Mesh(neckOutlineGeo, inkOutlineMat);
            neckOutlineMesh.position.y = 0.03;
            this.headGroup.add(neckOutlineMesh);

            // Upper Hemisphere Dome (Scale 0.46 for expressive chibi proportions)
            const DOME_RADIUS = 0.45;
            const domeGeo = new THREE.SphereGeometry(DOME_RADIUS, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMesh = new THREE.Mesh(domeGeo, headMat);
            this.domeMesh = domeMesh;
            domeMesh.position.y = 0.06;
            this.headGroup.add(domeMesh);

            // Golden Overcharge Radiant Halo Ring (Unlocked upon 5/5 Data Cores)
            const haloGeo = new THREE.TorusGeometry(0.55, 0.03, 16, 32);
            const haloMat = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.85
            });
            this.goldenHalo = new THREE.Mesh(haloGeo, haloMat);
            this.goldenHalo.position.set(0, 0.25, -0.15);
            this.goldenHalo.visible = false;
            this.headGroup.add(this.goldenHalo);

            // Dome cel-shaded ink outline hull
            const domeOutlineGeo = new THREE.SphereGeometry(DOME_RADIUS * 1.038, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeOutlineMesh = new THREE.Mesh(domeOutlineGeo, inkOutlineMat);
            domeOutlineMesh.position.y = 0.06;
            this.headGroup.add(domeOutlineMesh);

            // Primary Photoreceptor (Large Glossy Black Lens with Silver Bezel)
            const lensMountGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.05, 24);
            const lensMount = new THREE.Mesh(lensMountGeo, silverMat);
            lensMount.rotation.x = Math.PI / 2;
            lensMount.position.set(0, 0.25, 0.38);
            this.headGroup.add(lensMount);

            const lensMountOutlineGeo = new THREE.CylinderGeometry(0.155, 0.165, 0.055, 24);
            const lensMountOutline = new THREE.Mesh(lensMountOutlineGeo, inkOutlineMat);
            lensMountOutline.rotation.x = Math.PI / 2;
            lensMountOutline.position.set(0, 0.25, 0.38);
            this.headGroup.add(lensMountOutline);

            // Glossy black eye lens
            const lensGeo = new THREE.SphereGeometry(0.115, 24, 16);
            this.primaryLens = new THREE.Mesh(lensGeo, lensMat);
            this.primaryLens.position.set(0, 0.25, 0.40);
            this.headGroup.add(this.primaryLens);

            // Sharp pinpoint specular glass reflection glint
            const dotGeo = new THREE.SphereGeometry(0.024, 12, 12);
            const glassDot = new THREE.Mesh(dotGeo, glassDotMat);
            glassDot.position.set(0.04, 0.29, 0.50);
            this.headGroup.add(glassDot);

            // Secondary Indicator Sensor (Cyan)
            const secMountGeo = new THREE.CylinderGeometry(0.06, 0.065, 0.04, 16);
            const secMount = new THREE.Mesh(secMountGeo, silverMat);
            secMount.rotation.x = Math.PI / 2;
            secMount.position.set(0.18, 0.13, 0.39);
            this.headGroup.add(secMount);

            const secSensorGeo = new THREE.SphereGeometry(0.05, 16, 12);
            this.secondarySensor = new THREE.Mesh(secSensorGeo, cyanSensorMat);
            this.secondarySensor.position.set(0.18, 0.13, 0.42);
            this.headGroup.add(this.secondarySensor);

            // Dual Astromech Antennae on Dome
            // Tall main antenna with collar and cyan LED tip
            const tallAntCollarGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.06, 12);
            const tallAntCollar = new THREE.Mesh(tallAntCollarGeo, silverMat);
            tallAntCollar.position.set(-0.11, 0.48, -0.06);
            this.headGroup.add(tallAntCollar);

            const tallAntGeo = new THREE.CylinderGeometry(0.010, 0.014, 0.48, 12);
            this.tallAntenna = new THREE.Mesh(tallAntGeo, silverMat);
            this.tallAntenna.position.set(-0.11, 0.48 + 0.24, -0.06);
            this.headGroup.add(this.tallAntenna);

            // Antenna beacon LED (Pulsing cyan/orange status light)
            const ledGeo = new THREE.SphereGeometry(0.022, 10, 10);
            this.antennaLed = new THREE.Mesh(ledGeo, ledMat);
            this.antennaLed.position.set(-0.11, 0.48 + 0.48, -0.06);
            this.headGroup.add(this.antennaLed);

            // Short stub antenna
            const shortAntGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.24, 12);
            this.shortAntenna = new THREE.Mesh(shortAntGeo, silverMat);
            this.shortAntenna.position.set(0.15, 0.48 + 0.12, -0.08);
            this.headGroup.add(this.shortAntenna);

            // Register shadows with engine
            if (window.Engine3D && window.Engine3D.addShadowCaster) {
                window.Engine3D.addShadowCaster(this.root);
            }

            this.isCreated = true;
            console.log("Cel-Shaded 3D BB-8 Astromech Droid with Flush Panels & Ink Outlines Created in Three.js.");
        },

        // --- REAL-TIME FRAME SYNCHRONIZATION WITH 2D KABOOM PLAYER ---
        syncWith2D(guy) {
            if (!this.isCreated || !guy || !guy.exists || !guy.exists()) {
                if (this.root) this.root.visible = false;
                return;
            }

            this.root.visible = true;

            // Skip XY and Scale sync if we are doing a Z-axis smash animation!
            if (this.isSmashing) return;

            // 1. Coordinate Sync
            const targetPos = window.Engine3D.to3DVec(guy.pos.x, guy.pos.y, 0);
            this.root.position.x = targetPos.x;
            this.root.position.y = targetPos.y;

            // 2. Facing & Scale
            const isFacingLeft = guy.facingLeft || (guy.scale && guy.scale.x < 0);
            const scaleY = (guy.scale && guy.scale.y) ? guy.scale.y : 1.0;
            const scaleX = (guy.scale && guy.scale.x) ? Math.abs(guy.scale.x) : 1.0;

            this.root.scale.set(scaleX, scaleY, 1.0);

            // 3. Movement & Rolling Ball Physics
            const t = (typeof time === "function") ? time() : performance.now() * 0.001;
            const isGrounded = (typeof guy.isGrounded === "function") ? guy.isGrounded() : true;
            const isMoving = (typeof isKeyDown === "function" && (isKeyDown("left") || isKeyDown("right") || isKeyDown("a") || isKeyDown("d"))) || Boolean(guy.isMovingThisFrame);

            // Calculate horizontal delta for ball rolling
            const deltaX = targetPos.x - this.lastX;
            this.lastX = targetPos.x;

            if (isGrounded && Math.abs(deltaX) > 0.0001) {
                // Roll sphere: Delta theta = -deltaX / radius
                this.currentRollZ -= (deltaX / 0.65) * 1.25;
                this.bodyBall.rotation.z = this.currentRollZ;
            }

            // 4. Momentum Tilt (The BB-8 Lean)
            let targetTiltZ = 0;
            if (isMoving) {
                targetTiltZ = isFacingLeft ? 0.22 : -0.22; // ~12 degrees forward sprint lean
            }
            this.headTiltZ += (targetTiltZ - this.headTiltZ) * 0.15;
            this.headGroup.rotation.z = this.headTiltZ;

            // 5. Inquisitive Head Tracking (Mouse cursor companion)
            let targetPitch = 0;
            let targetYaw = 0;

            if (window.mousePos2D && window.Engine3D) {
                const mouse3D = window.Engine3D.to3DVec(window.mousePos2D.x, window.mousePos2D.y, 0);
                const dx = mouse3D.x - this.root.position.x;
                const dy = mouse3D.y - (this.root.position.y + 1.28);

                // Pitch (look up / down)
                targetPitch = Math.max(-0.35, Math.min(0.35, -dy * 0.06));
                // Yaw (turn towards cursor)
                targetYaw = Math.max(-0.55, Math.min(0.55, dx * 0.04));
            }

            this.headGroup.rotation.x += (targetPitch - this.headGroup.rotation.x) * 0.1;
            this.headGroup.rotation.y += (targetYaw - this.headGroup.rotation.y) * 0.1;

            // 6. Jump & Airborne Dynamics + Contact Shadow
            if (!isGrounded) {
                // Airborne: Dome lifts slightly on magnetic cushion, slight wobble
                this.headGroup.position.y = 1.34 + Math.sin(t * 12) * 0.02;
                this.bodyContainer.scale.set(0.92, 1.10, 0.92); // Stretch in air
                this.tallAntenna.rotation.z = Math.sin(t * 15) * 0.12; // Antenna flutter

                // Contact shadow scales down and fades as BB-8 rises
                if (this.groundShadow) {
                    this.groundShadow.scale.set(0.7, 0.3, 0.7);
                    this.groundShadow.material.opacity = 0.18;
                }
            } else if (isMoving) {
                // Rolling on ground: Subtle magnetic chatter
                this.headGroup.position.y = 1.28 + Math.abs(Math.sin(t * 18)) * 0.025;
                this.bodyContainer.scale.set(1.0, 1.0, 1.0);
                this.tallAntenna.rotation.z = (isFacingLeft ? 0.08 : -0.08);

                if (this.groundShadow) {
                    this.groundShadow.scale.set(1.05, 0.45, 1.05);
                    this.groundShadow.material.opacity = 0.35;
                }
            } else {
                // Idle curious floating hover
                this.headGroup.position.y = 1.28 + Math.sin(t * 3) * 0.02;
                this.bodyContainer.scale.set(1.0, 1.0, 1.0);
                this.tallAntenna.rotation.z = Math.sin(t * 2) * 0.03;

                if (this.groundShadow) {
                    this.groundShadow.scale.set(1.0, 0.45, 1.0);
                    this.groundShadow.material.opacity = 0.35;
                }
            }

            // 7. Pulsing Antenna LED Beacon & Golden Halo Spin
            if (this.antennaLed) {
                const pulse = 0.5 + 0.5 * Math.sin(t * 6);
                this.antennaLed.scale.set(1 + pulse * 0.3, 1 + pulse * 0.3, 1 + pulse * 0.3);
            }
            if (this.goldenHalo && this.goldenHalo.visible) {
                this.goldenHalo.rotation.z += 0.035;
                const haloPulse = 0.8 + 0.2 * Math.sin(t * 8);
                this.goldenHalo.scale.set(haloPulse, haloPulse, haloPulse);
            }
        }
    };

    window.Player3D = Player3D;
})();
