/**
 * LevelIntro3D - Babylon.js 2.5D Presentation Layer for Intro Level (Remastered)
 * 
 * Features:
 * 1. PBR Terracotta & Obsidian Stoneware Platform with Glowing Runic Inlays.
 * 2. 3D Monolith Gate Portals with Swirling Particle Vortex Fields.
 * 3. Animated "About Me" Runaway Gate Troll (Tiptoe Legs & Dual Rocket Thrusters).
 * 4. Volumetric Grumpy Stormcloud with Internal Pulsing Plasma & Lightning Arcs.
 */

(function () {
    "use strict";

    const LevelIntro3D = {
        scene: null,
        groundMesh: null,
        runes: [],
        gates: [],
        aboutGate3D: null,
        leftThruster: null,
        rightThruster: null,
        thrusterFireMat: null,
        trollOriginPos: null,
        isTrollVaulting: false,
        trollVaultProgress: 0,
        cloudMesh: null,
        cloudLight: null,
        lightningMesh: null,
        isLoaded: false,

        build: function (scene) {
            if (!scene || !window.Engine3D) return;
            this.scene = scene;
            this.cleanup();

            const Engine3D = window.Engine3D;
            const screenW = typeof width === "function" ? width() : 1280;
            const screenH = typeof height === "function" ? height() : 720;
            const floorH = screenH * 0.2;
            const floorTop2D = screenH - floorH;
            const floorTop3D = Engine3D.to3DY(floorTop2D);

            // 1. MATERIAL PALETTES (Tactile Nostalgic Level Devil PBR)
            const terracottaMat = new BABYLON.PBRMaterial("mat_terracotta_intro", scene);
            terracottaMat.albedoColor = new BABYLON.Color3(0.69, 0.44, 0.11); // #B0711D
            terracottaMat.metallic = 0.25;
            terracottaMat.roughness = 0.45;

            const obsidianMat = new BABYLON.PBRMaterial("mat_obsidian_intro", scene);
            obsidianMat.albedoColor = new BABYLON.Color3(0.12, 0.11, 0.15); // Deep Charcoal Obsidian
            obsidianMat.metallic = 0.9;
            obsidianMat.roughness = 0.2;

            const runeMat = new BABYLON.PBRMaterial("mat_rune_intro", scene);
            runeMat.albedoColor = new BABYLON.Color3(0.1, 0.9, 1.0);
            runeMat.emissiveColor = new BABYLON.Color3(0.05, 0.6, 0.9);
            runeMat.metallic = 0.3;
            runeMat.roughness = 0.1;

            const goldMat = new BABYLON.PBRMaterial("mat_gold_intro", scene);
            goldMat.albedoColor = new BABYLON.Color3(0.95, 0.75, 0.2);
            goldMat.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.05);
            goldMat.metallic = 0.95;
            goldMat.roughness = 0.15;

            // 2. TACTILE STONEWARE GROUND PLATFORM
            const groundW3D = screenW * 4 * Engine3D.SCALE;
            this.groundMesh = BABYLON.MeshBuilder.CreateBox("introGround3D", {
                width: groundW3D,
                height: 15,
                depth: 8
            }, scene);
            this.groundMesh.position = new BABYLON.Vector3(0, floorTop3D - 7.5, 0);
            this.groundMesh.material = terracottaMat;
            this.groundMesh.receiveShadows = true;

            // Decorative Top Edge Bevel & Circuit Runes
            const topBevel = BABYLON.MeshBuilder.CreateBox("groundBevel", {
                width: groundW3D,
                height: 0.4,
                depth: 8.2
            }, scene);
            topBevel.position = new BABYLON.Vector3(0, floorTop3D - 0.2, 0);
            topBevel.material = obsidianMat;
            topBevel.receiveShadows = true;
            this.groundMesh.addChild(topBevel);

            // Glowing Circuit Inlay Strips
            this.runes = [];
            for (let r = -6; r <= 6; r++) {
                const rune = BABYLON.MeshBuilder.CreateBox("runeStrip_" + r, {
                    width: 1.6,
                    height: 0.1,
                    depth: 4.0
                }, scene);
                rune.position = new BABYLON.Vector3(r * 5.0, floorTop3D + 0.02, 0);
                rune.material = runeMat;
                this.runes.push(rune);
            }

            // 3. 3D MONOLITH GATE PORTALS
            const gateNames = ["About Me", "Projects", "Contact Me"];
            const startX = screenW * 0.55;
            const gap = 220;

            this.gates = [];
            for (let i = 0; i < 3; i++) {
                const gx2D = startX + (i * gap);
                const pos3D = Engine3D.to3DVec(gx2D, floorTop2D, 0);

                const gateRoot = new BABYLON.TransformNode("introGateRoot_" + i, scene);
                gateRoot.position = pos3D;

                // Left & Right Monolith Columns
                const pL = BABYLON.MeshBuilder.CreateBox("gatePL_" + i, { width: 0.6, height: 5.5, depth: 0.8 }, scene);
                pL.position = new BABYLON.Vector3(-1.6, 2.75, 0);
                pL.material = obsidianMat;
                pL.parent = gateRoot;
                Engine3D.addShadowCaster(pL);

                const pR = BABYLON.MeshBuilder.CreateBox("gatePR_" + i, { width: 0.6, height: 5.5, depth: 0.8 }, scene);
                pR.position = new BABYLON.Vector3(1.6, 2.75, 0);
                pR.material = obsidianMat;
                pR.parent = gateRoot;
                Engine3D.addShadowCaster(pR);

                // Top Header Arch with Gold Inlay
                const topArch = BABYLON.MeshBuilder.CreateBox("gateTopArch_" + i, { width: 3.8, height: 0.8, depth: 0.9 }, scene);
                topArch.position = new BABYLON.Vector3(0, 5.8, 0);
                topArch.material = obsidianMat;
                topArch.parent = gateRoot;
                Engine3D.addShadowCaster(topArch);

                const goldTrim = BABYLON.MeshBuilder.CreateBox("gateGoldTrim_" + i, { width: 3.2, height: 0.2, depth: 0.95 }, scene);
                goldTrim.position = new BABYLON.Vector3(0, 5.4, 0);
                goldTrim.material = goldMat;
                goldTrim.parent = gateRoot;

                // Swirling Particle Vortex Core
                const vortexColors = [
                    new BABYLON.Color3(0.1, 0.8, 1.0),  // Cyan (About)
                    new BABYLON.Color3(0.95, 0.7, 0.1), // Gold (Projects)
                    new BABYLON.Color3(0.1, 0.95, 0.4)  // Emerald (Contact)
                ];

                const vortexMat = new BABYLON.PBRMaterial("introVortexMat_" + i, scene);
                vortexMat.albedoColor = vortexColors[i];
                vortexMat.emissiveColor = vortexColors[i].scale(0.85);
                vortexMat.alpha = 0.7;
                vortexMat.metallic = 0.2;

                const vortexPlane = BABYLON.MeshBuilder.CreatePlane("vortexCore_" + i, { width: 2.6, height: 5.0 }, scene);
                vortexPlane.position = new BABYLON.Vector3(0, 2.5, 0);
                vortexPlane.material = vortexMat;
                vortexPlane.parent = gateRoot;

                this.gates.push({
                    name: gateNames[i],
                    root: gateRoot,
                    vortex: vortexPlane,
                    vortexMat: vortexMat
                });

                // Attach Rocket Thrusters to "About Me" Troll Gate
                if (i === 0) {
                    this.aboutGate3D = gateRoot;
                    this.trollOriginPos = gateRoot.position.clone();

                    const thrusterMat = new BABYLON.PBRMaterial("thrusterMat", scene);
                    thrusterMat.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.25);
                    thrusterMat.metallic = 0.95;

                    this.thrusterFireMat = new BABYLON.StandardMaterial("thrusterFireMat", scene);
                    this.thrusterFireMat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.05);

                    // Left Thruster
                    this.leftThruster = BABYLON.MeshBuilder.CreateCylinder("lThruster", { diameter: 0.4, height: 1.2 }, scene);
                    this.leftThruster.position = new BABYLON.Vector3(-2.0, 3.0, 0);
                    this.leftThruster.rotation.z = Math.PI;
                    this.leftThruster.material = thrusterMat;
                    this.leftThruster.parent = gateRoot;

                    const lFlame = BABYLON.MeshBuilder.CreateCylinder("lFlame", { diameterTop: 0.35, diameterBottom: 0, height: 0.8 }, scene);
                    lFlame.position.y = 0.9;
                    lFlame.material = this.thrusterFireMat;
                    lFlame.parent = this.leftThruster;
                    lFlame.setEnabled(false);
                    this.leftThruster.flame = lFlame;

                    // Right Thruster
                    this.rightThruster = BABYLON.MeshBuilder.CreateCylinder("rThruster", { diameter: 0.4, height: 1.2 }, scene);
                    this.rightThruster.position = new BABYLON.Vector3(2.0, 3.0, 0);
                    this.rightThruster.rotation.z = Math.PI;
                    this.rightThruster.material = thrusterMat;
                    this.rightThruster.parent = gateRoot;

                    const rFlame = BABYLON.MeshBuilder.CreateCylinder("rFlame", { diameterTop: 0.35, diameterBottom: 0, height: 0.8 }, scene);
                    rFlame.position.y = 0.9;
                    rFlame.material = this.thrusterFireMat;
                    rFlame.parent = this.rightThruster;
                    rFlame.setEnabled(false);
                    this.rightThruster.flame = rFlame;
                }
            }

            // 4. VOLUMETRIC 3D STORMCLOUD
            const cloudMat = new BABYLON.StandardMaterial("introStormCloudMat", scene);
            cloudMat.diffuseColor = new BABYLON.Color3(0.2, 0.22, 0.28); // Stormy dark grey
            cloudMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.08);

            this.cloudMesh = BABYLON.MeshBuilder.CreateSphere("introStormCloud3D", { diameterX: 4.8, diameterY: 1.8, diameterZ: 2.4 }, scene);
            this.cloudMesh.position = new BABYLON.Vector3(0, floorTop3D + 12, 0);
            this.cloudMesh.material = cloudMat;
            Engine3D.addShadowCaster(this.cloudMesh);

            this.cloudLight = new BABYLON.PointLight("introCloudInternalLight", new BABYLON.Vector3(0, floorTop3D + 12, -0.5), scene);
            this.cloudLight.intensity = 0;
            this.cloudLight.diffuse = new BABYLON.Color3(1.0, 0.85, 0.2);

            this.isLoaded = true;
            console.log("3D Intro Level Environment & Monoliths Constructed (Remastered).");
        },

        update: function (scene, guy) {
            if (!this.isLoaded || !scene) return;

            const t = performance.now() * 0.001;

            // 1. Swirling Portal Vortex Energy
            for (let i = 0; i < this.gates.length; i++) {
                const g = this.gates[i];
                if (g.vortexMat) {
                    g.vortexMat.alpha = 0.6 + Math.sin(t * 4.0 + i * 2.0) * 0.15;
                }
            }

            // 2. Synchronize "About Me" Troll Gate with Kaboom 2D Gate
            if (this.aboutGate3D && typeof get === "function") {
                const gates2D = get("gate");
                const about2D = gates2D.find(g => g.gateName === "About Me");
                if (about2D && about2D.pos) {
                    const targetX = Engine3D.to3DX(about2D.pos.x);
                    const targetY = Engine3D.to3DY(about2D.pos.y);

                    this.aboutGate3D.position.x = BABYLON.Scalar.Lerp(this.aboutGate3D.position.x, targetX, 0.2);
                    this.aboutGate3D.position.y = BABYLON.Scalar.Lerp(this.aboutGate3D.position.y, targetY, 0.2);

                    // If vaulted into the air, ignite rocket thrusters!
                    const isAirborne = (targetY - Engine3D.to3DY(window.innerHeight - window.innerHeight * 0.2)) > 1.0;
                    if (this.leftThruster && this.leftThruster.flame) this.leftThruster.flame.setEnabled(isAirborne);
                    if (this.rightThruster && this.rightThruster.flame) this.rightThruster.flame.setEnabled(isAirborne);
                }
            }

            // 3. Lightning Cloud Patrol Tracking
            if (this.cloudMesh && typeof get === "function") {
                const clouds2D = get("lightning_cloud");
                if (clouds2D && clouds2D.length > 0) {
                    const c2D = clouds2D[0];
                    this.cloudMesh.position.x = Engine3D.to3DX(c2D.pos.x);
                    this.cloudMesh.position.y = Engine3D.to3DY(c2D.pos.y);
                    if (this.cloudLight) {
                        this.cloudLight.position.x = this.cloudMesh.position.x;
                        this.cloudLight.position.y = this.cloudMesh.position.y;
                        this.cloudLight.intensity = (c2D.state === "charge" || c2D.state === "strike") ? 3.0 : 0.0;
                    }
                }
            }
        },

        cleanup: function () {
            if (this.groundMesh) this.groundMesh.dispose();
            this.runes.forEach(r => r.dispose());
            this.runes = [];
            this.gates.forEach(g => {
                if (g.root) g.root.dispose();
            });
            this.gates = [];
            if (this.cloudMesh) this.cloudMesh.dispose();
            if (this.cloudLight) this.cloudLight.dispose();
            if (this.lightningMesh) this.lightningMesh.dispose();
            this.isLoaded = false;
        }
    };

    window.LevelIntro3D = LevelIntro3D;
})();
