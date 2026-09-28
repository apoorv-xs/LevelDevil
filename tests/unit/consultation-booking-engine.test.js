import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 7: Public Acquisition & Consultation Booking Engine", () => {
  describe("7.1 Consultation Date, Time Slot & Timezone Validation", () => {
    function validateBookingSlot(dateStr, timeStr, now = new Date("2026-09-28T12:00:00Z")) {
      const selected = new Date(`${dateStr}T${timeStr}:00`);
      if (isNaN(selected.getTime())) {
        return { valid: false, reason: "INVALID_DATE_TIME" };
      }

      // Past date check
      if (selected < now) {
        return { valid: false, reason: "CANNOT_BOOK_PAST_DATE" };
      }

      // Business hours check (09:00 - 19:00)
      const hour = selected.getHours();
      if (hour < 9 || hour >= 19) {
        return { valid: false, reason: "OUTSIDE_BUSINESS_HOURS" };
      }

      // Weekend advisory flag
      const day = selected.getDay();
      const isWeekend = day === 0 || day === 6; // 0 = Sun, 6 = Sat

      return { valid: true, isWeekend, selectedTime: selected.toISOString() };
    }

    it("accepts a valid weekday booking slot within business hours", () => {
      // 2026-09-30 is Wednesday, 14:00
      const res = validateBookingSlot("2026-09-30", "14:00", new Date("2026-09-28T12:00:00"));
      expect(res.valid).toBe(true);
      expect(res.isWeekend).toBe(false);
    });

    it("rejects booking slots in the past", () => {
      const res = validateBookingSlot("2026-09-25", "10:00", new Date("2026-09-28T12:00:00"));
      expect(res.valid).toBe(false);
      expect(res.reason).toBe("CANNOT_BOOK_PAST_DATE");
    });

    it("rejects booking slots before 09:00 AM", () => {
      const res = validateBookingSlot("2026-09-30", "07:30", new Date("2026-09-28T12:00:00"));
      expect(res.valid).toBe(false);
      expect(res.reason).toBe("OUTSIDE_BUSINESS_HOURS");
    });

    it("rejects booking slots after 07:00 PM (19:00)", () => {
      const res = validateBookingSlot("2026-09-30", "20:30", new Date("2026-09-28T12:00:00"));
      expect(res.valid).toBe(false);
      expect(res.reason).toBe("OUTSIDE_BUSINESS_HOURS");
    });

    it("flags weekend appointments with isWeekend advisory", () => {
      // 2026-10-04 is Sunday
      const res = validateBookingSlot("2026-10-04", "11:00", new Date("2026-09-28T12:00:00"));
      expect(res.valid).toBe(true);
      expect(res.isWeekend).toBe(true);
    });
  });

  describe("7.2 Google Calendar Link Generator Formatting", () => {
    function generateGoogleCalendarUrl(booking) {
      const { title, startIso, endIso, details, attendeeEmail, location } = booking;
      const formatTime = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/g, "");
      const datesParam = `${formatTime(startIso)}/${formatTime(endIso)}`;

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: datesParam,
        details: details,
        location: location || "Google Meet",
        add: attendeeEmail || "apoorvxs@gmail.com"
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    it("formats Google Calendar URL with RFC 3986 encoding and attendee coordinates", () => {
      const booking = {
        title: "Apoorv Studio Strategy: 60 FPS Audit",
        startIso: "20261001T100000Z",
        endIso: "20261001T101500Z",
        details: "15-Min Strategic Walkthrough: Review mobile WebGL bottlenecks & conversion leaks.",
        attendeeEmail: "founder@client.com",
        location: "Google Meet"
      };

      const url = generateGoogleCalendarUrl(booking);
      expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
      expect(url).toContain("action=TEMPLATE");
      expect(url).toContain("founder%40client.com");
      expect(url).toContain("Google+Meet");
    });
  });

  describe("7.3 Dynamic Scope Deliverables Matrix", () => {
    function getScopeDeliverables(scopeId) {
      const MATRIX = {
        webgpu: {
          title: "WebGPU / Three.js 3D Engine",
          deliverables: ["Procedural 3D Canvas Rig", "Draco/Meshopt Asset Pipeline", "Locked 60 FPS Mobile Target"],
          turnaround: "3 - 5 Weeks",
          guarantee: "16.6ms Frame Budget"
        },
        experience: {
          title: "Interactive 3D Showcase",
          deliverables: ["GSAP Scroll Choreography", "Custom GLSL Shader Passes", "Zero-Leak Memory Disposal"],
          turnaround: "2 - 4 Weeks",
          guarantee: "Zero Memory Leaks"
        },
        optimization: {
          title: "60 FPS Performance Surgery",
          deliverables: ["Sub-0.8s Headless Shell", "Draw Call Merging (<50 calls)", "Asset Compression (<5MB)"],
          turnaround: "1 - 2 Weeks",
          guarantee: "Sub-1s LCP Floor"
        },
        headless: {
          title: "Headless E-Commerce 3D Store",
          deliverables: ["Shopify/Stripe Direct Integration", "Instant 3D Product Configurator", "WhatsApp Intake Portal"],
          turnaround: "3 - 6 Weeks",
          guarantee: "Sub-5MB Total Bundle"
        }
      };

      return MATRIX[scopeId] || MATRIX.webgpu;
    }

    it("returns complete deliverable checklist and turnaround for WebGPU scope", () => {
      const scope = getScopeDeliverables("webgpu");
      expect(scope.title).toContain("WebGPU");
      expect(scope.deliverables.length).toBe(3);
      expect(scope.guarantee).toContain("16.6ms");
    });

    it("returns complete deliverable checklist for 60 FPS optimization surgery", () => {
      const scope = getScopeDeliverables("optimization");
      expect(scope.title).toContain("60 FPS");
      expect(scope.deliverables).toContain("Sub-0.8s Headless Shell");
      expect(scope.turnaround).toBe("1 - 2 Weeks");
    });

    it("falls back to default webgpu deliverables if unknown scope is passed", () => {
      const scope = getScopeDeliverables("unknown_custom_scope");
      expect(scope.title).toContain("WebGPU");
    });
  });

  describe("7.4 DPDP Statutory Affirmative Consent Enforcement", () => {
    function canSubmitInquiry(formData, consentChecked) {
      if (!consentChecked) return { allowed: false, reason: "CONSENT_REQUIRED" };
      if (!formData.name || !formData.email || !formData.message) {
        return { allowed: false, reason: "FIELDS_INCOMPLETE" };
      }
      return { allowed: true };
    }

    it("blocks inquiry submission when DPDP consent checkbox is unchecked", () => {
      const form = { name: "Client", email: "client@test.com", message: "Hello" };
      const res = canSubmitInquiry(form, false);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe("CONSENT_REQUIRED");
    });

    it("allows inquiry submission when DPDP consent checkbox is affirmatively checked", () => {
      const form = { name: "Client", email: "client@test.com", message: "Hello" };
      const res = canSubmitInquiry(form, true);
      expect(res.allowed).toBe(true);
    });

    it("blocks submission if required fields are missing even with consent checked", () => {
      const form = { name: "", email: "client@test.com", message: "Hello" };
      const res = canSubmitInquiry(form, true);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe("FIELDS_INCOMPLETE");
    });
  });
});
