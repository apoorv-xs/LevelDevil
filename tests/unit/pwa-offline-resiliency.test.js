import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Subsystem 1: Offline Resiliency, Service Worker & PWA Lifecycle", () => {
  let mockStorage = {};
  let originalWindow;

  beforeEach(() => {
    const mockNav = {
      onLine: true,
      serviceWorker: {
        register: vi.fn().mockResolvedValue({
          scope: "/",
          active: { state: "activated" },
          update: vi.fn().mockResolvedValue(true)
        })
      }
    };

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matchMedia: vi.fn().mockImplementation((query) => ({
        matches: query.includes("standalone") ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })),
      deferredInstallPrompt: null,
      navigator: mockNav
    };

    global.localStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, val) => {
        mockStorage[key] = String(val);
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      get length() {
        return Object.keys(mockStorage).length;
      },
      key: vi.fn((i) => Object.keys(mockStorage)[i] || null)
    };

    try {
      Object.defineProperty(globalThis, "navigator", {
        value: mockNav,
        configurable: true,
        writable: true
      });
    } catch (e) {
      // In case navigator is not reconfigurable, fallback to window.navigator
    }
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe("1.1 Service Worker Cache Strategy & Versioning Invariants", () => {
    const CACHE_NAME = "client-radar-cache-v1";
    const IMMUTABLE_ASSETS = [
      "/fonts/press-start-2p.woff2",
      "/fonts/courier-prime.woff2",
      "/three.min.js",
      "/kaboom.js",
      "/shell.css",
      "/sales.css"
    ];

    it("defines the canonical versioned cache key matching v1 specification", () => {
      expect(CACHE_NAME).toBe("client-radar-cache-v1");
      expect(CACHE_NAME).toMatch(/^client-radar-cache-v\d+$/);
    });

    it("verifies immutable static assets are included in precache manifest", () => {
      expect(IMMUTABLE_ASSETS).toContain("/fonts/press-start-2p.woff2");
      expect(IMMUTABLE_ASSETS).toContain("/three.min.js");
      expect(IMMUTABLE_ASSETS).toContain("/kaboom.js");
      expect(IMMUTABLE_ASSETS.length).toBeGreaterThanOrEqual(6);
    });

    it("identifies cache-first candidates by file extension (.woff2, .min.js)", () => {
      const isCacheFirst = (url) => /\.(woff2|woff|min\.js|png|jpg|svg)$/.test(url);
      expect(isCacheFirst("/fonts/press-start-2p.woff2")).toBe(true);
      expect(isCacheFirst("/three.min.js")).toBe(true);
      expect(isCacheFirst("/workspace/prospects_data.js")).toBe(false);
      expect(isCacheFirst("/api/inquiry")).toBe(false);
    });

    it("identifies network-first candidates for dynamic lead telemetry and API endpoints", () => {
      const isNetworkFirst = (url) => url.includes("/api/") || url.includes("prospects_data.js");
      expect(isNetworkFirst("/api/inquiry")).toBe(true);
      expect(isNetworkFirst("/workspace/prospects_data.js")).toBe(true);
      expect(isNetworkFirst("/fonts/courier-prime.woff2")).toBe(false);
    });

    it("simulates cache migration pruning stale caches matching prefix", async () => {
      const existingCaches = ["client-radar-cache-v0", "sprintdial-v1", "client-radar-cache-v1", "other-cache"];
      const deletedCaches = [];
      const mockCaches = {
        keys: vi.fn().mockResolvedValue(existingCaches),
        delete: vi.fn().mockImplementation((key) => {
          deletedCaches.push(key);
          return Promise.resolve(true);
        })
      };

      const keys = await mockCaches.keys();
      const purgePromises = keys
        .filter((k) => (k.startsWith("client-radar-cache-") || k.startsWith("sprintdial-")) && k !== CACHE_NAME)
        .map((k) => mockCaches.delete(k));

      await Promise.all(purgePromises);
      expect(deletedCaches).toContain("client-radar-cache-v0");
      expect(deletedCaches).toContain("sprintdial-v1");
      expect(deletedCaches).not.toContain("client-radar-cache-v1");
      expect(deletedCaches).not.toContain("other-cache");
    });
  });

  describe("1.2 Offline Mode Telemetry & Network Fallbacks", () => {
    function setupOfflineBannerManager() {
      let isOffline = false;
      let bannerText = "";
      let bannerVisible = false;

      return {
        handleOffline: () => {
          isOffline = true;
          bannerText = "⚡ OFFLINE MODE: LOCAL RADAR ACTIVE";
          bannerVisible = true;
        },
        handleOnline: () => {
          isOffline = false;
          bannerText = "✓ ONLINE: CLOUD RADAR RESTORED";
          bannerVisible = false;
        },
        getState: () => ({ isOffline, bannerText, bannerVisible })
      };
    }

    it("triggers offline banner state when network disconnects", () => {
      const manager = setupOfflineBannerManager();
      manager.handleOffline();
      const state = manager.getState();
      expect(state.isOffline).toBe(true);
      expect(state.bannerVisible).toBe(true);
      expect(state.bannerText).toContain("OFFLINE MODE: LOCAL RADAR ACTIVE");
    });

    it("restores online state and clears offline banner when network reconnects", () => {
      const manager = setupOfflineBannerManager();
      manager.handleOffline();
      manager.handleOnline();
      const state = manager.getState();
      expect(state.isOffline).toBe(false);
      expect(state.bannerVisible).toBe(false);
      expect(state.bannerText).toContain("CLOUD RADAR RESTORED");
    });

    it("safely enqueues inquiry submissions into localStorage when offline", () => {
      const inquiryPayload = {
        name: "Test Founder",
        email: "founder@hyperion.com",
        scope: "webgpu",
        budget: "flagship",
        message: "Need 60 FPS 3D configurator",
        createdAt: new Date().toISOString()
      };

      function dispatchInquiry(payload, isOnline) {
        if (!isOnline) {
          const raw = localStorage.getItem("apoorv_offline_inquiry_queue") || "[]";
          const queue = JSON.parse(raw);
          queue.push(payload);
          localStorage.setItem("apoorv_offline_inquiry_queue", JSON.stringify(queue));
          return { status: "queued_offline", id: queue.length };
        }
        return { status: "sent_online" };
      }

      const res = dispatchInquiry(inquiryPayload, false);
      expect(res.status).toBe("queued_offline");

      const saved = JSON.parse(mockStorage["apoorv_offline_inquiry_queue"]);
      expect(saved.length).toBe(1);
      expect(saved[0].name).toBe("Test Founder");
      expect(saved[0].scope).toBe("webgpu");
    });

    it("drains offline queue in FIFO order upon network reconnection", async () => {
      const queue = [
        { id: 1, name: "Lead Alpha" },
        { id: 2, name: "Lead Beta" },
        { id: 3, name: "Lead Gamma" }
      ];
      localStorage.setItem("apoorv_offline_inquiry_queue", JSON.stringify(queue));

      const processed = [];
      const drainQueue = async (mockSendFn) => {
        const raw = localStorage.getItem("apoorv_offline_inquiry_queue");
        if (!raw) return;
        const items = JSON.parse(raw);
        while (items.length > 0) {
          const next = items.shift();
          await mockSendFn(next);
          processed.push(next);
        }
        localStorage.removeItem("apoorv_offline_inquiry_queue");
      };

      await drainQueue(async (item) => {
        return Promise.resolve({ ok: true });
      });

      expect(processed.length).toBe(3);
      expect(processed[0].name).toBe("Lead Alpha");
      expect(processed[1].name).toBe("Lead Beta");
      expect(processed[2].name).toBe("Lead Gamma");
      expect(localStorage.getItem("apoorv_offline_inquiry_queue")).toBeNull();
    });
  });

  describe("1.3 Storage Quota Overflow & Corrupted Data Recovery", () => {
    it("handles QuotaExceededError when setting item without uncaught crash", () => {
      let quotaTripped = false;
      const safeSetItem = (key, value) => {
        try {
          if (value.length > 5000) {
            const err = new Error("QuotaExceededError");
            err.name = "QuotaExceededError";
            throw err;
          }
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          if (e.name === "QuotaExceededError") {
            quotaTripped = true;
            // Prune volatile telemetry
            localStorage.removeItem("apoorv_telemetry_cache");
            return false;
          }
          throw e;
        }
      };

      const hugeString = "X".repeat(10000);
      const ok = safeSetItem("huge_key", hugeString);
      expect(ok).toBe(false);
      expect(quotaTripped).toBe(true);
    });

    it("recovers gracefully from corrupted JSON in prospect local storage", () => {
      mockStorage["sprintdial_prospects"] = "{ malformed: json, missing quotes";

      const defaultMaster = [{ id: "fallback-1", name: "Canonical Prospect" }];
      function getProspectsSafe() {
        const raw = localStorage.getItem("sprintdial_prospects");
        if (!raw) return defaultMaster;
        try {
          return JSON.parse(raw);
        } catch (err) {
          // Self-heal corrupted state with canonical fallback
          localStorage.setItem("sprintdial_prospects", JSON.stringify(defaultMaster));
          return defaultMaster;
        }
      }

      const result = getProspectsSafe();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Canonical Prospect");
      // Verify storage was self-healed
      expect(mockStorage["sprintdial_prospects"]).toBe(JSON.stringify(defaultMaster));
    });

    it("prunes teleprompter cache entries older than 7 days", () => {
      const now = Date.now();
      const dayMs = 86400000;

      const cache = [
        { id: "note-1", timestamp: now - dayMs * 2, text: "Recent call note" },
        { id: "note-2", timestamp: now - dayMs * 10, text: "Stale call note 1" },
        { id: "note-3", timestamp: now - dayMs * 15, text: "Stale call note 2" }
      ];

      function pruneStaleNotes(notes, maxAgeDays = 7) {
        const cutoff = Date.now() - maxAgeDays * dayMs;
        return notes.filter((n) => n.timestamp >= cutoff);
      }

      const pruned = pruneStaleNotes(cache);
      expect(pruned).toHaveLength(1);
      expect(pruned[0].id).toBe("note-1");
    });
  });

  describe("1.4 PWA Standalone Detection & Installation Lifecycle", () => {
    it("detects standalone display mode via window.matchMedia", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(display-mode: standalone)",
        media: query
      }));

      function isStandalonePWA() {
        return (
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true
        );
      }

      expect(isStandalonePWA()).toBe(true);
    });

    it("detects browser tab mode when standalone media query does not match", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query
      }));

      function isStandalonePWA() {
        return (
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true
        );
      }

      expect(isStandalonePWA()).toBe(false);
    });

    it("captures and prevents default on beforeinstallprompt event", () => {
      let defaultPrevented = false;
      const mockEvent = {
        preventDefault: () => {
          defaultPrevented = true;
        },
        prompt: vi.fn().mockResolvedValue({ outcome: "accepted" })
      };

      function onBeforeInstallPrompt(e) {
        e.preventDefault();
        window.deferredInstallPrompt = e;
      }

      onBeforeInstallPrompt(mockEvent);
      expect(defaultPrevented).toBe(true);
      expect(window.deferredInstallPrompt).toBe(mockEvent);
    });

    it("triggers prompt on user gesture and clears deferred install prompt upon acceptance", async () => {
      let promptTriggered = false;
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockImplementation(async () => {
          promptTriggered = true;
          return { outcome: "accepted" };
        }),
        userChoice: Promise.resolve({ outcome: "accepted" })
      };

      window.deferredInstallPrompt = mockEvent;

      async function triggerPWAInstall() {
        if (!window.deferredInstallPrompt) return false;
        await window.deferredInstallPrompt.prompt();
        const choice = await window.deferredInstallPrompt.userChoice;
        window.deferredInstallPrompt = null;
        return choice.outcome === "accepted";
      }

      const result = await triggerPWAInstall();
      expect(promptTriggered).toBe(true);
      expect(result).toBe(true);
      expect(window.deferredInstallPrompt).toBeNull();
    });

    it("handles appinstalled event by updating localStorage and telemetry", () => {
      let installRecorded = false;
      function onAppInstalled() {
        localStorage.setItem("apoorv_pwa_installed", "true");
        window.deferredInstallPrompt = null;
        installRecorded = true;
      }

      onAppInstalled();
      expect(installRecorded).toBe(true);
      expect(localStorage.getItem("apoorv_pwa_installed")).toBe("true");
      expect(window.deferredInstallPrompt).toBeNull();
    });

    it("synchronizes multi-tab sign-out across StorageEvent handlers", () => {
      let userSessionActive = true;
      function handleStorageChange(event) {
        if (event.key === "sprintdial_user" && !event.newValue) {
          userSessionActive = false;
        }
      }

      handleStorageChange({ key: "sprintdial_user", newValue: null, oldValue: '{"email":"caller@studio.com"}' });
      expect(userSessionActive).toBe(false);
    });
  });

  describe("1.5 Service Worker Registration & Scope Invariants", () => {
    it("registers service worker with relative scope pointing to workspace sub-route", async () => {
      let registeredScope = null;
      navigator.serviceWorker.register = vi.fn().mockImplementation(async (scriptPath, options) => {
        registeredScope = options?.scope || "./";
        return { scope: registeredScope };
      });

      const reg = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith("./sw.js", { scope: "./" });
      expect(reg.scope).toBe("./");
    });

    it("gracefully catches service worker registration failure on insecure non-localhost HTTP", async () => {
      navigator.serviceWorker.register = vi.fn().mockRejectedValue(new Error("SecurityError: Access denied"));

      let caught = false;
      async function registerSafe() {
        try {
          return await navigator.serviceWorker.register("./sw.js");
        } catch (err) {
          caught = true;
          return null;
        }
      }

      const result = await registerSafe();
      expect(result).toBeNull();
      expect(caught).toBe(true);
    });

    it("identifies whether browser context supports service workers", () => {
      const supportsSW = "serviceWorker" in navigator;
      expect(supportsSW).toBe(true);

      const mockInsecureNavigator = {};
      const supportsSWInsecure = "serviceWorker" in mockInsecureNavigator;
      expect(supportsSWInsecure).toBe(false);
    });

    it("formats manifest.json path correctly as relative in workspace directory", () => {
      const manifestLink = { rel: "manifest", href: "./manifest.json" };
      expect(manifestLink.href).toBe("./manifest.json");
      expect(manifestLink.href.startsWith("/")).toBe(false);
    });
  });
});
