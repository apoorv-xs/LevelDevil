// motion_graphics_bg.js - Reactive Motion Graphics Parallax & Kinetic Background Engine
(function () {
    const MotionGraphicsBG = {
        gridMesh: null,
        gridOriginalPositions: null,
        constellations: [],
        shockwaves: [],
        currentVelocityX: 0,
        lastPlayerX: 0,
        lastTime: 0,
        isCreated: false,

        create(scene) {
            if (!scene || this.isCreated) return;

            // 1. Create Kinetic Topography Wireframe Grid (Deep Plane Z = 45)
            const gridMat = new BABYLON.StandardMaterial("kineticGridMat", scene);
            gridMat.wireframe = true;
            gridMat.emissiveColor = new BABYLON.Color3(0.18, 0.25, 0.45);
            gridMat.alpha = 0.35;

            this.gridMesh = BABYLON.MeshBuilder.CreateGround("kineticGrid", {
                width: 140,
                height: 80,
                subdivisions: 36,
                updatable: true
            }, scene);
            this.gridMesh.position = new BABYLON.Vector3(0, 0, 40);
            this.gridMesh.rotation.x = Math.PI * 0.45; // Tilted towards the camera
            this.gridMesh.material = gridMat;

            // Cache original vertex positions for dynamic wave deformations
            this.gridOriginalPositions = this.gridMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

            // 2. Create Floating Geometric Constellations (Mid-Depth Planes Z = 15 .. 35)
            const constelMat = new BABYLON.StandardMaterial("constelMat", scene);
            constelMat.emissiveColor = new BABYLON.Color3(0.85, 0.7, 0.3); // Warm retro amber glow
            constelMat.alpha = 0.65;
            constelMat.wireframe = true;

            const shapes = ["torus", "cube", "octahedron"];
            const count = 18;

            for (let i = 0; i < count; i++) {
                const shapeType = shapes[i % shapes.length];
                let mesh;

                if (shapeType === "torus") {
                    mesh = BABYLON.MeshBuilder.CreateTorus(`constelTorus_${i}`, { diameter: 1.8, thickness: 0.15, tessellation: 16 }, scene);
                } else if (shapeType === "cube") {
                    mesh = BABYLON.MeshBuilder.CreateBox(`constelCube_${i}`, { size: 1.4 }, scene);
                } else {
                    mesh = BABYLON.MeshBuilder.CreatePolyhedron(`constelOcta_${i}`, { type: 1, size: 1.1 }, scene);
                }

                mesh.material = constelMat;

                // Spread randomly along the Z depth and horizontal span
                const posX = (i - count / 2) * 8 + (Math.random() - 0.5) * 4;
                const posY = (Math.random() - 0.5) * 16;
                const posZ = 15 + Math.random() * 20;

                mesh.position = new BABYLON.Vector3(posX, posY, posZ);

                this.constellations.push({
                    mesh: mesh,
                    baseX: posX,
                    baseY: posY,
                    baseZ: posZ,
                    rotSpeedX: (Math.random() - 0.5) * 0.02,
                    rotSpeedY: (Math.random() - 0.5) * 0.02,
                    angularMomentum: 0
                });
            }

            this.isCreated = true;
        },

        // Trigger a Ground-Slam Shockwave Ripple across the Kinetic Grid
        triggerShockwave(origin3DX, origin3DY, strength = 1.0) {
            this.shockwaves.push({
                originX: origin3DX,
                originY: origin3DY,
                radius: 0.1,
                maxRadius: 35,
                speed: 24,
                strength: strength,
                life: 1.0
            });
        },

        // Update loop executed each frame
        update(scene, camera3D, guy) {
            if (!this.isCreated) return;

            const now = performance.now() * 0.001;
            const dt = (this.lastTime > 0) ? Math.min(now - this.lastTime, 0.1) : 0.016;
            this.lastTime = now;

            // 1. Calculate Player Kinematic Velocity
            let currentX = 0;
            if (guy && guy.exists && guy.exists()) {
                currentX = guy.pos.x;
            } else if (typeof camPos === "function") {
                currentX = camPos().x;
            }

            const rawVel = (currentX - this.lastPlayerX) / dt;
            this.lastPlayerX = currentX;
            // Exponential smoothing on velocity
            this.currentVelocityX = this.currentVelocityX * 0.85 + rawVel * 0.15;

            // 2. Camera Tracking & Dynamic 2.5D Gimbal Lean
            if (camera3D && typeof camPos === "function") {
                const targetCam3DX = Engine3D.to3DX(camPos().x);
                const targetCam3DY = Engine3D.to3DY(camPos().y);

                // Smooth camera position tracking
                camera3D.position.x = camera3D.position.x * 0.9 + targetCam3DX * 0.1;
                camera3D.position.y = camera3D.position.y * 0.9 + targetCam3DY * 0.1;

                // Subtle dynamic gimbal lean (1.5° yaw roll based on horizontal velocity)
                const targetLean = Math.max(-0.04, Math.min(0.04, this.currentVelocityX * 0.0001));
                camera3D.rotation.y = camera3D.rotation.y * 0.92 + targetLean * 0.08;
                camera3D.rotation.z = camera3D.rotation.z * 0.92 - targetLean * 0.04;

                // Speed-responsive FOV expansion
                const speedMagnitude = Math.min(1.0, Math.abs(this.currentVelocityX) / 250);
                const targetFOV = 0.85 + speedMagnitude * 0.06;
                camera3D.fov = camera3D.fov * 0.95 + targetFOV * 0.05;

                // Lock camera target slightly ahead of player
                camera3D.setTarget(new BABYLON.Vector3(camera3D.position.x + targetLean * 15, camera3D.position.y, 0));
            }

            // 3. Kinetic Topography Grid Wave & Shockwave Solver
            if (this.gridMesh && this.gridOriginalPositions) {
                // Move grid horizontally with camera to simulate infinite motion backdrop
                if (camera3D) {
                    this.gridMesh.position.x = camera3D.position.x * 0.5;
                    this.gridMesh.position.y = camera3D.position.y * 0.3;
                }

                const positions = this.gridMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                const count = positions.length / 3;

                // Update active shockwaves
                for (let s = this.shockwaves.length - 1; s >= 0; s--) {
                    const sw = this.shockwaves[s];
                    sw.radius += sw.speed * dt;
                    sw.life -= dt * 0.75;
                    if (sw.radius > sw.maxRadius || sw.life <= 0) {
                        this.shockwaves.splice(s, 1);
                    }
                }

                // Deform grid vertices
                const stretch = Math.max(-0.35, Math.min(0.35, this.currentVelocityX * 0.001));

                for (let i = 0; i < count; i++) {
                    const idx = i * 3;
                    const origX = this.gridOriginalPositions[idx];
                    const origY = this.gridOriginalPositions[idx + 1];
                    const origZ = this.gridOriginalPositions[idx + 2];

                    // Base undulating sine terrain
                    let displacement = Math.sin(origX * 0.15 + now * 2.0) * Math.cos(origY * 0.15 + now * 1.5) * 0.6;

                    // Horizontal velocity stretch
                    positions[idx] = origX + origY * stretch * 0.2;

                    // Shockwave ripple displacement
                    for (let s = 0; s < this.shockwaves.length; s++) {
                        const sw = this.shockwaves[s];
                        const dx = origX - (sw.originX - this.gridMesh.position.x);
                        const dy = origY - (sw.originY - this.gridMesh.position.y);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const diff = Math.abs(dist - sw.radius);

                        if (diff < 3.5) {
                            const wave = Math.sin((diff / 3.5) * Math.PI) * sw.strength * sw.life * 2.2;
                            displacement += wave;
                        }
                    }

                    positions[idx + 2] = origZ + displacement;
                }

                this.gridMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            }

            // 4. Update Floating Geometric Constellations with Rotational Inertia
            for (let i = 0; i < this.constellations.length; i++) {
                const c = this.constellations[i];

                // Velocity adds angular momentum
                c.angularMomentum = c.angularMomentum * 0.94 + (this.currentVelocityX * 0.0003) * 0.06;

                c.mesh.rotation.x += c.rotSpeedX + c.angularMomentum;
                c.mesh.rotation.y += c.rotSpeedY + c.angularMomentum * 1.4;
                c.mesh.rotation.z += c.rotSpeedX * 0.5;

                // Parallax shift based on depth
                if (camera3D) {
                    const parallaxFactor = 1.0 - (c.baseZ / 60.0);
                    c.mesh.position.x = c.baseX + camera3D.position.x * parallaxFactor;
                }
            }
        }
    };

    window.MotionGraphicsBG = MotionGraphicsBG;
})();
