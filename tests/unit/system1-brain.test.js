import { describe, expect, it } from "vitest";
import { System1Brain, INTENTS } from "../../system1_brain.js";

describe("System 1 Decision Brain", () => {
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

  it("verifies exactly 51 calibrated rails taking BB-8 down to Terra Firma", () => {
    const fs = require("fs");
    const railsData = JSON.parse(fs.readFileSync("ground_rails.json", "utf8"));
    expect(railsData.length).toBe(51);

    const firstRail = railsData[0];
    const lastRail = railsData[railsData.length - 1];
    expect(firstRail.y).toBeLessThan(300);
    expect(lastRail.name).toBe("DIV.touchdown-zone");
    expect(lastRail.y).toBeGreaterThanOrEqual(3400);

    const engineSrc = fs.readFileSync("portfolio_engine.js", "utf8");
    const match = engineSrc.match(/const CALIBRATED_RAILS = (\[[\s\S]*?\]);/);
    expect(match).not.toBeNull();
    const engineRails = JSON.parse(match[1]);
    expect(engineRails.length).toBe(51);
    expect(engineRails[engineRails.length - 1].name).toBe("DIV.touchdown-zone");
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
  });
});
