// player_3d.js - Expressive 3D "Little Guy" Protagonist for Level Devil Remaster
(function () {
    "use strict";

    const Player3D = {
        root: null,
        torso: null,
        head: null,
        leftEye: null,
        rightEye: null,
        leftPupil: null,
        rightPupil: null,
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null,
        haloRing: null,
        isCreated: false,
        blinkTimer: 0,
        isShocked: false,

        create(scene) {
            if (!scene || this.isCreated) return;

            // 1. Root Node
            this.root = new BABYLON.TransformNode("player3DRoot", scene);

            // 2. Tactile Materials
            // Character Body: Dark Clay Charcoal with soft bevel specular highlights
            const clayMat = new BABYLON.PBRMaterial("heroClayMat", scene);
            clayMat.albedoColor = new BABYLON.Color3(0.12, 0.12, 0.14);
            clayMat.metallic = 0.1;
            clayMat.roughness = 0.65;

            // Expressive Glowing Eyes
            const eyeMat = new BABYLON.StandardMaterial("heroEyeMat", scene);
            eyeMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            eyeMat.emissiveColor = new BABYLON.Color3(0.95, 0.95, 0.95);

            const pupilMat = new BABYLON.StandardMaterial("heroPupilMat", scene);
            pupilMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);

            // Recruiter Gold Halo Material
            const haloMat = new BABYLON.StandardMaterial("heroHaloMat", scene);
            haloMat.diffuseColor = new BABYLON.Color3(1.0, 0.85, 0.2);
            haloMat.emissiveColor = new BABYLON.Color3(0.9, 0.7, 0.1);

            // 3. Body Construction
            // Torso (Y: ~0.8 to 1.6)
            this.torso = BABYLON.MeshBuilder.CreateBox("heroTorso", { width: 0.85, height: 0.95, depth: 0.6 }, scene);
            this.torso.position.y = 1.05;
            this.torso.material = clayMat;
            this.torso.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.torso);

            // Head (Y: ~1.7 to 2.4)
            this.head = BABYLON.MeshBuilder.CreateBox("heroHead", { width: 0.75, height: 0.75, depth: 0.75 }, scene);
            this.head.position.y = 1.95;
            this.head.material = clayMat;
            this.head.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.head);

            // Left Eye
            this.leftEye = BABYLON.MeshBuilder.CreatePlane("heroEyeL", { width: 0.18, height: 0.22 }, scene);
            this.leftEye.position = new BABYLON.Vector3(-0.2, 1.98, 0.38);
            this.leftEye.material = eyeMat;
            this.leftEye.parent = this.root;

            this.leftPupil = BABYLON.MeshBuilder.CreatePlane("heroPupilL", { width: 0.08, height: 0.1 }, scene);
            this.leftPupil.position = new BABYLON.Vector3(-0.2, 1.98, 0.39);
            this.leftPupil.material = pupilMat;
            this.leftPupil.parent = this.root;

            // Right Eye
            this.rightEye = BABYLON.MeshBuilder.CreatePlane("heroEyeR", { width: 0.18, height: 0.22 }, scene);
            this.rightEye.position = new BABYLON.Vector3(0.2, 1.98, 0.38);
            this.rightEye.material = eyeMat;
            this.rightEye.parent = this.root;

            this.rightPupil = BABYLON.MeshBuilder.CreatePlane("heroPupilR", { width: 0.08, height: 0.1 }, scene);
            this.rightPupil.position = new BABYLON.Vector3(0.2, 1.98, 0.39);
            this.rightPupil.material = pupilMat;
            this.rightPupil.parent = this.root;

            // Left Arm
            this.leftArm = BABYLON.MeshBuilder.CreateBox("heroArmL", { width: 0.24, height: 0.75, depth: 0.28 }, scene);
            this.leftArm.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.leftArm.position = new BABYLON.Vector3(-0.55, 1.35, 0);
            this.leftArm.material = clayMat;
            this.leftArm.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.leftArm);

            // Right Arm
            this.rightArm = BABYLON.MeshBuilder.CreateBox("heroArmR", { width: 0.24, height: 0.75, depth: 0.28 }, scene);
            this.rightArm.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.rightArm.position = new BABYLON.Vector3(0.55, 1.35, 0);
            this.rightArm.material = clayMat;
            this.rightArm.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.rightArm);

            // Left Leg
            this.leftLeg = BABYLON.MeshBuilder.CreateBox("heroLegL", { width: 0.28, height: 0.75, depth: 0.3 }, scene);
            this.leftLeg.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.leftLeg.position = new BABYLON.Vector3(-0.24, 0.5, 0);
            this.leftLeg.material = clayMat;
            this.leftLeg.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.leftLeg);

            // Right Leg
            this.rightLeg = BABYLON.MeshBuilder.CreateBox("heroLegR", { width: 0.28, height: 0.75, depth: 0.3 }, scene);
            this.rightLeg.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.rightLeg.position = new BABYLON.Vector3(0.24, 0.5, 0);
            this.rightLeg.material = clayMat;
            this.rightLeg.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.rightLeg);

            // Recruiter Gold Halo (Torus)
            this.haloRing = BABYLON.MeshBuilder.CreateTorus("heroHalo", { diameter: 1.2, thickness: 0.12, tessellation: 24 }, scene);
            this.haloRing.position = new BABYLON.Vector3(0, 2.65, 0);
            this.haloRing.rotation.x = Math.PI / 6;
            this.haloRing.material = haloMat;
            this.haloRing.parent = this.root;
            this.haloRing.setEnabled(false);

            this.isCreated = true;
        },

        // --- REAL-TIME FRAME SYNCHRONIZATION WITH 2D PLAYER ---
        syncWith2D(guy) {
            if (!this.isCreated || !guy || !guy.exists || !guy.exists()) {
                if (this.root) this.root.setEnabled(false);
                return;
            }

            this.root.setEnabled(true);

            // 1. Coordinate Sync
            const targetPos = Engine3D.to3DVec(guy.pos.x, guy.pos.y, 0);
            this.root.position.x = targetPos.x;
            this.root.position.y = targetPos.y;

            // 2. Facing & Scale
            const isFacingLeft = guy.facingLeft || (guy.scale && guy.scale.x < 0);
            const scaleY = (guy.scale && guy.scale.y) ? guy.scale.y : 1.0;
            const scaleX = (guy.scale && guy.scale.x) ? Math.abs(guy.scale.x) : 1.0;

            this.root.scaling.x = (isFacingLeft ? -1 : 1) * scaleX;
            this.root.scaling.y = scaleY;

            // 3. Animation State
            const t = (typeof time === "function") ? time() : performance.now() * 0.001;
            const isGrounded = (typeof guy.isGrounded === "function") ? guy.isGrounded() : true;
            const isMoving = (typeof isKeyDown === "function") && (isKeyDown("left") || isKeyDown("right"));

            // Eye Blinking Logic
            this.blinkTimer += 0.016;
            if (this.blinkTimer > 3.0) {
                this.leftEye.scaling.y = 0.1;
                this.rightEye.scaling.y = 0.1;
                this.leftPupil.scaling.y = 0.1;
                this.rightPupil.scaling.y = 0.1;
                if (this.blinkTimer > 3.15) {
                    this.leftEye.scaling.y = 1.0;
                    this.rightEye.scaling.y = 1.0;
                    this.leftPupil.scaling.y = 1.0;
                    this.rightPupil.scaling.y = 1.0;
                    this.blinkTimer = 0;
                }
            }

            if (!isGrounded) {
                // Airborne Cheer Pose
                this.leftArm.rotation.z = 2.4;
                this.rightArm.rotation.z = -2.4;
                this.leftLeg.rotation.x = 0.5;
                this.rightLeg.rotation.x = -0.5;
                this.root.rotation.z = 0;
                // Wide Excited Eyes
                this.leftEye.scaling.set(1.2, 1.2, 1.2);
                this.rightEye.scaling.set(1.2, 1.2, 1.2);
            } else if (isMoving) {
                // Running Walk Cycle with Dynamic Forward Lean (12 degrees)
                const runCycle = Math.sin(t * 15);
                this.leftLeg.rotation.x = runCycle * 0.8;
                this.rightLeg.rotation.x = -runCycle * 0.8;
                this.leftArm.rotation.x = -runCycle * 0.7;
                this.rightArm.rotation.x = runCycle * 0.7;
                this.leftArm.rotation.z = 0.1;
                this.rightArm.rotation.z = -0.1;

                // Running Lean
                this.root.rotation.z = (isFacingLeft ? 0.2 : -0.2);
                this.head.position.y = 1.95 + Math.abs(runCycle) * 0.06;

                // Determined squint
                this.leftEye.scaling.set(1.0, 0.85, 1.0);
                this.rightEye.scaling.set(1.0, 0.85, 1.0);
            } else {
                // Idle Breathing
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
                this.leftArm.rotation.x = 0;
                this.rightArm.rotation.x = 0;
                this.leftArm.rotation.z = Math.sin(t * 2.5) * 0.08;
                this.rightArm.rotation.z = -Math.sin(t * 2.5) * 0.08;
                this.root.rotation.z = 0;
                this.head.position.y = 1.95 + Math.sin(t * 2.5) * 0.03;
                this.leftEye.scaling.set(1.0, 1.0, 1.0);
                this.rightEye.scaling.set(1.0, 1.0, 1.0);
            }

            // 4. Recruiter Mode Gold Halo
            if (this.haloRing) {
                const isRecruiter = (window.isRecruiterActive && window.isRecruiterActive());
                this.haloRing.setEnabled(isRecruiter);
                if (isRecruiter) {
                    this.haloRing.rotation.y += 0.03;
                    this.haloRing.position.y = 2.65 + Math.sin(t * 4) * 0.05;
                }
            }
        }
    };

    window.Player3D = Player3D;
})();
