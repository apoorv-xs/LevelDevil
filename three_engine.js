// three_engine.js - Core 2.5D Three.js Architecture & Coordinate Bridge
(function () {
    "use strict";

    const Engine3D = {
        canvas: null,
        renderer: null,
        scene: null,
        camera: null,
        sunLight: null,
        ambientLight: null,
        atmosphereParticles: null,
        currentSectorClass: "sector-1",
        isReady: false,
        _isInitializing: false,
        SCALE: 0.05, // 100 2D pixels = 5 3D world units

        init() {
            // Guard against duplicate init calls
            if (this.isReady || this._isInitializing) return;
            this._isInitializing = true;

            if (typeof THREE === "undefined") {
                console.warn("Three.js not yet loaded. Retrying in 100ms...");
                setTimeout(() => {
                    this._isInitializing = false;
                    this.init();
                }, 100);
                return;
            }

            this.canvas = document.getElementById("three-canvas") || document.getElementById("babylon-canvas");
            if (!this.canvas) {
                this._isInitializing = false;
                return;
            }

            // 1. Create WebGL Renderer with alpha transparency & high performance
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // 2. Create Main Scene
            this.scene = new THREE.Scene();

            // 3. Setup Camera (2.5D Viewport)
            // Calibrated to distance Z = 80 and FOV ~16.04 deg (0.28 rad) for planar perspective
            const fovDegrees = (0.28 * 180) / Math.PI; // ~16.0428 degrees
            const aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(fovDegrees, aspect, 0.1, 300);
            this.camera.position.set(0, 0, 80);
            this.camera.lookAt(0, 0, 0);

            // 4. Setup Lighting
            // Ambient Warm Fill Light
            this.ambientLight = new THREE.HemisphereLight(0xfff7e6, 0x5c4224, 0.9);
            this.scene.add(this.ambientLight);

            // Directional Sun Light (Casting Soft Shadows on Z-Plane)
            this.sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
            this.sunLight.position.set(-10, 20, 15);
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 1024;
            this.sunLight.shadow.mapSize.height = 1024;
            this.sunLight.shadow.camera.near = 0.5;
            this.sunLight.shadow.camera.far = 120;
            this.sunLight.shadow.camera.left = -35;
            this.sunLight.shadow.camera.right = 35;
            this.sunLight.shadow.camera.top = 35;
            this.sunLight.shadow.camera.bottom = -35;
            this.sunLight.shadow.bias = -0.0005;
            this.scene.add(this.sunLight);

            // 5. Atmospheric Story Particle System (Shifts with active Sector)
            const PARTICLE_COUNT = 160;
            const pGeo = new THREE.BufferGeometry();
            const pPositions = new Float32Array(PARTICLE_COUNT * 3);
            const pColors = new Float32Array(PARTICLE_COUNT * 3);

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                pPositions[i * 3] = (Math.random() - 0.5) * 60;
                pPositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
                pPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

                // Initial soft golden cloud mist (S-01)
                pColors[i * 3] = 1.0;
                pColors[i * 3 + 1] = 0.88;
                pColors[i * 3 + 2] = 0.45;
            }
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
            pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

            const pMat = new THREE.PointsMaterial({
                size: 0.28,
                vertexColors: true,
                transparent: true,
                opacity: 0.65
            });

            this.atmosphereParticles = new THREE.Points(pGeo, pMat);
            this.scene.add(this.atmosphereParticles);

            // 6. Window Resize Handler
            window.addEventListener("resize", () => {
                if (this.renderer && this.camera) {
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    this.camera.aspect = width / height;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(width, height);
                    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                }
            });

            // 7. Start Render Loop
            const render = () => {
                requestAnimationFrame(render);
                if (this.renderer && this.scene && this.camera) {
                    // Animate ambient particles according to active stratum
                    if (this.atmosphereParticles) {
                        const posAttr = this.atmosphereParticles.geometry.attributes.position;
                        const arr = posAttr.array;
                        const now = Date.now() * 0.001;
                        for (let i = 0; i < 160; i++) {
                            const idx = i * 3;
                            if (this.currentSectorClass === "sector-2") {
                                // S-02: Cloudbreak vapor particles drifting upward
                                arr[idx + 1] += 0.035;
                                arr[idx] += Math.sin(now + i) * 0.01;
                                if (arr[idx + 1] > 22) arr[idx + 1] = -22;
                            } else if (this.currentSectorClass === "sector-3") {
                                // S-03: Industrial copper/amber sparks rising fast
                                arr[idx + 1] += 0.065;
                                arr[idx] += (Math.random() - 0.5) * 0.04;
                                if (arr[idx + 1] > 22) arr[idx + 1] = -22;
                                if (arr[idx] > 30) arr[idx] = -30;
                                else if (arr[idx] < -30) arr[idx] = 30;
                            } else if (this.currentSectorClass === "sector-4") {
                                // S-04: Rooftop evening dust / city ember motes swirling
                                arr[idx] += Math.sin(now * 1.5 + i) * 0.02;
                                arr[idx + 1] += 0.018;
                                if (arr[idx + 1] > 22) arr[idx + 1] = -22;
                                if (arr[idx] > 30) arr[idx] = -30;
                                else if (arr[idx] < -30) arr[idx] = 30;
                            } else if (this.currentSectorClass === "sector-5") {
                                // S-05: Runway beacon lights with subtle pulsing shimmer
                                arr[idx] += Math.sin(now * 2.5 + i) * 0.004;
                            } else {
                                // S-01: Soft golden cloud mist / sunbeam motes drifting gently
                                arr[idx] += 0.02;
                                arr[idx + 1] += Math.sin(now + i) * 0.008;
                                if (arr[idx] > 30) arr[idx] = -30;
                            }
                        }
                        posAttr.needsUpdate = true;
                    }

                    this.renderer.render(this.scene, this.camera);
                }
            };
            requestAnimationFrame(render);

            this.isReady = true;
            this._isInitializing = false;
            console.log("Three.js 2.5D Engine & PBR Lighting Pipeline Initialized.");
        },

        // Dynamically morph atmospheric particles based on 5 strata depth
        setSectorDepth(depthY, sectorClass) {
            if (this.currentSectorClass === sectorClass) return;
            this.currentSectorClass = sectorClass;
            if (!this.atmosphereParticles) return;

            const mat = this.atmosphereParticles.material;
            const colAttr = this.atmosphereParticles.geometry.attributes.color;
            const colors = colAttr.array;

            if (sectorClass === "sector-1") {
                // S-01 (10,000m): Soft golden cloud mist / sunbeam motes (#fff4c9 / #fde047)
                mat.size = 0.28;
                mat.opacity = 0.60;
                for (let i = 0; i < 160; i++) {
                    colors[i * 3] = 1.0;
                    colors[i * 3 + 1] = 0.88 + Math.random() * 0.08;
                    colors[i * 3 + 2] = 0.45 + Math.random() * 0.35;
                }
            } else if (sectorClass === "sector-2") {
                // S-02 (7,500m): Cloudbreak vapor particles drifting upward (#f59e0b / #d97706)
                mat.size = 0.34;
                mat.opacity = 0.50;
                for (let i = 0; i < 160; i++) {
                    colors[i * 3] = 0.96;
                    colors[i * 3 + 1] = 0.62 + Math.random() * 0.15;
                    colors[i * 3 + 2] = 0.04 + Math.random() * 0.08;
                }
            } else if (sectorClass === "sector-3") {
                // S-03 (4,500m): Industrial copper/amber sparks (#b45309 / #d97706)
                mat.size = 0.22;
                mat.opacity = 0.75;
                for (let i = 0; i < 160; i++) {
                    colors[i * 3] = 0.85 + Math.random() * 0.15;
                    colors[i * 3 + 1] = 0.35 + Math.random() * 0.25;
                    colors[i * 3 + 2] = 0.04;
                }
            } else if (sectorClass === "sector-4") {
                // S-04 (2,000m): Rooftop evening dust / city ember motes (#92400e / #f59e0b)
                mat.size = 0.25;
                mat.opacity = 0.65;
                for (let i = 0; i < 160; i++) {
                    colors[i * 3] = 0.65 + Math.random() * 0.30;
                    colors[i * 3 + 1] = 0.25 + Math.random() * 0.25;
                    colors[i * 3 + 2] = 0.05;
                }
            } else if (sectorClass === "sector-5") {
                // S-05 (0m): Runway beacon lights (amber #fce566 & cyan #00e5ff)
                mat.size = 0.36;
                mat.opacity = 0.85;
                for (let i = 0; i < 160; i++) {
                    if (i % 2 === 0) {
                        // Brilliant yellow runway strip lights (#fce566)
                        colors[i * 3] = 0.99;
                        colors[i * 3 + 1] = 0.90;
                        colors[i * 3 + 2] = 0.40;
                    } else {
                        // Cyan threshold beacon lights (#00e5ff)
                        colors[i * 3] = 0.0;
                        colors[i * 3 + 1] = 0.90;
                        colors[i * 3 + 2] = 1.0;
                    }
                }
            }
            colAttr.needsUpdate = true;
        },

        // Scale factor calibrated to camera distance Z = 80 and fov = 16.04 deg (0.28 rad)
        getScale() {
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            const fovRad = this.camera ? (this.camera.fov * Math.PI / 180) : 0.28;
            const visibleHeight = 2 * 80 * Math.tan(fovRad / 2);
            return visibleHeight / screenH;
        },

        // --- 2D to 3D COORDINATE CONVERSION UTILITIES ---
        to3DX(x2d) {
            const screenW = (typeof width === "function") ? width() : window.innerWidth;
            return (x2d - screenW / 2) * this.getScale();
        },

        to3DY(y2d) {
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const screenY = y2d - scrollY;
            return -(screenY - screenH / 2) * this.getScale();
        },

        to3DVec(x2d, y2d, z = 0) {
            return new THREE.Vector3(this.to3DX(x2d), this.to3DY(y2d), z);
        },

        // Helper to register shadow casters
        addShadowCaster(mesh) {
            if (!mesh) return;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }
    };

    window.Engine3D = Engine3D;

    // Auto-init on page load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => Engine3D.init());
    } else {
        Engine3D.init();
    }
})();
