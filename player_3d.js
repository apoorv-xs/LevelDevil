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

    const Player3D = {
        root: null,
        bodyContainer: null,
        bodyBall: null,
        headGroup: null,
        groundShadow: null,
        primaryLens: null,
        secondarySensor: null,
        tallAntenna: null,
        antennaLed: null,
        shortAntenna: null,
        isCreated: false,
        isSmashing: false,
        isCelebrating: false,
        celebrateStartTime: 0,
        isNodding: false,
        nodStartTime: 0,
        isCurious: false,
        curiousStartTime: 0,
        gazeTargetWorld: null,
        lastX: null,
        currentRollZ: 0,
        headTiltZ: 0,

        celebrateVictory() {
            if (!this.isCreated) return;
            if (this.isCelebrating) return;
            this.isCelebrating = true;
            this.celebrateStartTime = performance.now();
            if (this.antennaLed) {
                this.antennaLed.material.color.setHex(0xffd700);
            }
            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playCelebrate === "function") {
                const bb8X = this.root ? (this.root.position.x / (typeof this.getScale === "function" ? this.getScale() : 0.05)) : null;
                window.SFX.playCelebrate(bb8X);
            }
        },

        curiousInspect() {
            if (!this.isCreated) return;
            this.isCurious = true;
            this.curiousStartTime = performance.now();
            if (this.secondarySensor) {
                this.secondarySensor.material.color.setHex(0x00ffff);
            }
        },

        nod() {
            if (!this.isCreated) return;
            this.isNodding = true;
            this.nodStartTime = performance.now();
        },

        pointAt(worldX, worldY, duration = 3000) {
            this.gazeTargetWorld = { x: worldX, y: worldY };
            if (this._gazeTimeout) clearTimeout(this._gazeTimeout);
            if (duration > 0) {
                this._gazeTimeout = setTimeout(() => {
                    this.gazeTargetWorld = null;
                }, duration);
            }
        },

        pulseAntenna(colorHex = 0xffd700, duration = 220) {
            if (!this.isCreated || !this.antennaLed) return;
            this.antennaLed.material.color.setHex(colorHex);
            this.antennaLed.scale.set(1.85, 1.85, 1.85);
            if (this._antennaPulseTimeout) clearTimeout(this._antennaPulseTimeout);
            this._antennaPulseTimeout = setTimeout(() => {
                if (this.antennaLed) {
                    this.antennaLed.material.color.setHex(0x00ffff);
                    this.antennaLed.scale.set(1.0, 1.0, 1.0);
                }
            }, duration);
        },

        initPointerInteractions() {
            if (typeof window === "undefined" || this._pointerBound) return;
            this._pointerBound = true;

            window.mousePos2D = window.mousePos2D || { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };

            this._onPointerMove = (e) => {
                const scrollY = window.scrollY || window.pageYOffset || 0;
                window.mousePos2D.x = e.clientX;
                window.mousePos2D.y = e.clientY + scrollY; // World coordinate
                window.mousePos2D.active = true;
                window.mousePos2D.lastMoveTime = performance.now();
            };
            window.addEventListener("pointermove", this._onPointerMove, { passive: true });

            const raycaster = (typeof THREE !== "undefined") ? new THREE.Raycaster() : null;
            const pointerVec = (typeof THREE !== "undefined") ? new THREE.Vector2() : null;

            this._onPointerDown = (e) => {
                // If clicking an interactive form element or HUD button, let it handle
                if (e.target && e.target.closest && e.target.closest("input, textarea, select, button, a, .bb8-hud-btn")) return;

                if (this.root && raycaster && pointerVec && window.Engine3D && window.Engine3D.camera) {
                    pointerVec.x = (e.clientX / window.innerWidth) * 2 - 1;
                    pointerVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
                    raycaster.setFromCamera(pointerVec, window.Engine3D.camera);
                    const hits = raycaster.intersectObject(this.root, true);
                    if (hits && hits.length > 0) {
                        e.stopPropagation();
                        this.celebrateVictory();
                        if (typeof window.SFX?.playThought === "function") {
                            window.SFX.playThought(window.player?.pos?.x);
                        }
                        if (window.System1Brain && typeof window.System1Brain.showGuidanceHUD === "function") {
                            window.System1Brain.showGuidanceHUD();
                        }
                        return;
                    }
                }

                this.pulseAntenna(0xffd700, 220);
                if (!this.isCelebrating && Math.random() > 0.6) {
                    this.nod();
                }
            };
            window.addEventListener("pointerdown", this._onPointerDown, { passive: false });
        },

        setThrusterActive(active) {
            this.isThrusterActive = Boolean(active);
            if (active) {
                this.pulseAntenna(0x4deeea, 800);
            }
        },

        holographicSpotlight(targetX, targetY, duration = 2500) {
            if (!this.root || !window.player) return;
            const fromX = window.player.pos.x;
            const fromY = window.player.pos.y - 20; // from antenna beacon
            AstromechArchitect.fireTargetingBeam(fromX, fromY, targetX, targetY);
            this.pulseAntenna(0x4deeea, duration);
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
                side: THREE.BackSide,
                depthWrite: false
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
            domeMesh.position.y = 0.06;
            this.headGroup.add(domeMesh);

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
            this.antennaLed.position.set(0, 0.24, 0);
            this.tallAntenna.add(this.antennaLed);

            // Short stub antenna
            const shortAntGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.24, 12);
            this.shortAntenna = new THREE.Mesh(shortAntGeo, silverMat);
            this.shortAntenna.position.set(0.15, 0.48 + 0.12, -0.08);
            this.headGroup.add(this.shortAntenna);

            // Register shadows with engine
            if (window.Engine3D && window.Engine3D.addShadowCaster) {
                window.Engine3D.addShadowCaster(this.root);
            }

            if (AstromechArchitect) {
                AstromechArchitect.init(scene);
            }

            this.isCreated = true;
            this.initPointerInteractions();
            console.log("Cel-Shaded 3D BB-8 Astromech Droid with Flush Panels & Ink Outlines Created in Three.js.");
        },

        // --- REAL-TIME FRAME SYNCHRONIZATION WITH 2D KABOOM PLAYER ---
        syncWith2D(guy) {
            // REMOVED: AstromechArchitect.update(...) - Sole driver should be portfolio_engine.js
            
            const frameDt = Math.min((performance.now() - (this._lastSyncTime || performance.now())) / 1000, 0.05);
            this._lastSyncTime = performance.now();

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
            
            if (this.lastX === null || Math.abs(deltaX) > 5) {
                this.lastX = targetPos.x;
                // skip rotation this frame
            } else {
                this.lastX = targetPos.x;
                if (isGrounded && Math.abs(deltaX) > 0.0001) {
                    // Roll sphere: Delta theta = -deltaX / radius
                    this.currentRollZ -= (deltaX / 0.65) * 1.25;
                    this.bodyBall.rotation.z = this.currentRollZ;
                }
            }

            // 4. Momentum Tilt & Emotive Gestures
            let targetTiltZ = 0;
            if (this.isCelebrating) {
                const elapsed = (performance.now() - this.celebrateStartTime) / 1000;
                if (elapsed < 1.6) {
                    const leapHeight = Math.sin((elapsed / 1.6) * Math.PI) * 2.2;
                    this.root.position.y = targetPos.y + leapHeight;
                    this.bodyBall.rotation.y += 15.0 * frameDt;
                    this.headGroup.rotation.y += 16.8 * frameDt;
                    targetTiltZ = Math.sin(elapsed * 12) * 0.25;
                    if (this.antennaLed) {
                        const strobe = Math.sin(elapsed * 24) > 0 ? 0xffd700 : 0x00ffff;
                        this.antennaLed.material.color.setHex(strobe);
                        this.antennaLed.scale.set(1.8, 1.8, 1.8);
                    }
                } else {
                    this.isCelebrating = false;
                    this.bodyBall.rotation.y = 0;
                    this.headGroup.rotation.y = 0;
                    if (this.antennaLed) {
                        this.antennaLed.material.color.setHex(0x00ffff);
                        this.antennaLed.scale.set(1, 1, 1);
                    }
                }
            } else if (this.isCurious) {
                const elapsedCurious = (performance.now() - this.curiousStartTime) / 1000;
                if (elapsedCurious < 2.0) {
                    targetTiltZ = isFacingLeft ? -0.32 : 0.32; // Inquisitive 18 deg lean
                } else {
                    this.isCurious = false;
                }
            } else if (isMoving) {
                targetTiltZ = isFacingLeft ? 0.22 : -0.22; // ~12 degrees forward sprint lean
            }
            // 5. Inquisitive Head Tracking (Mouse cursor / active target companion)
            let targetPitch = 0;
            let targetYaw = 0;
            let targetGazeRoll = 0;

            if (this.isNodding) {
                const elapsedNod = (performance.now() - this.nodStartTime) / 1000;
                if (elapsedNod < 0.8) {
                    targetPitch = Math.sin((elapsedNod / 0.8) * Math.PI * 4) * 0.35;
                } else {
                    this.isNodding = false;
                }
            } else if (this.gazeTargetWorld && window.Engine3D) {
                const target3D = window.Engine3D.to3DVec(this.gazeTargetWorld.x, this.gazeTargetWorld.y, 0);
                const dx = target3D.x - this.root.position.x;
                const dy = target3D.y - (this.root.position.y + 1.28);
                targetPitch = Math.max(-0.45, Math.min(0.45, -dy * 0.08));
                targetYaw = Math.max(-0.75, Math.min(0.75, dx * 0.05));
                targetGazeRoll = -targetYaw * 0.18;
            } else if (window.mousePos2D && window.Engine3D) {
                const now = performance.now();
                const isRecent = (now - (window.mousePos2D.lastMoveTime || now)) < 4500;
                if (isRecent || window.mousePos2D.active) {
                    const mouse3D = window.Engine3D.to3DVec(window.mousePos2D.x, window.mousePos2D.y, 0);
                    const dx = mouse3D.x - this.root.position.x;
                    const dy = mouse3D.y - (this.root.position.y + 1.28);

                    // Anatomically natural clamped look angles (Pitch +/-26 deg, Yaw +/-43 deg)
                    targetPitch = Math.max(-0.45, Math.min(0.45, -dy * 0.08));
                    targetYaw = Math.max(-0.75, Math.min(0.75, dx * 0.05));
                    targetGazeRoll = -targetYaw * 0.18;

                    // Specular glint pupil shift (subtle life-like eye tracking)
                    if (this.primaryLens) {
                        const shiftX = Math.max(-0.015, Math.min(0.015, dx * 0.002));
                        const shiftY = Math.max(-0.012, Math.min(0.012, dy * 0.002));
                        this.primaryLens.position.x = shiftX;
                        this.primaryLens.position.y = 0.25 + shiftY;
                    }
                } else if (!isRecent && !window.mousePos2D.active) {
                    if (this.primaryLens) {
                        this.primaryLens.position.x += (0 - this.primaryLens.position.x) * 0.05;
                        this.primaryLens.position.y += (0.25 - this.primaryLens.position.y) * 0.05;
                    }
                }
            }

            this.headTiltZ += ((targetTiltZ + targetGazeRoll) - this.headTiltZ) * 0.15;
            this.headGroup.rotation.z = this.headTiltZ;

            this.headGroup.rotation.x += (targetPitch - this.headGroup.rotation.x) * 0.12;
            this.headGroup.rotation.y += (targetYaw - this.headGroup.rotation.y) * 0.12;

            // 6. Jump & Airborne Dynamics + Contact Shadow
            if (!isGrounded || this.isThrusterActive) {
                if (this.isThrusterActive && Math.random() > 0.4) {
                    AstromechArchitect.spawnSparkBurst(guy.pos.x, guy.pos.y + 10, 3, 0x4deeea, true);
                }
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

            // 7. Pulsing Antenna LED Beacon
            if (this.antennaLed) {
                const pulse = 0.5 + 0.5 * Math.sin(t * 6);
                this.antennaLed.scale.set(1 + pulse * 0.3, 1 + pulse * 0.3, 1 + pulse * 0.3);
            }
        },

        constructPlatform(guy, rails) {
            return AstromechArchitect.constructPlatform(guy, rails || (typeof window !== "undefined" ? window.landingRails : null));
        },

        deployLaserBridge(gapLeft, gapRight, y, rails, guy) {
            return AstromechArchitect.deployLaserBridge(gapLeft, gapRight, y, rails || (typeof window !== "undefined" ? window.landingRails : null), guy);
        },

        weldSurface(rail, contactX) {
            return AstromechArchitect.weldSurface(rail, contactX);
        },

        dispose() {
            if (AstromechArchitect) {
                AstromechArchitect.dispose(typeof window !== "undefined" ? window.player : null, typeof window !== "undefined" ? window.landingRails : null);
            }
            if (this.root && this.root.parent) {
                this.root.parent.remove(this.root);
            }
            if (this.root) {
                this.root.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => {
                                if (m.map) m.map.dispose();
                                m.dispose();
                            });
                        } else {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    }
                });
            }
            this.root = null;
            this.bodyContainer = null;
            this.bodyBall = null;
            this.headGroup = null;
            this.groundShadow = null;
            this.antennaLed = null;
            this.tallAntenna = null;
            this.shortAntenna = null;
            this.isCreated = false;
            
            this.lastX = null;
            this.currentRollZ = 0;
            this.headTiltZ = 0;
            this.isCelebrating = false;
            this.isNodding = false;
            this.isCurious = false;
            if (this._gazeTimeout) clearTimeout(this._gazeTimeout);
            if (this._antennaPulseTimeout) clearTimeout(this._antennaPulseTimeout);

            if (this._onPointerMove) {
                window.removeEventListener('pointermove', this._onPointerMove);
                this._onPointerMove = null;
            }
            if (this._onPointerDown) {
                window.removeEventListener('pointerdown', this._onPointerDown);
                this._onPointerDown = null;
            }
            this._pointerBound = false;
        }
    };

    // --- ASTROMECH ARCHITECT ENGINE (Level Devil 2.5D Hard-Light Laser Engine) ---
    const AstromechArchitect = {
        scene: null,
        activeRails: [],
        activeSparks: [],
        activeBeams: [],
        lastConstructTime: 0,
        lastWeldTime: 0,

        init(scene) {
            this.scene = scene || (typeof window !== "undefined" && window.Engine3D && window.Engine3D.scene) || null;
        },

        getScene() {
            if (typeof window !== "undefined" && window.Engine3D && window.Engine3D.scene) {
                return window.Engine3D.scene;
            }
            if (this.scene) return this.scene;
            if (typeof window !== "undefined" && Player3D.root && Player3D.root.parent) {
                return Player3D.root.parent;
            }
            return null;
        },

        getScale() {
            if (typeof window !== "undefined" && window.Engine3D && typeof window.Engine3D.getScale === "function") {
                return window.Engine3D.getScale();
            }
            return 0.05;
        },

        to3DVec(x2d, y2d, z = 0) {
            if (typeof window !== "undefined" && window.Engine3D && typeof window.Engine3D.to3DVec === "function") {
                const target = (typeof THREE !== "undefined") ? new THREE.Vector3() : null;
                const v = window.Engine3D.to3DVec(x2d, y2d, z, target);
                return v;
            }
            if (typeof THREE !== "undefined") {
                return new THREE.Vector3(x2d * 0.05, -y2d * 0.05, z);
            }
            return { x: x2d * 0.05, y: -y2d * 0.05, z };
        },

        // Spawn neon welding spark particles in Three.js
        spawnSparkBurst(x2d, y2d, count = 16, colorHex = 0x4deeea, isExhaust = false) {
            const scene = this.getScene();
            if (!scene || typeof THREE === "undefined") return;

            const origin3d = this.to3DVec(x2d, y2d, 0.2);
            const positions = new Float32Array(count * 3);
            const velocities = [];

            for (let i = 0; i < count; i++) {
                positions[i * 3] = origin3d.x;
                positions[i * 3 + 1] = origin3d.y;
                positions[i * 3 + 2] = origin3d.z + (Math.random() - 0.5) * 0.3;
                velocities.push({
                    vx: (Math.random() - 0.5) * 5.5,
                    vy: isExhaust ? -(Math.random() * 6.5 + 2.5) : (Math.random() * 6.5 + 2.5),
                    vz: (Math.random() - 0.5) * 3.5
                });
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const mat = new THREE.PointsMaterial({
                color: colorHex,
                size: 0.16,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const points = new THREE.Points(geo, mat);
            scene.add(points);

            this.activeSparks.push({
                points,
                geo,
                mat,
                velocities,
                count,
                lastScrollY: (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0,
                createdAt: performance.now(),
                duration: 420
            });
        },

        // Downward laser beam from BB-8 chassis to construct platform
        fireDownwardBeam(x2d, fromY2d, toY2d) {
            const scene = this.getScene();
            if (!scene || typeof THREE === "undefined") return;

            const scale = this.getScale();
            const height2d = Math.max(8, toY2d - fromY2d);
            const height3d = height2d * scale;
            const midY2d = (fromY2d + toY2d) / 2;
            const pos3d = this.to3DVec(x2d, midY2d, 0.1);

            const geo = new THREE.CylinderGeometry(0.045, 0.045, height3d, 12);
            const mat = new THREE.MeshBasicMaterial({ color: 0x4deeea, transparent: true, opacity: 0.95 });
            const coreGeo = new THREE.CylinderGeometry(0.02, 0.02, height3d, 8);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });

            const group = new THREE.Group();
            group.add(new THREE.Mesh(geo, mat));
            group.add(new THREE.Mesh(coreGeo, coreMat));
            group.position.copy(pos3d);
            scene.add(group);

            this.activeBeams.push({
                group,
                geometries: [geo, coreGeo],
                materials: [mat, coreMat],
                x2d,
                y2d: midY2d,
                createdAt: performance.now(),
                duration: 220
            });
        },

        // Targeting pulse beam from BB-8 to chasm gap
        fireTargetingBeam(fromX, fromY, toX, toY) {
            const scene = this.getScene();
            if (!scene || typeof THREE === "undefined") return;

            const from3d = this.to3DVec(fromX, fromY, 0.3);
            const to3d = this.to3DVec(toX, toY, 0.1);
            const dir = new THREE.Vector3().subVectors(to3d, from3d);
            const length = dir.length();
            if (length < 0.01) return;

            const geo = new THREE.CylinderGeometry(0.035, 0.035, length, 8);
            geo.translate(0, length / 2, 0);
            geo.rotateX(Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x4deeea, transparent: true, opacity: 0.9 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(from3d);
            mesh.lookAt(to3d);
            scene.add(mesh);

            this.activeBeams.push({
                group: mesh,
                geometries: [geo],
                materials: [mat],
                isTargeting: true,
                fromX,
                fromY,
                toX,
                toY,
                createdAt: performance.now(),
                duration: 200
            });
        },

        // Autonomous LiDaR Surface Welding: Brief neon welding spark effect and laser line flash
        weldSurface(rail, contactX) {
            if (!rail) return;
            const now = performance.now();
            if (rail._lastWeldTime && now - rail._lastWeldTime < 280) return;
            rail._lastWeldTime = now;

            const cx = (typeof contactX === "number") ? contactX : (rail.xLeft + rail.xRight) / 2;
            this.spawnSparkBurst(cx, rail.y, 14, 0x4deeea);

            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playWeld === "function") {
                window.SFX.playWeld(cx);
            }

            const scene = this.getScene();
            if (!scene || typeof THREE === "undefined") return;

            const scale = this.getScale();
            const width2d = rail.width || (rail.xRight - rail.xLeft) || 120;
            const width3d = width2d * scale;
            const midX = (rail.xLeft + rail.xRight) / 2;
            const p3d = this.to3DVec(midX, rail.y, 0.06);

            const geo = new THREE.PlaneGeometry(width3d, 0.12);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x4deeea,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(p3d);
            mesh.scale.x = 0.2;
            scene.add(mesh);

            this.activeBeams.push({
                group: mesh,
                geometries: [geo],
                materials: [mat],
                cx: midX,
                y2d: rail.y,
                width3d,
                isFlash: true,
                createdAt: now,
                duration: 320
            });
        },

        // Player Construct Tool ('F' Hotkey / Laser Springboard)
        constructPlatform(player, landingRails) {
            const now = performance.now();
            if (this.lastConstructTime && (now - this.lastConstructTime < 350)) return null;
            this.lastConstructTime = now;

            const px = player ? player.pos.x : 0;
            const py = player ? player.pos.y : 0;
            const width = 160;
            const xLeft = Math.round(px - width / 2);
            const xRight = Math.round(px + width / 2);
            const platformY = Math.round(py);

            // 1. Downward laser beam & spark particles
            this.fireDownwardBeam(px, py - 35, platformY);
            this.spawnSparkBurst(px, platformY, 18, 0x4deeea);

            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playConstruct === "function") {
                window.SFX.playConstruct(px);
            }

            // 2. 3D holographic platform
            let group = null;
            let geometries = [];
            let materials = [];
            const scene = this.getScene();
            const scale = this.getScale();
            const len3d = width * scale;

            if (scene && typeof THREE !== "undefined") {
                group = new THREE.Group();
                group.name = "hardLightPlatform";

                // Main vibrant cyan beam (#4deeea)
                const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, len3d, 16);
                beamGeo.rotateZ(Math.PI / 2);
                const beamMat = new THREE.MeshBasicMaterial({ color: 0x4deeea, transparent: true, opacity: 0.9, depthWrite: false });
                const beamMesh = new THREE.Mesh(beamGeo, beamMat);
                group.add(beamMesh);

                // Laser core (white high-intensity)
                const coreGeo = new THREE.CylinderGeometry(0.038, 0.038, len3d, 12);
                coreGeo.rotateZ(Math.PI / 2);
                const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false });
                const coreMesh = new THREE.Mesh(coreGeo, coreMat);
                group.add(coreMesh);

                // Laser endcaps (#00ffff)
                const endcapGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16);
                endcapGeo.rotateZ(Math.PI / 2);
                const endcapMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 1.0 });
                const leftCap = new THREE.Mesh(endcapGeo, endcapMat);
                leftCap.position.x = -len3d / 2;
                group.add(leftCap);

                const rightCap = new THREE.Mesh(endcapGeo, endcapMat);
                rightCap.position.x = len3d / 2;
                group.add(rightCap);

                const pos3d = this.to3DVec(px, platformY, 0.2);
                group.position.copy(pos3d);
                scene.add(group);

                geometries.push(beamGeo, coreGeo, endcapGeo);
                materials.push(beamMat, coreMat, endcapMat);
            }

            // 3. Register physical landing rail in engine
            const rail = {
                name: "HARD_LIGHT_PLATFORM",
                xLeft,
                xRight,
                width,
                y: platformY,
                cx: px,           // ADD: center X for 3D positioning
                y2d: platformY,    // ADD: 2D Y for 3D positioning
                w2d: width,        // ADD: 2D width for scale sync
                len3d: len3d || (width * 0.05),  // ADD: initial 3D length for scale reference
                trap: false,
                isHardLight: true,
                isBridge: false,
                group,
                geometries,
                materials,
                createdAt: now,
                duration: 6000 // 6-second platform lifetime
            };

            this.activeRails.push(rail);
            if (landingRails && !landingRails.includes(rail)) landingRails.push(rail);
            if (typeof window !== "undefined" && window.landingRails && !window.landingRails.includes(rail)) {
                window.landingRails.push(rail);
            }

            // 4. Pin player to platform & trigger landing
            if (player) {
                player.pos.y = platformY;
                player.vy = 0;
                player.grounded = true;
                player.currentRail = rail;
                if (typeof player.triggerGround === "function") {
                    player.triggerGround(rail);
                }
            }

            // 5. Emotive response & retro thought bubble
            if (typeof Player3D !== "undefined" && typeof Player3D.nod === "function") {
                Player3D.nod();
            }
            if (typeof window !== "undefined" && window.System1Brain && typeof window.System1Brain.emitThought === "function") {
                window.System1Brain.emitThought("⚡ HARD-LIGHT RAIL DEPLOYED", 3000);
            }

            return rail;
        },

        // Dynamic Hard-Light Laser Bridging (Autonomous Chasm Bridging)
        deployLaserBridge(gapLeft, gapRight, bridgeY, landingRails, player) {
            const now = performance.now();
            const cx = (gapLeft + gapRight) / 2;

            // Check if active bridge already covers this gap
            const existing = this.activeRails.find(r => r.isBridge && Math.abs(r.y2d - bridgeY) <= 8 && Math.abs(r.cx - cx) <= 25);
            if (existing) {
                existing.createdAt = now; // Refresh decay while near/crossing
                return existing;
            }

            const xLeft = gapLeft - 6;
            const xRight = gapRight + 6;
            const width = xRight - xLeft;

            // BB-8 fires targeting pulse beam towards the gap
            if (player) {
                this.fireTargetingBeam(player.pos.x, player.pos.y - 25, cx, bridgeY);
            }

            // Laser sparks at both bridge endcaps
            this.spawnSparkBurst(gapLeft, bridgeY, 12, 0x4deeea);
            this.spawnSparkBurst(gapRight, bridgeY, 12, 0x4deeea);

            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playConstruct === "function") {
                window.SFX.playConstruct(cx);
            }

            // Three.js holographic laser bridge
            let group = null;
            let geometries = [];
            let materials = [];
            const scene = this.getScene();
            const scale = this.getScale();
            const len3d = width * scale;

            if (scene && typeof THREE !== "undefined") {
                group = new THREE.Group();
                group.name = "hardLightBridge";

                // Vibrant glowing cyan beam (#4deeea)
                const beamGeo = new THREE.CylinderGeometry(0.075, 0.075, len3d, 16);
                beamGeo.rotateZ(Math.PI / 2);
                const beamMat = new THREE.MeshBasicMaterial({ color: 0x4deeea, transparent: true, opacity: 0.92, depthWrite: false });
                const beamMesh = new THREE.Mesh(beamGeo, beamMat);
                group.add(beamMesh);

                // Laser core (white)
                const coreGeo = new THREE.CylinderGeometry(0.035, 0.035, len3d, 12);
                coreGeo.rotateZ(Math.PI / 2);
                const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98, depthWrite: false });
                const coreMesh = new THREE.Mesh(coreGeo, coreMat);
                group.add(coreMesh);

                // Laser endcaps at both anchors
                const endcapGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
                endcapGeo.rotateZ(Math.PI / 2);
                const endcapMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 1.0 });
                const leftCap = new THREE.Mesh(endcapGeo, endcapMat);
                leftCap.position.x = -len3d / 2;
                const rightCap = new THREE.Mesh(endcapGeo, endcapMat);
                rightCap.position.x = len3d / 2;
                group.add(leftCap);
                group.add(rightCap);

                // Holographic lattice plane
                const shelfGeo = new THREE.PlaneGeometry(len3d, 0.25);
                shelfGeo.rotateX(-Math.PI / 2);
                const shelfMat = new THREE.MeshBasicMaterial({ color: 0x4deeea, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
                const shelfMesh = new THREE.Mesh(shelfGeo, shelfMat);
                group.add(shelfMesh);

                const p3d = this.to3DVec(cx, bridgeY, 0);
                group.position.copy(p3d);
                scene.add(group);

                geometries = [beamGeo, coreGeo, endcapGeo, shelfGeo];
                materials = [beamMat, coreMat, endcapMat, shelfMat];
            }

            // Physical landing rail registered in Kaboom
            const rail = {
                xLeft,
                xRight,
                width,
                y: bridgeY,
                trap: "normal",
                name: "HARD_LIGHT_BRIDGE",
                isHardLight: true,
                isBridge: true,
                createdAt: now,
                duration: 8000, // 8-second lifetime (auto-refreshed while player remains near)
                group,
                geometries,
                materials,
                cx,
                y2d: bridgeY,
                w2d: width,
                len3d
            };

            this.activeRails.push(rail);
            if (landingRails && !landingRails.includes(rail)) landingRails.push(rail);
            if (typeof window !== "undefined" && window.landingRails && !window.landingRails.includes(rail)) {
                window.landingRails.push(rail);
            }

            return rail;
        },

        // Clean disposal of a specific rail
        disposeRail(rail, player, landingRails) {
            if (!rail) return;
            const scene = this.getScene();

            if (rail.group && scene) {
                scene.remove(rail.group);
                if (typeof rail.group.clear === "function") {
                    rail.group.clear();
                }
            }
            if (rail.geometries) {
                rail.geometries.forEach(g => { if (g && typeof g.dispose === "function") g.dispose(); });
            }
            if (rail.materials) {
                rail.materials.forEach(m => { if (m && typeof m.dispose === "function") m.dispose(); });
            }
            rail.group = null;
            rail.geometries = [];
            rail.materials = [];

            const p = player || (typeof window !== "undefined" ? window.player : null);
            const rails = landingRails || (typeof window !== "undefined" ? window.landingRails : null);

            // Remove from landingRails arrays
            if (rails) {
                const idx = rails.indexOf(rail);
                if (idx !== -1) rails.splice(idx, 1);
            }
            if (typeof window !== "undefined" && window.landingRails && window.landingRails !== rails) {
                const idx = window.landingRails.indexOf(rail);
                if (idx !== -1) window.landingRails.splice(idx, 1);
            }

            // If player was standing on this rail when it despawned, un-ground
            if (p && p.currentRail === rail) {
                p.grounded = false;
                p.currentRail = null;
            }
        },

        // Per-frame animation, scroll-pinning, and decay update
        update(dt, player, landingRails) {
            const now = performance.now();
            if (this._lastUpdateTime && (now - this._lastUpdateTime < 3)) {
                return; // Frame guard against double execution
            }
            this._lastUpdateTime = now;

            const scene = this.getScene();
            const scale = this.getScale();
            const p = player || (typeof window !== "undefined" ? window.player : null);
            const rails = landingRails || (typeof window !== "undefined" ? window.landingRails : null);

            // 1. Update Active Hard-Light Rails
            for (let i = this.activeRails.length - 1; i >= 0; i--) {
                const rail = this.activeRails[i];

                // Refresh bridge lifetime while player is traversing or near it
                if (rail.isBridge && p) {
                    const distCenter = Math.abs(p.pos.x - rail.cx);
                    const distY = Math.abs(p.pos.y - rail.y2d);
                    if (distCenter <= rail.w2d / 2 + 60 && distY <= 60) {
                        rail.createdAt = now;
                    }
                }

                // Update 3D position anchored to 2D coordinates across scroll
                if (rail.group) {
                    const p3d = this.to3DVec(rail.cx, rail.y2d, 0);
                    rail.group.position.x = p3d.x;
                    rail.group.position.y = p3d.y;

                    // Re-scale if DPR / viewport changed
                    if (rail.len3d && rail.len3d > 0) {
                        const currentLen3d = rail.w2d * scale;
                        rail.group.scale.x = currentLen3d / rail.len3d;
                    }
                }

                const elapsed = now - rail.createdAt;
                const remaining = rail.duration - elapsed;

                // Electric pulse & smooth decay pulse-out
                if (rail.materials && rail.materials.length >= 3) {
                    const pulse = 0.82 + 0.18 * Math.sin(now * 0.012 + rail.cx * 0.02);

                    if (remaining <= 1500) {
                        // Smooth pulse-out during final 1.5s
                        const flashSpeed = 0.025 + (1 - remaining / 1500) * 0.045;
                        const flash = 0.5 + 0.5 * Math.sin(now * flashSpeed);
                        const alpha = Math.max(0, remaining / 1500) * flash;

                        if (rail.materials[0]) rail.materials[0].opacity = 0.90 * alpha; // beam
                        if (rail.materials[1]) rail.materials[1].opacity = 0.95 * alpha; // core
                        if (rail.materials[2]) rail.materials[2].opacity = 0.95 * alpha; // endcaps
                        if (rail.materials[3]) rail.materials[3].opacity = 0.45 * alpha; // shelf
                    } else {
                        if (rail.materials[0]) rail.materials[0].opacity = 0.88 * pulse;
                        if (rail.materials[1]) rail.materials[1].opacity = 0.95 * pulse;
                        if (rail.materials[2]) rail.materials[2].opacity = 1.0;
                        if (rail.materials[3]) rail.materials[3].opacity = 0.45 * pulse;
                    }
                }

                // Lifetime expired
                if (remaining <= 0) {
                    this.disposeRail(rail, p, rails);
                    this.activeRails.splice(i, 1);
                }
            }

            // 2. Update Active Spark Particles
            for (let i = this.activeSparks.length - 1; i >= 0; i--) {
                const spark = this.activeSparks[i];
                const elapsed = now - spark.createdAt;

                if (elapsed >= spark.duration) {
                    if (spark.points && scene) scene.remove(spark.points);
                    if (spark.geo) spark.geo.dispose();
                    if (spark.mat) spark.mat.dispose();
                    this.activeSparks.splice(i, 1);
                    continue;
                }

                const progress = elapsed / spark.duration;
                if (spark.mat) spark.mat.opacity = 1.0 - progress;

                const posAttr = spark.geo ? spark.geo.attributes.position : null;
                if (posAttr && spark.velocities) {
                    const clampedDt = Math.min(dt || 0.016, 0.05);
                    const currentScroll = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                    const scrollDelta = (currentScroll - (spark.lastScrollY || currentScroll)) * scale;
                    spark.lastScrollY = currentScroll;

                    for (let j = 0; j < spark.count; j++) {
                        const vel = spark.velocities[j];
                        posAttr.array[j * 3] += vel.vx * clampedDt;
                        posAttr.array[j * 3 + 1] += (vel.vy * clampedDt) + scrollDelta;
                        posAttr.array[j * 3 + 2] += vel.vz * clampedDt;
                        vel.vy -= 14.0 * clampedDt; // Gravity on sparks
                    }
                    posAttr.needsUpdate = true;
                }
            }

            // 3. Update Active Beams & Laser Line Flashes
            for (let i = this.activeBeams.length - 1; i >= 0; i--) {
                const beam = this.activeBeams[i];
                const elapsed = now - beam.createdAt;

                if (elapsed >= beam.duration) {
                    if (beam.group && scene) scene.remove(beam.group);
                    if (beam.geometries) beam.geometries.forEach(g => g && g.dispose());
                    if (beam.materials) beam.materials.forEach(m => m && m.dispose());
                    beam.group = null;
                    beam.geometries = [];
                    beam.materials = [];
                    this.activeBeams.splice(i, 1);
                    continue;
                }

                const progress = elapsed / beam.duration;

                if (beam.isFlash) {
                    // Update flash position with scroll
                    const p3d = this.to3DVec(beam.cx, beam.y2d, 0.06);
                    beam.group.position.x = p3d.x;
                    beam.group.position.y = p3d.y;

                    // Expand scale X outward, fade opacity
                    const expand = Math.min(1.0, 0.2 + progress * 1.6);
                    beam.group.scale.x = expand;
                    if (beam.materials[0]) beam.materials[0].opacity = (1.0 - progress);
                } else if (beam.isTargeting) {
                    // Targeting pulse beam scroll sync & lookAt
                    if (typeof beam.fromX === "number") {
                        const from3d = this.to3DVec(beam.fromX, beam.fromY, 0.3);
                        const to3d = this.to3DVec(beam.toX, beam.toY, 0.1);
                        beam.group.position.copy(from3d);
                        beam.group.lookAt(to3d);
                    }
                    if (beam.materials[0]) beam.materials[0].opacity = (1.0 - progress);
                } else {
                    // Downward beam scroll sync
                    const p3d = this.to3DVec(beam.x2d, beam.y2d, 0.1);
                    beam.group.position.x = p3d.x;
                    beam.group.position.y = p3d.y;
                    if (beam.materials) {
                        beam.materials.forEach(m => {
                            if (m) m.opacity = (1.0 - progress);
                        });
                    }
                }
            }
        },

        // Zero-leak full teardown
        dispose(player, landingRails) {
            const p = player || (typeof window !== "undefined" ? window.player : null);
            const rails = landingRails || (typeof window !== "undefined" ? window.landingRails : null);

            for (let i = this.activeRails.length - 1; i >= 0; i--) {
                this.disposeRail(this.activeRails[i], p, rails);
            }
            this.activeRails = [];

            const scene = this.getScene();
            for (const spark of this.activeSparks) {
                if (spark.points && scene) scene.remove(spark.points);
                if (spark.geo) spark.geo.dispose();
                if (spark.mat) spark.mat.dispose();
            }
            this.activeSparks = [];

            for (const beam of this.activeBeams) {
                if (beam.group && scene) scene.remove(beam.group);
                if (beam.geometries) beam.geometries.forEach(g => g && g.dispose());
                if (beam.materials) beam.materials.forEach(m => m && m.dispose());
            }
            this.activeBeams = [];
            this.scene = null;
            this._lastUpdateTime = 0;
        }
    };

    Player3D.architect = AstromechArchitect;

    if (typeof window !== "undefined") {
        window.Player3D = Player3D;
        window.AstromechArchitect = AstromechArchitect;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { Player3D, AstromechArchitect };
    }
})();
