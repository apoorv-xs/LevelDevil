// level_intro_3d.js - 3D Intro Scene Environment, Monolith Portals & Rocket Troll Gate
(function () {
    const LevelIntro3D = {
        scene: null,
        groundMesh: null,
        gates: [],
        aboutGate3D: null,
        isTrollVaulting: false,
        trollVaultProgress: 0,
        trollOriginPos: null,
        cloudMesh: null,
        cloudLight: null,
        lightningMesh: null,
        vortexParticles: [],
        isLoaded: false,

        build(scene) {
            if (!scene) return;
            this.scene = scene;
            this.cleanup();

            // 1. PBR Stone Ground Platform
            const stoneMat = new BABYLON.PBRMaterial("introStoneMat", scene);
            stoneMat.albedoColor = new BABYLON.Color3(0.55, 0.42, 0.25); // Warm stone
            stoneMat.metallic = 0.15;
            stoneMat.roughness = 0.8;

            const screenW = (typeof width === "function") ? width() : window.innerWidth;
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            const floorH = (typeof height === "function") ? height() * 0.2 : 144;

            const groundW3D = screenW * 4 * Engine3D.SCALE;
            const groundH3D = 20 * Engine3D.SCALE;

            this.groundMesh = BABYLON.MeshBuilder.CreateBox("ground3D", {
                width: groundW3D,
                height: 15,
                depth: 8
            }, scene);
            this.groundMesh.position = new BABYLON.Vector3(0, Engine3D.to3DY(screenH - floorH + 30) - 7.5, 0);
            this.groundMesh.material = stoneMat;
            this.groundMesh.receiveShadows = true;

            // 2. Build 3D Monolith Portals
            const gateNames = ["About Me", "Projects", "Contact Me"];
            const startX = screenW * 0.45;
            const spacing = 180;

            const monolithMat = new BABYLON.PBRMaterial("monolithMat", scene);
            monolithMat.albedoColor = new BABYLON.Color3(0.18, 0.18, 0.22); // Obsidian
            monolithMat.metallic = 0.85;
            monolithMat.roughness = 0.25;

            for (let i = 0; i < 3; i++) {
                const gateX2D = startX + i * spacing;
                const gateY2D = screenH - floorH;
                const pos3D = Engine3D.to3DVec(gateX2D, gateY2D, 0);

                const gateRoot = new BABYLON.TransformNode(`gateRoot_${i}`, scene);
                gateRoot.position = pos3D;

                // Left Pillar
                const lPillar = BABYLON.MeshBuilder.CreateBox(`lPillar_${i}`, { width: 0.5, height: 4.5, depth: 0.6 }, scene);
                lPillar.position = new BABYLON.Vector3(-1.4, 2.25, 0);
                lPillar.material = monolithMat;
                lPillar.parent = gateRoot;
                Engine3D.addShadowCaster(lPillar);

                // Right Pillar
                const rPillar = BABYLON.MeshBuilder.CreateBox(`rPillar_${i}`, { width: 0.5, height: 4.5, depth: 0.6 }, scene);
                rPillar.position = new BABYLON.Vector3(1.4, 2.25, 0);
                rPillar.material = monolithMat;
                rPillar.parent = gateRoot;
                Engine3D.addShadowCaster(rPillar);

                // Arch Top
                const topArch = BABYLON.MeshBuilder.CreateBox(`topArch_${i}`, { width: 3.3, height: 0.7, depth: 0.7 }, scene);
                topArch.position = new BABYLON.Vector3(0, 4.6, 0);
                topArch.material = monolithMat;
                topArch.parent = gateRoot;
                Engine3D.addShadowCaster(topArch);

                // Portal Vortex Core (Glowing energetic aperture)
                const vortexPlane = BABYLON.MeshBuilder.CreatePlane(`vortex_${i}`, { width: 2.3, height: 4.2 }, scene);
                vortexPlane.position = new BABYLON.Vector3(0, 2.2, 0);
                vortexPlane.parent = gateRoot;

                const vortexMat = new BABYLON.StandardMaterial(`vortexMat_${i}`, scene);
                vortexMat.diffuseColor = (i === 0) ? new BABYLON.Color3(1.0, 0.3, 0.4) : (i === 1) ? new BABYLON.Color3(0.2, 0.8, 1.0) : new BABYLON.Color3(0.4, 1.0, 0.5);
                vortexMat.emissiveColor = vortexMat.diffuseColor;
                vortexMat.alpha = 0.75;
                vortexPlane.material = vortexMat;

                this.gates.push({
                    name: gateNames[i],
                    root: gateRoot,
                    vortex: vortexPlane,
                    vortexMat: vortexMat
                });

                if (i === 0) {
                    this.aboutGate3D = gateRoot;
                    this.trollOriginPos = gateRoot.position.clone();
                }
            }

            // 3. Volumetric 3D Stormcloud & Lightning Trap
            const cloudMat = new BABYLON.StandardMaterial("stormCloudMat", scene);
            cloudMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
            cloudMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);

            this.cloudMesh = BABYLON.MeshBuilder.CreateSphere("stormCloud3D", { diameterX: 4.5, diameterY: 1.6, diameterZ: 2.2 }, scene);
            this.cloudMesh.position = new BABYLON.Vector3(0, 6, 0);
            this.cloudMesh.material = cloudMat;
            Engine3D.addShadowCaster(this.cloudMesh);

            this.cloudLight = new BABYLON.PointLight("cloudInternalLight", new BABYLON.Vector3(0, 6, -0.5), scene);
            this.cloudLight.intensity = 0;
            this.cloudLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.3);

            this.isLoaded = true;
            console.log("3D Intro Level Environment & Monoliths Constructed.");
        },

        // Frame update loop
        update(scene, guy) {
            if (!this.isLoaded) return;

            const t = (typeof time === "function") ? time() : performance.now() * 0.001;

            // 1. Swirl Portal Vortex Apertures
            for (let i = 0; i < this.gates.length; i++) {
                const g = this.gates[i];
                g.vortexMat.alpha = 0.65 + Math.sin(t * 5 + i * 2) * 0.15;
            }

            // 2. Synchronize "About Me" Rocket Troll Gate with 2D Troll State
            // Check if 2D troll gate was triggered
            const is2DTrollActive = (typeof get === "function" && get("gate").some(g => g.gateName === "About Me" && g.trollTriggered));

            if (is2DTrollActive && !this.isTrollVaulting && this.trollVaultProgress < 1.0) {
                this.isTrollVaulting = true;
            }

            if (this.isTrollVaulting && this.aboutGate3D) {
                this.trollVaultProgress = Math.min(1.0, this.trollVaultProgress + 0.025);
                const p = this.trollVaultProgress;

                // Parabolic 3D vault arc: shifts to the right, rises up in Y, and recedes into Z depth
                const vaultX = this.trollOriginPos.x + p * 16.0;
                const vaultY = this.trollOriginPos.y + Math.sin(p * Math.PI) * 8.0;
                const vaultZ = this.trollOriginPos.z + Math.sin(p * Math.PI) * 4.0;

                this.aboutGate3D.position.x = vaultX;
                this.aboutGate3D.position.y = vaultY;
                this.aboutGate3D.position.z = vaultZ;
                this.aboutGate3D.rotation.z = -p * Math.PI * 0.5; // Tumbles forward dynamically
            }

            // 3. Synchronize Stormcloud position with 2D Trap Cloud
            if (typeof get === "function") {
                const trap2D = get("trap_cloud")[0];
                if (trap2D && this.cloudMesh) {
                    const cPos3D = Engine3D.to3DVec(trap2D.pos.x + 40, trap2D.pos.y + 13, 0);
                    this.cloudMesh.position.x = cPos3D.x;
                    this.cloudMesh.position.y = cPos3D.y;
                    this.cloudLight.position.x = cPos3D.x;
                    this.cloudLight.position.y = cPos3D.y;

                    // Flashing charge glow
                    if (trap2D.state === "charge") {
                        this.cloudLight.intensity = (Math.sin(t * 25) > 0) ? 2.5 : 0.2;
                        this.cloudLight.diffuse = new BABYLON.Color3(1.0, 0.2, 0.2); // Flashing red
                    } else {
                        this.cloudLight.intensity = 0;
                    }
                }
            }
        },

        cleanup() {
            if (this.groundMesh) {
                this.groundMesh.dispose();
                this.groundMesh = null;
            }
            for (let g of this.gates) {
                if (g.root) g.root.dispose();
            }
            this.gates = [];
            if (this.cloudMesh) {
                this.cloudMesh.dispose();
                this.cloudMesh = null;
            }
            if (this.cloudLight) {
                this.cloudLight.dispose();
                this.cloudLight = null;
            }
            this.isTrollVaulting = false;
            this.trollVaultProgress = 0;
            this.isLoaded = false;
        }
    };

    window.LevelIntro3D = LevelIntro3D;
})();
