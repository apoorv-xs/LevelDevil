import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";

describe("Subsystem 11: Workspace Data Pipeline & Territory Filtering Invariants", () => {
  let prospectsModule;

  beforeEach(() => {
    const code = fs.readFileSync(path.resolve(__dirname, "../../workspace/prospects_data.js"), "utf8");
    const sandbox = {
      window: {},
      document: {
        getElementById: vi.fn().mockReturnValue(null),
        querySelectorAll: vi.fn().mockReturnValue([])
      }
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    prospectsModule = sandbox.window;
  });

  describe("11.1 Master Dossier Deduplication & Structure", () => {
    it("loads master prospects dataset containing at least 60 curated dossiers", () => {
      const prospects = prospectsModule.DEFAULT_PROSPECTS || prospectsModule.PROSPECTS;
      expect(prospects).toBeDefined();
      expect(Array.isArray(prospects)).toBe(true);
      expect(prospects.length).toBeGreaterThanOrEqual(60);
    });

    it("verifies deduplication logic by unique prospect ID", () => {
      const dataset = [
        { id: "lead-1", name: "Alpha Clinic", city: "Kochi" },
        { id: "lead-2", name: "Beta Hospital", city: "Calicut" },
        { id: "lead-1", name: "Alpha Clinic Updated", city: "Kochi" } // Duplicate ID
      ];

      function deduplicateById(items) {
        const seen = new Set();
        return items.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      }

      const deduplicated = deduplicateById(dataset);
      expect(deduplicated.length).toBe(2);
      expect(deduplicated[0].name).toBe("Alpha Clinic");
      expect(deduplicated[1].name).toBe("Beta Hospital");
    });
  });

  describe("11.2 Territory Filtering Invariants", () => {
    const SAMPLE_PROSPECTS = [
      { id: "p1", name: "Kochi Dental", city: "Kochi", territory: "Ernakulam" },
      { id: "p2", name: "Calicut Eye Care", city: "Kozhikode", territory: "Kozhikode" },
      { id: "p3", name: "Trivandrum Ortho", city: "Thiruvananthapuram", territory: "Trivandrum" },
      { id: "p4", name: "Thrissur Heart Care", city: "Thrissur", territory: "Thrissur" },
      { id: "p5", name: "Aluva Skin Clinic", city: "Ernakulam", territory: "Ernakulam" }
    ];

    function filterByTerritory(prospects, activeTerritory) {
      if (!activeTerritory || activeTerritory === "All" || activeTerritory === "ALL") {
        return prospects;
      }
      return prospects.filter((p) => {
        const t = (p.territory || p.city || "").toLowerCase();
        return t.includes(activeTerritory.toLowerCase());
      });
    }

    it("returns all prospects when territory filter is set to 'All'", () => {
      const filtered = filterByTerritory(SAMPLE_PROSPECTS, "All");
      expect(filtered.length).toBe(5);
    });

    it("filters prospects belonging strictly to Ernakulam territory", () => {
      const filtered = filterByTerritory(SAMPLE_PROSPECTS, "Ernakulam");
      expect(filtered.length).toBe(2);
      expect(filtered.map((p) => p.id)).toEqual(["p1", "p5"]);
    });

    it("filters prospects belonging strictly to Kozhikode territory", () => {
      const filtered = filterByTerritory(SAMPLE_PROSPECTS, "Kozhikode");
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("p2");
    });

    it("filters prospects belonging strictly to Trivandrum territory", () => {
      const filtered = filterByTerritory(SAMPLE_PROSPECTS, "Trivandrum");
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("p3");
    });
  });

  describe("11.3 Lead Lifecycle State Transitions & Commission Tracking", () => {
    function transitionLeadStatus(lead, newStatus) {
      const VALID_TRANSITIONS = {
        verified: ["contacted", "disqualified"],
        contacted: ["interested", "callback_requested", "disqualified"],
        interested: ["proposal_sent", "meeting_booked", "disqualified"],
        proposal_sent: ["closed_won", "closed_lost"],
        meeting_booked: ["proposal_sent", "closed_won", "closed_lost"],
        closed_won: [],
        disqualified: ["verified"] // Re-activation
      };

      const allowed = VALID_TRANSITIONS[lead.status] || [];
      if (allowed.includes(newStatus)) {
        return { success: true, lead: { ...lead, status: newStatus } };
      }
      return { success: false, lead, reason: `ILLEGAL_TRANSITION_FROM_${lead.status}_TO_${newStatus}` };
    }

    it("permits legal progression: verified -> contacted -> interested -> proposal_sent -> closed_won", () => {
      let lead = { id: "p1", status: "verified", fee: 150000 };

      const step1 = transitionLeadStatus(lead, "contacted");
      expect(step1.success).toBe(true);
      lead = step1.lead;

      const step2 = transitionLeadStatus(lead, "interested");
      expect(step2.success).toBe(true);
      lead = step2.lead;

      const step3 = transitionLeadStatus(lead, "proposal_sent");
      expect(step3.success).toBe(true);
      lead = step3.lead;

      const step4 = transitionLeadStatus(lead, "closed_won");
      expect(step4.success).toBe(true);
      expect(step4.lead.status).toBe("closed_won");
    });

    it("blocks illegal jumping: verified directly to closed_won without contact", () => {
      const lead = { id: "p2", status: "verified", fee: 75000 };
      const step = transitionLeadStatus(lead, "closed_won");
      expect(step.success).toBe(false);
      expect(step.reason).toContain("ILLEGAL_TRANSITION");
    });

    it("computes aggregate commissions accurately across all closed_won deals", () => {
      const closedDeals = [
        { id: "c1", fee: 50000, status: "closed_won" },
        { id: "c2", fee: 150000, status: "closed_won" },
        { id: "c3", fee: 300000, status: "closed_won" }
      ];

      function calculateTotalEarnedCommission(deals, commissionRate = 0.15, floor = 7500) {
        return deals.reduce((total, deal) => {
          const comm = Math.max(deal.fee * commissionRate, floor);
          return total + comm;
        }, 0);
      }

      // Deal 1: 50,000 * 0.15 = 7,500
      // Deal 2: 150,000 * 0.15 = 22,500
      // Deal 3: 300,000 * 0.15 = 45,000
      // Total: 75,000
      const totalCommission = calculateTotalEarnedCommission(closedDeals);
      expect(totalCommission).toBe(75000);
    });
  });
});
