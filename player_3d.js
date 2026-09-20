// player_3d.js - Expressive 3D BB-8 Astromech Droid for Level Devil Remaster (Three.js)
(function () {
    "use strict";

    const Player3D = {
        root: null,
        bodyContainer: null,
        bodyBall: null,
        headGroup: null,
        primaryLens: null,
        secondarySensor: null,
        tallAntenna: null,
        shortAntenna: null,
        haloRing: null,
        isCreated: false,
        isSmashing: false,
        lastX: 0,
        currentRollZ: 0,
        headTiltZ: 0,

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

            // 2. High-Grade Tactile Materials
            // Warm off-white ceramic chassis with soft specular highlights
            const ceramicMat = new THREE.MeshStandardMaterial({
                color: 0xf5f3ec,
                roughness: 0.32,
                metalness: 0.12
            });

            // Signature Star Wars BB-8 Safety Orange
            const orangeMat = new THREE.MeshStandardMaterial({
                color: 0xeb5e28,
                roughness: 0.38,
                metalness: 0.15
            });

            // Gunmetal / Silver detailing
            const silverMat = new THREE.MeshStandardMaterial({
                color: 0x7c858d,
                roughness: 0.28,
                metalness: 0.75
            });

            // Charcoal tool socket interior
            const charcoalMat = new THREE.MeshStandardMaterial({
                color: 0x1f2329,
                roughness: 0.65,
                metalness: 0.4
            });

            // Glossy black camera photoreceptor lens
            const lensMat = new THREE.MeshStandardMaterial({
                color: 0x08080a,
                roughness: 0.04,
                metalness: 0.95
            });

            // Lens reflection pin-point
            const glassDotMat = new THREE.MeshBasicMaterial({
                color: 0xffffff
            });

            // Cyan optical sensor
            const cyanSensorMat = new THREE.MeshStandardMaterial({
                color: 0x00e5ff,
                emissive: 0x00b0ff,
                emissiveIntensity: 0.6,
                roughness: 0.2
            });

            // Recruiter Gold Halo Material
            const haloMat = new THREE.MeshStandardMaterial({
                color: 0xfce566,
                emissive: 0xf59e0b,
                emissiveIntensity: 0.8,
                roughness: 0.25,
                metalness: 0.5
            });

            // 3. Spherical Rolling Body Construction
            // Ball radius = 0.65 units, sitting on Y = 0 baseline (center at Y = 0.65)
            const BALL_RADIUS = 0.65;
            this.bodyContainer = new THREE.Group();
            this.bodyContainer.position.y = BALL_RADIUS;
            this.root.add(this.bodyContainer);

            this.bodyBall = new THREE.Group();
            this.bodyContainer.add(this.bodyBall);

            // Core sphere
            const sphereGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 24);
            const bodyMesh = new THREE.Mesh(sphereGeo, ceramicMat);
            this.bodyBall.add(bodyMesh);

            // 6 Characteristic BB-8 Circular Orange Tool Panels (Mapped orthogonally to faces)
            const ringGeo = new THREE.TorusGeometry(0.32, 0.06, 16, 32);
            const coreGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20);

            const orientations = [
                { pos: [0, 0, BALL_RADIUS - 0.02], rot: [0, 0, 0] },             // Front
                { pos: [0, 0, -BALL_RADIUS + 0.02], rot: [0, Math.PI, 0] },       // Back
                { pos: [BALL_RADIUS - 0.02, 0, 0], rot: [0, Math.PI / 2, 0] },    // Right
                { pos: [-BALL_RADIUS + 0.02, 0, 0], rot: [0, -Math.PI / 2, 0] },  // Left
                { pos: [0, BALL_RADIUS - 0.02, 0], rot: [Math.PI / 2, 0, 0] },    // Top
                { pos: [0, -BALL_RADIUS + 0.02, 0], rot: [-Math.PI / 2, 0, 0] }   // Bottom
            ];

            orientations.forEach((ori) => {
                const ringGroup = new THREE.Group();
                ringGroup.position.set(ori.pos[0], ori.pos[1], ori.pos[2]);
                ringGroup.rotation.set(ori.rot[0], ori.rot[1], ori.rot[2]);

                const ringMesh = new THREE.Mesh(ringGeo, orangeMat);
                ringGroup.add(ringMesh);

                const centerMesh = new THREE.Mesh(coreGeo, charcoalMat);
                centerMesh.rotation.x = Math.PI / 2;
                ringGroup.add(centerMesh);

                // Small silver tool notch
                const notchGeo = new THREE.BoxGeometry(0.04, 0.12, 0.04);
                const notchMesh = new THREE.Mesh(notchGeo, silverMat);
                notchMesh.position.set(0.24, 0, 0.02);
                ringGroup.add(notchMesh);

                this.bodyBall.add(ringGroup);
            });

            // 4. Floating Magnetic Dome (Head)
            // Sits magnetically hovering at Y = 1.30
            this.headGroup = new THREE.Group();
            this.headGroup.position.y = 1.30;
            this.root.add(this.headGroup);

            // Neck base disk (Gunmetal base ring)
            const neckGeo = new THREE.CylinderGeometry(0.38, 0.40, 0.06, 32);
            const neckMesh = new THREE.Mesh(neckGeo, silverMat);
            neckMesh.position.y = 0.03;
            this.headGroup.add(neckMesh);

            // Upper Hemisphere Dome
            const domeGeo = new THREE.SphereGeometry(0.42, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMesh = new THREE.Mesh(domeGeo, ceramicMat);
            domeMesh.position.y = 0.06;
            this.headGroup.add(domeMesh);

            // Orange racing band around lower dome rim
            const bandGeo = new THREE.TorusGeometry(0.41, 0.025, 16, 32);
            const bandMesh = new THREE.Mesh(bandGeo, orangeMat);
            bandMesh.rotation.x = Math.PI / 2;
            bandMesh.position.y = 0.11;
            this.headGroup.add(bandMesh);

            // Primary Photoreceptor (Large Glossy Black Lens)
            const lensMountGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.04, 24);
            const lensMount = new THREE.Mesh(lensMountGeo, silverMat);
            lensMount.rotation.x = Math.PI / 2;
            lensMount.position.set(0, 0.24, 0.36);
            this.headGroup.add(lensMount);

            const lensGeo = new THREE.SphereGeometry(0.10, 24, 16);
            this.primaryLens = new THREE.Mesh(lensGeo, lensMat);
            this.primaryLens.position.set(0, 0.24, 0.38);
            this.headGroup.add(this.primaryLens);

            // Pinpoint specular glass reflection dot
            const dotGeo = new THREE.SphereGeometry(0.022, 12, 12);
            const glassDot = new THREE.Mesh(dotGeo, glassDotMat);
            glassDot.position.set(0.035, 0.27, 0.46);
            this.headGroup.add(glassDot);

            // Secondary Indicator Sensor (Cyan)
            const secMountGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.03, 16);
            const secMount = new THREE.Mesh(secMountGeo, silverMat);
            secMount.rotation.x = Math.PI / 2;
            secMount.position.set(0.16, 0.12, 0.37);
            this.headGroup.add(secMount);

            const secSensorGeo = new THREE.SphereGeometry(0.045, 16, 12);
            this.secondarySensor = new THREE.Mesh(secSensorGeo, cyanSensorMat);
            this.secondarySensor.position.set(0.16, 0.12, 0.39);
            this.headGroup.add(this.secondarySensor);

            // Dual Antennae on Dome
            // Tall main antenna
            const tallAntGeo = new THREE.CylinderGeometry(0.010, 0.012, 0.46, 12);
            this.tallAntenna = new THREE.Mesh(tallAntGeo, silverMat);
            this.tallAntenna.position.set(-0.10, 0.44 + 0.23, -0.06);
            this.headGroup.add(this.tallAntenna);

            // Short needle antenna
            const shortAntGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.22, 12);
            this.shortAntenna = new THREE.Mesh(shortAntGeo, silverMat);
            this.shortAntenna.position.set(0.14, 0.44 + 0.11, -0.08);
            this.headGroup.add(this.shortAntenna);

            // Recruiter Mode Gold Halo (Torus)
            const haloGeo = new THREE.TorusGeometry(0.70, 0.06, 16, 32);
            this.haloRing = new THREE.Mesh(haloGeo, haloMat);
            this.haloRing.position.set(0, 2.25, 0);
            this.haloRing.rotation.x = Math.PI / 6;
            this.root.add(this.haloRing);
            this.haloRing.visible = false;

            // Register shadows with engine
            if (window.Engine3D && window.Engine3D.addShadowCaster) {
                window.Engine3D.addShadowCaster(this.root);
            }

            this.isCreated = true;
            console.log("3D BB-8 Astromech Droid Created in Three.js.");
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
                this.currentRollZ -= (deltaX / 0.65) * 1.2;
                this.bodyBall.rotation.z = this.currentRollZ;
            }

            // 4. Momentum Tilt (The BB-8 Lean)
            let targetTiltZ = 0;
            if (isMoving) {
                targetTiltZ = isFacingLeft ? 0.22 : -0.22; // ~12 degrees forward lean
            }
            this.headTiltZ += (targetTiltZ - this.headTiltZ) * 0.15;
            this.headGroup.rotation.z = this.headTiltZ;

            // 5. Inquisitive Head Tracking (Mouse cursor companion)
            let targetPitch = 0;
            let targetYaw = 0;

            if (window.mousePos2D && window.Engine3D) {
                const mouse3D = window.Engine3D.to3DVec(window.mousePos2D.x, window.mousePos2D.y, 0);
                const dx = mouse3D.x - this.root.position.x;
                const dy = mouse3D.y - (this.root.position.y + 1.30);

                const facingMult = isFacingLeft ? -1 : 1;
                const localForward = dx * facingMult;

                // Pitch (look up / down)
                targetPitch = Math.max(-0.35, Math.min(0.35, -dy * 0.06));
                // Yaw (turn towards cursor)
                targetYaw = Math.max(-0.55, Math.min(0.55, dx * 0.04));
            }

            this.headGroup.rotation.x += (targetPitch - this.headGroup.rotation.x) * 0.1;
            this.headGroup.rotation.y += (targetYaw - this.headGroup.rotation.y) * 0.1;

            // 6. Jump & Airborne Dynamics
            if (!isGrounded) {
                // Airborne: Dome lifts slightly on magnetic repulsion, slight wobble
                this.headGroup.position.y = 1.36 + Math.sin(t * 12) * 0.02;
                this.bodyContainer.scale.set(0.92, 1.10, 0.92); // Stretch in air
                this.tallAntenna.rotation.z = Math.sin(t * 15) * 0.12; // Antenna flutter
            } else if (isMoving) {
                // Rolling on ground: Subtle magnetic chatter
                this.headGroup.position.y = 1.30 + Math.abs(Math.sin(t * 18)) * 0.03;
                this.bodyContainer.scale.set(1.0, 1.0, 1.0);
                this.tallAntenna.rotation.z = (isFacingLeft ? 0.08 : -0.08);
            } else {
                // Idle curious floating hover
                this.headGroup.position.y = 1.30 + Math.sin(t * 3) * 0.02;
                this.bodyContainer.scale.set(1.0, 1.0, 1.0);
                this.tallAntenna.rotation.z = Math.sin(t * 2) * 0.03;
            }

            // 7. Recruiter Mode Gold Halo
            if (this.haloRing) {
                const isRecruiter = (window.isRecruiterActive && window.isRecruiterActive());
                this.haloRing.visible = isRecruiter;
                if (isRecruiter) {
                    this.haloRing.rotation.y += 0.04;
                    this.haloRing.position.y = 2.25 + Math.sin(t * 4) * 0.06;
                }
            }
        }
    };

    window.Player3D = Player3D;
})();
