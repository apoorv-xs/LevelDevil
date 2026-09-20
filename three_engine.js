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

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                pPositions[i * 3] = (Math.random() - 0.5) * 60;
                pPositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
                pPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
            }
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));

            const pMat = new THREE.PointsMaterial({
                size: 0.22,
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.55
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
                    // Animate ambient particles according to active sector
                    if (this.atmosphereParticles) {
                        const posAttr = this.atmosphereParticles.geometry.attributes.position;
                        const arr = posAttr.array;
                        for (let i = 0; i < 160; i++) {
                            const idx = i * 3;
                            if (this.currentSectorClass === "sector-2" || this.currentSectorClass === "sector-4") {
                                // Sparks / reactor heat rise upwards
                                arr[idx + 1] += 0.04;
                                if (arr[idx + 1] > 22) arr[idx + 1] = -22;
                            } else if (this.currentSectorClass === "sector-5") {
                                // Starfield subtle twinkling drift
                                arr[idx] += Math.sin(Date.now() * 0.001 + i) * 0.003;
                            } else {
                                // Desert dust / cyber data drift sideways
                                arr[idx] += 0.02;
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

        // Dynamically morph atmospheric particles based on Sector depth
        setSectorDepth(depthY, sectorClass) {
            if (this.currentSectorClass === sectorClass) return;
            this.currentSectorClass = sectorClass;
            if (!this.atmosphereParticles) return;

            const mat = this.atmosphereParticles.material;
            if (sectorClass === "sector-1") {
                mat.color.setHex(0xf59e0b); // Amber desert dust
                mat.size = 0.20;
                mat.opacity = 0.55;
            } else if (sectorClass === "sector-2") {
                mat.color.setHex(0xf97316); // Copper/orange foundry sparks
                mat.size = 0.24;
                mat.opacity = 0.65;
            } else if (sectorClass === "sector-3") {
                mat.color.setHex(0x00e5ff); // Cyan cyber data packets
                mat.size = 0.22;
                mat.opacity = 0.75;
            } else if (sectorClass === "sector-4") {
                mat.color.setHex(0xef4444); // Red-orange reactor embers
                mat.size = 0.26;
                mat.opacity = 0.80;
            } else if (sectorClass === "sector-5") {
                mat.color.setHex(0xffffff); // Starfield white stars
                mat.size = 0.28;
                mat.opacity = 0.90;
            }
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
