import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 5: Security Armor, CSV Injection & Cryptographic Bounds", () => {
  describe("5.1 CSV Spreadsheet Formula Injection Armor (DDE & Command Guard)", () => {
    function sanitizeForCSV(field) {
      if (field === null || field === undefined) return '""';
      let str = String(field);

      // Formula injection guard: if string begins with =, +, -, @, \t, or \r, prepend single quote
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }

      // RFC 4180 double-quote escaping
      str = str.replace(/"/g, '""');

      // Wrap in double quotes if it contains quotes, commas, or newlines
      return `"${str}"`;
    }

    it("neutralizes Excel formula injection starting with '='", () => {
      const maliciousPayload = "=cmd|' /C calc'!A0";
      const sanitized = sanitizeForCSV(maliciousPayload);
      expect(sanitized).toBe("\"'=cmd|' /C calc'!A0\"");
      expect(sanitized.startsWith("\"'=")).toBe(true);
    });

    it("neutralizes Excel formula injection starting with '+' or '-'", () => {
      expect(sanitizeForCSV("+2+5")).toBe("\"'+2+5\"");
      expect(sanitizeForCSV("-1+SUM(A1:A10)")).toBe("\"'-1+SUM(A1:A10)\"");
    });

    it("neutralizes Excel formula injection starting with '@'", () => {
      expect(sanitizeForCSV("@SUM(1,2)")).toBe("\"'@SUM(1,2)\"");
    });

    it("escapes existing double quotes according to RFC 4180", () => {
      const textWithQuotes = 'Said: "Let us close the deal" today';
      const sanitized = sanitizeForCSV(textWithQuotes);
      expect(sanitized).toBe('"Said: ""Let us close the deal"" today"');
    });

    it("wraps multiline call notes safely in quotes to preserve row count", () => {
      const multilineNote = "Spoke with CTO.\r\nAgreed on 60 FPS audit.\r\nBudget: ₹1,50,000.";
      const sanitized = sanitizeForCSV(multilineNote);
      expect(sanitized.startsWith('"')).toBe(true);
      expect(sanitized.endsWith('"')).toBe(true);
      expect(sanitized).toContain("\r\n");
    });

    it("handles null and undefined values safely without crashing", () => {
      expect(sanitizeForCSV(null)).toBe('""');
      expect(sanitizeForCSV(undefined)).toBe('""');
    });
  });

  describe("5.2 DOM XSS Sanitization & Input Disinfection", () => {
    function sanitizeHTML(input) {
      if (typeof input !== "string") return "";
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    }

    function sanitizeURL(rawUrl) {
      if (!rawUrl || typeof rawUrl !== "string") return "";
      const trimmed = rawUrl.trim();
      // Block javascript:, data:, vbscript: protocols
      if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return "about:blank";
      }
      return trimmed;
    }

    it("escapes HTML angle brackets and quotes to neutralize reflected XSS", () => {
      const payload = '<script>alert("pwned")</script>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).toBe("&lt;script&gt;alert(&quot;pwned&quot;)&lt;&#x2F;script&gt;");
      expect(sanitized).not.toContain("<script>");
    });

    it("blocks javascript: URI scheme in consultation website/repo inputs", () => {
      const maliciousUrl = "javascript:alert(document.cookie)";
      const safe = sanitizeURL(maliciousUrl);
      expect(safe).toBe("about:blank");
    });

    it("blocks data: URI scheme with executable HTML payload", () => {
      const dataUri = "data:text/html,<script>alert(1)</script>";
      const safe = sanitizeURL(dataUri);
      expect(safe).toBe("about:blank");
    });

    it("permits valid HTTPS URLs in consultation and prospect links", () => {
      const validUrl = "https://github.com/apoorv-xs/portfolio";
      expect(sanitizeURL(validUrl)).toBe("https://github.com/apoorv-xs/portfolio");
    });
  });

  describe("5.3 Prototype Pollution Defense", () => {
    function safeDeepAssign(target, source) {
      for (const key of Object.keys(source)) {
        // Prevent prototype poisoning
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          continue;
        }
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          safeDeepAssign(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    }

    it("rejects __proto__ pollution attempts in deep state merges", () => {
      const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
      const target = {};
      safeDeepAssign(target, payload);

      expect(target.isAdmin).toBeUndefined();
      expect(({}).isAdmin).toBeUndefined(); // Global Object prototype remains unpolluted
    });

    it("rejects constructor/prototype pollution attempts in lead telemetry merges", () => {
      const payload = JSON.parse('{"constructor": {"prototype": {"polluted": true}}}');
      const target = {};
      safeDeepAssign(target, payload);

      expect(target.polluted).toBeUndefined();
      expect(({}).polluted).toBeUndefined();
    });
  });

  describe("5.4 Session Purge & Credential Scrubbing", () => {
    it("purges all persistent authentication and caller tokens upon sign-out", () => {
      const mockStorage = {
        sprintdial_user: '{"email":"caller@studio.com"}',
        sprintdial_google_user: '{"uid":"xyz123"}',
        apoorv_caller_role: "caller",
        apoorv_auth_token: "mock-jwt-token-abc",
        unrelated_theme_key: "retro-brutalist"
      };

      function signOutPurge(storage) {
        const SENSITIVE_KEYS = [
          "sprintdial_user",
          "sprintdial_google_user",
          "apoorv_caller_role",
          "apoorv_auth_token"
        ];
        SENSITIVE_KEYS.forEach((k) => delete storage[k]);
      }

      signOutPurge(mockStorage);
      expect(mockStorage.sprintdial_user).toBeUndefined();
      expect(mockStorage.sprintdial_google_user).toBeUndefined();
      expect(mockStorage.apoorv_caller_role).toBeUndefined();
      expect(mockStorage.apoorv_auth_token).toBeUndefined();
      // Unrelated preference preserved
      expect(mockStorage.unrelated_theme_key).toBe("retro-brutalist");
    });
  });
});
