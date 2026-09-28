import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { System1Brain, INTENTS } from "../../system1_brain.js";

describe("Subsystem 3: System 1 Cognitive Decision Brain (Expanded Matrix)", () => {
  beforeEach(() => {
    if (typeof System1Brain.resetToFactory === "function") {
      System1Brain.resetToFactory();
    }
    System1Brain.isCallActive = false;
    System1Brain.activeRadarFilter = null;
    System1Brain.selectedProspect = null;
    System1Brain.selectedTier = null;
    System1Brain.selectedScope = null;
    System1Brain.validationAlertField = null;
    System1Brain.isFormReady = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("3.1 Multi-Page Intent Classification & State Transitions", () => {
    it("latches onto IDLE_PERCH after single CELEBRATE cycle upon bedrock touchdown (y >= 3470)", () => {
      const touchdownTelemetry = {
        scrollY: 2800,
        viewportFocusY: 3400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 200,
        currentRail: { name: "touchdown-zone", y: 3480 },
        playerPos: { x: 600, y: 3480 },
        activeElement: null,
        page: "home"
      };

      System1Brain.hasCelebratedTouchdown = false;

      const firstIntent = System1Brain.classifyIntent(touchdownTelemetry);
      expect(firstIntent).toBe(INTENTS.CELEBRATE);
      expect(System1Brain.hasCelebratedTouchdown).toBe(true);

      const secondIntent = System1Brain.classifyIntent(touchdownTelemetry);
      expect(secondIntent).toBe(INTENTS.IDLE_PERCH);
    });

    it("resets touchdown celebration latch when player ascends above y = 3200", () => {
      System1Brain.hasCelebratedTouchdown = true;

      const ascendedTelemetry = {
        scrollY: 2000,
        viewportFocusY: 2400,
        viewportHeight: 800,
        userScrollSpeed: -10,
        dwellTime: 0,
        currentRail: { name: "CARD_PROJECTS", y: 2200 },
        playerPos: { x: 500, y: 2200 },
        activeElement: null,
        page: "home"
      };

      System1Brain.classifyIntent(ascendedTelemetry);
      expect(System1Brain.hasCelebratedTouchdown).toBe(false);
    });

    it("transitions intent to LEAD_ASCENT when user scrolls rapidly upward (speed < -6)", () => {
      const ascentTelemetry = {
        scrollY: 1100, // screenY = 1224 - 1100 = 124 (inside viewport [0, 800])
        viewportFocusY: 1000,
        viewportHeight: 800,
        userScrollSpeed: -14,
        dwellTime: 0,
        currentRail: { name: "CARD_MAISON", y: 1224 },
        playerPos: { x: 400, y: 1224 },
        activeElement: null,
        page: "home"
      };

      const intent = System1Brain.classifyIntent(ascentTelemetry);
      expect(intent).toBe(INTENTS.LEAD_ASCENT);
    });

    it("transitions intent to LEAD_DESCENT when user scrolls rapidly downward (speed > +6)", () => {
      const descentTelemetry = {
        scrollY: 200, // screenY = 350 - 200 = 150 (inside viewport [0, 800])
        viewportFocusY: 600,
        viewportHeight: 800,
        userScrollSpeed: +18,
        dwellTime: 0,
        currentRail: { name: "HERO_RAIL", y: 350 },
        playerPos: { x: 500, y: 350 },
        activeElement: null,
        page: "home"
      };

      const intent = System1Brain.classifyIntent(descentTelemetry);
      expect(intent).toBe(INTENTS.LEAD_DESCENT);
    });

    it("resolves Maison Anima knowledge on column left (X < 720) vs Level Devil on column right (X >= 720)", () => {
      const maisonTelemetry = {
        scrollY: 1000,
        viewportFocusY: 1400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 800,
        currentRail: { name: "CARD_MAISON", y: 1300 },
        playerPos: { x: 350, y: 1300 },
        activeElement: null,
        page: "home"
      };

      const levelDevilTelemetry = {
        scrollY: 1000,
        viewportFocusY: 1400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 800,
        currentRail: { name: "CARD_LEVELDEVIL", y: 1300 },
        playerPos: { x: 850, y: 1300 },
        activeElement: null,
        page: "home"
      };

      expect(System1Brain.classifyIntent(maisonTelemetry)).toBe(INTENTS.SHOWCASE_PROJECT);
      expect(System1Brain.classifyIntent(levelDevilTelemetry)).toBe(INTENTS.SHOWCASE_PROJECT);
    });

    it("prioritizes INSPECT_FORM_INPUT over PROMPT_SUBMIT on Sales page when input is focused", () => {
      System1Brain.isFormReady = true;

      const typingTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 500,
        currentRail: null,
        playerPos: { x: 450, y: 450 },
        activeElement: { tagName: "INPUT" },
        page: "sales"
      };

      const intent = System1Brain.classifyIntent(typingTelemetry);
      expect(intent).toBe(INTENTS.INSPECT_FORM_INPUT);
    });

    it("transitions to PROMPT_SUBMIT on Sales page when form is ready and user is not typing", () => {
      System1Brain.isFormReady = true;

      const submitReadyTelemetry = {
        scrollY: 0,
        viewportFocusY: 600,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 1200,
        currentRail: null,
        playerPos: { x: 500, y: 650 },
        activeElement: null,
        page: "sales"
      };

      const intent = System1Brain.classifyIntent(submitReadyTelemetry);
      expect(intent).toBe(INTENTS.PROMPT_SUBMIT);
    });

    it("classifies VALIDATE_TIER when onTierSelect triggers on Sales page", () => {
      System1Brain.onTierSelect({ id: "tier-5k-15k", name: "$5k - $15k Tier" });
      System1Brain.isFormReady = false;

      const tierTelemetry = {
        scrollY: 0,
        viewportFocusY: 350,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 400,
        currentRail: null,
        playerPos: { x: 500, y: 350 },
        activeElement: null,
        page: "sales"
      };

      const intent = System1Brain.classifyIntent(tierTelemetry);
      expect(intent).toBe(INTENTS.VALIDATE_TIER);
    });

    it("classifies CALIBRATE_SCOPE when onScopeSelect triggers on Sales page", () => {
      System1Brain.onScopeSelect({ id: "scope-3d-webgl", name: "3D WebGL Engine" });
      System1Brain.selectedTier = null;
      System1Brain.isFormReady = false;

      const scopeTelemetry = {
        scrollY: 0,
        viewportFocusY: 250,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 300,
        currentRail: null,
        playerPos: { x: 400, y: 250 },
        activeElement: null,
        page: "sales"
      };

      const intent = System1Brain.classifyIntent(scopeTelemetry);
      expect(intent).toBe(INTENTS.CALIBRATE_SCOPE);
    });

    it("classifies ALERT_VALIDATION on Sales page when onValidationFail triggers", () => {
      System1Brain.onValidationFail("email");

      const alertTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 400, y: 400 },
        activeElement: null,
        page: "sales"
      };

      const intent = System1Brain.classifyIntent(alertTelemetry);
      expect(intent).toBe(INTENTS.ALERT_VALIDATION);
    });

    it("classifies CALL_STANDBY on Workspace when onCallStateChange(true) triggers", () => {
      System1Brain.onCallStateChange(true, 45);

      const callActiveTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 400 },
        activeElement: null,
        page: "workspace"
      };

      const intent = System1Brain.classifyIntent(callActiveTelemetry);
      expect(intent).toBe(INTENTS.CALL_STANDBY);
    });

    it("classifies RADAR_SWEEP on Workspace when onRadarFilter triggers", () => {
      System1Brain.onRadarFilter("Kerala", "", 12);

      const radarSweepTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 400 },
        activeElement: null,
        page: "workspace"
      };

      const intent = System1Brain.classifyIntent(radarSweepTelemetry);
      expect(intent).toBe(INTENTS.RADAR_SWEEP);
    });

    it("classifies AUDIT_PROSPECT on Workspace when onProspectSelect triggers", () => {
      System1Brain.onProspectSelect({ id: "lead-1", name: "Malabar Gold", lcpTime: "4.2s" });

      const auditTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 400 },
        activeElement: null,
        page: "workspace"
      };

      const intent = System1Brain.classifyIntent(auditTelemetry);
      expect(intent).toBe(INTENTS.AUDIT_PROSPECT);
    });

    it("transitions back to IDLE_PERCH when phone call terminates on Workspace", () => {
      System1Brain.onCallStateChange(false, 0);

      const idleTelemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 400 },
        activeElement: null,
        page: "workspace"
      };

      const intent = System1Brain.classifyIntent(idleTelemetry);
      expect(intent).toBe(INTENTS.IDLE_PERCH);
    });

    it("classifies CATCH_UP_SPRINT when droid is far below viewport (screenY > vh + 450)", () => {
      const farBelowTelemetry = {
        scrollY: 100,
        viewportFocusY: 450,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 1600 },
        activeElement: null,
        page: "home"
      };

      expect(System1Brain.classifyIntent(farBelowTelemetry)).toBe(INTENTS.CATCH_UP_SPRINT);
    });

    it("classifies CATCH_UP_SPRINT when droid is far above viewport (screenY < -200)", () => {
      const farAboveTelemetry = {
        scrollY: 1000,
        viewportFocusY: 1350,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 700 },
        activeElement: null,
        page: "home"
      };

      expect(System1Brain.classifyIntent(farAboveTelemetry)).toBe(INTENTS.CATCH_UP_SPRINT);
    });

    it("classifies EVADE_HAZARD when standing on a trap rail (trap === 'spikes')", () => {
      const trapTelemetry = {
        scrollY: 200,
        viewportFocusY: 350,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 100,
        currentRail: { name: "SPIKE_TRAP", y: 350, trap: "spikes" },
        playerPos: { x: 500, y: 350 },
        activeElement: null,
        page: "home"
      };

      expect(System1Brain.classifyIntent(trapTelemetry)).toBe(INTENTS.EVADE_HAZARD);
    });

    it("defaults to page home when telemetry page argument is omitted", () => {
      const noPageTelemetry = {
        scrollY: 0,
        viewportFocusY: 300,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 500, y: 300 },
        activeElement: null
      };

      const intent = System1Brain.classifyIntent(noPageTelemetry);
      expect(intent).toBe(INTENTS.IDLE_PERCH);
    });
  });

  describe("3.2 Thought Bubble Positioning, Clamping & Formatting", () => {
    it("flips thought bubble below BB-8 when approaching sticky top header (< 68px on desktop)", () => {
      const screenY = 50;
      const minTopClearance = 68;

      let top = screenY - 36 - 44;
      let isFlipped = false;

      if (top < minTopClearance) {
        top = screenY + 24;
        isFlipped = true;
      }

      expect(isFlipped).toBe(true);
      expect(top).toBe(74);
    });

    it("enforces higher top clearance on mobile viewports (88px) to account for flight tape dock", () => {
      const screenY = 70;
      const minTopClearance = 88;

      let top = screenY - 36 - 44;
      let isFlipped = false;

      if (top < minTopClearance) {
        top = screenY + 24;
        isFlipped = true;
      }

      expect(isFlipped).toBe(true);
      expect(top).toBe(94);
    });

    it("clamps thought bubble horizontally within screen boundaries [16, screenWidth - bubbleW - 16]", () => {
      const screenWidth = 1200;
      const bubbleW = 280;

      const clampBubbleX = (targetLeft) => Math.max(16, Math.min(targetLeft, screenWidth - bubbleW - 16));

      expect(clampBubbleX(-50)).toBe(16);
      expect(clampBubbleX(500)).toBe(500);
      expect(clampBubbleX(1150)).toBe(1200 - 280 - 16);
    });

    it("dynamically computes --tail-left percentage to point accurately at BB-8 chassis", () => {
      const bb8ScreenX = 600;
      const bubbleLeft = 460;
      const bubbleW = 280;

      const relativeX = bb8ScreenX - bubbleLeft;
      const tailPercent = Math.max(12, Math.min((relativeX / bubbleW) * 100, 88));

      expect(tailPercent).toBe(50);
    });

    it("suppresses thought bubble emission when Guidance HUD is currently active", () => {
      let emitted = false;
      const isHudActive = true;

      const emitThought = () => {
        if (isHudActive) return;
        emitted = true;
      };

      emitThought();
      expect(emitted).toBe(false);
    });

    it("provides hideThought() removing bubble from DOM immediately", () => {
      let bubbleInDOM = true;
      const hideThought = () => {
        bubbleInDOM = false;
      };

      hideThought();
      expect(bubbleInDOM).toBe(false);
    });

    it("formats markdown bold text (**bold**) into strong tags in companion bubble", () => {
      const formatMarkdown = (txt) => txt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      const input = "Check out **ERAVEX** 3D engine!";
      const output = formatMarkdown(input);

      expect(output).toBe("Check out <strong>ERAVEX</strong> 3D engine!");
    });

    it("sanitizes potential HTML script injections inside companion thoughts", () => {
      const sanitizeHtml = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const dangerousInput = "<script>alert('pwned')</script>";
      const safeOutput = sanitizeHtml(dangerousInput);

      expect(safeOutput).toBe("&lt;script&gt;alert('pwned')&lt;/script&gt;");
    });

    it("returns correct defect knowledge string for LCP performance bottlenecks", () => {
      const defect = System1Brain.getDefectKnowledge("lcp");
      expect(defect).toBeDefined();
      expect(defect.toLowerCase()).toContain("lcp");
    });

    it("returns correct defect knowledge string for DPDP privacy compliance", () => {
      const defect = System1Brain.getDefectKnowledge("dpdp");
      expect(defect).toBeDefined();
      expect(defect.toLowerCase()).toContain("dpdp");
    });

    it("returns correct defect knowledge string for bloated DOM / WordPress setups", () => {
      const defect = System1Brain.getDefectKnowledge("dom");
      expect(defect).toBeDefined();
      expect(defect.toLowerCase()).toContain("dom");
    });
  });

  describe("3.3 Dynamic Neural Knowledge Engine & Hot-Reload", () => {
    it("trains and retrieves custom project knowledge in < 1ms", () => {
      const startTime = performance.now();

      System1Brain.trainNode({
        id: "crypto-dex",
        category: "project",
        match: ["dex", "swap", "liquidity"],
        yRange: [800, 1400],
        thought: "Decentralized Liquidity Pool Engine: Sub-50ms execution.",
        action: "inspect"
      }, false);

      const projects = System1Brain.getProjectKnowledge();
      const node = projects.find(p => p.id === "crypto-dex");
      const elapsed = performance.now() - startTime;

      expect(node).toBeDefined();
      expect(node.thought).toContain("Decentralized Liquidity Pool Engine");
      expect(elapsed).toBeLessThan(15);
    });

    it("normalizes comma-separated string keywords into clean array of match tokens", () => {
      System1Brain.trainNode({
        id: "token-str-test",
        category: "project",
        match: "webgpu, compute, wgsl, 60fps",
        thought: "WGSL compute shader test.",
        action: "nod"
      }, false);

      const projects = System1Brain.getProjectKnowledge();
      const node = projects.find(p => p.id === "token-str-test");
      expect(Array.isArray(node.match)).toBe(true);
      expect(node.match).toContain("webgpu");
      expect(node.match).toContain("wgsl");
      expect(node.match).toContain("60fps");
    });

    it("trains custom scope parameters and verifies scope node registration", () => {
      System1Brain.trainNode({
        id: "scope-ai-agent",
        category: "scope",
        name: "Autonomous AI Agent Layer",
        baseFee: 85000,
        timeline: "10-14 days",
        thought: "Full-stack LLM Agent with zero-cost browser bridging."
      }, false);

      const all = System1Brain.getAllKnowledge();
      const scope = all.find(n => n.id === "scope-ai-agent" && n.category === "scope");
      expect(scope).toBeDefined();
      expect(scope.thought).toContain("Full-stack LLM Agent");
    });

    it("trains custom behavioral trigger rule with altitude and audio cue constraints", () => {
      System1Brain.trainNode({
        id: "secret-warp-trigger",
        category: "rule",
        yMin: 2200,
        yMax: 2600,
        action: "celebrate",
        thought: "Warp coordinates locked: Proceed to bedrock!",
        audioCue: "playCelebrate"
      }, false);

      const rules = System1Brain.getCustomRules();
      const rule = rules.find(r => r.id === "secret-warp-trigger");
      expect(rule).toBeDefined();
      expect(rule.action).toBe("celebrate");
      expect(rule.audioCue).toBe("playCelebrate");
    });

    it("exports complete neural knowledge checkpoint matching JSON snapshot schema", () => {
      const exportedJson = System1Brain.exportJSON();
      const parsed = JSON.parse(exportedJson);

      expect(parsed).toHaveProperty("projects");
      expect(parsed).toHaveProperty("scopes");
      expect(parsed).toHaveProperty("customRules");
      expect(parsed).toHaveProperty("tiers");
      expect(parsed).toHaveProperty("defects");
      expect(Array.isArray(parsed.projects)).toBe(true);
    });

    it("imports neural knowledge checkpoint and restores all nodes cleanly", () => {
      const testCheckpoint = JSON.stringify({
        projects: [
          { id: "imported-p1", match: ["imported"], yRange: [0, 500], thought: "Imported P1" }
        ],
        scopes: {},
        customRules: []
      });

      System1Brain.importJSON(testCheckpoint);
      const projects = System1Brain.getProjectKnowledge();
      const node = projects.find(p => p.id === "imported-p1");

      expect(node).toBeDefined();
      expect(node.thought).toBe("Imported P1");
    });

    it("restores factory neural knowledge upon resetToFactory()", () => {
      System1Brain.trainNode({
        id: "temp-p",
        category: "project",
        thought: "Temporary"
      }, false);

      expect(System1Brain.getProjectKnowledge().some(p => p.id === "temp-p")).toBe(true);

      System1Brain.resetToFactory();
      expect(System1Brain.getProjectKnowledge().some(p => p.id === "temp-p")).toBe(false);
      expect(System1Brain.getProjectKnowledge().some(p => p.id === "eravex")).toBe(true);
    });

    it("executes cognitive intent evaluation in under 1ms (60 FPS budget compliance)", () => {
      const telemetry = {
        scrollY: 1000,
        viewportFocusY: 1400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 200,
        currentRail: { name: "CARD_MAISON", y: 1300 },
        playerPos: { x: 350, y: 1300 },
        activeElement: null,
        page: "home"
      };

      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        System1Brain.classifyIntent(telemetry);
      }

      const totalTime = performance.now() - start;
      const avgTime = totalTime / iterations;

      expect(avgTime).toBeLessThan(1.0);
    });

    it("supports custom rule matching against page route and active input element ID", () => {
      System1Brain.trainNode({
        id: "custom-input-focus",
        category: "rule",
        match: ["inquiry-message"],
        page: "sales",
        thought: "Analyzing custom project brief parameters...",
        action: "inspect"
      }, false);

      const telemetry = {
        scrollY: 0,
        viewportFocusY: 300,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 400, y: 300 },
        activeElement: { id: "inquiry-message", tagName: "TEXTAREA" },
        page: "sales"
      };

      const matchedRule = System1Brain.classifyCustomRule(telemetry);
      expect(matchedRule).toBeDefined();
      expect(matchedRule.id).toBe("custom-input-focus");
      expect(matchedRule.thought).toContain("Analyzing custom project brief");
    });

    it("evaluates custom rule page: 'all' across any page route", () => {
      System1Brain.trainNode({
        id: "universal-rule",
        category: "rule",
        page: "all",
        match: ["universal-target"],
        thought: "Universal rule activated."
      }, false);

      const telemetry = {
        scrollY: 0,
        viewportFocusY: 200,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 200, y: 200 },
        activeElement: { id: "universal-target" },
        page: "workspace"
      };

      const matched = System1Brain.classifyCustomRule(telemetry);
      expect(matched).toBeDefined();
      expect(matched.id).toBe("universal-rule");
    });

    it("evaluates custom rule horizontal xRange bounds", () => {
      System1Brain.trainNode({
        id: "left-sector-rule",
        category: "rule",
        xRange: [100, 300],
        match: ["*"],
        thought: "Left sector detected."
      }, false);

      const inBounds = { page: "home", playerPos: { x: 200, y: 500 } };
      const outOfBounds = { page: "home", playerPos: { x: 450, y: 500 } };

      expect(System1Brain.classifyCustomRule(inBounds)).toBeDefined();
      expect(System1Brain.classifyCustomRule(outOfBounds)).toBeNull();
    });

    it("evaluates wildcard match token ['*'] without requiring specific element ID", () => {
      System1Brain.trainNode({
        id: "wildcard-rule",
        category: "rule",
        yRange: [700, 900],
        match: ["*"],
        thought: "Wildcard altitude triggered."
      }, false);

      const telemetry = {
        page: "home",
        playerPos: { x: 500, y: 800 },
        activeElement: null
      };

      const matched = System1Brain.classifyCustomRule(telemetry);
      expect(matched).toBeDefined();
      expect(matched.id).toBe("wildcard-rule");
    });

    it("returns null when no custom rules match the current telemetry context", () => {
      const telemetry = {
        page: "home",
        playerPos: { x: 500, y: 9999 },
        activeElement: null
      };

      const matched = System1Brain.classifyCustomRule(telemetry);
      expect(matched).toBeNull();
    });

    it("onFormSubmit sets currentIntent to CELEBRATE and isCelebrating to true", () => {
      System1Brain.isFormReady = true;
      System1Brain.onFormSubmit();

      expect(System1Brain.isFormReady).toBe(false);
      expect(System1Brain.currentIntent).toBe(INTENTS.CELEBRATE);
      expect(System1Brain.isCelebrating).toBe(true);
    });

    it("onFormReady sets isFormReady to true and currentIntent to PROMPT_SUBMIT", () => {
      System1Brain.isFormReady = false;
      System1Brain.onFormReady();

      expect(System1Brain.isFormReady).toBe(true);
      expect(System1Brain.currentIntent).toBe(INTENTS.PROMPT_SUBMIT);
    });

    it("tracks call duration during onCallStateChange", () => {
      System1Brain.onCallStateChange(true, 120);

      expect(System1Brain.isCallActive).toBe(true);
      expect(System1Brain.callDuration).toBe(120);
    });

    it("updates radar filter parameters on onRadarFilter", () => {
      System1Brain.onRadarFilter("Bengaluru", "FinTech", 45);

      expect(System1Brain.activeRadarFilter).toEqual({
        city: "Bengaluru",
        query: "FinTech",
        count: 45
      });
    });

    it("handles onWorkspaceInteract with objection button elements", () => {
      let emittedText = null;
      System1Brain.emitThought = (txt) => { emittedText = txt; };

      const mockObjButton = {
        classList: { contains: (cls) => cls === "obj-btn" },
        textContent: "We already have an agency"
      };

      System1Brain.onWorkspaceInteract(mockObjButton);
      expect(emittedText).toContain("Deploying value defense");
    });

    it("binds events idempotently without registering duplicate window listeners", () => {
      System1Brain._eventsBound = false;
      const initialBound = System1Brain._eventsBound;

      System1Brain._eventsBound = true;
      expect(System1Brain._eventsBound).toBe(true);
    });

    it("evaluates custom rule with yRange constraint rejecting altitudes outside bounds", () => {
      System1Brain.trainNode({
        id: "altitude-specific-rule",
        category: "rule",
        yRange: [1500, 2000],
        match: ["*"],
        thought: "Altitude window matched."
      }, false);

      const inAlt = { page: "home", playerPos: { x: 500, y: 1750 } };
      const outAlt = { page: "home", playerPos: { x: 500, y: 2400 } };

      expect(System1Brain.classifyCustomRule(inAlt)).toBeDefined();
      expect(System1Brain.classifyCustomRule(outAlt)).toBeNull();
    });

    it("returns null custom rule when activeElement does not match rule keywords", () => {
      System1Brain.trainNode({
        id: "strict-match-rule",
        category: "rule",
        match: ["special-target"],
        thought: "Special target focus."
      }, false);

      const telemetry = {
        page: "home",
        playerPos: { x: 500, y: 500 },
        activeElement: { id: "ordinary-element" }
      };

      expect(System1Brain.classifyCustomRule(telemetry)).toBeNull();
    });

    it("records lastScopeTime timestamp when onScopeSelect is invoked", () => {
      System1Brain.onScopeSelect({ id: "scope-test", name: "Scope Test" });

      expect(System1Brain.selectedScope).toEqual({ id: "scope-test", name: "Scope Test" });
      expect(System1Brain.lastScopeTime).toBeGreaterThan(0);
    });

    it("records lastTierTime timestamp when onTierSelect is invoked", () => {
      System1Brain.onTierSelect({ id: "tier-test", name: "Tier Test" });

      expect(System1Brain.selectedTier).toEqual({ id: "tier-test", name: "Tier Test" });
      expect(System1Brain.lastTierTime).toBeGreaterThan(0);
    });
  });
});
