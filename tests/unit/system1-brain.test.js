import { describe, expect, it, beforeEach } from "vitest";
import { System1Brain, INTENTS } from "../../system1_brain.js";

describe("System 1 Decision Brain", () => {
  beforeEach(() => {
    if (typeof System1Brain.resetToFactory === "function") {
      System1Brain.resetToFactory();
    }
  });

  it("defines all required typed intent states", () => {
    expect(INTENTS.IDLE_PERCH).toBe("IDLE_PERCH");
    expect(INTENTS.LEAD_DESCENT).toBe("LEAD_DESCENT");
    expect(INTENTS.LEAD_ASCENT).toBe("LEAD_ASCENT");
    expect(INTENTS.INSPECT_FORM_INPUT).toBe("INSPECT_FORM_INPUT");
    expect(INTENTS.EVADE_HAZARD).toBe("EVADE_HAZARD");
    expect(INTENTS.CATCH_UP_SPRINT).toBe("CATCH_UP_SPRINT");
    expect(INTENTS.CELEBRATE).toBe("CELEBRATE");
  });

  it("classifies CATCH_UP_SPRINT when player is far out of viewport", () => {
    const telemetryFarBelow = {
      scrollY: 100,
      viewportFocusY: 450,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: null,
      playerPos: { x: 500, y: 1600 }, // 1600 - 100 = 1500 > 800 + 450
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetryFarBelow)).toBe(INTENTS.CATCH_UP_SPRINT);

    const telemetryFarAbove = {
      scrollY: 1000,
      viewportFocusY: 1350,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: null,
      playerPos: { x: 500, y: 700 }, // 700 - 1000 = -300 < -200
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetryFarAbove)).toBe(INTENTS.CATCH_UP_SPRINT);
  });

  it("classifies INSPECT_FORM_INPUT when form element is active", () => {
    const mockInput = { tagName: "INPUT" };
    const telemetry = {
      scrollY: 0,
      viewportFocusY: 300,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: null,
      playerPos: { x: 300, y: 300 },
      activeElement: mockInput,
      page: "sales"
    };
    expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.INSPECT_FORM_INPUT);
  });

  it("classifies EVADE_HAZARD when standing on spike trap", () => {
    const telemetry = {
      scrollY: 1000,
      viewportFocusY: 1300,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: { xLeft: 200, xRight: 600, y: 1200, trap: "spikes" },
      playerPos: { x: 400, y: 1200 },
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.EVADE_HAZARD);
  });

  it("classifies CELEBRATE at touchdown zone on home", () => {
    const telemetry = {
      scrollY: 3000,
      viewportFocusY: 3300,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: null,
      playerPos: { x: 500, y: 3400 },
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.CELEBRATE);
  });

  it("stays in IDLE_PERCH during extended dwell time (no autonomous abandonment)", () => {
    const telemetry = {
      scrollY: 0,
      viewportFocusY: 400,
      viewportHeight: 900,
      userScrollSpeed: 0,
      dwellTime: 12.0, // User has been idle for 12 seconds
      currentRail: { xLeft: 200, xRight: 800, y: 336, trap: "normal", name: "H1" },
      groundedRail: { xLeft: 200, xRight: 800, y: 336, trap: "normal", name: "H1" },
      playerPos: { x: 400, y: 336 },
      activeElement: null,
      page: "home",
      isGrounded: true
    };
    const intent = System1Brain.classifyIntent(telemetry);
    // BB-8 must NEVER descend just because the visitor is reading
    expect(intent).not.toBe(INTENTS.LEAD_DESCENT);
    expect([INTENTS.IDLE_PERCH, INTENTS.SHOWCASE_PROJECT]).toContain(intent);
  });

  it("classifies LEAD_DESCENT when visitor is scrolling down", () => {
    const telemetry = {
      scrollY: 200,
      viewportFocusY: 600, // viewportFocusY (600) > playerPos.y (400) + 100
      viewportHeight: 800,
      userScrollSpeed: 10,
      dwellTime: 0,
      currentRail: { xLeft: 200, xRight: 800, y: 400, trap: "normal" },
      playerPos: { x: 400, y: 400 },
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.LEAD_DESCENT);
  });

  it("classifies LEAD_ASCENT when visitor scrolls up", () => {
    const telemetry = {
      scrollY: 100,
      viewportFocusY: 300, // viewportFocusY (300) < playerPos.y (600) - 180
      viewportHeight: 800,
      userScrollSpeed: -8,
      dwellTime: 0,
      currentRail: { xLeft: 200, xRight: 800, y: 600, trap: "normal" },
      playerPos: { x: 400, y: 600 },
      activeElement: null,
      page: "home"
    };
    expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.LEAD_ASCENT);
  });

  it("evaluates LEAD_DESCENT actuator commands towards target rail", () => {
    const currentRail = { xLeft: 200, xRight: 600, y: 400, width: 400, trap: "normal" };
    const nextRail = { xLeft: 500, xRight: 900, y: 550, width: 400, trap: "normal" };
    const telemetry = {
      scrollY: 200,
      viewportFocusY: 600,
      viewportHeight: 800,
      userScrollSpeed: 8,
      dwellTime: 0,
      currentRail: currentRail,
      allRails: [currentRail, nextRail],
      playerPos: { x: 300, y: 400 },
      activeElement: null,
      page: "home",
      isGrounded: true
    };

    const cmd = System1Brain.evaluate(0.016, telemetry);
    expect(cmd.intent).toBe(INTENTS.LEAD_DESCENT);
    expect(cmd.targetRail).toBe(nextRail);
    // Player is at x: 300, target is around x: 550, so moveX should be 1 (right)
    expect(cmd.moveX).toBe(1);
  });

  it("evaluates EVADE_HAZARD actuator to trigger high hurdle jump", () => {
    const hazardRail = { xLeft: 200, xRight: 600, y: 400, width: 400, trap: "spikes" };
    const telemetry = {
      scrollY: 100,
      viewportFocusY: 450,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: hazardRail,
      allRails: [hazardRail],
      playerPos: { x: 400, y: 400 },
      activeElement: null,
      page: "home",
      isGrounded: true
    };

    const cmd = System1Brain.evaluate(0.016, telemetry);
    expect(cmd.intent).toBe(INTENTS.EVADE_HAZARD);
    expect(cmd.wantsJump).toBe(true);
    expect(cmd.jumpForce).toBeGreaterThan(600);
  });

  it("verifies living dynamic DOM landing rails and smooth thruster hover-glide in portfolio_engine.js", () => {
    const fs = require("fs");
    const railsData = JSON.parse(fs.readFileSync("ground_rails.json", "utf8"));
    expect(railsData.length).toBe(51);

    const firstRail = railsData[0];
    const lastRail = railsData[railsData.length - 1];
    expect(firstRail.y).toBeLessThan(300);
    expect(lastRail.name).toBe("DIV.touchdown-zone");
    expect(lastRail.y).toBeGreaterThanOrEqual(3400);

    const engineSrc = fs.readFileSync("portfolio_engine.js", "utf8");
    expect(engineSrc).toContain("generatePageRails()");
    expect(engineSrc).toContain("window.smoothGlideTo =");
    expect(engineSrc).toContain("initClickToSummon()");
    expect(engineSrc).toContain("!window.isAirborneGlide");
  });

  it("verifies System 1 Brain Guidance HUD and mission dispatchers", () => {
    expect(typeof System1Brain.showGuidanceHUD).toBe("function");
    expect(typeof System1Brain.closeHUD).toBe("function");
    expect(typeof System1Brain.startMission).toBe("function");

    // Test startMission runs cleanly without error across missions
    expect(() => System1Brain.startMission("deals")).not.toThrow();
    expect(() => System1Brain.startMission("flaws")).not.toThrow();
    expect(() => System1Brain.startMission("call")).not.toThrow();
    expect(() => System1Brain.startMission("work")).not.toThrow();
  });

  it("evaluates INSPECT_FORM_INPUT actuator to hop up to higher inputs", () => {
    const submitRail = { xLeft: 200, xRight: 400, y: 700, width: 200, trap: "cta" };
    const inputRail = { xLeft: 200, xRight: 400, y: 500, width: 200, trap: "normal" };
    const mockInput = {
      getBoundingClientRect: () => ({ left: 220, right: 380, width: 160, bottom: 500 }),
      tagName: "INPUT"
    };

    const telemetry = {
      scrollY: 0,
      viewportFocusY: 550,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: submitRail,
      allRails: [submitRail, inputRail],
      playerPos: { x: 250, y: 700 },
      activeElement: mockInput,
      page: "sales",
      isGrounded: true
    };

    const cmd = System1Brain.evaluate(0.016, telemetry);
    expect(cmd.intent).toBe(INTENTS.INSPECT_FORM_INPUT);
    expect(cmd.wantsJump).toBe(true);
    expect(cmd.jumpForce).toBeGreaterThanOrEqual(500);
  });

  it("evaluates INSPECT_FORM_INPUT actuator to hop down to lower inputs", () => {
    const topInputRail = { xLeft: 200, xRight: 400, y: 300, width: 200, trap: "normal" };
    const bottomInputRail = { xLeft: 200, xRight: 400, y: 450, width: 200, trap: "normal" };
    const mockTextarea = {
      getBoundingClientRect: () => ({ left: 220, right: 380, width: 160, bottom: 450 }),
      tagName: "TEXTAREA"
    };

    const telemetry = {
      scrollY: 0,
      viewportFocusY: 400,
      viewportHeight: 800,
      userScrollSpeed: 0,
      dwellTime: 0,
      currentRail: topInputRail,
      allRails: [topInputRail, bottomInputRail],
      playerPos: { x: 250, y: 300 },
      activeElement: mockTextarea,
      page: "sales",
      isGrounded: true
    };

    const cmd = System1Brain.evaluate(0.016, telemetry);
    expect(cmd.intent).toBe(INTENTS.INSPECT_FORM_INPUT);
    expect(cmd.wantsJump).toBe(true);
    expect(cmd.jumpForce).toBe(380);
  });

  describe("Unified Multi-Page Trained Playbooks", () => {
    it("exports all new typed intent states", () => {
      expect(INTENTS.SHOWCASE_PROJECT).toBe("SHOWCASE_PROJECT");
      expect(INTENTS.CALIBRATE_SCOPE).toBe("CALIBRATE_SCOPE");
      expect(INTENTS.VALIDATE_TIER).toBe("VALIDATE_TIER");
      expect(INTENTS.PROMPT_SUBMIT).toBe("PROMPT_SUBMIT");
      expect(INTENTS.ALERT_VALIDATION).toBe("ALERT_VALIDATION");
      expect(INTENTS.AUDIT_PROSPECT).toBe("AUDIT_PROSPECT");
      expect(INTENTS.RADAR_SWEEP).toBe("RADAR_SWEEP");
      expect(INTENTS.CALL_STANDBY).toBe("CALL_STANDBY");
    });

    it("classifies SHOWCASE_PROJECT when dwelling on Home flagship cards", () => {
      const eravexRail = { name: "eravex-card-rail", y: 900, xLeft: 100, xRight: 800, width: 700 };
      const telemetry = {
        scrollY: 500,
        viewportFocusY: 900,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 3.5,
        currentRail: eravexRail,
        playerPos: { x: 300, y: 900 },
        page: "home",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.SHOWCASE_PROJECT);
    });

    it("classifies CALIBRATE_SCOPE and executes calibrated jump force on Sales", () => {
      System1Brain.onScopeSelect("WebGPU Shader Architecture");
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 300,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: { xLeft: 100, xRight: 300, y: 350, width: 200 },
        playerPos: { x: 200, y: 350 },
        page: "sales",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.CALIBRATE_SCOPE);
      const cmd = System1Brain.evaluate(0.016, telemetry);
      expect(cmd.intent).toBe(INTENTS.CALIBRATE_SCOPE);
      expect(cmd.jumpForce).toBe(450);
    });

    it("classifies VALIDATE_TIER and prompts high-value commitment thought on Sales", () => {
      System1Brain.onTierSelect("$15k+");
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: { xLeft: 100, xRight: 300, y: 400, width: 200 },
        playerPos: { x: 200, y: 400 },
        page: "sales",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.VALIDATE_TIER);
      const cmd = System1Brain.evaluate(0.016, telemetry);
      expect(cmd.intent).toBe(INTENTS.VALIDATE_TIER);
      expect(cmd.jumpForce).toBe(460);
    });

    it("classifies ALERT_VALIDATION on submit with missing required inputs", () => {
      System1Brain.onValidationFail("Email");
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: null,
        playerPos: { x: 200, y: 400 },
        page: "sales",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.ALERT_VALIDATION);
      const cmd = System1Brain.evaluate(0.016, telemetry);
      expect(cmd.intent).toBe(INTENTS.ALERT_VALIDATION);
      expect(cmd.wantsJump).toBe(true);
    });

    it("classifies AUDIT_PROSPECT on Workspace and targets prospect row", () => {
      const mockProspect = {
        id: "p-42",
        name: "Acme Dental",
        lcpTime: "4.8s",
        techStack: "WordPress, Elementor",
        flaws: ["High DOM clutter", "No consent form"]
      };
      System1Brain.onProspectSelect(mockProspect);
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 200,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: { xLeft: 50, xRight: 350, y: 200, width: 300 },
        playerPos: { x: 100, y: 200 },
        page: "workspace",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.AUDIT_PROSPECT);
      const cmd = System1Brain.evaluate(0.016, telemetry);
      expect(cmd.intent).toBe(INTENTS.AUDIT_PROSPECT);
    });

    it("classifies CALL_STANDBY on Workspace when phone call is active", () => {
      System1Brain.onCallStateChange(true, 15);
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 200,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: { xLeft: 50, xRight: 350, y: 200, width: 300 },
        playerPos: { x: 100, y: 200 },
        page: "workspace",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.CALL_STANDBY);
      const cmd = System1Brain.evaluate(0.016, telemetry);
      expect(cmd.intent).toBe(INTENTS.CALL_STANDBY);
      expect(cmd.moveX).toBe(0);

      // Reset call
      System1Brain.onCallStateChange(false);
    });

    it("classifies RADAR_SWEEP on Workspace when territory filter changes", () => {
      System1Brain.onRadarFilter("SF / Bay", "", 24);
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 100,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 0,
        currentRail: { xLeft: 50, xRight: 350, y: 100, width: 300 },
        playerPos: { x: 100, y: 100 },
        page: "workspace",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.RADAR_SWEEP);
    });

    it("classifies SHOWCASE_PROJECT on Jarvis card and emits zero-cost bridge thought", () => {
      const jarvisRail = { name: "ARTICLE.standard-project-card.jarvis::roof", y: 1800, xLeft: 200, xRight: 900, width: 700 };
      const telemetry = {
        scrollY: 1400,
        viewportFocusY: 1800,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 2.0,
        currentRail: jarvisRail,
        playerPos: { x: 450, y: 1800 },
        page: "home",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.SHOWCASE_PROJECT);
      System1Brain.evaluate(0.016, telemetry);
      expect(System1Brain.currentThought).toContain("Jarvis: Zero-cost LLM gateway proxy");
    });

    it("correctly resolves Maison Anima (left) vs Level Devil (right) in side-by-side columns", () => {
      // Both at Y = 1400 (within [1210, 1620]), but Maison is on left (x=400) and Level Devil is on right (x=850)
      const telemetryMaison = {
        scrollY: 1000,
        viewportFocusY: 1400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 2.0,
        currentRail: { xLeft: 100, xRight: 600, y: 1400, width: 500 },
        playerPos: { x: 400, y: 1400 },
        page: "home",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetryMaison)).toBe(INTENTS.SHOWCASE_PROJECT);
      System1Brain.evaluate(0.016, telemetryMaison);
      expect(System1Brain.currentThought).toContain("Maison Anima");

      // Reset thought throttle
      System1Brain.lastThoughtTime = 0;

      const telemetryLevelDevil = {
        scrollY: 1000,
        viewportFocusY: 1400,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 2.0,
        currentRail: { xLeft: 750, xRight: 1250, y: 1400, width: 500 },
        playerPos: { x: 850, y: 1400 },
        page: "home",
        isGrounded: true
      };
      expect(System1Brain.classifyIntent(telemetryLevelDevil)).toBe(INTENTS.SHOWCASE_PROJECT);
      System1Brain.evaluate(0.016, telemetryLevelDevil);
      expect(System1Brain.currentThought).toContain("Level Devil Engine");
    });

    it("positions companion bubble above BB-8 with dynamic tail offset and flippable margin", () => {
      const mockProps = {};
      const mockClassList = new Set();
      const mockBubble = {
        offsetWidth: 280,
        offsetHeight: 44,
        style: {
          display: "block",
          left: "",
          top: "",
          setProperty: (k, v) => { mockProps[k] = v; },
          getPropertyValue: (k) => mockProps[k]
        },
        classList: {
          toggle: (cls, val) => {
            if (val) mockClassList.add(cls);
            else mockClassList.delete(cls);
          },
          contains: (cls) => mockClassList.has(cls)
        }
      };

      System1Brain.bubbleElement = mockBubble;
      globalThis.window = { innerWidth: 1200, innerHeight: 800, scrollY: 100 };

      const mockPlayer = { pos: { x: 400, y: 500 } };
      System1Brain.updateBubblePosition(mockPlayer);

      expect(mockBubble.style.left).toBe("260px"); // 400 - 280/2 = 260px
      expect(mockBubble.style.top).toBe("280px");  // (500 - 100) - 76 - 44 = 280px (full BB-8 height clearance)
      expect(mockBubble.style.getPropertyValue("--tail-left")).toBe("140px"); // 400 - 260 = 140px (dead center)
      expect(mockClassList.has("bubble-flipped")).toBe(false);

      // Test top boundary flip when near top of viewport (e.g. screenY = 120 -> top = 120 - 120 = 0 < 68)
      const mockPlayerNearTop = { pos: { x: 400, y: 220 } }; // screenY = 220 - 100 = 120
      System1Brain.updateBubblePosition(mockPlayerNearTop);
      expect(mockClassList.has("bubble-flipped")).toBe(true);
      expect(mockBubble.style.top).toBe("144px"); // 120 + 24 = 144px

      delete globalThis.window;
    });
  });

  describe("Dynamic Neural Knowledge Training & Inspection", () => {
    it("trains, overrides, and introspects project knowledge nodes", () => {
      System1Brain.resetToFactory();

      const baseProjects = System1Brain.getProjectKnowledge();
      expect(baseProjects.length).toBeGreaterThanOrEqual(6);

      // Train a new custom project node
      const trainedNode = System1Brain.trainNode({
        id: "quantum_forge",
        category: "project",
        match: ["quantum", "forge", "quantum-card"],
        yRange: [2950, 3400],
        thought: "Quantum Forge: Sub-atomic compute matrix trained in real-time.",
        action: "jump",
        jumpForce: 490
      }, false);

      expect(trainedNode.id).toBe("quantum_forge");
      expect(trainedNode.source).toBe("trained");

      // Verify custom trained node is at the front of project knowledge
      const updatedProjects = System1Brain.getProjectKnowledge();
      expect(updatedProjects[0].id).toBe("quantum_forge");
      expect(updatedProjects[0].thought).toContain("Quantum Forge");

      // Test classification on the custom trained project
      const telemetry = {
        scrollY: 2800,
        viewportFocusY: 3100,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 2.0,
        currentRail: { name: "quantum-forge-rail", xLeft: 100, width: 200 },
        groundedRail: { name: "quantum-forge-rail", xLeft: 100, width: 200 },
        playerPos: { x: 200, y: 3100 },
        page: "home"
      };
      expect(System1Brain.classifyIntent(telemetry)).toBe(INTENTS.SHOWCASE_PROJECT);

      // Verify introspection catalog contains both factory and trained nodes
      const allKnowledge = System1Brain.getAllKnowledge();
      const customEntry = allKnowledge.find(k => k.id === "quantum_forge");
      expect(customEntry).toBeDefined();
      expect(customEntry.source).toBe("trained");

      // Clean up
      System1Brain.deleteTrainedNode("quantum_forge");
      expect(System1Brain.getProjectKnowledge().some(p => p.id === "quantum_forge")).toBe(false);
    });

    it("trains and resolves custom scope and budget tier parameters", () => {
      System1Brain.resetToFactory();

      System1Brain.trainNode({
        id: "Holographic Neural Rig",
        category: "scope",
        thought: "Scope: Volumetric gaussian radiance fields at locked 60 FPS.",
        jumpForce: 520
      }, false);

      const scopeIntel = System1Brain.getScopeKnowledge("Holographic Neural Rig");
      expect(scopeIntel).toBeDefined();
      expect(scopeIntel.thought).toContain("Volumetric gaussian radiance fields");
      expect(scopeIntel.jumpForce).toBe(520);

      // Train custom budget tier
      System1Brain.trainNode({
        id: "$50k+ Syndicate",
        category: "tier",
        thought: "Syndicate Tier ($50k+): Sovereign WebGPU engine infrastructure deployed."
      }, false);

      const tierIntel = System1Brain.getTierKnowledge("$50k+ Syndicate");
      expect(tierIntel).toBeDefined();
      expect(tierIntel.thought).toContain("Sovereign WebGPU engine");

      System1Brain.resetToFactory();
    });

    it("trains custom behavioral trigger rules", () => {
      System1Brain.resetToFactory();

      System1Brain.trainNode({
        id: "vip_terminal_focus",
        category: "custom_trigger",
        match: ["vip-secret-input"],
        page: "sales",
        thought: "⚡ VIP clearance sequence detected. Unlocking fast-track rail.",
        action: "celebrate"
      }, false);

      const mockInput = { id: "vip-secret-input", tagName: "INPUT" };
      const telemetry = {
        scrollY: 0,
        viewportFocusY: 200,
        viewportHeight: 800,
        userScrollSpeed: 0,
        dwellTime: 1.0,
        currentRail: null,
        playerPos: { x: 300, y: 300 },
        activeElement: mockInput,
        page: "sales"
      };

      const matchedRule = System1Brain.classifyCustomRule(telemetry);
      expect(matchedRule).toBeDefined();
      expect(matchedRule.id).toBe("vip_terminal_focus");
      expect(matchedRule.thought).toContain("VIP clearance sequence");

      System1Brain.resetToFactory();
    });

    it("exports and imports neural knowledge JSON checkpoints", () => {
      System1Brain.resetToFactory();

      System1Brain.trainNode({
        id: "checkpoint_test",
        category: "project",
        match: ["checkpoint"],
        yRange: [1000, 1500],
        thought: "Test Checkpoint Thought"
      }, false);

      const exportedJson = System1Brain.exportJSON();
      expect(exportedJson).toContain("checkpoint_test");

      System1Brain.resetToFactory();
      expect(System1Brain.getProjectKnowledge().some(p => p.id === "checkpoint_test")).toBe(false);

      // Re-import
      System1Brain.importJSON(exportedJson);
      expect(System1Brain.getProjectKnowledge().some(p => p.id === "checkpoint_test")).toBe(true);

      System1Brain.resetToFactory();
    });

    it("synchronizes knowledge bidirectionally with Cloud Firestore", async () => {
      System1Brain.resetToFactory();

      const mockDocs = [
        {
          data: () => ({
            id: "cloud_trained_project",
            name: "CLOUD PROJECT",
            category: "project",
            thought: "⚡ Synchronized from Cloud Firestore node.",
            keywords: ["cloud", "webrtc"]
          })
        }
      ];

      const mockDb = {
        collection: (colName) => ({
          get: async () => ({
            empty: false,
            forEach: (cb) => mockDocs.forEach(cb)
          }),
          doc: (docId) => ({
            set: async (payload, opts) => {
              return true;
            }
          })
        })
      };

      // 1. Sync from Firestore
      await System1Brain.syncWithFirestore(mockDb);
      const all = System1Brain.getAllKnowledge();
      const synced = all.find(n => n.id === "cloud_trained_project");
      expect(synced).toBeDefined();
      expect(synced.thought).toContain("Synchronized from Cloud Firestore");

      // 2. Push to Firestore
      let pushedDocs = [];
      const mockPushDb = {
        collection: (colName) => ({
          doc: (docId) => ({
            set: async (payload, opts) => {
              pushedDocs.push({ id: docId, payload });
              return true;
            }
          })
        })
      };

      await System1Brain.pushToFirestore(mockPushDb);
      expect(pushedDocs.some(d => d.id === "cloud_trained_project")).toBe(true);

      System1Brain.resetToFactory();
    });
  });
});
