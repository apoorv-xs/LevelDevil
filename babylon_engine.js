// babylon_engine.js - Core 2.5D Babylon.js Architecture & Coordinate Bridge
(function () {
    const Engine3D = {
        canvas: null,
        engine: null,
        scene: null,
        camera: null,
        sunLight: null,
        ambientLight: null,
        shadowGenerator: null,
        isReady: false,
        SCALE: 0.05, // 100 2D pixels = 5 3D world units

        init() {
            if (typeof BABYLON === "undefined") {
                console.warn("Babylon.js CDN not yet loaded. Retrying in 100ms...");
                setTimeout(() => this.init(), 100);
                return;
            }

            this.canvas = document.getElementById("babylon-canvas");
            if (!this.canvas) return;

            // 1. Create Engine with hardware acceleration & anti-aliasing
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true,
                powerPreference: "high-performance"
            });

            // 2. Create Main Scene
            this.scene = new BABYLON.Scene(this.engine);
            // Warm retro Amber/Gold atmosphere
            this.scene.clearColor = new BABYLON.Color4(0.91, 0.71, 0.35, 1.0);

            // 3. Setup Camera (2.5D Viewport)
            this.camera = new BABYLON.UniversalCamera("camera3D", new BABYLON.Vector3(0, 0, -25), this.scene);
            this.camera.inputs.clear(); // Detach all default camera inputs so Kaboom receives all keys
            this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
            this.camera.fov = 0.85; // ~50 degrees FOV for cinematic depth

            // 4. Setup Lighting
            // Ambient Warm Fill Light
            this.ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, -0.5), this.scene);
            this.ambientLight.intensity = 0.85;
            this.ambientLight.diffuse = new BABYLON.Color3(1.0, 0.92, 0.8);
            this.ambientLight.groundColor = new BABYLON.Color3(0.65, 0.45, 0.2);

            // Directional Sun Light (Casting Soft Shadows on Z-Plane)
            this.sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(0.4, -1, 0.8), this.scene);
            this.sunLight.position = new BABYLON.Vector3(-10, 20, -15);
            this.sunLight.intensity = 1.4;

            // Shadow Generator (Cascaded Soft Filtered Shadows)
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sunLight);
            this.shadowGenerator.useBlurExponentialShadowMap = true;
            this.shadowGenerator.blurKernel = 32;
            this.shadowGenerator.depthScale = 50;

            // 5. Window Resize Handler
            window.addEventListener("resize", () => {
                if (this.engine) this.engine.resize();
            });

            // 6. Start Render Loop
            this.engine.runRenderLoop(() => {
                if (this.scene && this.scene.activeCamera) {
                    this.scene.render();
                }
            });

            this.isReady = true;
            console.log("Babylon.js 2.5D Engine & PBR Lighting Pipeline Initialized.");
        },

        // --- 2D to 3D COORDINATE CONVERSION UTILITIES ---
        to3DX(x2d) {
            const screenW = (typeof width === "function") ? width() : window.innerWidth;
            return (x2d - screenW / 2) * this.SCALE;
        },

        to3DY(y2d) {
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            return -(y2d - screenH / 2) * this.SCALE;
        },

        to3DVec(x2d, y2d, z = 0) {
            return new BABYLON.Vector3(this.to3DX(x2d), this.to3DY(y2d), z);
        },

        // Helper to register shadow casters
        addShadowCaster(mesh) {
            if (this.shadowGenerator && mesh) {
                this.shadowGenerator.addShadowCaster(mesh, true);
            }
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
