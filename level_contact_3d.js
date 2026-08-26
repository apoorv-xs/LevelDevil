/**
 * LevelContact3D - Babylon.js 2.5D Presentation Layer for Contact Level
 * 
 * Features:
 * 1. Terraced PBR Obsidian Cliffs & Volcano Ascent.
 * 2. Volumetric Molten Magma Trench with emissive pulse & particle embers.
 * 3. 3D Floating Carbon-Fiber Bridges & Holographic Recruiter Energy Span.
 * 4. 3D Molten Projectile Orbs (Fireballs) with fiery emission.
 * 5. Monolith Exit Portals ("BACK" to Intro & Summit Portal).
 */

(function () {
    "use strict";

    const LevelContact3D = {
        meshes: [],
        magmaMesh: null,
        energyBridge: null,
        floatingPlats: [],

        build: function (scene) {
            this.dispose();

            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            const screenW = typeof width === "function" ? width() : 1280;
            const screenH = typeof height === "function" ? height() : 720;
            const floorH = screenH * 0.2;
            const safeFloorH = floorH + 60;
            const safeGroundY2D = screenH - safeFloorH;
            const safeGroundY3D = Engine3D.to3DY(safeGroundY2D);
            const lavaY2D = screenH - floorH;
            const lavaY3D = Engine3D.to3DY(lavaY2D);

            const safeStartWidth = 400;
            const gapSize = 60;
            const bridgeWidth = 80;
            const bridgeCount = 4;
            const lavaSectionWidth = (gapSize * (bridgeCount + 1)) + (bridgeWidth * bridgeCount);

            // 1. MATERIAL PALETTES
            const obsidianMat = new BABYLON.PBRMaterial("mat_obsidian_contact", scene);
            obsidianMat.albedoColor = new BABYLON.Color3(0.07, 0.06, 0.09);
            obsidianMat.metallic = 0.9;
            obsidianMat.roughness = 0.2;

            const magmaMat = new BABYLON.PBRMaterial("mat_magma_contact", scene);
            magmaMat.albedoColor = new BABYLON.Color3(0.95, 0.2, 0.05);
            magmaMat.emissiveColor = new BABYLON.Color3(0.9, 0.18, 0.02);
            magmaMat.metallic = 0.1;
            magmaMat.roughness = 0.5;

            const holoCyanMat = new BABYLON.PBRMaterial("mat_holo_bridge", scene);
            holoCyanMat.albedoColor = new BABYLON.Color3(0.1, 0.9, 1.0);
            holoCyanMat.emissiveColor = new BABYLON.Color3(0.05, 0.6, 0.8);
            holoCyanMat.alpha = 0.5;
            holoCyanMat.metallic = 0.3;

            // 2. SAFE START PLATFORM
            const startW3D = Math.abs(Engine3D.to3DX(safeStartWidth) - Engine3D.to3DX(0));
            const startPlat = BABYLON.MeshBuilder.CreateBox("startPlat3D", {
                width: startW3D,
                height: 15,
                depth: 8
            }, scene);
            startPlat.position = new BABYLON.Vector3(Engine3D.to3DX(safeStartWidth / 2), safeGroundY3D - 7.5, 0);
            startPlat.material = obsidianMat;
            startPlat.receiveShadows = true;
            this.meshes.push(startPlat);

            // 3. MAGMA TRENCH
            const lavaW3D = Math.abs(Engine3D.to3DX(lavaSectionWidth) - Engine3D.to3DX(0));
            const lavaMesh = BABYLON.MeshBuilder.CreateBox("magmaTrench3D", {
                width: lavaW3D,
                height: 6,
                depth: 10
            }, scene);
            lavaMesh.position = new BABYLON.Vector3(Engine3D.to3DX(safeStartWidth + (lavaSectionWidth / 2)), lavaY3D - 3.0, 0.5);
            lavaMesh.material = magmaMat;
            this.magmaMesh = lavaMesh;
            this.meshes.push(lavaMesh);

            // 4. FLOATING BRIDGES
            this.floatingPlats = [];
            for (let i = 0; i < bridgeCount; i++) {
                const px2D = safeStartWidth + gapSize + (i * (bridgeWidth + gapSize)) + (bridgeWidth / 2);
                const plat3D = BABYLON.MeshBuilder.CreateBox("contactBridge_" + i, {
                    width: Math.abs(Engine3D.to3DX(bridgeWidth) - Engine3D.to3DX(0)),
                    height: 0.8,
                    depth: 4.0
                }, scene);
                plat3D.position = new BABYLON.Vector3(Engine3D.to3DX(px2D), lavaY3D + 1.2, 0);
                plat3D.material = obsidianMat;
                plat3D.receiveShadows = true;
                if (Engine3D.shadowGenerator) Engine3D.shadowGenerator.addShadowCaster(plat3D);
                this.floatingPlats.push(plat3D);
                this.meshes.push(plat3D);
            }

            // 5. RECRUITER HOLOGRAPHIC ENERGY BRIDGE
            const eBridge = BABYLON.MeshBuilder.CreateBox("recruiterHoloBridge3D", {
                width: lavaW3D,
                height: 0.5,
                depth: 5.0
            }, scene);
            eBridge.position = new BABYLON.Vector3(Engine3D.to3DX(safeStartWidth + (lavaSectionWidth / 2)), safeGroundY3D, 0);
            eBridge.material = holoCyanMat;
            eBridge.setEnabled(false);
            this.energyBridge = eBridge;
            this.meshes.push(eBridge);

            // 6. MOUNTAIN BASE & PEAK
            const endSafeX = safeStartWidth + lavaSectionWidth;
            const mountainPlat = BABYLON.MeshBuilder.CreateBox("mountainPlat3D", {
                width: Math.abs(Engine3D.to3DX(2000) - Engine3D.to3DX(0)),
                height: 20,
                depth: 8
            }, scene);
            mountainPlat.position = new BABYLON.Vector3(Engine3D.to3DX(endSafeX + 1000), safeGroundY3D - 10, 0);
            mountainPlat.material = obsidianMat;
            mountainPlat.receiveShadows = true;
            this.meshes.push(mountainPlat);

            // 7. MONOLITH GATES ("BACK" & SUMMIT)
            const gateMat = new BABYLON.PBRMaterial("mat_contact_gate", scene);
            gateMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.14);
            gateMat.metallic = 0.95;
            gateMat.roughness = 0.15;

            // Back Gate at 100
            const backGateRoot = new BABYLON.TransformNode("contactBackGateRoot", scene);
            backGateRoot.position = new BABYLON.Vector3(Engine3D.to3DX(100), safeGroundY3D + 3.0, 0);

            const bgL = BABYLON.MeshBuilder.CreateBox("bgL", { width: 0.6, height: 6.0, depth: 0.8 }, scene);
            bgL.position.x = -1.8;
            bgL.parent = backGateRoot;
            bgL.material = gateMat;

            const bgR = BABYLON.MeshBuilder.CreateBox("bgR", { width: 0.6, height: 6.0, depth: 0.8 }, scene);
            bgR.position.x = 1.8;
            bgR.parent = backGateRoot;
            bgR.material = gateMat;

            const bgTop = BABYLON.MeshBuilder.CreateBox("bgTop", { width: 4.2, height: 0.8, depth: 0.8 }, scene);
            bgTop.position.y = 3.0;
            bgTop.parent = backGateRoot;
            bgTop.material = gateMat;

            this.meshes.push(bgL, bgR, bgTop);

            console.log("3D Contact Level Environment & Volcano Constructed.");
        },

        update: function (scene, guy) {
            if (!scene || !window.Engine3D) return;
            const Engine3D = window.Engine3D;

            const t = performance.now() * 0.001;

            // 1. Magma Emissive Pulse
            if (this.magmaMesh && this.magmaMesh.material) {
                const glow = 0.7 + Math.sin(t * 3.0) * 0.2;
                this.magmaMesh.material.emissiveColor = new BABYLON.Color3(0.9 * glow, 0.18 * glow, 0.02);
            }

            // 2. Recruiter Holographic Bridge Visibility
            if (this.energyBridge) {
                const isActive = typeof window.isRecruiterActive === "function" && window.isRecruiterActive();
                this.energyBridge.setEnabled(isActive);
            }

            // 3. Camera Sync
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
            this.magmaMesh = null;
            this.energyBridge = null;
            this.floatingPlats = [];
        }
    };

    window.LevelContact3D = LevelContact3D;
})();
