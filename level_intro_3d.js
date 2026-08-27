// level_intro_3d.js - Complete 2.5D Intro Level Remaster
(function () {
    "use strict";

    const LevelIntro3D = {
        scene: null,
        groundMesh: null,
        gates: [],
        aboutGate3D: null,
        aboutGateLegL: null,
        aboutGateLegR: null,
        aboutGateEyeL: null,
        aboutGateEyeR: null,
        isTrollVaulting: false,
        trollVaultProgress: 0,
        trollOriginPos: null,
        professor3D: null,
        cloudMesh: null,
        cloudEyebrows: null,
        cloudLight: null,
        backdropMeshes: [],
        isLoaded: false,

        build(scene) {
            if (!scene || !window.Engine3D) return;
            this.scene = scene;
            this.cleanup();

            const Engine3D = window.Engine3D;
            const screenW = (typeof width === "function") ? width() : window.innerWidth;
            const screenH = (typeof height === "function") ? height() : window.innerHeight;
            const floorH = (typeof height === "function") ? height() * 0.2 : 144;
            const floorTop2D = screenH - floorH;
            const floorTop3D = Engine3D.to3DY(floorTop2D);

            // 1. MATERIAL PALETTES
            // Terracotta Platform PBR
            const terracottaMat = new BABYLON.PBRMaterial("introTerracottaMat", scene);
            terracottaMat.albedoColor = new BABYLON.Color3(0.69, 0.44, 0.12); // Rich #B0711D
            terracottaMat.metallic = 0.15;
            terracottaMat.roughness = 0.7;

            // Obsidian Gate Frames
            const obsidianMat = new BABYLON.PBRMaterial("introObsidianMat", scene);
            obsidianMat.albedoColor = new BABYLON.Color3(0.12, 0.12, 0.16);
            obsidianMat.metallic = 0.85;
            obsidianMat.roughness = 0.25;

            // Paper Craft Material for Background
            const paperMat = new BABYLON.PBRMaterial("introPaperMat", scene);
            paperMat.albedoColor = new BABYLON.Color3(0.98, 0.95, 0.9);
            paperMat.metallic = 0.05;
            paperMat.roughness = 0.9;

            // Glowing Neon Circuit Inlays
            const neonCyanMat = new BABYLON.StandardMaterial("introNeonCyan", scene);
            neonCyanMat.diffuseColor = new BABYLON.Color3(0, 0.9, 1.0);
            neonCyanMat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 1.0);

            // 2. TACTILE TERRACOTTA GROUND PLATFORM
            const groundW3D = screenW * 4 * Engine3D.SCALE;
            this.groundMesh = BABYLON.MeshBuilder.CreateBox("ground3D", {
                width: groundW3D,
                height: 15,
                depth: 8
            }, scene);
            this.groundMesh.position = new BABYLON.Vector3(0, floorTop3D - 7.5, 0);
            this.groundMesh.material = terracottaMat;
            this.groundMesh.receiveShadows = true;

            // Glowing Runic Floor Inlay Line
            const circuitLine = BABYLON.MeshBuilder.CreateBox("floorCircuitLine", {
                width: groundW3D,
                height: 0.1,
                depth: 0.4
            }, scene);
            circuitLine.position = new BABYLON.Vector3(0, floorTop3D + 0.05, 0);
            circuitLine.material = neonCyanMat;
            this.backdropMeshes.push(circuitLine);

            // 3. FLOATING PAPERCUT PARALLAX BACKDROP ($Z = 25..50$)
            // Floating Calipers & Draft Tools
            const draftToolMat = new BABYLON.PBRMaterial("draftToolMat", scene);
            draftToolMat.albedoColor = new BABYLON.Color3(0.95, 0.85, 0.5);
            draftToolMat.metallic = 0.5;
            draftToolMat.roughness = 0.3;

            for (let i = 0; i < 4; i++) {
                const tool = BABYLON.MeshBuilder.CreateTorus(`draftTool_${i}`, { diameter: 3.0 + i * 0.8, thickness: 0.2, tessellation: 32 }, scene);
                tool.position = new BABYLON.Vector3(-15 + i * 10, floorTop3D + 6 + (i % 2) * 3, 25);
                tool.rotation.x = Math.PI / 4;
                tool.rotation.y = i * 0.5;
                tool.material = draftToolMat;
                this.backdropMeshes.push(tool);
            }

            // Floating Paper Clouds ($Z = 35$)
            for (let i = 0; i < 5; i++) {
                const pCloud = BABYLON.MeshBuilder.CreateSphere(`pCloud_${i}`, { diameterX: 5.5, diameterY: 2.0, diameterZ: 1.5 }, scene);
                pCloud.position = new BABYLON.Vector3(-20 + i * 12, floorTop3D + 10 + (i % 2) * 2.5, 35);
                pCloud.material = paperMat;
                this.backdropMeshes.push(pCloud);
            }

            // 4. THE 3 GATEWAY PORTALS
            const gateNames = ["About Me", "Projects", "Contact Me"];
            const gateColors = [
                new BABYLON.Color3(1.0, 0.75, 0.2), // Gold (About)
                new BABYLON.Color3(0.1, 0.85, 1.0), // Cyan (Projects)
                new BABYLON.Color3(0.2, 0.95, 0.4)  // Emerald (Contact)
            ];

            const startX = screenW * 0.45;
            const spacing = 180;

            for (let i = 0; i < 3; i++) {
                const gateX2D = startX + i * spacing;
                const gateY2D = floorTop2D;
                const pos3D = Engine3D.to3DVec(gateX2D, gateY2D, 0);

                const gateRoot = new BABYLON.TransformNode(`gateRoot_${i}`, scene);
                gateRoot.position = pos3D;

                // Left Pillar
                const lPillar = BABYLON.MeshBuilder.CreateBox(`lPillar_${i}`, { width: 0.5, height: 4.5, depth: 0.6 }, scene);
                lPillar.position = new BABYLON.Vector3(-1.4, 2.25, 0);
                lPillar.material = obsidianMat;
                lPillar.parent = gateRoot;
                Engine3D.addShadowCaster(lPillar);

                // Right Pillar
                const rPillar = BABYLON.MeshBuilder.CreateBox(`rPillar_${i}`, { width: 0.5, height: 4.5, depth: 0.6 }, scene);
                rPillar.position = new BABYLON.Vector3(1.4, 2.25, 0);
                rPillar.parent = gateRoot;
                rPillar.material = obsidianMat;
                Engine3D.addShadowCaster(rPillar);

                // Arch Top
                const topArch = BABYLON.MeshBuilder.CreateBox(`topArch_${i}`, { width: 3.3, height: 0.7, depth: 0.7 }, scene);
                topArch.position = new BABYLON.Vector3(0, 4.6, 0);
                topArch.parent = gateRoot;
                topArch.material = obsidianMat;
                Engine3D.addShadowCaster(topArch);

                // Swirling Portal Vortex
                const vortexPlane = BABYLON.MeshBuilder.CreatePlane(`vortex_${i}`, { width: 2.3, height: 4.2 }, scene);
                vortexPlane.position = new BABYLON.Vector3(0, 2.2, 0);
                vortexPlane.parent = gateRoot;

                const vortexMat = new BABYLON.StandardMaterial(`vortexMat_${i}`, scene);
                vortexMat.diffuseColor = gateColors[i];
                vortexMat.emissiveColor = gateColors[i].scale(0.8);
                vortexMat.alpha = 0.75;
                vortexPlane.material = vortexMat;

                // Floating Gate Icon Widget
                let iconMesh;
                if (i === 0) {
                    // ID Badge
                    iconMesh = BABYLON.MeshBuilder.CreateBox(`gateIcon_${i}`, { width: 0.9, height: 1.2, depth: 0.1 }, scene);
                } else if (i === 1) {
                    // Spinning Geometric Cube
                    iconMesh = BABYLON.MeshBuilder.CreateBox(`gateIcon_${i}`, { size: 0.7 }, scene);
                } else {
                    // Paper Envelope
                    iconMesh = BABYLON.MeshBuilder.CreateBox(`gateIcon_${i}`, { width: 1.1, height: 0.7, depth: 0.1 }, scene);
                }
                iconMesh.position = new BABYLON.Vector3(0, 5.4, 0);
                iconMesh.parent = gateRoot;
                iconMesh.material = vortexMat;

                this.gates.push({
                    name: gateNames[i],
                    root: gateRoot,
                    vortex: vortexPlane,
                    vortexMat: vortexMat,
                    icon: iconMesh
                });

                // Attach Tiptoe Legs & Googly Eyes to the "About Me" Troll Gate (i = 0)
                if (i === 0) {
                    this.aboutGate3D = gateRoot;
                    this.trollOriginPos = gateRoot.position.clone();

                    // Mechanical Legs
                    const legMat = new BABYLON.PBRMaterial("trollLegMat", scene);
                    legMat.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.25);
                    legMat.metallic = 0.8;

                    this.aboutGateLegL = BABYLON.MeshBuilder.CreateBox("aboutLegL", { width: 0.3, height: 0.8, depth: 0.3 }, scene);
                    this.aboutGateLegL.position = new BABYLON.Vector3(-0.9, 0, 0);
                    this.aboutGateLegL.parent = gateRoot;
                    this.aboutGateLegL.material = legMat;

                    this.aboutGateLegR = BABYLON.MeshBuilder.CreateBox("aboutLegR", { width: 0.3, height: 0.8, depth: 0.3 }, scene);
                    this.aboutGateLegR.position = new BABYLON.Vector3(0.9, 0, 0);
                    this.aboutGateLegR.parent = gateRoot;
                    this.aboutGateLegR.material = legMat;

                    // Googly Eyes on Top of the Door
                    const eyeMat = new BABYLON.StandardMaterial("trollEyeMat", scene);
                    eyeMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
                    eyeMat.emissiveColor = new BABYLON.Color3(0.9, 0.9, 0.9);

                    this.aboutGateEyeL = BABYLON.MeshBuilder.CreateSphere("aboutEyeL", { diameter: 0.45 }, scene);
                    this.aboutGateEyeL.position = new BABYLON.Vector3(-0.5, 5.2, 0.35);
                    this.aboutGateEyeL.parent = gateRoot;
                    this.aboutGateEyeL.material = eyeMat;

                    this.aboutGateEyeR = BABYLON.MeshBuilder.CreateSphere("aboutEyeR", { diameter: 0.45 }, scene);
                    this.aboutGateEyeR.position = new BABYLON.Vector3(0.5, 5.2, 0.35);
                    this.aboutGateEyeR.parent = gateRoot;
                    this.aboutGateEyeR.material = eyeMat;
                }
            }

            // 5. 3D PROFESSOR NPC (The Quirky Guide)
            const profX2D = startX - 180;
            const profPos3D = Engine3D.to3DVec(profX2D, floorTop2D, 0);

            const profRoot = new BABYLON.TransformNode("profRoot3D", scene);
            profRoot.position = profPos3D;

            const profMat = new BABYLON.PBRMaterial("profBodyMat", scene);
            profMat.albedoColor = new BABYLON.Color3(0.4, 0.2, 0.5); // Scholar Purple
            profMat.roughness = 0.6;

            const profBody = BABYLON.MeshBuilder.CreateCylinder("profBody", { diameterTop: 0.8, diameterBottom: 1.1, height: 1.4 }, scene);
            profBody.position.y = 0.7;
            profBody.parent = profRoot;
            profBody.material = profMat;

            const profHead = BABYLON.MeshBuilder.CreateSphere("profHead", { diameter: 0.85 }, scene);
            profHead.position.y = 1.7;
            profHead.parent = profRoot;
            profHead.material = profMat;

            // Round Spectacles
            const glassMat = new BABYLON.StandardMaterial("profGlassMat", scene);
            glassMat.diffuseColor = new BABYLON.Color3(1.0, 0.85, 0.2); // Gold frame
            const glasses = BABYLON.MeshBuilder.CreateTorus("profGlasses", { diameter: 0.4, thickness: 0.05 }, scene);
            glasses.position = new BABYLON.Vector3(0, 1.75, 0.4);
            glasses.rotation.x = Math.PI / 2;
            glasses.parent = profRoot;
            glasses.material = glassMat;

            this.professor3D = profRoot;
            this.backdropMeshes.push(profBody, profHead, glasses);

            // 6. GRUMPY 3D THUNDERCLOUD & LIGHTNING TRAP
            const cloudMat = new BABYLON.StandardMaterial("stormCloudMat", scene);
            cloudMat.diffuseColor = new BABYLON.Color3(0.35, 0.35, 0.42);
            cloudMat.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.12);

            this.cloudMesh = BABYLON.MeshBuilder.CreateSphere("stormCloud3D", { diameterX: 4.8, diameterY: 1.8, diameterZ: 2.2 }, scene);
            this.cloudMesh.position = new BABYLON.Vector3(0, floorTop3D + 8.5, 0);
            this.cloudMesh.material = cloudMat;
            Engine3D.addShadowCaster(this.cloudMesh);

            // Angry Eyebrows
            const browMat = new BABYLON.StandardMaterial("browMat", scene);
            browMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            this.cloudEyebrows = BABYLON.MeshBuilder.CreateBox("cloudBrows", { width: 1.2, height: 0.2, depth: 0.3 }, scene);
            this.cloudEyebrows.position = new BABYLON.Vector3(0, floorTop3D + 9.1, 1.0);
            this.cloudEyebrows.rotation.z = 0.15;
            this.cloudEyebrows.material = browMat;

            this.cloudLight = new BABYLON.PointLight("cloudInternalLight", new BABYLON.Vector3(0, floorTop3D + 8.5, -0.5), scene);
            this.cloudLight.intensity = 0;
            this.cloudLight.diffuse = new BABYLON.Color3(1.0, 0.85, 0.2);

            this.isLoaded = true;
            console.log("3D Intro Level Remaster Environment & Animations Constructed.");
        },

        update(scene, guy) {
            if (!this.isLoaded) return;

            const t = (typeof time === "function") ? time() : performance.now() * 0.001;

            // 1. Swirl Gate Icons & Vortexes
            for (let i = 0; i < this.gates.length; i++) {
                const g = this.gates[i];
                g.vortexMat.alpha = 0.65 + Math.sin(t * 5 + i * 2) * 0.15;
                if (g.icon) {
                    g.icon.rotation.y += 0.02;
                    g.icon.position.y = 5.4 + Math.sin(t * 3 + i) * 0.1;
                }
            }

            // 2. Professor subtle idle wobble
            if (this.professor3D) {
                this.professor3D.rotation.y = Math.sin(t * 1.5) * 0.15;
            }

            // 3. Synchronize "About Me" Rocket Troll Gate with 2D Troll State
            const is2DTrollActive = (typeof get === "function" && get("gate").some(g => g.gateName === "About Me" && g.trollTriggered));

            if (is2DTrollActive && !this.isTrollVaulting && this.trollVaultProgress < 1.0) {
                this.isTrollVaulting = true;
            }

            if (this.isTrollVaulting && this.aboutGate3D) {
                this.trollVaultProgress = Math.min(1.0, this.trollVaultProgress + 0.02);
                const p = this.trollVaultProgress;

                // Tiptoe Leg Flutter
                if (this.aboutGateLegL && this.aboutGateLegR) {
                    this.aboutGateLegL.rotation.x = Math.sin(t * 25) * 0.8;
                    this.aboutGateLegR.rotation.x = -Math.sin(t * 25) * 0.8;
                }

                // Parabolic 3D vault arc: shifts to the right, rises up in Y, and recedes into Z depth
                const vaultX = this.trollOriginPos.x + p * 16.0;
                const vaultY = this.trollOriginPos.y + Math.sin(p * Math.PI) * 9.0;
                const vaultZ = this.trollOriginPos.z + Math.sin(p * Math.PI) * 5.0;

                this.aboutGate3D.position.x = vaultX;
                this.aboutGate3D.position.y = vaultY;
                this.aboutGate3D.position.z = vaultZ;
                this.aboutGate3D.rotation.z = -p * Math.PI * 0.5;
            }

            // 4. Synchronize Stormcloud position with 2D Trap Cloud
            if (typeof get === "function") {
                const trap2D = get("trap_cloud")[0];
                if (trap2D && this.cloudMesh) {
                    const cPos3D = Engine3D.to3DVec(trap2D.pos.x + 40, trap2D.pos.y + 13, 0);
                    this.cloudMesh.position.x = cPos3D.x;
                    this.cloudMesh.position.y = cPos3D.y;
                    if (this.cloudEyebrows) {
                        this.cloudEyebrows.position.x = cPos3D.x;
                        this.cloudEyebrows.position.y = cPos3D.y + 0.6;
                    }
                    this.cloudLight.position.x = cPos3D.x;
                    this.cloudLight.position.y = cPos3D.y;

                    // Flashing charge glow
                    if (trap2D.state === "charge") {
                        this.cloudLight.intensity = (Math.sin(t * 25) > 0) ? 3.0 : 0.3;
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
            this.backdropMeshes.forEach(m => {
                if (m) m.dispose();
            });
            this.backdropMeshes = [];
            if (this.cloudMesh) {
                this.cloudMesh.dispose();
                this.cloudMesh = null;
            }
            if (this.cloudEyebrows) {
                this.cloudEyebrows.dispose();
                this.cloudEyebrows = null;
            }
            if (this.cloudLight) {
                this.cloudLight.dispose();
                this.cloudLight = null;
            }
            if (this.professor3D) {
                this.professor3D.dispose();
                this.professor3D = null;
            }
            this.isTrollVaulting = false;
            this.trollVaultProgress = 0;
            this.isLoaded = false;
        }
    };

    window.LevelIntro3D = LevelIntro3D;
})();
