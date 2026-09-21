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

            // 6. Initialize 2.5D Parallax Background Layer Manager
            this.parallaxManager = ParallaxManager;
            this.parallaxManager.init(this.scene);

            // 7. Start Render Loop
            let lastRenderTime = performance.now();
            const render = (time) => {
                requestAnimationFrame(render);
                const dt = Math.min(Math.max((time - lastRenderTime) / 1000, 0.001), 0.1);
                lastRenderTime = time;
                if (this.parallaxManager) {
                    this.parallaxManager.update(dt);
                }
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            };
            requestAnimationFrame(render);

            this.isReady = true;
            this._isInitializing = false;
            console.log("Three.js 2.5D Engine & PBR Lighting Pipeline Initialized with Parallax Layers.");
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

    // --- PROCEDURAL 2.5D PAPER DIORAMA TEXTURE GENERATORS ---
    function createCloudTexture(variant = 0) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.clearRect(0, 0, 512, 256);
        ctx.fillStyle = "#fffdf1";
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        if (variant === 0) {
            // Classic fluffy ink-outlined paper cloud
            ctx.moveTo(90, 180);
            ctx.bezierCurveTo(70, 140, 130, 110, 160, 130);
            ctx.bezierCurveTo(180, 80, 260, 70, 290, 110);
            ctx.bezierCurveTo(330, 75, 410, 100, 410, 150);
            ctx.bezierCurveTo(450, 160, 440, 200, 400, 205);
            ctx.lineTo(100, 205);
            ctx.bezierCurveTo(70, 205, 70, 180, 90, 180);
        } else if (variant === 1) {
            // Stratified cloud bank
            ctx.moveTo(60, 180);
            ctx.bezierCurveTo(50, 130, 120, 120, 150, 140);
            ctx.bezierCurveTo(180, 95, 270, 90, 300, 130);
            ctx.bezierCurveTo(340, 100, 420, 110, 440, 150);
            ctx.bezierCurveTo(470, 160, 470, 195, 430, 200);
            ctx.lineTo(70, 200);
            ctx.bezierCurveTo(50, 200, 50, 180, 60, 180);
        } else {
            // High altitude cirrus feather
            ctx.moveTo(80, 170);
            ctx.bezierCurveTo(80, 120, 180, 110, 220, 140);
            ctx.bezierCurveTo(260, 105, 340, 100, 380, 135);
            ctx.bezierCurveTo(420, 130, 450, 150, 435, 185);
            ctx.lineTo(90, 185);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Internal paper contour & volume hatch curves
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (variant === 0) {
            ctx.arc(200, 150, 25, 0.2 * Math.PI, 0.9 * Math.PI);
            ctx.moveTo(310, 140);
            ctx.arc(310, 140, 30, 0.1 * Math.PI, 0.8 * Math.PI);
        } else {
            ctx.arc(230, 150, 35, 0.1 * Math.PI, 0.8 * Math.PI);
            ctx.moveTo(340, 155);
            ctx.arc(340, 155, 28, 0.2 * Math.PI, 0.85 * Math.PI);
        }
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    function createMountainTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 384;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.clearRect(0, 0, 1024, 384);
        ctx.fillStyle = "#fffdf1";
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Horizon mountain silhouette with jagged paper peaks
        ctx.beginPath();
        ctx.moveTo(0, 384);
        ctx.lineTo(0, 260);
        ctx.lineTo(120, 210);
        ctx.lineTo(240, 280);
        ctx.lineTo(380, 130); // Peak 1
        ctx.lineTo(460, 210);
        ctx.lineTo(580, 90);  // High Peak 2
        ctx.lineTo(700, 230);
        ctx.lineTo(820, 140); // Peak 3
        ctx.lineTo(940, 240);
        ctx.lineTo(1024, 200);
        ctx.lineTo(1024, 384);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Radio Mast on Peak 2 (580, 90)
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(580, 90);
        ctx.lineTo(580, 25);
        ctx.moveTo(570, 45);
        ctx.lineTo(590, 45);
        ctx.moveTo(573, 65);
        ctx.lineTo(587, 65);
        ctx.moveTo(570, 45);
        ctx.lineTo(587, 65);
        ctx.moveTo(590, 45);
        ctx.lineTo(573, 65);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(580, 22, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#17120f";
        ctx.fill();

        // Shading crosshatch lines on mountain facets
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 380; x <= 460; x += 10) {
            ctx.moveTo(x, 130 + (x - 380));
            ctx.lineTo(x - 20, 130 + (x - 380) + 40);
        }
        for (let x = 580; x <= 690; x += 12) {
            ctx.moveTo(x, 90 + (x - 580) * 1.2);
            ctx.lineTo(x - 25, 90 + (x - 580) * 1.2 + 50);
        }
        for (let x = 820; x <= 920; x += 12) {
            ctx.moveTo(x, 140 + (x - 820) * 1.0);
            ctx.lineTo(x - 20, 140 + (x - 820) * 1.0 + 40);
        }
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    function createRunwayTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.clearRect(0, 0, 1024, 256);
        ctx.fillStyle = "#fffdf1";
        ctx.strokeStyle = "#17120f";
        ctx.lineWidth = 3;

        // Bedrock foundation plate
        ctx.fillRect(20, 40, 984, 180);
        ctx.strokeRect(20, 40, 984, 180);

        // Runway threshold zebra bars
        ctx.fillStyle = "#17120f";
        const barW = 16;
        const barGap = 12;
        const totalBars = 30;
        const startX = 60;
        for (let i = 0; i < totalBars; i++) {
            ctx.fillRect(startX + i * (barW + barGap), 60, barW, 60);
        }

        // Centerline dashes
        for (let x = 60; x < 960; x += 80) {
            ctx.fillRect(x, 140, 48, 8);
        }

        ctx.font = "bold 16px monospace";
        ctx.fillText("RUNWAY 01-C // ELEV 0 FT // TOUCHDOWN THRESHOLD", 60, 185);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    // --- 2.5D PARALLAX LAYER MANAGER ---
    const ParallaxManager = {
        layers: [],
        mountainMaterial: null,
        planeGeometry: null,

        init(scene) {
            if (!scene || this.layers.length > 0) return;
            this.planeGeometry = new THREE.PlaneGeometry(1, 1);

            const cloudTex0 = createCloudTexture(0);
            const cloudTex1 = createCloudTexture(1);
            const cloudTex2 = createCloudTexture(2);
            const mountainTex = createMountainTexture();
            const runwayTex = createRunwayTexture();

            const cloudMat0 = new THREE.MeshBasicMaterial({ map: cloudTex0, transparent: true, depthWrite: false });
            const cloudMat1 = new THREE.MeshBasicMaterial({ map: cloudTex1, transparent: true, depthWrite: false });
            const cloudMat2 = new THREE.MeshBasicMaterial({ map: cloudTex2, transparent: true, depthWrite: false });

            this.mountainMaterial = new THREE.MeshBasicMaterial({
                map: mountainTex,
                transparent: true,
                opacity: 0,
                depthWrite: false
            });

            const runwayMat = new THREE.MeshBasicMaterial({ map: runwayTex, transparent: true, depthWrite: false });

            const screenW = window.innerWidth || 1200;

            // 1. Near Cloud Layer (Z = -20, parallax ratio 0.55)
            const nearClouds = [
                { w2d: 320, h2d: 160, baseX: screenW * 0.15, baseY: 220, drift: 18, z: -20, pRatio: 0.55, mat: cloudMat0 },
                { w2d: 380, h2d: 190, baseX: screenW * 0.75, baseY: 480, drift: 24, z: -20, pRatio: 0.55, mat: cloudMat1 },
                { w2d: 340, h2d: 170, baseX: screenW * 0.35, baseY: 850, drift: 16, z: -20, pRatio: 0.55, mat: cloudMat2 },
                { w2d: 400, h2d: 200, baseX: screenW * 0.85, baseY: 1200, drift: 22, z: -20, pRatio: 0.55, mat: cloudMat0 },
                { w2d: 350, h2d: 175, baseX: screenW * 0.20, baseY: 1550, drift: 19, z: -20, pRatio: 0.55, mat: cloudMat1 },
                { w2d: 380, h2d: 190, baseX: screenW * 0.68, baseY: 1850, drift: 21, z: -20, pRatio: 0.55, mat: cloudMat2 },
                { w2d: 320, h2d: 160, baseX: screenW * 0.40, baseY: 2100, drift: 17, z: -20, pRatio: 0.55, mat: cloudMat0 },
            ];

            // 2. Mid Cloud & Elevation Layer (Z = -45, parallax ratio 0.30)
            const midClouds = [
                { w2d: 500, h2d: 220, baseX: screenW * 0.45, baseY: 150, drift: 9, z: -45, pRatio: 0.30, mat: cloudMat1 },
                { w2d: 540, h2d: 240, baseX: screenW * 0.10, baseY: 400, drift: 12, z: -45, pRatio: 0.30, mat: cloudMat2 },
                { w2d: 480, h2d: 210, baseX: screenW * 0.80, baseY: 680, drift: 8, z: -45, pRatio: 0.30, mat: cloudMat0 },
                { w2d: 520, h2d: 230, baseX: screenW * 0.30, baseY: 920, drift: 11, z: -45, pRatio: 0.30, mat: cloudMat1 },
                { w2d: 560, h2d: 250, baseX: screenW * 0.70, baseY: 1150, drift: 10, z: -45, pRatio: 0.30, mat: cloudMat2 },
                { w2d: 500, h2d: 220, baseX: screenW * 0.25, baseY: 1350, drift: 9, z: -45, pRatio: 0.30, mat: cloudMat0 },
            ];

            // 3. Distant Horizon Mountain Silhouette Layer (Z = -70, parallax ratio 0.12)
            // Calibrated so mountain ridge silhouettes rise onto lower horizon at low altitudes
            const mountainItems = [
                { w2d: 1100, h2d: 400, baseXRatio: 0.30, baseX: screenW * 0.30, baseY: 900, drift: 0, z: -70, pRatio: 0.12, mat: this.mountainMaterial },
                { w2d: 1200, h2d: 420, baseXRatio: 0.75, baseX: screenW * 0.75, baseY: 940, drift: 0, z: -70, pRatio: 0.12, mat: this.mountainMaterial }
            ];

            // 4. Touchdown Bedrock Runway Plane (Z = -10, parallax ratio 1.0)
            const runwayItems = [
                { w2d: 1150, h2d: 200, baseXRatio: 0.50, baseX: screenW * 0.50, baseY: 3380, drift: 0, z: -10, pRatio: 1.0, mat: runwayMat }
            ];

            const allItems = [...nearClouds, ...midClouds, ...mountainItems, ...runwayItems];

            for (const item of allItems) {
                const mesh = new THREE.Mesh(this.planeGeometry, item.mat);
                mesh.position.set(0, 0, item.z);
                scene.add(mesh);
                item.mesh = mesh;
                item.curX = item.baseX;
                this.layers.push(item);
            }
        },

        update(dt) {
            if (!this.layers.length) return;
            const screenW = (typeof width === "function") ? width() : window.innerWidth;
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const baseScale = Engine3D.getScale();

            // Reveal mountain silhouette at low altitudes (scrollY > 1000)
            if (this.mountainMaterial) {
                const alpha = Math.min(0.85, Math.max(0, (scrollY - 1000) / 1200));
                this.mountainMaterial.opacity = alpha;
                this.mountainMaterial.visible = alpha > 0.01;
            }

            for (const item of this.layers) {
                // Horizontal drift with wrapping, or proportional ratio anchoring
                if (item.drift > 0) {
                    item.curX += item.drift * dt;
                    const halfW = item.w2d / 2;
                    if (item.curX - halfW > screenW + 100) {
                        item.curX = -halfW - 60;
                    }
                } else if (item.baseXRatio !== undefined) {
                    item.curX = screenW * item.baseXRatio;
                }

                // Perspective scaling calibrated to depth Z
                const distToCam = 80 - item.z;
                const scaleZ = baseScale * (distToCam / 80);

                item.mesh.scale.set(item.w2d * scaleZ, item.h2d * scaleZ, 1);

                const x3D = (item.curX - screenW / 2) * scaleZ;
                const effectiveY = item.baseY - (scrollY * item.pRatio);
                const y3D = -(effectiveY - screenH / 2) * scaleZ;

                item.mesh.position.set(x3D, y3D, item.z);
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
