// system1_brain.js - Non-Autoregressive Typed-State Autonomous AI Companion Brain
// Unified Multi-Page Cognitive Engine (Laya/Jev Architecture)
(function () {
    "use strict";

    const INTENTS = {
        IDLE_PERCH: "IDLE_PERCH",
        LEAD_DESCENT: "LEAD_DESCENT",
        LEAD_ASCENT: "LEAD_ASCENT",
        INSPECT_FORM_INPUT: "INSPECT_FORM_INPUT",
        EVADE_HAZARD: "EVADE_HAZARD",
        CATCH_UP_SPRINT: "CATCH_UP_SPRINT",
        CELEBRATE: "CELEBRATE",
        // Unified Multi-Page Trained Intents:
        SHOWCASE_PROJECT: "SHOWCASE_PROJECT",
        CALIBRATE_SCOPE: "CALIBRATE_SCOPE",
        VALIDATE_TIER: "VALIDATE_TIER",
        PROMPT_SUBMIT: "PROMPT_SUBMIT",
        ALERT_VALIDATION: "ALERT_VALIDATION",
        AUDIT_PROSPECT: "AUDIT_PROSPECT",
        RADAR_SWEEP: "RADAR_SWEEP",
        CALL_STANDBY: "CALL_STANDBY"
    };

    // --- EMBEDDED KNOWLEDGE MATRICES (< 1ms In-Memory Resolution) ---
    const PROJECT_KNOWLEDGE = [
        {
            id: "eravex",
            match: ["eravex", "webgpu", "flagship", "project-card-1", "featured-project-card", "featured"],
            yRange: [500, 1210],
            thought: "Have a look at ERAVEX: WebGPU compute & procedural shaders at 60 FPS!",
            action: "inspect"
        },
        {
            id: "maison",
            match: ["maison", "luxury", "project-card-2"],
            yRange: [1210, 1620],
            xRange: [0, 720],
            thought: "Maison Anima: Luxury 3D digital showcase with sub-5MB Draco delivery.",
            action: "inspect"
        },
        {
            id: "leveldevil",
            match: ["level devil", "level-devil", "spatial", "portfolio", "project-card-3", "active-canvas"],
            yRange: [1210, 1620],
            xRange: [720, 9999],
            thought: "Level Devil Engine: 2.5D spatial physics you can platform across!",
            action: "nod"
        },
        {
            id: "jarvis",
            match: ["jarvis", "bridge", "loopback", "zero-cost", "zero-api"],
            yRange: [1620, 2050],
            thought: "Jarvis: Zero-cost LLM gateway proxy & browser automation bridge.",
            action: "inspect"
        },
        {
            id: "capabilities",
            match: ["capability", "capabilities", "standards", "performance"],
            yRange: [2050, 2450],
            thought: "Curious about our benchmarks? We lock 60 FPS with sub-5MB Draco payloads.",
            action: "nod"
        },
        {
            id: "dispatches",
            match: ["dispatches", "principles", "notes", "project-card-4"],
            yRange: [2450, 2950],
            thought: "Our engineering creed: pure mathematical performance over agency bloat.",
            action: "nod"
        }
    ];

    const SCOPE_KNOWLEDGE = {
        "Performance Sprint": {
            title: "Performance Sprint",
            thought: "Scope: Core Web Vitals audit, 60 FPS guarantee & DPR clamp.",
            jumpForce: 400
        },
        "3D Web Feature": {
            title: "3D Web Feature",
            thought: "Scope: Procedural Three.js/WebGL scene with custom shaders.",
            jumpForce: 430
        },
        "Product Configurator": {
            title: "Product Configurator",
            thought: "Scope: Bespoke 3D e-commerce viewer with KTX2 texture streaming.",
            jumpForce: 450
        },
        "WebGPU Shader Architecture": {
            title: "WebGPU Shader Architecture",
            thought: "Scope: Custom WebGPU compute and procedural shader architecture.",
            jumpForce: 450
        },
        "Full Interactive Site": {
            title: "Full Interactive Site",
            thought: "Scope: Complete 2.5D spatial physics & autonomous companion.",
            jumpForce: 500
        },
        "Exploration / Other": {
            title: "Creative Exploration",
            thought: "Scope: Custom WebGPU compute and creative engineering R&D.",
            jumpForce: 420
        }
    };

    const TIER_KNOWLEDGE = {
        "Flexible": { thought: "Flexible parameters: Scoping tailored deliverables." },
        "Under $1k": { thought: "Micro-Sprint (<$1k): Laser-focused 48h site-speed patch." },
        "$1k - $5k": { thought: "Mid-Sprint ($1k–$5k): Targeted 3D feature or shader rig." },
        "$5k - $15k": { thought: "Flagship Build ($5k–$15k): Complete interactive 3D hero with 60 FPS floor." },
        "$15k+": { thought: "Enterprise Tier ($15k+): Tier-0 proprietary graphics architecture reserved." }
    };

    const DEFECT_KNOWLEDGE = {
        lcp: "LCP bottleneck (>3.5s). Front door jammed shut for mobile patients.",
        dom: "WordPress DOM clutter (3,000+ nodes). Overheating mobile devices.",
        dpdp: "DPDP 2023 compliance risk. Mandatory data consent armor required.",
        tls: "Missing modern TLS encryption. Google Chrome flagging site warnings.",
        ssl: "Missing modern TLS encryption. Google Chrome flagging site warnings.",
        webgl: "Flat 2D layout. Adding 3D visual authority to 10x conversions."
    };

    const System1Brain = {
        intents: INTENTS,
        currentIntent: INTENTS.IDLE_PERCH,
        currentThought: null,
        bubbleElement: null,
        bubbleTimeout: null,
        _cachedBubbleW: 280,
        _cachedBubbleH: 44,
        lastThoughtTime: 0,
        dwellStartTime: 0,
        lastDwellY: 0,
        dwellDuration: 0,
        targetRail: null,
        targetX: null,
        activeFocusedElement: null,
        isCelebrating: false,
        hasCelebratedTouchdown: false,
        lastIntentChange: 0,
        stepDownTimer: 0,

        // Trained Workflow State
        selectedScope: null,
        selectedTier: null,
        lastScopeTime: 0,
        lastTierTime: 0,
        validationAlertField: null,
        lastValidationTime: 0,
        isFormReady: false,
        selectedProspect: null,
        lastProspectTime: 0,
        activeRadarFilter: null,
        lastRadarTime: 0,
        isCallActive: false,
        callDuration: 0,
        activeCustomRule: null,

        // --- DYNAMIC NEURAL KNOWLEDGE LAYER (< 1ms IN-MEMORY ACCESS) ---
        trainedKnowledge: {
            projects: [],
            scopes: {},
            tiers: {},
            defects: {},
            customRules: []
        },

        loadTrainedKnowledge() {
            try {
                if (typeof localStorage !== "undefined") {
                    const raw = localStorage.getItem("system1_brain_knowledge");
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === "object") {
                            this.trainedKnowledge.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
                            this.trainedKnowledge.scopes = (parsed.scopes && typeof parsed.scopes === "object") ? parsed.scopes : {};
                            this.trainedKnowledge.tiers = (parsed.tiers && typeof parsed.tiers === "object") ? parsed.tiers : {};
                            this.trainedKnowledge.defects = (parsed.defects && typeof parsed.defects === "object") ? parsed.defects : {};
                            this.trainedKnowledge.customRules = Array.isArray(parsed.customRules) ? parsed.customRules : [];
                        }
                    }
                }
            } catch (err) {
                console.warn("[System 1 Brain] Failed to load trained knowledge from localStorage:", err);
            }
        },

        saveTrainedKnowledge(syncCloud = true) {
            try {
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem("system1_brain_knowledge", JSON.stringify(this.trainedKnowledge));
                }
            } catch (err) {
                console.warn("[System 1 Brain] Failed to persist trained knowledge to localStorage:", err);
            }
            if (syncCloud && typeof window !== "undefined" && window.SALES_PLATFORM_AUTH?.getFirestore) {
                window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
                    this.pushToFirestore(db).catch(() => {});
                }).catch(() => {});
            }
        },

        getProjectKnowledge() {
            return [...(this.trainedKnowledge.projects || []), ...PROJECT_KNOWLEDGE];
        },

        getScopeKnowledge(scope) {
            return (this.trainedKnowledge.scopes && this.trainedKnowledge.scopes[scope]) || SCOPE_KNOWLEDGE[scope];
        },

        getTierKnowledge(tier) {
            return (this.trainedKnowledge.tiers && this.trainedKnowledge.tiers[tier]) || TIER_KNOWLEDGE[tier];
        },

        getDefectKnowledge(defectKey) {
            return (this.trainedKnowledge.defects && this.trainedKnowledge.defects[defectKey]) || DEFECT_KNOWLEDGE[defectKey];
        },

        getCustomRules() {
            return this.trainedKnowledge.customRules || [];
        },

        trainNode(node, syncCloud = true) {
            if (!node || typeof node !== "object") throw new Error("Invalid knowledge node payload.");
            const id = String(node.id || node.name || `node_${Date.now()}`).trim();
            const category = node.category || "custom_trigger";

            const record = {
                id,
                category,
                name: node.name || id,
                thought: String(node.thought || "").trim(),
                page: node.page || "all",
                action: node.action || "nod",
                jumpForce: Number(node.jumpForce) || 400,
                audioCue: node.audioCue || "playThought",
                updatedAt: new Date().toISOString(),
                source: "trained"
            };

            if (category === "project") {
                record.match = Array.isArray(node.match) ? node.match : (node.match ? String(node.match).split(',').map(s=>s.trim()).filter(Boolean) : [id]);
                record.yRange = Array.isArray(node.yRange) ? node.yRange : [Number(node.yMin) || 0, Number(node.yMax) || 4000];
                if (node.xRange || (node.xMin !== undefined && node.xMax !== undefined)) {
                    record.xRange = Array.isArray(node.xRange) ? node.xRange : [Number(node.xMin) || 0, Number(node.xMax) || 9999];
                }
                const idx = this.trainedKnowledge.projects.findIndex(p => p.id === id);
                if (idx >= 0) this.trainedKnowledge.projects[idx] = record;
                else this.trainedKnowledge.projects.unshift(record);
            } else if (category === "scope") {
                record.title = node.title || id;
                this.trainedKnowledge.scopes[id] = record;
            } else if (category === "tier") {
                this.trainedKnowledge.tiers[id] = record;
            } else if (category === "defect") {
                this.trainedKnowledge.defects[id] = record.thought;
            } else {
                // category === "custom_trigger"
                if (node.match && typeof node.match === "object" && !Array.isArray(node.match)) {
                    // Object form from workspace UI: { keywords: [...], yMin, yMax }
                    record.match = Array.isArray(node.match.keywords) ? node.match.keywords : 
                        (typeof node.match.keywords === 'string' ? node.match.keywords.split(',').map(s => s.trim()).filter(Boolean) : [id]);
                    if (node.match.yMin !== undefined && node.match.yMax !== undefined) {
                        record.yRange = [Number(node.match.yMin) || 0, Number(node.match.yMax) || 4000];
                    }
                } else {
                    record.match = Array.isArray(node.match) ? node.match : (node.match ? String(node.match).split(',').map(s => s.trim()).filter(Boolean) : [id]);
                }
                if (!record.yRange && (node.yRange || (node.yMin !== undefined && node.yMax !== undefined))) {
                    record.yRange = Array.isArray(node.yRange) ? node.yRange : [Number(node.yMin) || 0, Number(node.yMax) || 4000];
                }
                const idx = this.trainedKnowledge.customRules.findIndex(r => r.id === id);
                if (idx >= 0) this.trainedKnowledge.customRules[idx] = record;
                else this.trainedKnowledge.customRules.unshift(record);
            }

            this.saveTrainedKnowledge(syncCloud);
            return record;
        },

        deleteTrainedNode(id) {
            if (!id) return false;
            let deleted = false;
            const pIdx = this.trainedKnowledge.projects.findIndex(p => p.id === id);
            if (pIdx >= 0) {
                this.trainedKnowledge.projects.splice(pIdx, 1);
                deleted = true;
            }
            if (this.trainedKnowledge.scopes[id]) {
                delete this.trainedKnowledge.scopes[id];
                deleted = true;
            }
            if (this.trainedKnowledge.tiers[id]) {
                delete this.trainedKnowledge.tiers[id];
                deleted = true;
            }
            if (this.trainedKnowledge.defects[id]) {
                delete this.trainedKnowledge.defects[id];
                deleted = true;
            }
            const rIdx = this.trainedKnowledge.customRules.findIndex(r => r.id === id);
            if (rIdx >= 0) {
                this.trainedKnowledge.customRules.splice(rIdx, 1);
                deleted = true;
            }

            if (deleted) {
                this.saveTrainedKnowledge(false);
                if (typeof window !== "undefined" && window.SALES_PLATFORM_AUTH?.getFirestore) {
                    window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
                        db.collection("brain_knowledge").doc(id).delete().catch(() => {});
                    }).catch(() => {});
                }
            }
            return deleted;
        },

        getAllKnowledge() {
            const list = [];
            // 1. Projects
            PROJECT_KNOWLEDGE.forEach(p => {
                const isOverridden = this.trainedKnowledge.projects.some(tp => tp.id === p.id);
                if (!isOverridden) {
                    list.push({ ...p, category: "project", source: "factory", name: p.id.toUpperCase() });
                }
            });
            this.trainedKnowledge.projects.forEach(p => {
                list.push({ ...p, category: "project", source: "trained" });
            });

            // 2. Scopes
            Object.keys(SCOPE_KNOWLEDGE).forEach(k => {
                const isOverridden = Boolean(this.trainedKnowledge.scopes[k]);
                if (!isOverridden) {
                    list.push({ id: k, name: k, category: "scope", thought: SCOPE_KNOWLEDGE[k].thought, jumpForce: SCOPE_KNOWLEDGE[k].jumpForce, source: "factory" });
                }
            });
            Object.keys(this.trainedKnowledge.scopes).forEach(k => {
                list.push({ ...this.trainedKnowledge.scopes[k], id: k, name: k, category: "scope", source: "trained" });
            });

            // 3. Tiers
            Object.keys(TIER_KNOWLEDGE).forEach(k => {
                const isOverridden = Boolean(this.trainedKnowledge.tiers[k]);
                if (!isOverridden) {
                    list.push({ id: k, name: k, category: "tier", thought: TIER_KNOWLEDGE[k].thought, source: "factory" });
                }
            });
            Object.keys(this.trainedKnowledge.tiers).forEach(k => {
                list.push({ ...this.trainedKnowledge.tiers[k], id: k, name: k, category: "tier", source: "trained" });
            });

            // 4. Defects
            Object.keys(DEFECT_KNOWLEDGE).forEach(k => {
                const isOverridden = Boolean(this.trainedKnowledge.defects[k]);
                if (!isOverridden) {
                    list.push({ id: k, name: k.toUpperCase(), category: "defect", thought: DEFECT_KNOWLEDGE[k], source: "factory" });
                }
            });
            Object.keys(this.trainedKnowledge.defects).forEach(k => {
                list.push({ id: k, name: k.toUpperCase(), category: "defect", thought: this.trainedKnowledge.defects[k], source: "trained" });
            });

            // 5. Custom Rules
            this.trainedKnowledge.customRules.forEach(r => {
                list.push({ ...r, category: "custom_trigger", source: "trained" });
            });

            return list;
        },

        exportJSON() {
            return JSON.stringify(this.trainedKnowledge, null, 2);
        },

        importJSON(jsonString) {
            try {
                const parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
                if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON structure.");
                this.trainedKnowledge.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
                this.trainedKnowledge.scopes = (parsed.scopes && typeof parsed.scopes === "object") ? parsed.scopes : {};
                this.trainedKnowledge.tiers = (parsed.tiers && typeof parsed.tiers === "object") ? parsed.tiers : {};
                this.trainedKnowledge.defects = (parsed.defects && typeof parsed.defects === "object") ? parsed.defects : {};
                this.trainedKnowledge.customRules = Array.isArray(parsed.customRules) ? parsed.customRules : [];
                this.saveTrainedKnowledge(true);
                return true;
            } catch (err) {
                console.error("[System 1 Brain] Failed to import knowledge JSON:", err);
                throw err;
            }
        },

        resetToFactory() {
            this.trainedKnowledge = {
                projects: [],
                scopes: {},
                tiers: {},
                defects: {},
                customRules: []
            };
            if (typeof localStorage !== "undefined") {
                localStorage.removeItem("system1_brain_knowledge");
            }
            this.hasCelebratedTouchdown = false;
            return true;
        },

        async syncWithFirestore(db) {
            if (!db) return;
            try {
                const snap = await db.collection("brain_knowledge").get();
                if (!snap.empty) {
                    let count = 0;
                    snap.forEach(doc => {
                        const data = doc.data();
                        if (data && data.id && data.category) {
                            this.trainNode(data, false);
                            count++;
                        }
                    });
                    if (count > 0) {
                        this.saveTrainedKnowledge(false);
                    }
                }
            } catch (e) {
                console.warn("[System 1 Brain] Firestore sync note:", e);
            }
        },

        async pushToFirestore(db) {
            if (!db) return;
            try {
                const allTrained = [];
                this.trainedKnowledge.projects.forEach(p => allTrained.push(p));
                Object.keys(this.trainedKnowledge.scopes).forEach(k => allTrained.push({ id: k, ...this.trainedKnowledge.scopes[k], category: "scope" }));
                Object.keys(this.trainedKnowledge.tiers).forEach(k => allTrained.push({ id: k, ...this.trainedKnowledge.tiers[k], category: "tier" }));
                Object.keys(this.trainedKnowledge.defects).forEach(k => allTrained.push({ id: k, thought: this.trainedKnowledge.defects[k], category: "defect" }));
                this.trainedKnowledge.customRules.forEach(r => allTrained.push(r));

                if (typeof db.batch === "function") {
                    const batch = db.batch();
                    allTrained.forEach(item => {
                        const docRef = db.collection("brain_knowledge").doc(item.id);
                        batch.set(docRef, item, { merge: true });
                    });
                    await batch.commit();
                } else {
                    for (const item of allTrained) {
                        await db.collection("brain_knowledge").doc(item.id).set(item, { merge: true });
                    }
                }
            } catch (e) {
                console.warn("[System 1 Brain] Firestore push note:", e);
            }
        },

        init() {
            this.loadTrainedKnowledge();
            if (typeof document !== "undefined") {
                this.setupBubble();
                this.bindEvents();
            }
            if (typeof window !== "undefined" && window.SALES_PLATFORM_AUTH?.getFirestore) {
                window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
                    this.syncWithFirestore(db).catch(() => {});
                }).catch(() => {});
            }
            console.log("System 1 Decision Brain Initialized (Dynamic Neural Memory Enabled).");
        },

        setupBubble() {
            if (typeof document === "undefined") return;
            let el = document.getElementById("companion-bubble");
            if (!el) {
                el = document.createElement("div");
                el.id = "companion-bubble";
                el.className = "companion-bubble";
                el.setAttribute('role', 'status');
                el.setAttribute('aria-live', 'polite');
                el.setAttribute('aria-atomic', 'true');
                el.style.display = "none";
                document.body.appendChild(el);
            }
            if (!el._hasDismissHandler) {
                el._hasDismissHandler = true;
                el.addEventListener("click", (e) => {
                    if (e.target && e.target.closest && e.target.closest(".bb8-hud-btn, .bb8-hud-close")) return;
                    if (!this.bubbleElement?.classList?.contains("hud-active")) {
                        this.hideThought();
                    }
                });
            }
            this.bubbleElement = el;
        },

        bindEvents() {
            if (typeof document === "undefined") return;
            if (this._eventsBound) return;
            this._eventsBound = true;

            // Track form focus on /sales
            document.addEventListener("focusin", (e) => {
                const target = e.target;
                if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
                    this.activeFocusedElement = target;
                    this.onFormFocus(target);
                }
            });

            document.addEventListener("focusout", (e) => {
                if (this.activeFocusedElement === e.target) {
                    this.activeFocusedElement = null;
                }
            });

            // Listen for select inputs on /sales (Scope & Budget)
            document.addEventListener("change", (e) => {
                const target = e.target;
                if (target && target.tagName === "SELECT") {
                    if (target.name === "scope") {
                        this.onScopeSelect(target.value);
                    } else if (target.name === "budget") {
                        this.onTierSelect(target.value);
                    }
                }
            });

            // Form inputs change check (form completion)
            document.addEventListener("input", (e) => {
                const target = e.target;
                if (target && target.form && target.form.id === "inquiry-form") {
                    this.isFormReady = false;
                    const form = target.form;
                    const name = form.querySelector('input[name="name"]')?.value?.trim();
                    const email = form.querySelector('input[name="email"]')?.value?.trim();
                    const msg = form.querySelector('textarea[name="message"]')?.value?.trim();
                    if (name && email && msg && msg.length > 5 && !this.isFormReady) {
                        this.onFormReady();
                    }
                }
            });

            // Listen for form submit
            document.addEventListener("submit", (e) => {
                const form = e.target;
                if (form && (form.id === "inquiry-form" || form.getAttribute("name") === "inquiry")) {
                    this.onFormSubmit();
                }
            });

            // Listen for tactical rebuttal button clicks and call trigger in workspace
            document.addEventListener("click", (e) => {
                const objBtn = e.target.closest(".obj-btn, .objection-btn");
                if (objBtn) {
                    this.onWorkspaceInteract(objBtn);
                    return;
                }
                const callBtn = e.target.closest("#callActionBtn");
                if (callBtn) {
                    this.onCallStateChange(true);
                }
            });

            // Listen for Escape key to dismiss Guidance HUD or active thought bubble
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" || e.keyCode === 27) {
                    if (this.bubbleElement && this.bubbleElement.classList.contains("hud-active")) {
                        this.closeHUD();
                    } else if (this.bubbleElement && this.bubbleElement.style.display !== "none" && this.bubbleElement.style.opacity !== "0") {
                        this.hideThought();
                    }
                }
            });
        },

        emitThought(text, duration = 3200) {
            this.currentThought = text;
            if (typeof document === "undefined") return;
            if (!this.bubbleElement) this.setupBubble();
            if (!this.bubbleElement) return;
            if (this.bubbleElement && this.bubbleElement.classList.contains("hud-active")) return;

            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();
            const isPriority = text.includes("dispatched") || text.includes("TOUCHDOWN") || text.includes("Terra Firma") || text.includes("HARD-LIGHT") || text.includes("⚡") || text.includes("Missing") || text.includes("Scope:") || text.includes("Tier unlocked");
            if (!isPriority && (now - this.lastThoughtTime < 4500)) {
                return;
            }

            this.currentThought = text;
            this.lastThoughtTime = now;
            this.bubbleElement.classList.remove("hud-active");
            this.bubbleElement.textContent = text;
            this.bubbleElement.style.display = "block";
            this.bubbleElement.style.opacity = "1";
            requestAnimationFrame(() => {
                if (this.bubbleElement) {
                    this._cachedBubbleW = this.bubbleElement.offsetWidth || 280;
                    this._cachedBubbleH = this.bubbleElement.offsetHeight || 44;
                }
            });

            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playThought === "function") {
                const px = (window.player && window.player.pos) ? window.player.pos.x : null;
                window.SFX.playThought(px);
            }

            if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            this.bubbleTimeout = setTimeout(() => {
                if (this.bubbleElement) {
                    this.bubbleElement.style.opacity = "0";
                    setTimeout(() => {
                        if (this.bubbleElement && this.bubbleElement.style.opacity === "0") {
                            this.bubbleElement.style.display = "none";
                        }
                    }, 300);
                }
            }, duration);
        },

        showGuidanceHUD() {
            if (typeof document === "undefined") return;
            if (!this.bubbleElement) this.setupBubble();
            if (!this.bubbleElement) return;

            const page = (typeof window !== "undefined" && typeof window.location !== "undefined")
                ? ((window.location.pathname || "").includes("workspace") || document.body?.classList?.contains("retro-workspace") ? "workspace"
                : (window.location.pathname || "").includes("sales") || document.body?.classList?.contains("sales-page") ? "sales" : "home")
                : "home";

            let title = "⚡ BB-8 CO-PILOT";
            let buttonsHtml = "";

            if (page === "workspace") {
                title = "⚡ BB-8 TACTICAL CO-PILOT";
                buttonsHtml = `
                    <div class="bb8-hud-buttons">
                        <button onclick="window.System1Brain.startMission('deals')" class="bb8-hud-btn">🎯 Hunt $15k+ Deals</button>
                        <button onclick="window.System1Brain.startMission('flaws')" class="bb8-hud-btn">⚡ Inspect Latency Flaws</button>
                        <button onclick="window.System1Brain.startMission('call')" class="bb8-hud-btn">📞 Test Call Battle</button>
                        <button onclick="window.Player3D?.celebrateVictory?.(); window.System1Brain.closeHUD();" class="bb8-hud-btn">🤖 Droid 360° Spin</button>
                    </div>
                `;
            } else if (page === "sales") {
                title = "⚡ BB-8 BRIEF CO-PILOT";
                buttonsHtml = `
                    <div class="bb8-hud-buttons">
                        <button onclick="window.System1Brain.startMission('fill')" class="bb8-hud-btn">📝 Focus Brief</button>
                        <button onclick="window.System1Brain.startMission('scope')" class="bb8-hud-btn">💰 View Retainers</button>
                        <button onclick="window.Player3D?.celebrateVictory?.(); window.System1Brain.closeHUD();" class="bb8-hud-btn">🤖 Droid 360° Spin</button>
                    </div>
                `;
            } else {
                title = "⚡ BB-8 NAVIGATOR";
                buttonsHtml = `
                    <div class="bb8-hud-buttons">
                        <button onclick="window.System1Brain.startMission('work')" class="bb8-hud-btn">🚀 Flagship Case Studies</button>
                        <button onclick="window.System1Brain.startMission('capabilities')" class="bb8-hud-btn">⚡ 60 FPS Standards</button>
                        <button onclick="window.System1Brain.startMission('contact')" class="bb8-hud-btn">💼 Initiate Contract</button>
                        <button onclick="window.Player3D?.celebrateVictory?.(); window.System1Brain.closeHUD();" class="bb8-hud-btn">🤖 Droid 360° Spin</button>
                    </div>
                `;
            }

            this.bubbleElement.innerHTML = `
                <div class="bb8-hud-content">
                    <div class="bb8-hud-title"><span>${title}</span><button onclick="window.System1Brain.closeHUD()" class="bb8-hud-close" aria-label="Close Guide">✕</button></div>
                    ${buttonsHtml}
                </div>
            `;
            this.bubbleElement.classList.add("hud-active");
            this.bubbleElement.setAttribute("role", "dialog");
            this.bubbleElement.setAttribute("aria-modal", "false");
            this.bubbleElement.setAttribute("aria-label", title || "BB-8 Co-Pilot Guidance");
            this.bubbleElement.style.display = "block";
            this.bubbleElement.style.opacity = "1";

            // Pause auto-dismiss when hovering over or reading HUD
            if (!this.bubbleElement._hasHudHoverPause && typeof this.bubbleElement.addEventListener === "function") {
                this.bubbleElement._hasHudHoverPause = true;
                this.bubbleElement.addEventListener("mouseenter", () => {
                    if (this.bubbleElement?.classList?.contains("hud-active") && this.bubbleTimeout) {
                        clearTimeout(this.bubbleTimeout);
                        this.bubbleTimeout = null;
                    }
                });
                this.bubbleElement.addEventListener("mouseleave", () => {
                    if (this.bubbleElement?.classList?.contains("hud-active") && !this.bubbleTimeout) {
                        this.bubbleTimeout = setTimeout(() => this.closeHUD(), 6000);
                    }
                });
            }

            // Keyboard Accessibility: Focus the close button or first action button inside the HUD
            const deferFocus = (typeof requestAnimationFrame === "function") ? requestAnimationFrame : (cb) => setTimeout(cb, 0);
            deferFocus(() => {
                const targetBtn = this.bubbleElement?.querySelector?.(".bb8-hud-close, .bb8-hud-btn");
                if (targetBtn && typeof targetBtn.focus === "function") {
                    targetBtn.focus();
                }
            });

            if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            this.bubbleTimeout = setTimeout(() => {
                this.closeHUD();
            }, 10000);
        },

        hideThought() {
            if (!this.bubbleElement) return;
            if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            this.bubbleElement.style.opacity = "0";
            setTimeout(() => {
                if (this.bubbleElement && this.bubbleElement.style.opacity === "0") {
                    this.bubbleElement.style.display = "none";
                }
            }, 200);
        },

        closeHUD() {
            if (!this.bubbleElement) return;
            if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            this.bubbleElement.classList.remove("hud-active");
            this.bubbleElement.removeAttribute("role");
            this.bubbleElement.removeAttribute("aria-modal");
            this.bubbleElement.removeAttribute("aria-label");
            this.bubbleElement.style.opacity = "0";
            setTimeout(() => {
                if (this.bubbleElement && this.bubbleElement.style.opacity === "0") {
                    this.bubbleElement.style.display = "none";
                }
            }, 300);

            // Restore focus to summon button if active
            const guideBtn = (typeof document !== "undefined" && typeof document.getElementById === "function")
                ? (document.getElementById("bb8-guide-btn") || document.getElementById("btnBB8Guide"))
                : null;
            if (guideBtn && typeof guideBtn.focus === "function") {
                guideBtn.focus();
            }
        },

        startMission(missionId) {
            this.closeHUD();
            if (typeof window === "undefined" || typeof document === "undefined") return;
            const scrollY = window.scrollY || window.pageYOffset || 0;

            if (missionId === "deals") {
                const topProspect = (typeof window.PROSPECTS !== "undefined" && Array.isArray(window.PROSPECTS))
                    ? (window.PROSPECTS.find(p => String(p.fee || "").includes("15k") || String(p.fee || "").includes("18k") || String(p.fee || "").includes("20k") || String(p.fee || "").includes("25k")) || window.PROSPECTS[0])
                    : null;

                if (topProspect && typeof window.selectProspectById === "function") {
                    window.selectProspectById(topProspect.id);
                }

                const targetEl = document.querySelector("#activeName") || document.querySelector(".studio-panel");
                if (targetEl && window.smoothGlideTo) {
                    const r = targetEl.getBoundingClientRect();
                    window.smoothGlideTo(Math.round(r.left + 80), Math.round(r.top + scrollY), 700, () => {
                        const feeEl = document.querySelector("#activeFee");
                        if (feeEl && window.Player3D?.holographicSpotlight) {
                            const fr = feeEl.getBoundingClientRect();
                            window.Player3D.holographicSpotlight(Math.round(fr.left + fr.width/2), Math.round(fr.top + scrollY), 3000);
                        }
                        this.emitThought(`Spotlighting ${topProspect?.name || "lead"}: High-ticket fee opportunity!`, 3500);
                    });
                }
            } else if (missionId === "flaws") {
                const flawsPanel = document.querySelector("#flawsPanel") || document.querySelector(".studio-panel-elevated") || document.querySelector(".studio-panel");
                if (flawsPanel && window.smoothGlideTo) {
                    const r = flawsPanel.getBoundingClientRect();
                    window.smoothGlideTo(Math.round(r.left + 80), Math.round(r.top + scrollY), 700, () => {
                        const lcpBox = document.querySelector("#metricLCP") || flawsPanel;
                        if (lcpBox && window.Player3D?.holographicSpotlight) {
                            const lr = lcpBox.getBoundingClientRect();
                            window.Player3D.holographicSpotlight(Math.round(lr.left + lr.width/2), Math.round(lr.top + scrollY), 3000);
                        }
                        this.emitThought("LCP Latency Bottleneck: Front door jammed shut (>4s). Patients walk next door!", 3800);
                    });
                }
            } else if (missionId === "call") {
                const callBtn = document.querySelector("#callActionBtn") || document.querySelector("#btnStartCall");
                const objRack = document.querySelector(".obj-btn");
                if (callBtn && window.smoothGlideTo) {
                    const r = callBtn.getBoundingClientRect();
                    window.smoothGlideTo(Math.round(r.left + 60), Math.round(r.top + scrollY - 20), 700, () => {
                        if (window.Player3D?.holographicSpotlight) {
                            window.Player3D.holographicSpotlight(Math.round(r.left + r.width/2), Math.round(r.top + scrollY), 3000);
                        }
                        this.emitThought("Tactical Co-Pilot Standby: Rebuttal weapons armed and ready!", 3500);
                        if (objRack && window.Player3D?.holographicSpotlight) {
                            setTimeout(() => {
                                const or = objRack.getBoundingClientRect();
                                window.Player3D.holographicSpotlight(Math.round(or.left + or.width/2), Math.round(or.top + scrollY), 3000);
                            }, 1200);
                        }
                    });
                }
            } else if (missionId === "work") {
                const workHeader = document.querySelector("#selected-work") || document.querySelector(".featured-project-card");
                if (workHeader) {
                    workHeader.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => {
                        const r = workHeader.getBoundingClientRect();
                        const sY = window.scrollY || window.pageYOffset || 0;
                        if (window.smoothGlideTo) {
                            window.smoothGlideTo(Math.round(r.left + 120), Math.round(r.top + sY), 700, () => {
                                const cta = workHeader.querySelector("a.tech-pill, .launch-eravex");
                                if (cta && window.Player3D?.holographicSpotlight) {
                                    const cr = cta.getBoundingClientRect();
                                    window.Player3D.holographicSpotlight(Math.round(cr.left + cr.width/2), Math.round(cr.top + sY), 3000);
                                }
                                this.emitThought("Have a look at ERAVEX: WebGPU compute & procedural shaders at 60 FPS!", 3500);
                            });
                        }
                    }, 400);
                }
            } else if (missionId === "capabilities") {
                const capHeader = document.querySelector(".capabilities-grid") || document.querySelector(".section-header.capabilities");
                if (capHeader) {
                    capHeader.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => {
                        const r = capHeader.getBoundingClientRect();
                        const sY = window.scrollY || window.pageYOffset || 0;
                        if (window.smoothGlideTo) {
                            window.smoothGlideTo(Math.round(r.left + 120), Math.round(r.top + sY), 700, () => {
                                this.emitThought("Curious about our benchmarks? We lock 60 FPS with sub-5MB Draco payloads.", 3500);
                            });
                        }
                    }, 400);
                }
            } else if (missionId === "contact") {
                const contactCard = document.querySelector(".contact-card");
                if (contactCard) {
                    contactCard.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => {
                        const r = contactCard.getBoundingClientRect();
                        const sY = window.scrollY || window.pageYOffset || 0;
                        if (window.smoothGlideTo) {
                            window.smoothGlideTo(Math.round(r.left + 120), Math.round(r.top + sY), 700, () => {
                                const cta = contactCard.querySelector(".cta-btn-primary");
                                if (cta && window.Player3D?.holographicSpotlight) {
                                    const cr = cta.getBoundingClientRect();
                                    window.Player3D.holographicSpotlight(Math.round(cr.left + cr.width/2), Math.round(cr.top + sY), 3000);
                                }
                                this.emitThought("Ready to collaborate? Let's discuss your project parameters!", 3500);
                            });
                        }
                    }, 400);
                }
            } else if (missionId === "fill") {
                const nameInput = document.querySelector('#inquiry-form input[name="name"]');
                if (nameInput) {
                    nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
                    nameInput.focus();
                    const r = nameInput.getBoundingClientRect();
                    const sY = window.scrollY || window.pageYOffset || 0;
                    if (window.smoothGlideTo) {
                        window.smoothGlideTo(Math.round(r.left + 60), Math.round(r.top + sY), 700, () => {
                            this.emitThought("Tell us about your project parameters!", 3000);
                        });
                    }
                }
            } else if (missionId === "scope") {
                const scopeSelect = document.querySelector('#inquiry-form select[name="scope"]') || document.querySelector("#engagement-card");
                if (scopeSelect) {
                    scopeSelect.scrollIntoView({ behavior: "smooth", block: "center" });
                    const r = scopeSelect.getBoundingClientRect();
                    const sY = window.scrollY || window.pageYOffset || 0;
                    if (window.smoothGlideTo) {
                        window.smoothGlideTo(Math.round(r.left + 60), Math.round(r.top + sY), 700, () => {
                            this.emitThought("Select scope parameters: Micro-Sprint to Flagship 3D Engine.", 3000);
                        });
                    }
                }
            }
        },

        updateBubblePosition(player) {
            if (typeof window === "undefined" || !this.bubbleElement || this.bubbleElement.style.display === "none" || !player) return;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const screenX = player.pos.x;
            const screenY = player.pos.y - scrollY;

            // Dynamically measure bubble bounds to guarantee collision-free clearance
            const bubbleW = this._cachedBubbleW || 280;
            const bubbleH = this._cachedBubbleH || 44;

            // Clamp bubble horizontally so it never clips viewport bounds
            const left = Math.max(16, Math.min(window.innerWidth - bubbleW - 20, screenX - bubbleW / 2));

            // Position bubble comfortably above BB-8 (BB-8 height ~60px + 16px clearance buffer + bubbleH)
            let top = screenY - 76 - bubbleH;
            let isFlipped = false;

            // If clipped by topbar header (54px + buffer), flip bubble cleanly below BB-8
            const minTopClearance = (typeof window !== "undefined" && window.innerWidth <= 768) ? 88 : 68;
            if (top < minTopClearance) {
                top = screenY + 24;
                isFlipped = true;
            }

            // Dynamically calculate tail offset so the pointer tail directly aligns with BB-8
            const tailOffset = Math.max(16, Math.min(bubbleW - 16, screenX - left));
            this.bubbleElement.style.setProperty("--tail-left", `${Math.round(tailOffset)}px`);
            this.bubbleElement.classList.toggle("bubble-flipped", isFlipped);

            this.bubbleElement.style.left = `${Math.round(left)}px`;
            this.bubbleElement.style.top = `${Math.round(top)}px`;
        },

        // --- TRAINED WORKFLOW HANDLERS ---
        onFormFocus(el) {
            this.currentIntent = INTENTS.INSPECT_FORM_INPUT;
            if (el) {
                this._cachedFormInputRect = (typeof el.getBoundingClientRect === "function") ? el.getBoundingClientRect() : null;
                this._cachedFormInputDom = el;
            }
            const name = (el.getAttribute("name") || el.getAttribute("placeholder") || "").toLowerCase();
            if (name.includes("scope") || name.includes("budget")) {
                this.emitThought("Selecting project parameters...", 2500);
            } else if (name.includes("message")) {
                this.emitThought("Tell me what we're building. 60 FPS guaranteed.", 3000);
            } else {
                this.emitThought("Input detected. Calibrating brief.", 2500);
            }
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.curiousInspect) {
                window.Player3D.curiousInspect();
            }
        },

        onScopeSelect(scope) {
            this.selectedScope = scope;
            this.lastScopeTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this.currentIntent = INTENTS.CALIBRATE_SCOPE;
            if (typeof document !== "undefined") {
                const scopeEl = document.querySelector('select[name="scope"], .scope-pill');
                if (scopeEl) this._cachedScopeRect = scopeEl.getBoundingClientRect();
            }
            const intel = this.getScopeKnowledge(scope);
            if (intel) {
                this.emitThought(intel.thought, 3200);
            } else {
                this.emitThought(`Scope configured: ${scope}`, 2500);
            }
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.curiousInspect) {
                window.Player3D.curiousInspect();
            }
        },

        onTierSelect(tier) {
            this.selectedTier = tier;
            this.lastTierTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this.currentIntent = INTENTS.VALIDATE_TIER;
            if (typeof document !== "undefined") {
                const budgetEl = document.querySelector('select[name="budget"], .tier-pill');
                if (budgetEl) this._cachedTierRect = budgetEl.getBoundingClientRect();
            }
            const intel = this.getTierKnowledge(tier);
            if (intel) {
                this.emitThought(intel.thought, 3200);
            } else {
                this.emitThought(`Budget parameter: ${tier}`, 2500);
            }
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.nod) {
                window.Player3D.nod();
            }
        },

        onValidationFail(fieldName) {
            this.validationAlertField = fieldName;
            this.lastValidationTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this.currentIntent = INTENTS.ALERT_VALIDATION;
            this.emitThought(`Missing ${fieldName || "contact"} coordinates above!`, 3000);
            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playAlert === "function") {
                const px = (window.player && window.player.pos) ? window.player.pos.x : null;
                window.SFX.playAlert(px);
            }
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.nod) {
                window.Player3D.nod();
            }
        },

        onFormReady() {
            this.isFormReady = true;
            this.currentIntent = INTENTS.PROMPT_SUBMIT;
            if (typeof document !== "undefined") {
                const submitEl = document.querySelector('#inquiry-form button[type="submit"]');
                if (submitEl) {
                    this._cachedSubmitRect = submitEl.getBoundingClientRect();
                    this._cachedSubmitDom = submitEl;
                }
            }
            this.emitThought("Brief locked. Transmit when ready ↗", 3500);
        },

        onFormSubmit() {
            this.isFormReady = false;
            this.currentIntent = INTENTS.CELEBRATE;
            this.isCelebrating = true;
            this.emitThought("Deal inquiry dispatched! 360° victory spin!", 4000);
            if (typeof window !== "undefined" && window.SFX && typeof window.SFX.playCelebrate === "function") {
                const px = (window.player && window.player.pos) ? window.player.pos.x : null;
                window.SFX.playCelebrate(px);
            }
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.celebrateVictory) {
                window.Player3D.celebrateVictory();
            }
            setTimeout(() => {
                this.isCelebrating = false;
                this.currentIntent = INTENTS.IDLE_PERCH;
            }, 3500);
        },

        onProspectSelect(prospect) {
            if (!prospect) return;
            this.selectedProspect = prospect;
            this.lastProspectTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this.currentIntent = INTENTS.AUDIT_PROSPECT;
            if (typeof document !== "undefined") {
                const selectedEl = document.querySelector('#queueList > div.bg-white\\/\\[0\\.08\\], #queueList > div');
                if (selectedEl) {
                    this._cachedProspectRect = selectedEl.getBoundingClientRect();
                    this._cachedProspectDom = selectedEl;
                }
            }
            const lcp = prospect.lcpTime || "4.0s";
            const flaw = (prospect.flaws && prospect.flaws[0]) || "";
            let defectText = `Auditing ${prospect.name || "prospect"}: ${lcp} mobile latency.`;
            if (flaw.toLowerCase().includes("dom") || (prospect.techStack && prospect.techStack.includes("WordPress"))) {
                defectText = this.getDefectKnowledge("dom");
            } else if (flaw.toLowerCase().includes("dpdp") || flaw.toLowerCase().includes("privacy")) {
                defectText = this.getDefectKnowledge("dpdp");
            } else if (parseFloat(lcp) > 3.0) {
                defectText = this.getDefectKnowledge("lcp");
            }
            this.emitThought(defectText, 3200);

            if (typeof window !== "undefined") {
                const targetEl = document.querySelector("#activeName") || document.querySelector(".studio-panel");
                if (targetEl && window.smoothGlideTo) {
                    const scrollY = window.scrollY || window.pageYOffset || 0;
                    const r = targetEl.getBoundingClientRect();
                    window.smoothGlideTo(Math.round(r.left + 80), Math.round(r.top + scrollY), 650);
                }
                if (window.Player3D && window.Player3D.curiousInspect) {
                    window.Player3D.curiousInspect();
                }
            }
        },

        onRadarFilter(city, query, count) {
            this.activeRadarFilter = { city, query, count };
            this.lastRadarTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this.currentIntent = INTENTS.RADAR_SWEEP;
            const countText = count !== undefined ? `${count} targets` : "Radar active";
            this.emitThought(`Radar: [${city || "All"}] ${countText}.`, 2500);

            if (typeof window !== "undefined") {
                const activeTab = document.querySelector(".city-tab.active") || document.querySelector(".city-tab");
                if (activeTab && window.smoothGlideTo) {
                    const scrollY = window.scrollY || window.pageYOffset || 0;
                    const r = activeTab.getBoundingClientRect();
                    window.smoothGlideTo(Math.round(r.left + r.width / 2), Math.round(r.top + scrollY), 550);
                }
                if (window.Player3D && window.Player3D.nod) {
                    window.Player3D.nod();
                }
            }
        },

        onCallStateChange(isCalling, duration = 0) {
            this.isCallActive = isCalling;
            this.callDuration = duration;
            if (isCalling) {
                this.currentIntent = INTENTS.CALL_STANDBY;
                this.emitThought("Live call in progress. Co-pilot standby active.", 2500);
            } else {
                this.currentIntent = INTENTS.IDLE_PERCH;
            }
        },

        onWorkspaceInteract(el) {
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.nod) {
                window.Player3D.nod();
            }
            if (el.classList?.contains("obj-btn") || el.classList?.contains("objection-btn")) {
                const title = el.textContent?.trim() || "Rebuttal";
                this.emitThought(`Deploying tactical rebuttal: "${title.slice(0, 30)}..."`, 2600);
                if (typeof window !== "undefined" && window.Player3D?.holographicSpotlight) {
                    const scrollY = window.scrollY || window.pageYOffset || 0;
                    const r = el.getBoundingClientRect();
                    window.Player3D.holographicSpotlight(Math.round(r.left + r.width/2), Math.round(r.top + scrollY), 2400);
                }
            }
        },

        // --- PAGE-SPECIFIC CLASSIFICATION ROUTINES ---
        classifyHomeIntent(telemetry) {
            const {
                playerPos = { x: 0, y: 0 },
                currentRail = null,
                groundedRail = currentRail,
                dwellTime = 0,
                viewportFocusY = 0,
                userScrollSpeed = 0
            } = telemetry;

            // Touchdown zone check on Home (ALT: 0 FT) - true bedrock landing
            if (playerPos.y >= 3470 || (groundedRail && groundedRail.name && groundedRail.name.includes("touchdown")) || (playerPos.y >= 3350 && !groundedRail && !telemetry.allRails)) {
                if (!this.hasCelebratedTouchdown) {
                    this.hasCelebratedTouchdown = true;
                    return INTENTS.CELEBRATE;
                }
                // If user is actively scrolling up, allow ascent; otherwise stay perched!
                if (userScrollSpeed < -6) {
                    return INTENTS.LEAD_ASCENT;
                }
                return INTENTS.IDLE_PERCH;
            } else if (playerPos.y < 3200) {
                this.hasCelebratedTouchdown = false;
            }

            // Active user scroll navigation takes precedence over stationary showcase
            if (viewportFocusY < playerPos.y - 180 || userScrollSpeed < -6) {
                return INTENTS.LEAD_ASCENT;
            }
            if (viewportFocusY > playerPos.y + 120 || userScrollSpeed > 6) {
                return INTENTS.LEAD_DESCENT;
            }

            // Flagship Project Showcase proximity check (prioritize rail name matching, fallback to spatial coordinate bounds)
            const allProjects = this.getProjectKnowledge();
            const projectByRail = groundedRail?.name ? allProjects.find(p => p.match.some(m => groundedRail.name.toLowerCase().includes(m))) : null;
            const matchingProject = projectByRail || allProjects.find(p => {
                const yMatch = playerPos.y >= p.yRange[0] && playerPos.y < p.yRange[1];
                if (!yMatch) return false;
                if (p.xRange) {
                    return playerPos.x >= p.xRange[0] && playerPos.x < p.xRange[1];
                }
                return true;
            });
            const isGroundedOnProject = Boolean(projectByRail || (groundedRail && matchingProject));
            if (matchingProject && (dwellTime > 1.2 || isGroundedOnProject)) {
                return INTENTS.SHOWCASE_PROJECT;
            }

            // Dwell on hero or reading area keeps BB-8 perched attentively with the visitor
            return INTENTS.IDLE_PERCH;
        },

        classifyCustomRule(telemetry) {
            const rules = this.getCustomRules();
            if (!rules || !rules.length) return null;
            const { page = "home", playerPos = { x: 0, y: 0 }, groundedRail = null, activeElement = null } = telemetry;

            for (const rule of rules) {
                if (rule.page && rule.page !== "all" && rule.page !== page) continue;

                if (rule.yRange && Array.isArray(rule.yRange) && rule.yRange.length === 2) {
                    if (playerPos.y < rule.yRange[0] || playerPos.y >= rule.yRange[1]) continue;
                }
                if (rule.xRange && Array.isArray(rule.xRange) && rule.xRange.length === 2) {
                    if (playerPos.x < rule.xRange[0] || playerPos.x >= rule.xRange[1]) continue;
                }
                if (rule.match && Array.isArray(rule.match) && rule.match.length > 0) {
                    const railName = (groundedRail?.name || "").toLowerCase();
                    const elId = (activeElement?.id || "").toLowerCase();
                    const elName = (activeElement?.name || "").toLowerCase();
                    const matchesRail = rule.match.some(m => railName.includes(m.toLowerCase()));
                    const matchesEl = rule.match.some(m => elId.includes(m.toLowerCase()) || elName.includes(m.toLowerCase()));
                    if (!matchesRail && !matchesEl && rule.match[0] !== "*") continue;
                }
                return rule;
            }
            return null;
        },

        classifySalesIntent(telemetry) {
            const { activeElement = null } = telemetry;
            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();

            if (this.validationAlertField && (now - this.lastValidationTime < 3500)) {
                return INTENTS.ALERT_VALIDATION;
            }
            const isScopeActive = this.selectedScope && (now - (this.lastScopeTime || 0) < 3200);
            const isTierActive = this.selectedTier && (now - (this.lastTierTime || 0) < 3200);
            if (isScopeActive && isTierActive) {
                return (this.lastTierTime || 0) > (this.lastScopeTime || 0) ? INTENTS.VALIDATE_TIER : INTENTS.CALIBRATE_SCOPE;
            }
            if (isScopeActive) {
                return INTENTS.CALIBRATE_SCOPE;
            }
            if (isTierActive) {
                return INTENTS.VALIDATE_TIER;
            }
            if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")) {
                return INTENTS.INSPECT_FORM_INPUT;
            }
            if (this.isFormReady) {
                return INTENTS.PROMPT_SUBMIT;
            }
            return INTENTS.IDLE_PERCH;
        },

        classifyWorkspaceIntent() {
            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();

            if (this.isCallActive) {
                return INTENTS.CALL_STANDBY;
            }
            if (this.activeRadarFilter && (now - this.lastRadarTime < 2500)) {
                return INTENTS.RADAR_SWEEP;
            }
            if (this.selectedProspect && (now - this.lastProspectTime < 4000)) {
                return INTENTS.AUDIT_PROSPECT;
            }
            return INTENTS.IDLE_PERCH;
        },

        classifyIntent(telemetry) {
            const {
                scrollY = 0,
                viewportHeight = 800,
                currentRail = null,
                playerPos = { x: 0, y: 0 },
                page = "home"
            } = telemetry;

            if (this.isCelebrating) {
                return INTENTS.CELEBRATE;
            }

            // Universal hazard evasion
            if (currentRail && currentRail.trap === "spikes") {
                return INTENTS.EVADE_HAZARD;
            }

            // Check custom trained trigger rules
            const customRule = this.classifyCustomRule(telemetry);
            if (customRule) {
                this.activeCustomRule = customRule;
                if (customRule.intent && INTENTS[customRule.intent]) {
                    return INTENTS[customRule.intent];
                }
                return INTENTS.SHOWCASE_PROJECT;
            } else {
                this.activeCustomRule = null;
            }

            // Priority: Active route-specific workflows take precedence over passive catch-up
            if (page === "sales") {
                const salesIntent = this.classifySalesIntent(telemetry);
                if (salesIntent !== INTENTS.IDLE_PERCH) return salesIntent;
            } else if (page === "workspace") {
                const wsIntent = this.classifyWorkspaceIntent(telemetry);
                if (wsIntent !== INTENTS.IDLE_PERCH) return wsIntent;
            }

            // Universal catch up sprint if BB-8 drifts off-screen
            const playerScreenY = playerPos.y - scrollY;
            if (playerScreenY < -60 || playerScreenY > viewportHeight + 60) {
                return INTENTS.CATCH_UP_SPRINT;
            }

            if (page === "sales") {
                return this.classifySalesIntent(telemetry);
            } else if (page === "workspace") {
                return this.classifyWorkspaceIntent(telemetry);
            }
            return this.classifyHomeIntent(telemetry);
        },

        // Evaluate step and produce actuator commands (<1ms runtime)
        evaluate(dt, telemetry) {
            const intent = this.classifyIntent(telemetry);
            this.currentIntent = intent;

            const {
                viewportFocusY = 0,
                currentRail = null,
                allRails = [],
                playerPos = { x: 0, y: 0 },
                isGrounded = true
            } = telemetry;

            this.wantsDrop = false;

            const result = {
                intent: intent,
                moveX: 0,
                wantsJump: false,
                wantsDrop: false,
                jumpForce: null,
                targetRail: null,
                targetX: null,
                action: null
            };

            switch (intent) {
                case INTENTS.CELEBRATE: {
                    result.action = "celebrate";
                    break;
                }

                case INTENTS.CATCH_UP_SPRINT: {
                    const targetY = viewportFocusY;
                    let bestRail = null;
                    let bestDist = Infinity;
                    for (const r of allRails) {
                        const d = Math.abs(r.y - targetY);
                        if (d < bestDist) {
                            bestDist = d;
                            bestRail = r;
                        }
                    }
                    if (bestRail) {
                        result.targetRail = bestRail;
                        const screenW = (typeof window !== "undefined") ? (window.innerWidth || 1200) : 1200;
                        const minX = 35;
                        const maxX = Math.max(minX, screenW - 35);
                        result.targetX = Math.max(minX, Math.min(maxX, bestRail.xLeft + Math.min(120, bestRail.width / 2)));

                        // Airborne thruster glide directly back into visible frame if significantly displaced
                        if (typeof window !== "undefined" && window.smoothGlideTo && !window.isAirborneGlide && Math.abs(playerPos.y - targetY) > 90) {
                            window.smoothGlideTo(result.targetX, bestRail.y, 550, () => {
                                if (window.System1Brain?.emitThought) {
                                    window.System1Brain.emitThought("Reconnected with visitor viewport.", 2200);
                                }
                            });
                            break;
                        }

                        if (playerPos.x < result.targetX - 20) result.moveX = 1;
                        else if (playerPos.x > result.targetX + 20) result.moveX = -1;
                        if (playerPos.y > targetY + 200 && isGrounded) {
                            result.wantsJump = true;
                        }
                    }
                    break;
                }

                case INTENTS.SHOWCASE_PROJECT: {
                    if (this.activeCustomRule) {
                        this.emitThought(this.activeCustomRule.thought, 3500);
                        if (this.activeCustomRule.action === "jump" && isGrounded) {
                            result.wantsJump = true;
                            result.jumpForce = this.activeCustomRule.jumpForce || 450;
                        } else if (this.activeCustomRule.action === "celebrate") {
                            if (typeof window !== "undefined" && window.Player3D?.celebrateVictory) {
                                window.Player3D.celebrateVictory();
                            }
                        } else if (this.activeCustomRule.action === "nod") {
                            if (typeof window !== "undefined" && window.Player3D?.nod) {
                                window.Player3D.nod();
                            }
                        }
                        if (this.activeCustomRule.audioCue && typeof window !== "undefined" && window.SFX?.[this.activeCustomRule.audioCue]) {
                            const now = performance.now();
                            if (!this._lastRuleAudioTime || now - this._lastRuleAudioTime > 3000) {
                                const px = (window.player && window.player.pos) ? window.player.pos.x : null;
                                window.SFX[this.activeCustomRule.audioCue](px);
                                this._lastRuleAudioTime = now;
                            }
                        }
                        break;
                    }
                    const allProjects = this.getProjectKnowledge();
                    const projectByRail = currentRail?.name ? allProjects.find(p => p.match.some(m => currentRail.name.toLowerCase().includes(m))) : null;
                    const matchingProject = projectByRail || allProjects.find(p => {
                        const yMatch = playerPos.y >= p.yRange[0] && playerPos.y < p.yRange[1];
                        if (!yMatch) return false;
                        if (p.xRange) {
                            return playerPos.x >= p.xRange[0] && playerPos.x < p.xRange[1];
                        }
                        return true;
                    });
                    if (matchingProject) {
                        this.emitThought(matchingProject.thought, 3500);
                        if (currentRail) {
                            const midX = currentRail.xLeft + currentRail.width / 2;
                            if (Math.abs(playerPos.x - midX) > 20) {
                                result.moveX = Math.sign(midX - playerPos.x) * 0.5;
                            }
                        }
                    }
                    break;
                }

                case INTENTS.CALIBRATE_SCOPE: {
                    const intel = this.getScopeKnowledge(this.selectedScope);
                    if (this._cachedScopeRect) {
                        const rect = this._cachedScopeRect;
                        const scrollYOffset = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                        const targetX = Math.round(rect.left + rect.width / 2);
                        const targetY = Math.round(rect.bottom + scrollYOffset);
                        const rail = allRails.find(r => Math.abs(r.y - targetY) < 30);
                        result.targetRail = rail || currentRail;
                        result.targetX = targetX;
                        if (Math.abs(playerPos.x - targetX) > 15) {
                            result.moveX = Math.sign(targetX - playerPos.x);
                        }
                    }
                    if (isGrounded) {
                        result.wantsJump = true;
                        result.jumpForce = (intel && intel.jumpForce) ? intel.jumpForce : 430;
                    }
                    break;
                }

                case INTENTS.VALIDATE_TIER: {
                    if (this._cachedTierRect) {
                        const rect = this._cachedTierRect;
                        const scrollYOffset = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                        const targetX = Math.round(rect.left + rect.width / 2);
                        result.targetX = targetX;
                        if (Math.abs(playerPos.x - targetX) > 15) {
                            result.moveX = Math.sign(targetX - playerPos.x);
                        }
                    }
                    if (isGrounded) {
                        result.wantsJump = true;
                        result.jumpForce = 460;
                    }
                    break;
                }

                case INTENTS.PROMPT_SUBMIT: {
                    if (this._cachedSubmitRect) {
                        const rect = this._cachedSubmitRect;
                        const scrollYOffset = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                        const targetX = Math.round(rect.left + rect.width / 2);
                        const targetY = Math.round(rect.bottom + scrollYOffset);
                        const rail = allRails.find(r => r.domElement === this._cachedSubmitDom || Math.abs(r.y - targetY) < 25);
                        result.targetRail = rail || currentRail;
                        result.targetX = targetX;
                        if (Math.abs(playerPos.x - targetX) > 20) {
                            result.moveX = Math.sign(targetX - playerPos.x);
                        }
                    }
                    break;
                }

                case INTENTS.ALERT_VALIDATION: {
                    result.wantsJump = true;
                    result.jumpForce = 440;
                    break;
                }

                case INTENTS.AUDIT_PROSPECT: {
                    if (this._cachedProspectRect) {
                        const rect = this._cachedProspectRect;
                        const scrollYOffset = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                        const targetX = Math.round(rect.left + 80);
                        const targetY = Math.round(rect.bottom + scrollYOffset);
                        const rail = allRails.find(r => r.domElement === this._cachedProspectDom || Math.abs(r.y - targetY) < 20);
                        result.targetRail = rail || currentRail;
                        result.targetX = targetX;
                        if (Math.abs(playerPos.x - targetX) > 20) {
                            result.moveX = Math.sign(targetX - playerPos.x);
                        }
                    }
                    break;
                }

                case INTENTS.RADAR_SWEEP: {
                    if (currentRail) {
                        const midX = currentRail.xLeft + currentRail.width / 2;
                        if (Math.abs(playerPos.x - midX) > 15) {
                            result.moveX = Math.sign(midX - playerPos.x) * 0.6;
                        }
                    }
                    break;
                }

                case INTENTS.CALL_STANDBY: {
                    // Stay poised and silent on cockpit rail
                    result.moveX = 0;
                    break;
                }

                case INTENTS.INSPECT_FORM_INPUT: {
                    const el = (telemetry && telemetry.activeElement) || this.activeFocusedElement || this._cachedFormInputDom;
                    // Use cached rect if available, otherwise fallback to live measurement
                    let rect = null;
                    if (el && this._cachedFormInputRect && el === this._cachedFormInputDom) {
                        rect = this._cachedFormInputRect;
                    } else if (el && typeof el.getBoundingClientRect === "function") {
                        rect = el.getBoundingClientRect();
                    }
                    if (el && rect) {
                        const scrollYOffset = (typeof window !== "undefined") ? (window.scrollY || window.pageYOffset || 0) : 0;
                        const targetX = Math.round(rect.left + Math.min(60, rect.width / 2));
                        const targetY = Math.round(rect.bottom + scrollYOffset);

                        const rail = allRails.find(r => r.domElement === el || (Math.abs(r.y - targetY) < 20 && r.xLeft <= targetX + 40 && r.xRight >= targetX - 40));
                        result.targetRail = rail || currentRail;
                        result.targetX = targetX;

                        if (Math.abs(playerPos.x - targetX) > 15) {
                            result.moveX = Math.sign(targetX - playerPos.x);
                        }

                        // Hop up to higher input card or hop down to lower input card
                        if (currentRail && rail && isGrounded) {
                            if (rail.y > currentRail.y + 15) {
                                if (Math.abs(playerPos.x - targetX) < 120) {
                                    result.wantsJump = true;
                                    result.jumpForce = 380;
                                }
                            } else if (rail.y < currentRail.y - 15) {
                                result.wantsJump = true;
                                result.jumpForce = Math.min(650, Math.max(480, (currentRail.y - rail.y) * 1.6 + 320));
                            }
                        }
                    }
                    break;
                }

                case INTENTS.EVADE_HAZARD: {
                    result.wantsJump = true;
                    result.jumpForce = 620;
                    const screenMid = (typeof window !== "undefined") ? (window.innerWidth / 2) : 500;
                    result.moveX = playerPos.x > screenMid ? -1 : 1;
                    break;
                }

                case INTENTS.LEAD_DESCENT: {
                    const refY = currentRail ? currentRail.y : playerPos.y;
                    let target = null;
                    let bestY = Infinity;
                    let fallbackTarget = null;
                    let fallbackY = Infinity;
                    for (let i = 0; i < allRails.length; i++) {
                        const r = allRails[i];
                        if (r.y > refY + 15 && r.y < refY + 700) {
                            if (r.y < fallbackY) {
                                fallbackY = r.y;
                                fallbackTarget = r;
                            }
                            if (!currentRail || (r.xLeft <= currentRail.xRight + 150 && r.xRight >= currentRail.xLeft - 150)) {
                                if (r.y < bestY) {
                                    bestY = r.y;
                                    target = r;
                                }
                            }
                        }
                    }
                    if (!target) target = fallbackTarget;

                    if (target) {
                        result.targetRail = target;
                        const screenW = (typeof window !== "undefined") ? (window.innerWidth || 1200) : 1200;
                        const minX = Math.max(35, Math.min(target.xLeft + 20, target.xRight - 20));
                        const maxX = Math.min(screenW - 35, Math.max(target.xRight - 20, target.xLeft + 20));
                        const chosenX = (maxX >= minX) ? Math.round((minX + maxX) / 2) : Math.max(35, Math.min(screenW - 35, target.xLeft + 20));
                        result.targetX = chosenX;

                        const dx = chosenX - playerPos.x;
                        const isHorizontallyAligned = Math.abs(dx) <= 30;
                        const isDirectlyUnderneath = isHorizontallyAligned && (target.xLeft <= playerPos.x + 25 && target.xRight >= playerPos.x - 25);

                        if (!isHorizontallyAligned) {
                            result.moveX = Math.sign(dx);
                        } else if (isDirectlyUnderneath && isGrounded) {
                            // Direct drop-through platform descent to prevent infinite jump loops (DEF-02)
                            result.wantsDrop = true;
                            this.wantsDrop = true;
                        } else if (currentRail) {
                            const distY = target.y - currentRail.y;
                            if (isGrounded) {
                                result.wantsJump = true;
                                result.jumpForce = distY > 180 ? 460 : 380;
                            }
                        }
                    }
                    break;
                }

                case INTENTS.LEAD_ASCENT: {
                    const refY = currentRail ? currentRail.y : playerPos.y;
                    let target = null;
                    let bestY = -Infinity;
                    for (let i = 0; i < allRails.length; i++) {
                        const r = allRails[i];
                        if (r.y < refY - 15 && r.y > refY - 600) {
                            if (r.y > bestY) {
                                bestY = r.y;
                                target = r;
                            }
                        }
                    }
                    if (target) {
                        result.targetRail = target;
                        const screenW = (typeof window !== "undefined") ? (window.innerWidth || 1200) : 1200;
                        result.targetX = Math.max(35, Math.min(screenW - 35, target.xLeft + target.width / 2));
                        if (Math.abs(playerPos.x - result.targetX) > 25) {
                            result.moveX = Math.sign(result.targetX - playerPos.x);
                        }
                        if (isGrounded) {
                            result.wantsJump = true;
                            result.jumpForce = 580;
                        }
                    }
                    break;
                }

                case INTENTS.IDLE_PERCH:
                default: {
                    if (currentRail) {
                        const safeMin = currentRail.xLeft + 25;
                        const safeMax = currentRail.xRight - 25;
                        if (safeMax > safeMin) {
                            if (playerPos.x < safeMin) {
                                result.moveX = 1;
                            } else if (playerPos.x > safeMax) {
                                result.moveX = -1;
                            } else {
                                if (typeof window !== "undefined" && window.mousePos2D) {
                                    const mX = window.mousePos2D.x;
                                    if (mX >= safeMin && mX <= safeMax && Math.abs(playerPos.x - mX) > 25) {
                                        result.moveX = Math.sign(mX - playerPos.x) * 0.4;
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }

            this.maybeEmitContextualThought(telemetry);

            return result;
        },

        maybeEmitContextualThought(telemetry) {
            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();
            if (now - this.lastThoughtTime < 8000) return;

            const { page = "home", playerPos = { y: 0 } } = telemetry;
            if (page === "home") {
                if (playerPos.y < 500) {
                    this.emitThought("Initiating atmospheric descent. 60 FPS locked.", 3200);
                } else if (playerPos.y >= 600 && playerPos.y < 1300) {
                    this.emitThought("ERAVEX 3D Studio: procedural GLSL & WebGPU core.", 3200);
                } else if (playerPos.y >= 1300 && playerPos.y < 2100) {
                    this.emitThought("Featherweight 3D assets. Sub-5MB Draco delivery.", 3200);
                } else if (playerPos.y >= 2100 && playerPos.y < 2800) {
                    this.emitThought("Sub-16ms render loop guaranteed on all devices.", 3200);
                } else if (playerPos.y >= 2800 && playerPos.y < 3300) {
                    this.emitThought("Direct creative tech contracts. Initiate below.", 3200);
                } else if (playerPos.y >= 3300) {
                    this.emitThought("Touchdown at Terra Firma. Let's build.", 3500);
                }
            } else if (page === "sales") {
                if (playerPos.y < 400) {
                    this.emitThought("Direct creative engineering. No agency bloat.", 3000);
                } else if (playerPos.y >= 400 && playerPos.y < 900) {
                    this.emitThought("Tell me what we're building. Rapid 24h turnaround.", 3000);
                } else {
                    this.emitThought("Milestone security & staged preview environments.", 3000);
                }
            } else if (page === "workspace") {
                this.emitThought("Client intelligence & live telemetry radar active.", 3000);
            }
        }
    };

    if (typeof window !== "undefined") {
        window.System1Brain = System1Brain;
        // Auto-initialize when DOM is ready
        if (typeof document !== "undefined") {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => System1Brain.init());
            } else {
                System1Brain.init();
            }
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { System1Brain, INTENTS, PROJECT_KNOWLEDGE, SCOPE_KNOWLEDGE, TIER_KNOWLEDGE, DEFECT_KNOWLEDGE };
    }
})();
