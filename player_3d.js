/**
 * Player3D - Remastered 3D "Little Guy" Protagonist (Babylon.js 2.5D)
 * 
 * Features:
 * 1. Matte Charcoal Silicone/Clay Finish with Contact Shadows.
 * 2. Expressive Animated Eyes: Procedural Blinking, Sprint Squints, Jump Cheer, and Shocked Bug-Eyes (O_O).
 * 3. Procedural Kinematics: 12-degree sprint lean, squash & stretch deformers, and animated cape ribbons.
 * 4. Recruiter Mode Golden Halo & Translucent Shield.
 */

(function () {
    "use strict";

    const Player3D = {
        root: null,
        bodyGroup: null,
        torso: null,
        head: null,
        leftEye: null,
        rightEye: null,
        leftHorn: null,
        rightHorn: null,
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null,
        cape: null,
        shieldSphere: null,
        lastGrounded: true,
        landingSquashTimer: 0,
        blinkTimer: 0,
        isCreated: false,

        create: function (scene) {
            if (!scene || this.isCreated) return;

            const Engine3D = window.Engine3D;

            // 1. Root & Body Group
            this.root = new BABYLON.TransformNode("player3DRoot", scene);
            this.bodyGroup = new BABYLON.TransformNode("player3DBodyGroup", scene);
            this.bodyGroup.parent = this.root;

            // 2. Materials
            // Character Body: Matte Charcoal Clay / Silicone
            const bodyMat = new BABYLON.PBRMaterial("heroClayMat", scene);
            bodyMat.albedoColor = new BABYLON.Color3(0.12, 0.12, 0.15); // Deep Matte Charcoal
            bodyMat.metallic = 0.1;
            bodyMat.roughness = 0.7;

            // Glowing White Expressive Eyes
            const eyeMat = new BABYLON.PBRMaterial("heroEyeMat", scene);
            eyeMat.albedoColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            eyeMat.emissiveColor = new BABYLON.Color3(0.9, 0.9, 0.95);
            eyeMat.roughness = 0.1;

            // Cape Material: Vibrant Crimson
            const capeMat = new BABYLON.PBRMaterial("heroCapeMat", scene);
            capeMat.albedoColor = new BABYLON.Color3(0.85, 0.12, 0.18);
            capeMat.metallic = 0.05;
            capeMat.roughness = 0.6;
            capeMat.backFaceCulling = false;

            // 3. Meshes
            // Torso (Beveled Box)
            this.torso = BABYLON.MeshBuilder.CreateBox("heroTorso", { width: 0.85, height: 1.05, depth: 0.55 }, scene);
            this.torso.position.y = 1.1;
            this.torso.material = bodyMat;
            this.torso.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.torso);

            // Head
            this.head = BABYLON.MeshBuilder.CreateBox("heroHead", { width: 0.75, height: 0.75, depth: 0.7 }, scene);
            this.head.position.y = 2.0;
            this.head.material = bodyMat;
            this.head.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.head);

            // Left & Right Expressive Animated Eyes
            this.leftEye = BABYLON.MeshBuilder.CreatePlane("heroEyeL", { width: 0.18, height: 0.22 }, scene);
            this.leftEye.position = new BABYLON.Vector3(-0.18, 2.05, 0.36);
            this.leftEye.material = eyeMat;
            this.leftEye.parent = this.bodyGroup;

            this.rightEye = BABYLON.MeshBuilder.CreatePlane("heroEyeR", { width: 0.18, height: 0.22 }, scene);
            this.rightEye.position = new BABYLON.Vector3(0.18, 2.05, 0.36);
            this.rightEye.material = eyeMat;
            this.rightEye.parent = this.bodyGroup;

            // Cute Little Devil Horns
            const hornMat = new BABYLON.PBRMaterial("heroHornMat", scene);
            hornMat.albedoColor = new BABYLON.Color3(0.95, 0.2, 0.2);
            hornMat.emissiveColor = new BABYLON.Color3(0.4, 0.05, 0.05);

            this.leftHorn = BABYLON.MeshBuilder.CreateCylinder("heroHornL", { diameterTop: 0, diameterBottom: 0.2, height: 0.4 }, scene);
            this.leftHorn.position = new BABYLON.Vector3(-0.25, 2.45, 0);
            this.leftHorn.rotation.z = -0.3;
            this.leftHorn.material = hornMat;
            this.leftHorn.parent = this.bodyGroup;

            this.rightHorn = BABYLON.MeshBuilder.CreateCylinder("heroHornR", { diameterTop: 0, diameterBottom: 0.2, height: 0.4 }, scene);
            this.rightHorn.position = new BABYLON.Vector3(0.25, 2.45, 0);
            this.rightHorn.rotation.z = 0.3;
            this.rightHorn.material = hornMat;
            this.rightHorn.parent = this.bodyGroup;

            // Left Arm
            this.leftArm = BABYLON.MeshBuilder.CreateBox("heroLeftArm", { width: 0.25, height: 0.8, depth: 0.3 }, scene);
            this.leftArm.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.leftArm.position = new BABYLON.Vector3(-0.6, 1.45, 0);
            this.leftArm.material = bodyMat;
            this.leftArm.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.leftArm);

            // Right Arm
            this.rightArm = BABYLON.MeshBuilder.CreateBox("heroRightArm", { width: 0.25, height: 0.8, depth: 0.3 }, scene);
            this.rightArm.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.rightArm.position = new BABYLON.Vector3(0.6, 1.45, 0);
            this.rightArm.material = bodyMat;
            this.rightArm.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.rightArm);

            // Left Leg
            this.leftLeg = BABYLON.MeshBuilder.CreateBox("heroLeftLeg", { width: 0.28, height: 0.75, depth: 0.3 }, scene);
            this.leftLeg.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.leftLeg.position = new BABYLON.Vector3(-0.24, 0.5, 0);
            this.leftLeg.material = bodyMat;
            this.leftLeg.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.leftLeg);

            // Right Leg
            this.rightLeg = BABYLON.MeshBuilder.CreateBox("heroRightLeg", { width: 0.28, height: 0.75, depth: 0.3 }, scene);
            this.rightLeg.setPivotPoint(new BABYLON.Vector3(0, 0.35, 0));
            this.rightLeg.position = new BABYLON.Vector3(0.24, 0.5, 0);
            this.rightLeg.material = bodyMat;
            this.rightLeg.parent = this.bodyGroup;
            if (Engine3D) Engine3D.addShadowCaster(this.rightLeg);

            // Dynamic Cape
            this.cape = BABYLON.MeshBuilder.CreatePlane("heroCape", { width: 0.75, height: 1.15, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
            this.cape.setPivotPoint(new BABYLON.Vector3(0, 0.55, 0));
            this.cape.position = new BABYLON.Vector3(0, 1.55, -0.32);
            this.cape.material = capeMat;
            this.cape.parent = this.bodyGroup;

            // Recruiter Shield Sphere
            this.shieldSphere = BABYLON.MeshBuilder.CreateSphere("heroShield", { diameter: 3.4 }, scene);
            const shieldMat = new BABYLON.StandardMaterial("heroShieldMat", scene);
            shieldMat.diffuseColor = new BABYLON.Color3(0, 0.9, 1.0);
            shieldMat.emissiveColor = new BABYLON.Color3(0, 0.5, 0.8);
            shieldMat.alpha = 0.25;
            this.shieldSphere.material = shieldMat;
            this.shieldSphere.position.y = 1.3;
            this.shieldSphere.parent = this.root;
            this.shieldSphere.isVisible = false;

            this.isCreated = true;
            console.log("3D Little Guy Character Initialized.");
        },

        syncWith2D: function (guy) {
            if (!this.isCreated || !guy || !guy.exists || !guy.exists()) {
                if (this.root) this.root.setEnabled(false);
                return;
            }

            this.root.setEnabled(true);
            const Engine3D = window.Engine3D;

            // 1. Position Synchronization
            const targetPos = Engine3D.to3DVec(guy.pos.x, guy.pos.y, 0);
            this.root.position.x = targetPos.x;
            this.root.position.y = targetPos.y;

            // 2. Kinematic State Detection
            const isGrounded = (typeof guy.isGrounded === "function") ? guy.isGrounded() : true;
            const isMoving = (typeof isKeyDown === "function") && (isKeyDown("left") || isKeyDown("right"));
            const isFacingLeft = guy.facingLeft || (guy.scale && guy.scale.x < 0);
            const t = performance.now() * 0.001;

            // Landing Impact Detection (Squash Trigger)
            if (!this.lastGrounded && isGrounded) {
                this.landingSquashTimer = 0.15; // 150ms squash
            }
            this.lastGrounded = isGrounded;

            // 3. Direction & Squash/Stretch Deformations
            let scaleX = (isFacingLeft ? -1 : 1);
            let scaleY = 1.0;

            if (this.landingSquashTimer > 0) {
                this.landingSquashTimer -= (1 / 60);
                scaleX *= 1.25;
                scaleY = 0.75;
            } else if (!isGrounded) {
                // High Jump Stretch
                scaleX *= 0.85;
                scaleY = 1.15;
            }

            this.bodyGroup.scaling.x = scaleX;
            this.bodyGroup.scaling.y = scaleY;

            // 4. Procedural Blinking & Eye Expressions
            this.blinkTimer += (1 / 60);
            let eyeScaleY = 1.0;
            let eyeScaleX = 1.0;

            if (this.blinkTimer > 3.5) {
                // Blink closed
                eyeScaleY = 0.1;
                if (this.blinkTimer > 3.65) this.blinkTimer = 0;
            } else if (!isGrounded && guy.vel && guy.vel.y > 400) {
                // Falling / Shocked Eyes (O_O)
                eyeScaleX = 1.4;
                eyeScaleY = 1.4;
            } else if (isMoving) {
                // Sprint Squint
                eyeScaleY = 0.75;
            }

            if (this.leftEye) {
                this.leftEye.scaling.y = eyeScaleY;
                this.leftEye.scaling.x = eyeScaleX;
            }
            if (this.rightEye) {
                this.rightEye.scaling.y = eyeScaleY;
                this.rightEye.scaling.x = eyeScaleX;
            }

            // 5. Procedural Running Lean & Limb Animations
            if (!isGrounded) {
                // Airborne Cheer Pose
                this.bodyGroup.rotation.z = 0;
                this.leftArm.rotation.z = 2.4;
                this.rightArm.rotation.z = -2.4;
                this.leftLeg.rotation.x = 0.5;
                this.rightLeg.rotation.x = -0.5;
                this.cape.rotation.x = -0.7 + Math.sin(t * 12) * 0.15;
            } else if (isMoving) {
                // Sprinting: 12-degree forward lean ($0.2 rad)
                this.bodyGroup.rotation.z = (isFacingLeft ? 0.2 : -0.2);
                const runCycle = Math.sin(t * 14);
                this.leftLeg.rotation.x = runCycle * 0.8;
                this.rightLeg.rotation.x = -runCycle * 0.8;
                this.leftArm.rotation.x = -runCycle * 0.7;
                this.rightArm.rotation.x = runCycle * 0.7;
                this.cape.rotation.x = -0.45 + Math.abs(runCycle) * 0.35;
                this.head.position.y = 2.0 + Math.abs(runCycle) * 0.06;
            } else {
                // Idle Breathing
                this.bodyGroup.rotation.z = 0;
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
                this.leftArm.rotation.x = 0;
                this.rightArm.rotation.x = 0;
                this.leftArm.rotation.z = Math.sin(t * 2) * 0.08;
                this.rightArm.rotation.z = -Math.sin(t * 2) * 0.08;
                this.cape.rotation.x = -0.15 + Math.sin(t * 3) * 0.05;
                this.head.position.y = 2.0 + Math.sin(t * 3) * 0.02;
            }

            // 6. Recruiter Mode Shield
            if (this.shieldSphere) {
                const isRecruiter = (window.isRecruiterActive && window.isRecruiterActive());
                this.shieldSphere.isVisible = isRecruiter;
                if (isRecruiter) {
                    this.shieldSphere.rotation.y += 0.02;
                }
            }
        }
    };

    window.Player3D = Player3D;
})();
