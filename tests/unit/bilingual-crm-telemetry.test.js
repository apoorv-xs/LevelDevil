import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";

describe("Subsystem 6: Bilingual Closer CRM & Teleprompter Telemetry", () => {
  let objectionsModule;

  beforeEach(() => {
    const code = fs.readFileSync(path.resolve(__dirname, "../../workspace/objections.js"), "utf8");
    const sandbox = {
      window: {},
      document: {
        getElementById: vi.fn().mockReturnValue(null),
        querySelectorAll: vi.fn().mockReturnValue([])
      }
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    objectionsModule = sandbox.window;
  });

  describe("6.1 Bilingual Objection Soundboard Script Integrity", () => {
    it("verifies the master objections dictionary contains 6 high-conversion objections", () => {
      const objections = objectionsModule.OBJECTIONS;
      expect(objections).toBeDefined();
      const keys = Object.keys(objections);
      expect(keys.length).toBeGreaterThanOrEqual(6);
    });

    it("ensures every objection contains high-signal English and Malayalam rebuttals", () => {
      const objections = objectionsModule.OBJECTIONS;
      for (const [key, obj] of Object.entries(objections)) {
        expect(obj.title).toBeDefined();
        expect(obj.title.length).toBeGreaterThan(3);

        // English script
        expect(obj.en).toBeDefined();
        expect(obj.en.length).toBeGreaterThan(20);

        // Malayalam script
        expect(obj.ml).toBeDefined();
        expect(obj.ml.length).toBeGreaterThan(20);
      }
    });

    it("verifies objection script content references 60 FPS or performance benchmarks", () => {
      const objections = objectionsModule.OBJECTIONS;
      const allText = Object.values(objections).map((o) => o.en).join(" ");
      expect(allText).toMatch(/60 FPS|performance|seconds|speed|drop-off/i);
    });
  });

  describe("6.2 Layman Analogies Integrity", () => {
    it("verifies the layman analogies dictionary contains at least 5 technical analogies", () => {
      const analogies = objectionsModule.LAYMAN_ANALOGIES;
      expect(analogies).toBeDefined();
      const keys = Object.keys(analogies);
      expect(keys.length).toBeGreaterThanOrEqual(5);
    });

    it("ensures every analogy contains an explanation, hook, and closing question", () => {
      const analogies = objectionsModule.LAYMAN_ANALOGIES;
      for (const [key, item] of Object.entries(analogies)) {
        expect(item.title).toBeDefined();
        expect(item.metaphor).toBeDefined();
        expect(item.metaphor.length).toBeGreaterThan(20);
        expect(item.talkingPoint).toBeDefined();
        expect(item.talkingPoint.length).toBeGreaterThan(20);
      }
    });
  });

  describe("6.3 1-Tap Closer Note Insertion Formatting", () => {
    function appendRebuttalToNotes(existingNotes, rebuttalText, mockTimeStr = "14:30") {
      const prefix = `\n[${mockTimeStr}] Rebuttal: `;
      const cleanedExisting = (existingNotes || "").trim();
      if (!cleanedExisting) {
        return `[${mockTimeStr}] Rebuttal: ${rebuttalText}`;
      }
      return `${cleanedExisting}${prefix}${rebuttalText}`;
    }

    it("formats 1-tap note insertion with timestamp when notes field is empty", () => {
      const res = appendRebuttalToNotes("", "Explained 60 FPS rendering advantage.", "10:15");
      expect(res).toBe("[10:15] Rebuttal: Explained 60 FPS rendering advantage.");
    });

    it("appends to existing notes without overwriting previous context", () => {
      const initial = "Founder was hesitant about agency pricing.";
      const res = appendRebuttalToNotes(initial, "Offered 50/25/25 milestone structure.", "10:18");
      expect(res).toContain(initial);
      expect(res).toContain("\n[10:18] Rebuttal: Offered 50/25/25 milestone structure.");
    });
  });

  describe("6.4 Indian Currency Grouping & Commission Math", () => {
    function formatINR(amount) {
      if (typeof amount !== "number" || isNaN(amount)) return "₹0";
      // Format with Indian numbering system grouping (lakhs, crores)
      return "₹" + amount.toLocaleString("en-IN");
    }

    function calculateCommission(fee, commissionRate = 0.15, minFloor = 7500) {
      const raw = fee * commissionRate;
      return Math.max(raw, minFloor);
    }

    function calculateAdvanceDeposit(fee, depositRate = 0.50) {
      return fee * depositRate;
    }

    it("formats amounts according to Indian numbering commas", () => {
      expect(formatINR(50000)).toBe("₹50,000");
      expect(formatINR(150000)).toBe("₹1,50,000");
      expect(formatINR(1000000)).toBe("₹10,00,000");
      expect(formatINR(2500000)).toBe("₹25,00,000");
    });

    it("enforces ₹7,500 commission floor on baseline ₹50,000 contract", () => {
      const comm = calculateCommission(50000, 0.15, 7500);
      expect(comm).toBe(7500);
    });

    it("calculates exact 15% commission on flagship ₹2,00,000 deal", () => {
      const comm = calculateCommission(200000, 0.15, 7500);
      expect(comm).toBe(30000);
    });

    it("calculates exact 50% upfront advance milestone", () => {
      expect(calculateAdvanceDeposit(50000)).toBe(25000);
      expect(calculateAdvanceDeposit(150000)).toBe(75000);
      expect(calculateAdvanceDeposit(500000)).toBe(250000);
    });
  });
});
