/**
 * LevelAbout3D - Babylon.js 2.5D Presentation Layer for About Level
 * 
 * Features:
 * 1. Split PBR Obsidian Platforms (Floor 1 & Floor 2 spanning across the Pit).
 * 2. Floating 3D Holographic ID Card Pedestal with frosted glass and glowing circuit trims.
 * 3. 3D Metallic Hazard Spikes with emissive red tips.
 * 4. 4x 3D Interactive Skill Crates (Figma, Photoshop, Coding, AI) with glowing inlays.
 * 5. 3D Articulated Treasure Chest with rotating lid, glowing resume scroll, and leaping troll arc.
 * 6. 3D Monolith Gate Portals ("BACK" to Intro, "PROJECTS" forward).
 */

(function () {
    "use strict";

    const LevelAbout3D = {
        meshes: [],
        crates: [],
        spikes: [],
        chestRoot: null,
        chestLid: null,
        resumeScroll: null,
        idCardMesh: null,
        pitTrapMesh: null,
        backGateMesh: null,
        projectsGateMesh: null,

        build: function (scene) {
            this.dispose();

            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            const screenW = typeof width === "function" ? width() : 1280;
            const screenH = typeof height === "function" ? height() : 720;
            const floorH = screenH * 0.2;
            const floorTop2D = screenH - floorH;
            const floorTop3D = Engine3D.to3DY(floorTop2D);

            const LEFT_MARGIN = (screenW * 0.05) + 150;
            const startX = LEFT_MARGIN + 460 + 350;
            const gap = 120;
            const cratesCenterX = startX + (gap * 1.5);
            const chestX = cratesCenterX + 500;
            const pitWidth = 60;
            const pitX = chestX - 180;

            // 1. MATERIAL PALETTES
            const obsidianMat = new BABYLON.PBRMaterial("mat_obsidian_about", scene);
            obsidianMat.albedoColor = new BABYLON.Color3(0.08, 0.07, 0.09);
            obsidianMat.metallic = 0.85;
            obsidianMat.roughness = 0.25;

            const goldMat = new BABYLON.PBRMaterial("mat_gold_about", scene);
            goldMat.albedoColor = new BABYLON.Color3(0.95, 0.75, 0.2);
            goldMat.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.05);
            goldMat.metallic = 0.95;
            goldMat.roughness = 0.15;

            const holographicMat = new BABYLON.PBRMaterial("mat_hologram_card", scene);
            holographicMat.albedoColor = new BABYLON.Color3(0.1, 0.2, 0.35);
            holographicMat.emissiveColor = new BABYLON.Color3(0.15, 0.35, 0.6);
            holographicMat.alpha = 0.75;
            holographicMat.metallic = 0.2;
            holographicMat.roughness = 0.1;

            const spikeMat = new BABYLON.PBRMaterial("mat_spike_about", scene);
            spikeMat.albedoColor = new BABYLON.Color3(0.85, 0.1, 0.1);
            spikeMat.emissiveColor = new BABYLON.Color3(0.4, 0.05, 0.05);
            spikeMat.metallic = 0.9;
            spikeMat.roughness = 0.2;

            // 2. SPLIT FLOORS (Floor 1: 0 to pitX, Floor 2: pitX + pitWidth to 4*width)
            // Floor 1
            const f1Width2D = pitX;
            const f1Center2D = f1Width2D / 2;
            const f1Width3D = Math.abs(Engine3D.to3DX(f1Width2D) - Engine3D.to3DX(0));
            const f1 = BABYLON.MeshBuilder.CreateBox("floor1_3D", {
                width: f1Width3D,
                height: 15,
                depth: 8
            }, scene);
            f1.position = new BABYLON.Vector3(Engine3D.to3DX(f1Center2D), floorTop3D - 7.5, 0);
            f1.material = obsidianMat;
            f1.receiveShadows = true;
            this.meshes.push(f1);

            // Floor 2
            const f2Start2D = pitX + pitWidth;
            const f2End2D = screenW * 4;
            const f2Width2D = f2End2D - f2Start2D;
            const f2Center2D = f2Start2D + (f2Width2D / 2);
            const f2Width3D = Math.abs(Engine3D.to3DX(f2End2D) - Engine3D.to3DX(f2Start2D));
            const f2 = BABYLON.MeshBuilder.CreateBox("floor2_3D", {
                width: f2Width3D,
                height: 15,
                depth: 8
            }, scene);
            f2.position = new BABYLON.Vector3(Engine3D.to3DX(f2Center2D), floorTop3D - 7.5, 0);
            f2.material = obsidianMat;
            f2.receiveShadows = true;
            this.meshes.push(f2);

            // 3. FLOATING HOLOGRAPHIC ID CARD PEDESTAL (at LEFT_MARGIN)
            const cardW2D = 460;
            const cardH2D = 320;
            const cardX2D = LEFT_MARGIN + (cardW2D / 2);
            const cardY2D = screenH * 0.25 + (cardH2D / 2);

            const idCard = BABYLON.MeshBuilder.CreateBox("idCard3D", {
                width: Math.abs(Engine3D.to3DX(cardW2D) - Engine3D.to3DX(0)),
                height: Math.abs(Engine3D.to3DY(cardH2D) - Engine3D.to3DY(0)),
                depth: 0.8
            }, scene);
            idCard.position = new BABYLON.Vector3(Engine3D.to3DX(cardX2D), Engine3D.to3DY(cardY2D), 4);
            idCard.material = holographicMat;

            // Rotating holographic ring
            const holoRing = BABYLON.MeshBuilder.CreateTorus("holoRing", {
                diameter: 5,
                thickness: 0.15,
                tessellation: 32
            }, scene);
            holoRing.position = new BABYLON.Vector3(Engine3D.to3DX(cardX2D), Engine3D.to3DY(cardY2D), 3.5);
            holoRing.material = goldMat;
            this.idCardMesh = idCard;
            this.holoRing = holoRing;
            this.meshes.push(idCard, holoRing);

            // 4. 3D HAZARD SPIKES
            const spikePositions2D = [
                LEFT_MARGIN + 350,
                LEFT_MARGIN + 350 + 220
            ];
            spikePositions2D.forEach((spX, idx) => {
                for (let s = 0; s < 3; s++) {
                    const spike = BABYLON.MeshBuilder.CreateCylinder("spike_" + idx + "_" + s, {
                        diameterTop: 0,
                        diameterBottom: 1.2,
                        height: 2.2,
                        tessellation: 4
                    }, scene);
                    spike.position = new BABYLON.Vector3(Engine3D.to3DX(spX + (s * 30)), floorTop3D + 1.1, 0);
                    spike.rotation.y = Math.PI / 4;
                    spike.material = spikeMat;
                    if (Engine3D.shadowGenerator) Engine3D.shadowGenerator.addShadowCaster(spike);
                    this.spikes.push(spike);
                    this.meshes.push(spike);
                }
            });

            // 5. 3D SKILL CRATES (Fi, Ps, </>, AI)
            const skillColors = [
                new BABYLON.Color3(0.95, 0.3, 0.1),  // Figma Orange
                new BABYLON.Color3(0.19, 0.65, 1.0), // Photoshop Cyan
                new BABYLON.Color3(0.1, 0.95, 0.2),  // Code Green
                new BABYLON.Color3(0.58, 0.2, 0.92)  // AI Purple
            ];

            this.crates = [];
            for (let i = 0; i < 4; i++) {
                const cx2D = startX + (i * gap);
                const crateRoot = new BABYLON.TransformNode("crateRoot_" + i, scene);
                crateRoot.position = new BABYLON.Vector3(Engine3D.to3DX(cx2D), floorTop3D + 1.5, 0);

                const cube = BABYLON.MeshBuilder.CreateBox("crateCube_" + i, {
                    size: 3.0
                }, scene);
                cube.parent = crateRoot;
                cube.material = obsidianMat;
                cube.receiveShadows = true;
                if (Engine3D.shadowGenerator) Engine3D.shadowGenerator.addShadowCaster(cube);

                // Emissive Inlay
                const inlayMat = new BABYLON.PBRMaterial("inlayMat_" + i, scene);
                inlayMat.albedoColor = skillColors[i];
                inlayMat.emissiveColor = skillColors[i].scale(0.8);
                inlayMat.metallic = 0.5;

                const inlay = BABYLON.MeshBuilder.CreateBox("crateInlay_" + i, {
                    width: 2.2,
                    height: 2.2,
                    depth: 3.1
                }, scene);
                inlay.parent = crateRoot;
                inlay.material = inlayMat;

                this.crates.push({ root: crateRoot, cube: cube, inlay: inlay });
                this.meshes.push(cube, inlay);
            }

            // 6. 3D TREASURE CHEST (Maroon & Gold PBR)
            const chestMat = new BABYLON.PBRMaterial("mat_chest_about", scene);
            chestMat.albedoColor = new BABYLON.Color3(0.75, 0.22, 0.17);
            chestMat.metallic = 0.3;
            chestMat.roughness = 0.4;

            this.chestRoot = new BABYLON.TransformNode("chestRoot3D", scene);
            this.chestRoot.position = new BABYLON.Vector3(Engine3D.to3DX(chestX), floorTop3D + 1.0, 0);

            const chestBase = BABYLON.MeshBuilder.CreateBox("chestBase3D", {
                width: 2.8,
                height: 1.8,
                depth: 2.0
            }, scene);
            chestBase.parent = this.chestRoot;
            chestBase.material = chestMat;
            if (Engine3D.shadowGenerator) Engine3D.shadowGenerator.addShadowCaster(chestBase);

            this.chestLid = BABYLON.MeshBuilder.CreateCylinder("chestLid3D", {
                diameter: 2.0,
                height: 2.8,
                arc: 0.5,
                tessellation: 16
            }, scene);
            this.chestLid.parent = this.chestRoot;
            this.chestLid.position = new BABYLON.Vector3(0, 0.9, 0);
            this.chestLid.rotation.z = Math.PI / 2;
            this.chestLid.material = goldMat;

            // Resume Scroll inside chest
            const scrollMat = new BABYLON.PBRMaterial("mat_scroll_about", scene);
            scrollMat.albedoColor = new BABYLON.Color3(1, 1, 0.95);
            scrollMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.2);
            this.resumeScroll = BABYLON.MeshBuilder.CreateCylinder("resumeScroll3D", {
                diameter: 0.6,
                height: 2.2
            }, scene);
            this.resumeScroll.parent = this.chestRoot;
            this.resumeScroll.position = new BABYLON.Vector3(0, 0.5, 0);
            this.resumeScroll.material = scrollMat;
            this.resumeScroll.setEnabled(false);

            this.meshes.push(chestBase, this.chestLid, this.resumeScroll);

            // 7. 3D MONOLITH GATES ("BACK" & "PROJECTS")
            const gatesStartX = chestX + 300;
            const gateGap = 200;

            const gateMat = new BABYLON.PBRMaterial("mat_about_gate", scene);
            gateMat.albedoColor = new BABYLON.Color3(0.12, 0.12, 0.16);
            gateMat.metallic = 0.9;
            gateMat.roughness = 0.15;

            for (let g = 0; g < 2; g++) {
                const gx2D = gatesStartX + (g * gateGap);
                const gRoot = new BABYLON.TransformNode("aboutGateRoot_" + g, scene);
                gRoot.position = new BABYLON.Vector3(Engine3D.to3DX(gx2D), floorTop3D + 3.0, 0);

                // Arch Pillars
                const pL = BABYLON.MeshBuilder.CreateBox("gatePL_" + g, { width: 0.6, height: 6.0, depth: 0.8 }, scene);
                pL.position.x = -1.8;
                pL.parent = gRoot;
                pL.material = gateMat;

                const pR = BABYLON.MeshBuilder.CreateBox("gatePR_" + g, { width: 0.6, height: 6.0, depth: 0.8 }, scene);
                pR.position.x = 1.8;
                pR.parent = gRoot;
                pR.material = gateMat;

                const topBar = BABYLON.MeshBuilder.CreateBox("gateTop_" + g, { width: 4.2, height: 0.8, depth: 0.8 }, scene);
                topBar.position.y = 3.0;
                topBar.parent = gRoot;
                topBar.material = gateMat;

                // Glowing Portal Vortex
                const vortexMat = new BABYLON.PBRMaterial("vortexMat_" + g, scene);
                vortexMat.albedoColor = g === 0 ? new BABYLON.Color3(0.1, 0.5, 0.9) : new BABYLON.Color3(0.95, 0.7, 0.1);
                vortexMat.emissiveColor = g === 0 ? new BABYLON.Color3(0.1, 0.4, 0.8) : new BABYLON.Color3(0.8, 0.5, 0.05);
                vortexMat.alpha = 0.7;

                const portal = BABYLON.MeshBuilder.CreatePlane("portalDisc_" + g, { width: 3.0, height: 5.2 }, scene);
                portal.parent = gRoot;
                portal.material = vortexMat;

                this.meshes.push(pL, pR, topBar, portal);
            }

            console.log("3D About Level Environment & Monoliths Constructed.");
        },

        update: function (scene, guy) {
            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            // 1. Holographic ID Card gentle hover
            if (this.idCardMesh) {
                const t = performance.now() * 0.0015;
                this.idCardMesh.position.y += Math.sin(t) * 0.004;
                if (this.holoRing) {
                    this.holoRing.rotation.z += 0.015;
                    this.holoRing.rotation.x = Math.sin(t * 0.8) * 0.3;
                }
            }

            // 2. Synchronize Chest with Kaboom chestBody
            if (this.chestRoot && typeof get === "function") {
                const chest2D = get("chest")[0];
                if (chest2D) {
                    this.chestRoot.position.x = Engine3D.to3DX(chest2D.pos.x);
                    this.chestRoot.position.y = Engine3D.to3DY(chest2D.pos.y) + 1.0;
                }
            }

            // 3. Synchronize camera tracking with Kaboom camPos()
            if (typeof camPos === "function" && Engine3D.camera) {
                const cp = camPos();
                const camTargetX = Engine3D.to3DX(cp.x);
                Engine3D.camera.target.x = BABYLON.Scalar.Lerp(Engine3D.camera.target.x, camTargetX, 0.1);
                Engine3D.camera.position.x = Engine3D.camera.target.x;
            }
        },

        dispose: function () {
            this.meshes.forEach(m => {
                if (m) m.dispose();
            });
            this.meshes = [];
            this.crates = [];
            this.spikes = [];
            this.chestRoot = null;
            this.chestLid = null;
            this.resumeScroll = null;
            this.idCardMesh = null;
            this.holoRing = null;
        }
    };

    window.LevelAbout3D = LevelAbout3D;
})();
