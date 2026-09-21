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

            // 5. Window Resize Handler
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

            // 6. Start Render Loop
            let lastRenderTime = performance.now();
            const render = (time) => {
                this._rAF = requestAnimationFrame(render);
                const dt = Math.min(Math.max((time - lastRenderTime) / 1000, 0.001), 0.1);
                lastRenderTime = time;
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            };
            this._rAF = requestAnimationFrame(render);

            this.isReady = true;
            this._isInitializing = false;
            console.log("Three.js 2.5D Engine & PBR Lighting Pipeline Initialized.");
        },

        dispose() {
            if (this._rAF) {
                cancelAnimationFrame(this._rAF);
                this._rAF = null;
            }
            if (this.scene) {
                this.scene.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                        else child.material.dispose();
                    }
                });
            }
            if (this.renderer) {
                this.renderer.dispose();
                if (typeof this.renderer.forceContextLoss === "function") {
                    this.renderer.forceContextLoss();
                }
            }
            this.isReady = false;
            this._isInitializing = false;
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

        destroy() {
            this.dispose();
        },

        _to3DScratch: null,

        to3DVec(x2d, y2d, z = 0, target = null) {
            const dest = target || (this._to3DScratch || (this._to3DScratch = new THREE.Vector3()));
            dest.set(this.to3DX(x2d), this.to3DY(y2d), z);
            return dest;
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
