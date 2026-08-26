// player_3d.js - Articulated 3D Cyber-Hero Character & Kinematic Coupling
(function () {
    const Player3D = {
        root: null,
        torso: null,
        head: null,
        visor: null,
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null,
        cape: null,
        shieldSphere: null,
        isCreated: false,

        create(scene) {
            if (!scene || this.isCreated) return;

            // 1. Root Transform Node
            this.root = new BABYLON.TransformNode("player3DRoot", scene);

            // 2. Materials
            // Body Material: Dark Graphite PBR with subtle sheen
            const bodyMat = new BABYLON.PBRMaterial("heroBodyMat", scene);
            bodyMat.albedoColor = new BABYLON.Color3(0.15, 0.15, 0.18);
            bodyMat.metallic = 0.6;
            bodyMat.roughness = 0.35;

            // Visor / Core Material: Glowing Cyan Emissive
            const visorMat = new BABYLON.StandardMaterial("heroVisorMat", scene);
            visorMat.diffuseColor = new BABYLON.Color3(0, 0.8, 1.0);
            visorMat.emissiveColor = new BABYLON.Color3(0.2, 0.9, 1.0);

            // Cape Material: Vibrant Crimson PBR
            const capeMat = new BABYLON.PBRMaterial("heroCapeMat", scene);
            capeMat.albedoColor = new BABYLON.Color3(0.8, 0.1, 0.15);
            capeMat.metallic = 0.1;
            capeMat.roughness = 0.6;
            capeMat.backFaceCulling = false;

            // 3. Meshes
            // Torso (Y: ~0.8 to 1.6)
            this.torso = BABYLON.MeshBuilder.CreateBox("heroTorso", { width: 0.8, height: 1.0, depth: 0.5 }, scene);
            this.torso.position.y = 1.1;
            this.torso.material = bodyMat;
            this.torso.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.torso);

            // Glowing Chest Core Emblem
            const coreEmblem = BABYLON.MeshBuilder.CreateBox("heroCore", { width: 0.3, height: 0.3, depth: 0.52 }, scene);
            coreEmblem.position.y = 1.2;
            coreEmblem.material = visorMat;
            coreEmblem.parent = this.root;

            // Head (Y: ~1.8 to 2.4)
            this.head = BABYLON.MeshBuilder.CreateBox("heroHead", { width: 0.65, height: 0.65, depth: 0.65 }, scene);
            this.head.position.y = 1.95;
            this.head.material = bodyMat;
            this.head.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.head);

            // Visor
            this.visor = BABYLON.MeshBuilder.CreateBox("heroVisor", { width: 0.55, height: 0.2, depth: 0.68 }, scene);
            this.visor.position.y = 1.98;
            this.visor.material = visorMat;
            this.visor.parent = this.root;

            // Left Arm
            this.leftArm = BABYLON.MeshBuilder.CreateBox("heroLeftArm", { width: 0.25, height: 0.8, depth: 0.3 }, scene);
            this.leftArm.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.leftArm.position = new BABYLON.Vector3(-0.55, 1.4, 0);
            this.leftArm.material = bodyMat;
            this.leftArm.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.leftArm);

            // Right Arm
            this.rightArm = BABYLON.MeshBuilder.CreateBox("heroRightArm", { width: 0.25, height: 0.8, depth: 0.3 }, scene);
            this.rightArm.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.rightArm.position = new BABYLON.Vector3(0.55, 1.4, 0);
            this.rightArm.material = bodyMat;
            this.rightArm.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.rightArm);

            // Left Leg
            this.leftLeg = BABYLON.MeshBuilder.CreateBox("heroLeftLeg", { width: 0.28, height: 0.8, depth: 0.3 }, scene);
            this.leftLeg.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.leftLeg.position = new BABYLON.Vector3(-0.22, 0.5, 0);
            this.leftLeg.material = bodyMat;
            this.leftLeg.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.leftLeg);

            // Right Leg
            this.rightLeg = BABYLON.MeshBuilder.CreateBox("heroRightLeg", { width: 0.28, height: 0.8, depth: 0.3 }, scene);
            this.rightLeg.setPivotPoint(new BABYLON.Vector3(0, 0.4, 0));
            this.rightLeg.position = new BABYLON.Vector3(0.22, 0.5, 0);
            this.rightLeg.material = bodyMat;
            this.rightLeg.parent = this.root;
            if (window.Engine3D) Engine3D.addShadowCaster(this.rightLeg);

            // Cape
            this.cape = BABYLON.MeshBuilder.CreatePlane("heroCape", { width: 0.7, height: 1.1, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
            this.cape.setPivotPoint(new BABYLON.Vector3(0, 0.55, 0));
            this.cape.position = new BABYLON.Vector3(0, 1.5, -0.3);
            this.cape.material = capeMat;
            this.cape.parent = this.root;

            // Recruiter Shield Sphere (Hidden by default)
            this.shieldSphere = BABYLON.MeshBuilder.CreateSphere("heroShield", { diameter: 3.2 }, scene);
            const shieldMat = new BABYLON.StandardMaterial("heroShieldMat", scene);
            shieldMat.diffuseColor = new BABYLON.Color3(0, 1.0, 0.8);
            shieldMat.emissiveColor = new BABYLON.Color3(0, 0.6, 0.8);
            shieldMat.alpha = 0.25;
            this.shieldSphere.material = shieldMat;
            this.shieldSphere.position.y = 1.2;
            this.shieldSphere.parent = this.root;
            this.shieldSphere.isVisible = false;

            this.isCreated = true;
        },

        // --- REAL-TIME FRAME SYNCHRONIZATION WITH 2D PLAYER ---
        syncWith2D(guy) {
            if (!this.isCreated || !guy || !guy.exists || !guy.exists()) {
                if (this.root) this.root.setEnabled(false);
                return;
            }

            this.root.setEnabled(true);

            // 1. Position Synchronization
            const targetPos = Engine3D.to3DVec(guy.pos.x, guy.pos.y, 0);
            this.root.position.x = targetPos.x;
            this.root.position.y = targetPos.y;

            // 2. Direction & Squash/Stretch
            const isFacingLeft = guy.facingLeft || (guy.scale && guy.scale.x < 0);
            const scaleY = (guy.scale && guy.scale.y) ? guy.scale.y : 1.0;
            const scaleX = (guy.scale && guy.scale.x) ? Math.abs(guy.scale.x) : 1.0;

            this.root.scaling.x = (isFacingLeft ? -1 : 1) * scaleX;
            this.root.scaling.y = scaleY;

            // 3. Procedural Limb Animation
            const t = (typeof time === "function") ? time() : performance.now() * 0.001;
            const isGrounded = (typeof guy.isGrounded === "function") ? guy.isGrounded() : true;
            const isMoving = (typeof isKeyDown === "function") && (isKeyDown("left") || isKeyDown("right"));

            if (!isGrounded) {
                // Airborne / Jump Pose ("Cheer" pose)
                this.leftArm.rotation.z = 2.3;
                this.rightArm.rotation.z = -2.3;
                this.leftLeg.rotation.x = 0.6;
                this.rightLeg.rotation.x = -0.6;
                this.cape.rotation.x = -0.7 + Math.sin(t * 12) * 0.15;
            } else if (isMoving) {
                // Running Walk Cycle (Sine wave pendulum)
                const runCycle = Math.sin(t * 14);
                this.leftLeg.rotation.x = runCycle * 0.75;
                this.rightLeg.rotation.x = -runCycle * 0.75;
                this.leftArm.rotation.x = -runCycle * 0.65;
                this.rightArm.rotation.x = runCycle * 0.65;
                this.cape.rotation.x = -0.45 + Math.abs(runCycle) * 0.35;
                this.head.position.y = 1.95 + Math.abs(runCycle) * 0.05;
            } else {
                // Idle (Subtle breathing wave)
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
                this.leftArm.rotation.x = 0;
                this.rightArm.rotation.x = 0;
                this.leftArm.rotation.z = Math.sin(t * 2) * 0.08;
                this.rightArm.rotation.z = -Math.sin(t * 2) * 0.08;
                this.cape.rotation.x = -0.15 + Math.sin(t * 3) * 0.05;
                this.head.position.y = 1.95 + Math.sin(t * 3) * 0.02;
            }

            // 4. Recruiter Mode Shield Visibility
            if (this.shieldSphere) {
                const isRecruiter = (window.isRecruiterActive && window.isRecruiterActive());
                this.shieldSphere.isVisible = isRecruiter;
                if (isRecruiter) {
                    this.shieldSphere.rotation.y += 0.02;
                    this.shieldSphere.rotation.x += 0.01;
                }
            }
        }
    };

    window.Player3D = Player3D;
})();
