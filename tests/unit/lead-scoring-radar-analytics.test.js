import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 12: Lead Scoring & Client Radar Revenue Telemetry", () => {
  describe("12.1 Core Web Vitals & LCP Latency Scoring", () => {
    function scoreLCP(lcpSeconds) {
      if (typeof lcpSeconds !== "number" || isNaN(lcpSeconds) || lcpSeconds <= 0) {
        return { grade: "UNKNOWN", score: 0, severity: "unknown" };
      }
      if (lcpSeconds <= 1.2) {
        return { grade: "OPTIMAL", score: 95, severity: "good", badge: "sub-1.2s" };
      }
      if (lcpSeconds <= 2.5) {
        return { grade: "ACCEPTABLE", score: 70, severity: "moderate", badge: "needs-work" };
      }
      if (lcpSeconds <= 4.0) {
        return { grade: "SLOW", score: 45, severity: "poor", badge: "high-dropoff" };
      }
      return { grade: "CRITICAL", score: 20, severity: "severe", badge: "catastrophic-leak" };
    }

    it("evaluates sub-1.2s LCP as OPTIMAL with score 95", () => {
      const res = scoreLCP(0.8);
      expect(res.grade).toBe("OPTIMAL");
      expect(res.score).toBe(95);
      expect(res.severity).toBe("good");
    });

    it("evaluates 2.1s LCP as ACCEPTABLE with score 70", () => {
      const res = scoreLCP(2.1);
      expect(res.grade).toBe("ACCEPTABLE");
      expect(res.score).toBe(70);
      expect(res.severity).toBe("moderate");
    });

    it("evaluates 3.5s LCP as SLOW with high drop-off severity", () => {
      const res = scoreLCP(3.5);
      expect(res.grade).toBe("SLOW");
      expect(res.score).toBe(45);
      expect(res.severity).toBe("poor");
    });

    it("evaluates 5.8s WordPress page as CRITICAL with score 20", () => {
      const res = scoreLCP(5.8);
      expect(res.grade).toBe("CRITICAL");
      expect(res.score).toBe(20);
      expect(res.severity).toBe("severe");
    });

    it("handles invalid, null, or zero LCP values safely", () => {
      expect(scoreLCP(0).grade).toBe("UNKNOWN");
      expect(scoreLCP(null).grade).toBe("UNKNOWN");
      expect(scoreLCP(NaN).grade).toBe("UNKNOWN");
    });
  });

  describe("12.2 Revenue Leak & Aggregator Bleed Calculus", () => {
    function calculateAggregatorBleed(monthlyOrders, avgOrderValue, commissionRate = 0.18) {
      if (!monthlyOrders || !avgOrderValue) return { monthlyLoss: 0, annualLoss: 0 };
      const grossVolume = monthlyOrders * avgOrderValue;
      const monthlyLoss = Math.round(grossVolume * commissionRate);
      const annualLoss = monthlyLoss * 12;
      return { grossVolume, monthlyLoss, annualLoss };
    }

    it("computes monthly commission bleed paid to Practo/Zomato middlemen", () => {
      // 300 appointments/month at ₹800 avg consultation fee, 18% aggregator cut
      const bleed = calculateAggregatorBleed(300, 800, 0.18);
      expect(bleed.grossVolume).toBe(240000);
      expect(bleed.monthlyLoss).toBe(43200); // ₹43,200 lost every single month
      expect(bleed.annualLoss).toBe(518400); // ₹5,18,400 lost annually
    });

    it("handles zero order volume without returning NaN", () => {
      const bleed = calculateAggregatorBleed(0, 500);
      expect(bleed.monthlyLoss).toBe(0);
      expect(bleed.annualLoss).toBe(0);
    });

    function calculateMobileBounceRate(lcpSeconds) {
      // Google research: 1s -> 3s increases bounce by 32%, 1s -> 5s by 90%
      if (lcpSeconds <= 1.0) return 0.08; // 8% baseline bounce
      if (lcpSeconds <= 2.0) return 0.15;
      if (lcpSeconds <= 3.0) return 0.38;
      if (lcpSeconds <= 5.0) return 0.65;
      return 0.85; // 85% bounce on 5s+ sites
    }

    it("calculates mobile bounce rate curve based on loading latency", () => {
      expect(calculateMobileBounceRate(0.8)).toBe(0.08);
      expect(calculateMobileBounceRate(2.8)).toBe(0.38);
      expect(calculateMobileBounceRate(4.5)).toBe(0.65);
      expect(calculateMobileBounceRate(6.2)).toBe(0.85);
    });
  });

  describe("12.3 WhatsApp Direct Booking Link RFC 3986 Formatting", () => {
    function generateWhatsAppLink(phoneNumber, prospectName, auditHook) {
      const cleanPhone = String(phoneNumber || "").replace(/[^\d]/g, "");
      const message = `Hello ${prospectName}, Apoorv from Apoorv Studio prepared a custom 60 FPS mobile audit for your site: ${auditHook}. When is a good time for a 3-min walkthrough?`;
      const encodedMsg = encodeURIComponent(message);
      return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }

    it("generates clean WhatsApp direct link with RFC 3986 encoded message", () => {
      const link = generateWhatsAppLink("+91 94470 12345", "Dr. Mathew", "4.8s mobile LCP bottleneck");
      expect(link.startsWith("https://wa.me/919447012345?text=")).toBe(true);
      expect(link).toContain("Dr.%20Mathew");
      expect(link).toContain("60%20FPS");
    });

    it("strips non-numeric characters from phone number", () => {
      const link = generateWhatsAppLink("+91-(984)-701-1122", "Kochi Clinic", "speed audit");
      expect(link.startsWith("https://wa.me/919847011122?text=")).toBe(true);
    });
  });

  describe("12.4 Outreach Priority Index Ranking", () => {
    function computeOutreachPriority(prospect) {
      // Factors: High fee (+30), high LCP (+40), aggregator bleed (+20), DPDP non-compliance (+10)
      let score = 0;
      if (prospect.fee >= 150000) score += 30;
      else if (prospect.fee >= 50000) score += 15;

      if (prospect.lcp >= 4.0) score += 40;
      else if (prospect.lcp >= 2.5) score += 20;

      if (prospect.hasAggregator) score += 20;
      if (prospect.dpdpMissing) score += 10;

      return score;
    }

    it("ranks prospects with catastrophic LCP and high fee at top priority", () => {
      const leadHigh = { fee: 200000, lcp: 5.2, hasAggregator: true, dpdpMissing: true }; // 30 + 40 + 20 + 10 = 100
      const leadLow = { fee: 50000, lcp: 1.8, hasAggregator: false, dpdpMissing: false }; // 15 + 0 = 15

      const scoreHigh = computeOutreachPriority(leadHigh);
      const scoreLow = computeOutreachPriority(leadLow);

      expect(scoreHigh).toBe(100);
      expect(scoreLow).toBe(15);
      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });

    it("sorts prospect queue in descending order of priority score", () => {
      const queue = [
        { id: "A", fee: 50000, lcp: 1.5, hasAggregator: false },
        { id: "B", fee: 200000, lcp: 4.8, hasAggregator: true },
        { id: "C", fee: 100000, lcp: 3.2, hasAggregator: true }
      ];

      queue.sort((a, b) => computeOutreachPriority(b) - computeOutreachPriority(a));

      expect(queue[0].id).toBe("B"); // Highest priority
      expect(queue[2].id).toBe("A"); // Lowest priority
    });
  });
});
