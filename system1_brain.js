// system1_brain.js - Non-Autoregressive Typed-State Autonomous AI Companion Brain
// Inspired by the typed classification philosophy of Laya and Jev
(function () {
    "use strict";

    const INTENTS = {
        IDLE_PERCH: "IDLE_PERCH",
        LEAD_DESCENT: "LEAD_DESCENT",
        LEAD_ASCENT: "LEAD_ASCENT",
        INSPECT_FORM_INPUT: "INSPECT_FORM_INPUT",
        EVADE_HAZARD: "EVADE_HAZARD",
        CATCH_UP_SPRINT: "CATCH_UP_SPRINT",
        CELEBRATE: "CELEBRATE"
    };

    const System1Brain = {
        intents: INTENTS,
        currentIntent: INTENTS.IDLE_PERCH,
        currentThought: null,
        bubbleElement: null,
        bubbleTimeout: null,
        lastThoughtTime: 0,
        dwellStartTime: 0,
        lastDwellY: 0,
        dwellDuration: 0,
        targetRail: null,
        targetX: null,
        activeFocusedElement: null,
        isCelebrating: false,
        lastIntentChange: 0,
        stepDownTimer: 0,

        init() {
            if (typeof document !== "undefined") {
                this.setupBubble();
                this.bindEvents();
            }
            console.log("System 1 Decision Brain Initialized (Laya/Jev Architecture).");
        },

        setupBubble() {
            if (typeof document === "undefined") return;
            let el = document.getElementById("companion-bubble");
            if (!el) {
                el = document.createElement("div");
                el.id = "companion-bubble";
                el.className = "companion-bubble";
                el.style.display = "none";
                document.body.appendChild(el);
            }
            this.bubbleElement = el;
        },

        bindEvents() {
            if (typeof document === "undefined") return;

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

            // Listen for form submit
            document.addEventListener("submit", (e) => {
                const form = e.target;
                if (form && (form.id === "inquiry-form" || form.getAttribute("name") === "inquiry")) {
                    this.onFormSubmit();
                }
            });

            // Listen for prospect card clicks in workspace
            document.addEventListener("click", (e) => {
                const prospectItem = e.target.closest("#queueList > div, .obj-btn, #callActionBtn, #whatsappActionBtn, .city-tab");
                if (prospectItem) {
                    this.onWorkspaceInteract(prospectItem);
                }
            });
        },

        emitThought(text, duration = 3200) {
            if (typeof document === "undefined") return;
            if (!this.bubbleElement) this.setupBubble();
            if (!this.bubbleElement) return;

            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();
            // Minimum cooldown between spontaneous thoughts (unless celebrate / submit / touchdown)
            const isPriority = text.includes("dispatched") || text.includes("TOUCHDOWN") || text.includes("Terra Firma");
            if (!isPriority && (now - this.lastThoughtTime < 5000)) {
                return;
            }

            this.currentThought = text;
            this.lastThoughtTime = now;
            this.bubbleElement.textContent = text;
            this.bubbleElement.style.display = "block";
            this.bubbleElement.style.opacity = "1";

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

        updateBubblePosition(player) {
            if (typeof window === "undefined" || !this.bubbleElement || this.bubbleElement.style.display === "none" || !player) return;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const screenX = player.pos.x;
            const screenY = player.pos.y - scrollY;

            // Clamp so bubble doesn't clip screen boundaries
            const bubbleW = 200;
            const left = Math.max(16, Math.min(window.innerWidth - bubbleW - 20, screenX - bubbleW / 2));
            const top = Math.max(64, screenY - 115);

            this.bubbleElement.style.left = `${Math.round(left)}px`;
            this.bubbleElement.style.top = `${Math.round(top)}px`;
        },

        onFormFocus(el) {
            this.currentIntent = INTENTS.INSPECT_FORM_INPUT;
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

        onFormSubmit() {
            this.currentIntent = INTENTS.CELEBRATE;
            this.isCelebrating = true;
            this.emitThought("Deal inquiry dispatched! 360° victory spin!", 4000);
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.celebrateVictory) {
                window.Player3D.celebrateVictory();
            }
            setTimeout(() => {
                this.isCelebrating = false;
                this.currentIntent = INTENTS.IDLE_PERCH;
            }, 3500);
        },

        onWorkspaceInteract(el) {
            if (typeof window !== "undefined" && window.Player3D && window.Player3D.nod) {
                window.Player3D.nod();
            }
            if (el.classList?.contains("obj-btn")) {
                this.emitThought("Deploying direct client rebuttal...", 2200);
            } else if (el.id === "callActionBtn") {
                this.emitThought("Initiating high-priority call sequence.", 2500);
            } else if (el.classList?.contains("city-tab")) {
                this.emitThought(`Filtering territory: ${el.textContent?.trim()}`, 2000);
            } else {
                this.emitThought("Inspecting lead dossier telemetry.", 2000);
            }
        },

        classifyIntent(telemetry) {
            const {
                scrollY = 0,
                viewportFocusY = 0,
                viewportHeight = 800,
                userScrollSpeed = 0,
                dwellTime = 0,
                currentRail = null,
                playerPos = { x: 0, y: 0 },
                activeElement = null,
                page = "home"
            } = telemetry;
            const groundedRail = telemetry.groundedRail !== undefined ? telemetry.groundedRail : currentRail;

            if (this.isCelebrating) {
                return INTENTS.CELEBRATE;
            }

            // Check if player is far away from viewport (catch up)
            const playerScreenY = playerPos.y - scrollY;
            if (playerScreenY < -200 || playerScreenY > viewportHeight + 450) {
                return INTENTS.CATCH_UP_SPRINT;
            }

            // If an input is actively focused on /sales
            if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")) {
                return INTENTS.INSPECT_FORM_INPUT;
            }

            // Check if current rail or target is hazard
            if (currentRail && currentRail.trap === "spikes") {
                return INTENTS.EVADE_HAZARD;
            }

            // Touchdown zone check on Home (ALT: 0 FT) - true bedrock landing
            if (page === "home" && (
                (playerPos.y >= 3470 && (groundedRail?.name?.includes("touchdown") || groundedRail?.y >= 3470)) ||
                (playerPos.y >= 3350 && !groundedRail && !telemetry.allRails)
            )) {
                return INTENTS.CELEBRATE;
            }

            // Descent / Ascent guiding
            // If visitor is scrolling down, or viewport focus is below player by > 100px
            if (viewportFocusY > playerPos.y + 100 || userScrollSpeed > 6) {
                return INTENTS.LEAD_DESCENT;
            }

            // If visitor is scrolling up, or viewport focus is above player by > 180px
            if (viewportFocusY < playerPos.y - 180 || userScrollSpeed < -6) {
                return INTENTS.LEAD_ASCENT;
            }

            // If dwelling on same section for a while, can periodically step down to guide visitor
            if (dwellTime > 4.0 && page === "home") {
                return INTENTS.LEAD_DESCENT;
            }

            return INTENTS.IDLE_PERCH;
        },

        // Evaluate step and produce actuator commands (<1ms runtime)
        evaluate(dt, telemetry) {
            const intent = this.classifyIntent(telemetry);
            this.currentIntent = intent;

            const {
                scrollY = 0,
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
                        result.targetX = bestRail.xLeft + bestRail.width / 2;
                        if (playerPos.x < result.targetX - 20) result.moveX = 1;
                        else if (playerPos.x > result.targetX + 20) result.moveX = -1;
                        if (playerPos.y > targetY + 200 && isGrounded) {
                            result.wantsJump = true;
                        }
                    }
                    break;
                }

                case INTENTS.INSPECT_FORM_INPUT: {
                    const el = (telemetry && telemetry.activeElement) || this.activeFocusedElement || (typeof document !== "undefined" ? document.querySelector("#inquiry-form input:focus, #inquiry-form textarea:focus, #inquiry-form button[type='submit'], #inquiry-card") : null);
                    if (el) {
                        const rect = (typeof el.getBoundingClientRect === "function") ? el.getBoundingClientRect() : { left: playerPos.x, right: playerPos.x + 100, width: 100, bottom: playerPos.y };
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
                    if (currentRail) {
                        const nextRails = allRails.filter(r => r.y > currentRail.y + 15 && r.y < currentRail.y + 700);
                        nextRails.sort((a, b) => a.y - b.y);

                        let target = nextRails.find(r => (r.xLeft <= currentRail.xRight + 150 && r.xRight >= currentRail.xLeft - 150)) || nextRails[0];

                        if (target) {
                            result.targetRail = target;
                            const minX = Math.max(target.xLeft + 20, Math.min(target.xRight - 20, currentRail.xLeft));
                            const maxX = Math.min(target.xRight - 20, Math.max(target.xLeft + 20, currentRail.xRight));
                            const chosenX = Math.round((minX + maxX) / 2);
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
                            } else {
                                const distY = target.y - currentRail.y;
                                if (isGrounded) {
                                    result.wantsJump = true;
                                    result.jumpForce = distY > 180 ? 460 : 380;
                                }
                            }
                        }
                    }
                    break;
                }

                case INTENTS.LEAD_ASCENT: {
                    if (currentRail) {
                        const aboveRails = allRails.filter(r => r.y < currentRail.y - 15 && r.y > currentRail.y - 600);
                        aboveRails.sort((a, b) => b.y - a.y);
                        const target = aboveRails[0];
                        if (target) {
                            result.targetRail = target;
                            result.targetX = target.xLeft + target.width / 2;
                            if (Math.abs(playerPos.x - result.targetX) > 25) {
                                result.moveX = Math.sign(result.targetX - playerPos.x);
                            }
                            if (isGrounded) {
                                result.wantsJump = true;
                                result.jumpForce = 580;
                            }
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
        module.exports = { System1Brain, INTENTS };
    }
})();
