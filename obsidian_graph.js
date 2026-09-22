// obsidian_graph.js - 3D Holographic Obsidian Knowledge Graph Projected by BB-8 Astromech
(function () {
    "use strict";

    // --- GRAPH TOPOLOGY: APOORV'S CREATIVE TECH UNIVERSE ---
    const GRAPH_DATA = {
        nodes: [
            // Core Star
            { id: "apoorv", label: "APOORV", group: "core", radius: 1.6, color: "#fce566" },

            // Flagship Projects
            { id: "eravex", label: "ERAVEX", group: "project", radius: 1.3, color: "#ff4b4b", link: "https://eravex.vercel.app" },
            { id: "leveldevil", label: "LEVEL DEVIL", group: "project", radius: 1.3, color: "#8e44ad", link: "#" },
            { id: "maison", label: "MAISON ANIMA", group: "project", radius: 1.2, color: "#e67e22", link: "https://maison-anima.vercel.app" },
            { id: "jarvis", label: "JARVIS LINK", group: "project", radius: 1.2, color: "#2ecc71", link: "#" },

            // Graphics & Shaders Core
            { id: "webgpu", label: "WEBGPU", group: "tech", radius: 1.0, color: "#4deeea" },
            { id: "glsl", label: "GLSL SHADERS", group: "tech", radius: 1.0, color: "#4deeea" },
            { id: "raymarching", label: "RAYMARCHING", group: "tech", radius: 0.9, color: "#4deeea" },
            { id: "curl_noise", label: "CURL NOISE", group: "tech", radius: 0.9, color: "#4deeea" },
            { id: "lygia", label: "LYGIA", group: "tech", radius: 0.8, color: "#4deeea" },
            { id: "glass_refract", label: "PBR GLASS", group: "tech", radius: 0.8, color: "#4deeea" },

            // Spatial Engines & 60 FPS
            { id: "threejs", label: "THREE.JS 2.5D", group: "engine", radius: 1.1, color: "#3498db" },
            { id: "instanced", label: "INSTANCING", group: "engine", radius: 0.8, color: "#3498db" },
            { id: "dpr_clamp", label: "DPR 2.0 CLAMP", group: "engine", radius: 0.8, color: "#3498db" },
            { id: "disposal", label: "ZERO LEAKS", group: "engine", radius: 0.8, color: "#3498db" },
            { id: "kaboom", label: "KABOOM PHYS", group: "engine", radius: 1.0, color: "#3498db" },
            { id: "rails", label: "DUAL RAILS", group: "engine", radius: 0.9, color: "#3498db" },

            // AI & Systems Architecture
            { id: "system1", label: "SYSTEM 1 BRAIN", group: "ai", radius: 1.2, color: "#9b59b6" },
            { id: "bb8_companion", label: "BB-8 COMPANION", group: "ai", radius: 1.1, color: "#9b59b6" },
            { id: "altimeter", label: "ALTIMETER", group: "ai", radius: 0.8, color: "#9b59b6" },
            { id: "x402", label: "HTTP 402 PAY", group: "ai", radius: 0.8, color: "#9b59b6" },
            { id: "multiagent", label: "MULTI-AGENT", group: "ai", radius: 1.0, color: "#9b59b6" }
        ],
        edges: [
            // Core star
            { source: "apoorv", target: "eravex" },
            { source: "apoorv", target: "leveldevil" },
            { source: "apoorv", target: "maison" },
            { source: "apoorv", target: "jarvis" },
            { source: "apoorv", target: "system1" },

            // ERAVEX cluster
            { source: "eravex", target: "webgpu" },
            { source: "eravex", target: "glsl" },
            { source: "eravex", target: "lygia" },
            { source: "eravex", target: "raymarching" },

            // Level Devil cluster
            { source: "leveldevil", target: "threejs" },
            { source: "leveldevil", target: "kaboom" },
            { source: "leveldevil", target: "rails" },
            { source: "leveldevil", target: "bb8_companion" },
            { source: "leveldevil", target: "altimeter" },
            { source: "leveldevil", target: "system1" },

            // Maison Anima cluster
            { source: "maison", target: "threejs" },
            { source: "maison", target: "glass_refract" },
            { source: "maison", target: "raymarching" },

            // Jarvis & AI cluster
            { source: "jarvis", target: "multiagent" },
            { source: "jarvis", target: "x402" },
            { source: "system1", target: "bb8_companion" },
            { source: "system1", target: "multiagent" },

            // Engine & Performance Cross-links
            { source: "threejs", target: "instanced" },
            { source: "threejs", target: "dpr_clamp" },
            { source: "threejs", target: "disposal" },
            { source: "threejs", target: "webgpu" },
            { source: "glsl", target: "raymarching" },
            { source: "glsl", target: "curl_noise" },
            { source: "webgpu", target: "curl_noise" }
        ]
    };

    // Helper: Create high-contrast text billboard sprite
    function createTextSprite(text, color = "#4deeea") {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, 256, 64);

        // Semi-transparent dark background pill
        ctx.fillStyle = "rgba(23, 18, 15, 0.85)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 8, 248, 48, 6);
        ctx.fill();
        ctx.stroke();

        // Retro pixel typography
        ctx.font = 'bold 20px "Courier Prime", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.4, 0.35, 1.0);
        return sprite;
    }

    const ObsidianGraph = {
        isOpen: false,
        rootGroup: null,
        emitterLines: null,
        nodesGroup: null,
        linesMesh: null,
        nodeMeshes: [],
        edgeIndices: [],
        simNodes: [],
        tooltipEl: null,
        bannerEl: null,
        hoveredNode: null,
        targetRotationY: 0,
        currentRotationY: 0,
        isDragging: false,
        previousMouseX: 0,
        projectionCenter: new THREE.Vector3(0, 0, 0),
        emitterOrigin: new THREE.Vector3(0, 0, 0),

        init() {
            this.createTooltip();
            this.createBanner();
            this.setupHotkeys();
            this.setupTopbarButton();
            console.log("Obsidian Graph Engine registered. Press H to project.");
        },

        createBanner() {
            if (document.getElementById("holo-graph-banner")) return;
            const b = document.createElement("div");
            b.id = "holo-graph-banner";
            b.style.position = "fixed";
            b.style.top = "66px";
            b.style.left = "50%";
            b.style.transform = "translateX(-50%)";
            b.style.zIndex = "10000";
            b.style.display = "none";
            b.style.background = "rgba(23, 18, 15, 0.95)";
            b.style.color = "#4deeea";
            b.style.border = "2px solid #4deeea";
            b.style.boxShadow = "4px 4px 0 #4deeea";
            b.style.padding = "8px 16px";
            b.style.fontFamily = '"Press Start 2P", monospace';
            b.style.fontSize = "10px";
            b.style.letterSpacing = "0.5px";
            b.style.textAlign = "center";
            b.style.pointerEvents = "auto";
            b.innerHTML = `<span>⚡ OBSIDIAN GRAPH // 22 NODES</span> <span style="color:#fce566;margin-left:10px;">[ DRAG TO ROTATE • CLICK TO VISIT • ESC CLOSE ]</span>`;
            document.body.appendChild(b);
            this.bannerEl = b;
        },

        createTooltip() {
            if (document.getElementById("holo-graph-tooltip")) return;
            const tip = document.createElement("div");
            tip.id = "holo-graph-tooltip";
            tip.style.position = "fixed";
            tip.style.pointerEvents = "none";
            tip.style.zIndex = "10001";
            tip.style.display = "none";
            tip.style.background = "#17120f";
            tip.style.color = "#4deeea";
            tip.style.border = "2px solid #4deeea";
            tip.style.boxShadow = "3px 3px 0 #4deeea";
            tip.style.padding = "6px 10px";
            tip.style.fontFamily = '"Press Start 2P", monospace';
            tip.style.fontSize = "9px";
            tip.style.lineHeight = "1.4";
            tip.style.textTransform = "uppercase";
            document.body.appendChild(tip);
            this.tooltipEl = tip;
        },

        setupTopbarButton() {
            const actions = document.querySelector(".topbar-actions");
            if (!actions || document.getElementById("btn-holo-graph")) return;

            const btn = document.createElement("button");
            btn.id = "btn-holo-graph";
            btn.className = "altimeter-pill hide-mobile";
            btn.style.cursor = "pointer";
            btn.style.background = "#fffdf1";
            btn.style.color = "#17120f";
            btn.style.border = "2px solid #17120f";
            btn.style.boxShadow = "2px 2px 0 #17120f";
            btn.style.padding = "4px 10px";
            btn.style.fontFamily = '"Press Start 2P", monospace';
            btn.style.fontSize = "10px";
            btn.style.textTransform = "uppercase";
            btn.style.marginLeft = "8px";
            btn.title = "Toggle Holographic 3D Knowledge Graph (H)";
            btn.innerHTML = "🌐 GRAPH [H]";

            btn.addEventListener("click", () => this.toggle());
            actions.insertBefore(btn, actions.firstChild);
        },

        setupHotkeys() {
            window.addEventListener("keydown", (e) => {
                if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
                if (e.key === "h" || e.key === "H" || e.key === "g" || e.key === "G") {
                    this.toggle();
                    e.preventDefault();
                } else if (e.key === "Escape" && this.isOpen) {
                    this.close();
                }
            });

            // Pointer interaction for 3D Orbit & Hover
            window.addEventListener("mousedown", (e) => {
                if (!this.isOpen) return;
                this.isDragging = true;
                this.previousMouseX = e.clientX;
            });

            window.addEventListener("mousemove", (e) => {
                if (!this.isOpen) return;
                if (this.isDragging) {
                    const deltaX = e.clientX - this.previousMouseX;
                    this.targetRotationY += deltaX * 0.008;
                    this.previousMouseX = e.clientX;
                }
                this.handleRaycast(e);
            });

            window.addEventListener("mouseup", () => {
                this.isDragging = false;
            });

            window.addEventListener("click", (e) => {
                if (!this.isOpen || !this.hoveredNode) return;
                this.handleNodeClick(this.hoveredNode);
            });
        },

        toggle() {
            if (this.isOpen) this.close();
            else this.open();
        },

        open() {
            if (this.isOpen || !window.Engine3D || !window.Engine3D.scene) return;
            this.isOpen = true;

            const btn = document.getElementById("btn-holo-graph");
            if (btn) {
                btn.style.background = "#4deeea";
                btn.style.borderColor = "#17120f";
                btn.innerHTML = "✕ CLOSE [H]";
            }

            // Cinematic Hologram Backdrop Dimming
            if (!this.backdropEl) {
                const bd = document.createElement("div");
                bd.id = "holo-graph-backdrop";
                bd.style.position = "fixed";
                bd.style.top = "0";
                bd.style.left = "0";
                bd.style.width = "100vw";
                bd.style.height = "100vh";
                bd.style.zIndex = "40"; // Sits between DOM (10) and Three.js canvas (50)
                bd.style.background = "rgba(23, 18, 15, 0.72)";
                bd.style.backdropFilter = "blur(4px)";
                bd.style.webkitBackdropFilter = "blur(4px)";
                bd.style.pointerEvents = "auto";
                bd.addEventListener("click", () => this.close());
                document.body.appendChild(bd);
                this.backdropEl = bd;
            }
            this.backdropEl.style.display = "block";

            if (this.bannerEl) {
                this.bannerEl.style.display = "block";
            }

            this.buildHologram3D();

            if (window.showCompanionThought) {
                window.showCompanionThought("HOLOGRAPHIC GRAPH ONLINE // 22 NODES");
            }
            console.log("🌐 BB-8 Holographic Obsidian Graph Projected.");
        },

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;

            const btn = document.getElementById("btn-holo-graph");
            if (btn) {
                btn.style.background = "#fffdf1";
                btn.innerHTML = "🌐 GRAPH [H]";
            }

            if (this.backdropEl) {
                this.backdropEl.style.display = "none";
            }
            if (this.bannerEl) {
                this.bannerEl.style.display = "none";
            }
            if (this.tooltipEl) {
                this.tooltipEl.style.display = "none";
            }

            this.dispose();
            console.log("🌐 BB-8 Holographic Obsidian Graph Collapsed.");
        },

        buildHologram3D() {
            const scene = window.Engine3D.scene;
            this.rootGroup = new THREE.Group();
            this.rootGroup.name = "HoloObsidianGraph";

            // Determine BB-8 Origin in 3D Space
            this.emitterOrigin.set(0, 0, 0);
            if (window.Player3D && window.Player3D.root) {
                this.emitterOrigin.copy(window.Player3D.root.position);
                this.emitterOrigin.y += 1.4; // Dome lens emitter
            }

            // Frustum-safe Projection Center
            // If BB-8 is high up, project downward into center screen; if low, project upward
            const centerY = (this.emitterOrigin.y > 1.0) ? (this.emitterOrigin.y - 4.6) : (this.emitterOrigin.y + 4.8);
            const centerX = Math.max(Math.min(this.emitterOrigin.x, 5), -5);
            this.projectionCenter.set(centerX, centerY, 0);

            // 1. Holographic Astromech Projection Ray Beams (Connecting BB-8 Head to Hubs)
            const emitterPositions = [];
            const emitterMat = new THREE.LineBasicMaterial({
                color: 0x4deeea,
                transparent: true,
                opacity: 0.35,
                blending: THREE.AdditiveBlending
            });

            // 2. Initialize Simulation Nodes (Spherical Galaxy Configuration)
            this.simNodes = GRAPH_DATA.nodes.map((n, i) => {
                const angle = (i / GRAPH_DATA.nodes.length) * Math.PI * 2;
                const phi = ((i % 5) - 2) * 0.45;
                const dist = n.group === "core" ? 0.2 : (n.group === "project" ? 3.5 : 5.8);

                const nodePos = new THREE.Vector3(
                    this.projectionCenter.x + Math.cos(angle) * dist * Math.cos(phi),
                    this.projectionCenter.y + Math.sin(phi) * dist * 0.7,
                    this.projectionCenter.z + Math.sin(angle) * dist
                );

                // Add an emitter ray line for core & project nodes
                if (n.group === "core" || n.group === "project") {
                    emitterPositions.push(this.emitterOrigin.x, this.emitterOrigin.y, this.emitterOrigin.z);
                    emitterPositions.push(nodePos.x, nodePos.y, nodePos.z);
                }

                return {
                    ...n,
                    pos: nodePos,
                    basePos: nodePos.clone(),
                    vel: new THREE.Vector3(0, 0, 0)
                };
            });

            const emitterGeo = new THREE.BufferGeometry();
            emitterGeo.setAttribute("position", new THREE.Float32BufferAttribute(emitterPositions, 3));
            this.emitterLines = new THREE.LineSegments(emitterGeo, emitterMat);
            this.rootGroup.add(this.emitterLines);

            // 3. Create 3D Nodes Group with Attached Text Sprites
            this.nodesGroup = new THREE.Group();
            this.nodeMeshes = [];

            const sphereGeo = new THREE.OctahedronGeometry(0.28, 1);

            this.simNodes.forEach((node) => {
                const mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(node.color || "#4deeea"),
                    wireframe: node.group !== "core"
                });

                const mesh = new THREE.Mesh(sphereGeo, mat);
                mesh.scale.setScalar(node.radius || 1.0);
                mesh.position.copy(node.pos);
                mesh.userData = node;

                // Glowing outer halo for project hubs
                if (node.group === "core" || node.group === "project") {
                    const haloGeo = new THREE.OctahedronGeometry(0.42, 1);
                    const haloMat = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(node.color),
                        wireframe: true,
                        transparent: true,
                        opacity: 0.5
                    });
                    mesh.add(new THREE.Mesh(haloGeo, haloMat));
                }

                // Add Billboard Text Sprite directly beneath node
                const sprite = createTextSprite(node.label, node.color);
                sprite.position.set(0, -0.45, 0);
                mesh.add(sprite);

                this.nodesGroup.add(mesh);
                this.nodeMeshes.push(mesh);
            });

            this.rootGroup.add(this.nodesGroup);

            // 4. Create Interconnected Glowing Edges
            const linePositions = [];
            this.edgeIndices = [];

            GRAPH_DATA.edges.forEach((edge) => {
                const src = this.simNodes.find(n => n.id === edge.source);
                const tgt = this.simNodes.find(n => n.id === edge.target);
                if (src && tgt) {
                    this.edgeIndices.push({ src, tgt });
                    linePositions.push(src.pos.x, src.pos.y, src.pos.z);
                    linePositions.push(tgt.pos.x, tgt.pos.y, tgt.pos.z);
                }
            });

            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

            const lineMat = new THREE.LineBasicMaterial({
                color: 0x4deeea,
                transparent: true,
                opacity: 0.35,
                blending: THREE.AdditiveBlending
            });

            this.linesMesh = new THREE.LineSegments(lineGeo, lineMat);
            this.rootGroup.add(this.linesMesh);

            scene.add(this.rootGroup);

            // Start Animation Tick Hook
            this.startTick();
        },

        startTick() {
            if (this._tickActive) return;
            this._tickActive = true;

            const tick = () => {
                if (!this.isOpen) {
                    this._tickActive = false;
                    return;
                }
                this.updatePhysics();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        },

        updatePhysics() {
            if (!this.isOpen || !this.rootGroup) return;

            const time = performance.now() * 0.001;

            // 1. Follow BB-8 position dynamically if he moves
            if (window.Player3D && window.Player3D.root) {
                this.emitterOrigin.copy(window.Player3D.root.position);
                this.emitterOrigin.y += 1.4;
            }

            // 2. Smooth Orbit Rotation Damping
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;
            if (this.nodesGroup) {
                this.nodesGroup.rotation.y = this.currentRotationY + time * 0.08;
            }
            if (this.linesMesh) {
                this.linesMesh.rotation.y = this.currentRotationY + time * 0.08;
            }

            // 3. Force-directed Spring Relaxation
            this.simNodes.forEach((node, i) => {
                // Subtle floating breath
                const breath = Math.sin(time * 2.5 + i) * 0.006;
                node.pos.y = node.basePos.y + breath;

                const mesh = this.nodeMeshes[i];
                if (mesh) {
                    mesh.position.copy(node.pos);
                    mesh.rotation.x = time * 0.4 + i;
                    mesh.rotation.y = time * 0.6 + i;
                }
            });

            // 4. Update Line Segments Geometry
            if (this.linesMesh && this.edgeIndices.length > 0) {
                const positions = this.linesMesh.geometry.attributes.position.array;
                let ptr = 0;
                for (let i = 0; i < this.edgeIndices.length; i++) {
                    const e = this.edgeIndices[i];
                    positions[ptr++] = e.src.pos.x;
                    positions[ptr++] = e.src.pos.y;
                    positions[ptr++] = e.src.pos.z;
                    positions[ptr++] = e.tgt.pos.x;
                    positions[ptr++] = e.tgt.pos.y;
                    positions[ptr++] = e.tgt.pos.z;
                }
                this.linesMesh.geometry.attributes.position.needsUpdate = true;
            }

            // 5. Update Emitter Ray Lines from BB-8 Dome
            if (this.emitterLines) {
                const pos = this.emitterLines.geometry.attributes.position.array;
                let p = 0;
                this.simNodes.forEach((n) => {
                    if (n.group === "core" || n.group === "project") {
                        pos[p++] = this.emitterOrigin.x;
                        pos[p++] = this.emitterOrigin.y;
                        pos[p++] = this.emitterOrigin.z;
                        pos[p++] = n.pos.x;
                        pos[p++] = n.pos.y;
                        pos[p++] = n.pos.z;
                    }
                });
                this.emitterLines.geometry.attributes.position.needsUpdate = true;
                this.emitterLines.material.opacity = 0.25 + Math.sin(time * 10) * 0.08;
            }
        },

        handleRaycast(event) {
            if (!this.isOpen || !window.Engine3D || !window.Engine3D.camera) return;

            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, window.Engine3D.camera);

            const intersects = raycaster.intersectObjects(this.nodeMeshes, true);

            if (intersects.length > 0) {
                let hitMesh = intersects[0].object;
                while (hitMesh.parent && hitMesh.parent !== this.nodesGroup) {
                    hitMesh = hitMesh.parent;
                }

                const nodeData = hitMesh.userData;
                if (nodeData) {
                    this.hoveredNode = nodeData;
                    document.body.style.cursor = "pointer";

                    if (this.tooltipEl) {
                        this.tooltipEl.style.display = "block";
                        this.tooltipEl.style.left = (event.clientX + 14) + "px";
                        this.tooltipEl.style.top = (event.clientY - 30) + "px";

                        const edgeCount = GRAPH_DATA.edges.filter(e => e.source === nodeData.id || e.target === nodeData.id).length;
                        this.tooltipEl.innerHTML = `[ ${nodeData.label} ]<br><span style="color:#fce566;font-size:8px;">EDGES: ${edgeCount} • ${nodeData.group.toUpperCase()}</span>`;
                    }
                    return;
                }
            }

            this.hoveredNode = null;
            document.body.style.cursor = "default";
            if (this.tooltipEl) {
                this.tooltipEl.style.display = "none";
            }
        },

        handleNodeClick(node) {
            if (!node) return;

            console.log("Obsidian Node Clicked:", node.label);

            if (node.id === "eravex") {
                window.open("https://eravex.vercel.app", "_blank", "noopener");
            } else if (node.id === "maison") {
                window.open("https://maison-anima.vercel.app", "_blank", "noopener");
            } else if (node.id === "leveldevil") {
                this.close();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (node.group === "project") {
                this.close();
                const target = document.querySelector("#selected-work");
                if (target) target.scrollIntoView({ behavior: "smooth" });
            } else {
                if (window.showCompanionThought) {
                    window.showCompanionThought(`INSPECTING: ${node.label}`);
                }
            }
        },

        dispose() {
            if (this.rootGroup && this.rootGroup.parent) {
                this.rootGroup.parent.remove(this.rootGroup);
            }
            if (this.rootGroup) {
                this.rootGroup.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => {
                                if (m.map) m.map.dispose();
                                m.dispose();
                            });
                        } else {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    }
                });
            }
            this.rootGroup = null;
            this.emitterLines = null;
            this.nodesGroup = null;
            this.linesMesh = null;
            this.nodeMeshes = [];
            this.edgeIndices = [];
            this.simNodes = [];
            this._tickActive = false;
        }
    };

    window.ObsidianGraph = ObsidianGraph;

    // Auto-init on page load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => ObsidianGraph.init());
    } else {
        ObsidianGraph.init();
    }
})();
