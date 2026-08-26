/**
 * LevelProjects3D - Babylon.js 2.5D Presentation Layer for Projects Level
 * 
 * Features:
 * 1. PBR Obsidian Archipelago: Floating modular island platforms.
 * 2. 3D Fluid Lava River: Dynamic glowing molten magma plane with emissive pulsation.
 * 3. 3D Mechanical Jump Pads: Chrome & Crimson compression spring pads.
 * 4. 3D Project Monolith Crates with emissive badges and floating rotation.
 * 5. Monolith Exit Portals ("BACK" to About, "CONTACT" forward).
 */

(function () {
    "use strict";

    const LevelProjects3D = {
        meshes: [],
        lavaMesh: null,
        jumpPads: [],
        projectCrates: [],
        volcanoSparks: null,

        build: function (scene) {
            this.dispose();

            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            const screenW = typeof width === "function" ? width() : 1280;
            const screenH = typeof height === "function" ? height() : 720;
            const floorH = screenH * 0.2;
            const floorTop2D = screenH - floorH;
            const floorTop3D = Engine3D.to3DY(floorTop2D);
            const worldWidth = 10000;

            // 1. MATERIAL PALETTES
            const obsidianMat = new BABYLON.PBRMaterial("mat_obsidian_proj", scene);
            obsidianMat.albedoColor = new BABYLON.Color3(0.06, 0.05, 0.08);
            obsidianMat.metallic = 0.9;
            obsidianMat.roughness = 0.2;

            const goldMat = new BABYLON.PBRMaterial("mat_gold_proj", scene);
            goldMat.albedoColor = new BABYLON.Color3(0.95, 0.75, 0.2);
            goldMat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.05);
            goldMat.metallic = 0.95;
            goldMat.roughness = 0.15;

            // Molten Lava Material
            const lavaMat = new BABYLON.PBRMaterial("mat_lava_proj", scene);
            lavaMat.albedoColor = new BABYLON.Color3(0.9, 0.2, 0.05);
            lavaMat.emissiveColor = new BABYLON.Color3(0.8, 0.15, 0.02);
            lavaMat.metallic = 0.1;
            lavaMat.roughness = 0.6;

            // 2. MAIN GROUND & ARCHIPELAGO
            const groundW3D = Math.abs(Engine3D.to3DX(worldWidth) - Engine3D.to3DX(0));
            const ground = BABYLON.MeshBuilder.CreateBox("ground_proj_3D", {
                width: groundW3D,
                height: 15,
                depth: 8
            }, scene);
            ground.position = new BABYLON.Vector3(Engine3D.to3DX(worldWidth / 2), floorTop3D - 7.5, 0);
            ground.material = obsidianMat;
            ground.receiveShadows = true;
            this.meshes.push(ground);

            // 3. 3D MOLTEN LAVA RIVER
            const lavaRiver = BABYLON.MeshBuilder.CreateBox("lavaRiver3D", {
                width: groundW3D * 0.5,
                height: 4,
                depth: 10
            }, scene);
            lavaRiver.position = new BABYLON.Vector3(Engine3D.to3DX(1500), floorTop3D - 1.5, 0.5);
            lavaRiver.material = lavaMat;
            this.lavaMesh = lavaRiver;
            this.meshes.push(lavaRiver);

            // 4. 3D JUMP PADS (Spring Plungers)
            const padLocations = [400, 800, 1200, 1600, 2000, 2400];
            this.jumpPads = [];
            padLocations.forEach((px2D, idx) => {
                const padRoot = new BABYLON.TransformNode("jumpPadRoot_" + idx, scene);
                padRoot.position = new BABYLON.Vector3(Engine3D.to3DX(px2D), floorTop3D + 0.3, 0);

                const base = BABYLON.MeshBuilder.CreateCylinder("padBase_" + idx, {
                    diameter: 2.2,
                    height: 0.4
                }, scene);
                base.parent = padRoot;
                base.material = obsidianMat;

                const springTop = BABYLON.MeshBuilder.CreateCylinder("padTop_" + idx, {
                    diameter: 2.0,
                    height: 0.3
                }, scene);
                springTop.parent = padRoot;
                springTop.position.y = 0.3;

                const redMat = new BABYLON.PBRMaterial("mat_pad_red_" + idx, scene);
                redMat.albedoColor = new BABYLON.Color3(0.9, 0.1, 0.1);
                redMat.emissiveColor = new BABYLON.Color3(0.3, 0.05, 0.05);
                springTop.material = redMat;

                this.jumpPads.push({ root: padRoot, top: springTop });
                this.meshes.push(base, springTop);
            });

            // 5. 3D PROJECT CRATES / MONOLITHS
            const projectXPositions = [600, 1000, 1400, 1800, 2200];
            const projectThemes = [
                new BABYLON.Color3(0.95, 0.45, 0.1), // Paw / Warm
                new BABYLON.Color3(0.1, 0.7, 0.95),  // Cart / Cyan
                new BABYLON.Color3(0.2, 0.95, 0.4),  // Code / Green
                new BABYLON.Color3(0.8, 0.2, 0.9),   // UI / Violet
                new BABYLON.Color3(0.95, 0.8, 0.2)   // Showcase / Gold
            ];

            this.projectCrates = [];
            projectXPositions.forEach((cx2D, idx) => {
                const crateRoot = new BABYLON.TransformNode("projCrateRoot_" + idx, scene);
                crateRoot.position = new BABYLON.Vector3(Engine3D.to3DX(cx2D), floorTop3D + 4.0, 0);

                const crateCube = BABYLON.MeshBuilder.CreateBox("projCube_" + idx, {
                    size: 3.5
                }, scene);
                crateCube.parent = crateRoot;
                crateCube.material = obsidianMat;
                crateCube.receiveShadows = true;
                if (Engine3D.shadowGenerator) Engine3D.shadowGenerator.addShadowCaster(crateCube);

                // Emissive Trim
                const trimMat = new BABYLON.PBRMaterial("mat_proj_trim_" + idx, scene);
                trimMat.albedoColor = projectThemes[idx % projectThemes.length];
                trimMat.emissiveColor = projectThemes[idx % projectThemes.length].scale(0.8);

                const trim = BABYLON.MeshBuilder.CreateBox("projTrim_" + idx, {
                    width: 3.6,
                    height: 0.4,
                    depth: 3.6
                }, scene);
                trim.parent = crateRoot;
                trim.material = trimMat;

                this.projectCrates.push({ root: crateRoot, cube: crateCube, trim: trim });
                this.meshes.push(crateCube, trim);
            });

            // 6. 3D EXIT MONOLITH GATES ("BACK" & "CONTACT")
            const exitX = 2900;
            const gateMat = new BABYLON.PBRMaterial("mat_proj_gate", scene);
            gateMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.14);
            gateMat.metallic = 0.95;
            gateMat.roughness = 0.15;

            [0, 1].forEach(g => {
                const gx2D = exitX + (g * 220);
                const gRoot = new BABYLON.TransformNode("projGateRoot_" + g, scene);
                gRoot.position = new BABYLON.Vector3(Engine3D.to3DX(gx2D), floorTop3D + 3.0, 0);

                const archL = BABYLON.MeshBuilder.CreateBox("projArchL_" + g, { width: 0.6, height: 6.0, depth: 0.8 }, scene);
                archL.position.x = -1.8;
                archL.parent = gRoot;
                archL.material = gateMat;

                const archR = BABYLON.MeshBuilder.CreateBox("projArchR_" + g, { width: 0.6, height: 6.0, depth: 0.8 }, scene);
                archR.position.x = 1.8;
                archR.parent = gRoot;
                archR.material = gateMat;

                const archTop = BABYLON.MeshBuilder.CreateBox("projArchTop_" + g, { width: 4.2, height: 0.8, depth: 0.8 }, scene);
                archTop.position.y = 3.0;
                archTop.parent = gRoot;
                archTop.material = gateMat;

                const vortexMat = new BABYLON.PBRMaterial("projVortexMat_" + g, scene);
                vortexMat.albedoColor = g === 0 ? new BABYLON.Color3(0.9, 0.5, 0.1) : new BABYLON.Color3(0.1, 0.9, 0.5);
                vortexMat.emissiveColor = g === 0 ? new BABYLON.Color3(0.6, 0.3, 0.05) : new BABYLON.Color3(0.05, 0.6, 0.3);
                vortexMat.alpha = 0.75;

                const portal = BABYLON.MeshBuilder.CreatePlane("projPortal_" + g, { width: 3.0, height: 5.2 }, scene);
                portal.parent = gRoot;
                portal.material = vortexMat;

                this.meshes.push(archL, archR, archTop, portal);
            });

            console.log("3D Projects Level Environment & Archipelago Constructed.");
        },

        update: function (scene, guy) {
            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            const t = performance.now() * 0.001;

            // 1. Lava Pulsation
            if (this.lavaMesh && this.lavaMesh.material) {
                const glow = 0.6 + Math.sin(t * 3.0) * 0.2;
                this.lavaMesh.material.emissiveColor = new BABYLON.Color3(0.8 * glow, 0.15 * glow, 0.02);
            }

            // 2. Project Crates gentle float & rotation
            this.projectCrates.forEach((crate, i) => {
                if (crate.root) {
                    crate.root.rotation.y = Math.sin(t + i) * 0.2;
                    crate.root.position.y += Math.sin(t * 2.0 + i) * 0.005;
                }
            });

            // 3. Camera sync with Kaboom camPos()
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
            this.lavaMesh = null;
            this.jumpPads = [];
            this.projectCrates = [];
        }
    };

    window.LevelProjects3D = LevelProjects3D;
})();
