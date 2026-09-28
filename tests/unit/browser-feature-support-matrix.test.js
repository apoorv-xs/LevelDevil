import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 14: Browser Compatibility & Feature Degradation Matrix", () => {
  describe("14.1 WebGL Context Detection & Graceful Fallback", () => {
    function detectWebGLSupport(canvas) {
      if (!canvas || typeof canvas.getContext !== "function") {
        return { supported: false, version: null, error: "CANVAS_UNSUPPORTED" };
      }
      try {
        const gl2 = canvas.getContext("webgl2");
        if (gl2) return { supported: true, version: "webgl2" };
        const gl1 = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl1) return { supported: true, version: "webgl" };
        return { supported: false, version: null, error: "WEBGL_DISABLED" };
      } catch (e) {
        return { supported: false, version: null, error: e.message };
      }
    }

    it("detects WebGL 2.0 when supported by canvas context", () => {
      const mockCanvas = {
        getContext: vi.fn((type) => (type === "webgl2" ? { isWebGL2: true } : null))
      };
      const res = detectWebGLSupport(mockCanvas);
      expect(res.supported).toBe(true);
      expect(res.version).toBe("webgl2");
    });

    it("falls back to WebGL 1.0 when WebGL 2.0 is unavailable", () => {
      const mockCanvas = {
        getContext: vi.fn((type) => (type === "webgl" ? { isWebGL1: true } : null))
      };
      const res = detectWebGLSupport(mockCanvas);
      expect(res.supported).toBe(true);
      expect(res.version).toBe("webgl");
    });

    it("returns supported: false without throwing uncaught exceptions when WebGL is disabled", () => {
      const mockCanvas = {
        getContext: vi.fn(() => null)
      };
      const res = detectWebGLSupport(mockCanvas);
      expect(res.supported).toBe(false);
      expect(res.error).toBe("WEBGL_DISABLED");
    });
  });

  describe("14.2 Storage Resilience in Private Browsing / Incognito", () => {
    function createResilientStorage(mockLocalStorage) {
      let isLocalStorageAvailable = false;
      const memoryStore = {};

      try {
        if (mockLocalStorage && typeof mockLocalStorage.setItem === "function") {
          const testKey = "__storage_probe__";
          mockLocalStorage.setItem(testKey, testKey);
          mockLocalStorage.removeItem(testKey);
          isLocalStorageAvailable = true;
        }
      } catch (e) {
        isLocalStorageAvailable = false;
      }

      return {
        getItem: (key) => {
          if (isLocalStorageAvailable && mockLocalStorage) return mockLocalStorage.getItem(key);
          return memoryStore[key] || null;
        },
        setItem: (key, val) => {
          if (isLocalStorageAvailable && mockLocalStorage) {
            try {
              mockLocalStorage.setItem(key, val);
              return;
            } catch (e) {}
          }
          memoryStore[key] = String(val);
        },
        isUsingMemoryFallback: () => !isLocalStorageAvailable
      };
    }

    it("falls back to in-memory store when localStorage access is blocked in incognito", () => {
      const blockedStorage = {
        setItem: () => {
          throw new Error("SecurityError: Access is denied");
        },
        getItem: () => null,
        removeItem: () => {}
      };

      const storage = createResilientStorage(blockedStorage);
      expect(storage.isUsingMemoryFallback()).toBe(true);

      storage.setItem("lead_note", "Saved in memory");
      expect(storage.getItem("lead_note")).toBe("Saved in memory");
    });
  });

  describe("14.3 Clipboard Copying with Legacy Fallback", () => {
    async function copyToClipboard(text, mockNav = null, mockDoc = null) {
      if (mockNav && mockNav.clipboard && typeof mockNav.clipboard.writeText === "function") {
        try {
          await mockNav.clipboard.writeText(text);
          return { method: "clipboard_api", success: true };
        } catch (e) {}
      }

      // Legacy execCommand fallback
      if (mockDoc && typeof mockDoc.execCommand === "function") {
        try {
          const success = mockDoc.execCommand("copy");
          return { method: "exec_command", success };
        } catch (e) {}
      }

      return { method: "none", success: false };
    }

    it("uses modern navigator.clipboard.writeText when available", async () => {
      const mockNav = {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined)
        }
      };
      const res = await copyToClipboard("https://apoorv.qzz.io", mockNav);
      expect(res.success).toBe(true);
      expect(res.method).toBe("clipboard_api");
    });

    it("falls back to document.execCommand when navigator.clipboard fails or is unsupported", async () => {
      const mockNav = { clipboard: null };
      const mockDoc = { execCommand: vi.fn().mockReturnValue(true) };

      const res = await copyToClipboard("https://apoorv.qzz.io", mockNav, mockDoc);
      expect(res.success).toBe(true);
      expect(res.method).toBe("exec_command");
    });
  });

  describe("14.4 Intl.NumberFormat Currency Formatting", () => {
    it("formats Indian rupees with exact lakh and crore commas across supported runtimes", () => {
      const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      });

      expect(formatter.format(150000)).toMatch(/₹\s*1,50,000/);
      expect(formatter.format(10000000)).toMatch(/₹\s*1,00,00,000/);
    });
  });
});
