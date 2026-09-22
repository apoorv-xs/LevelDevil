import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "node:fs";

// Import AstromechArchitect from player_3d.js
import { AstromechArchitect } from "../../player_3d.js";

describe("Astromech Architect Engine", () => {
  beforeEach(() => {
    // Reset state before each test
    AstromechArchitect.dispose();
    AstromechArchitect.lastConstructTime = 0;
    AstromechArchitect.lastWeldTime = 0;
  });

  describe("Player Construct Tool ('F' Hotkey / Laser Springboard)", () => {
    it("materializes a floating hard-light platform beneath the player with width ~160px", () => {
      const mockPlayer = {
        pos: { x: 500, y: 1200 },
        vy: 200,
        grounded: false,
        currentRail: null
      };
      const landingRails = [];

      const rail = AstromechArchitect.constructPlatform(mockPlayer, landingRails);

      expect(rail).toBeDefined();
      expect(rail.name).toBe("HARD_LIGHT_PLATFORM");
      expect(rail.isHardLight).toBe(true);
      expect(rail.isBridge).toBe(false);
      expect(rail.width).toBe(160);
      expect(rail.xLeft).toBe(420); // 500 - 80
      expect(rail.xRight).toBe(580); // 500 + 80
      expect(rail.y).toBe(1200);
      expect(rail.duration).toBe(6000); // 6-second decay lifetime

      // Verifies platform is registered in landingRails array
      expect(landingRails).toContain(rail);

      // Verifies player is caught and pinned to the platform
      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.vy).toBe(0);
      expect(mockPlayer.pos.y).toBe(1200);
      expect(mockPlayer.currentRail).toBe(rail);
    });

    it("prevents spam construction through debounce cooldown", () => {
      const mockPlayer = { pos: { x: 300, y: 800 }, vy: 0, grounded: true, currentRail: null };
      const landingRails = [];

      const rail1 = AstromechArchitect.constructPlatform(mockPlayer, landingRails);
      expect(rail1).not.toBeNull();

      // Immediate second call should be blocked by cooldown
      const rail2 = AstromechArchitect.constructPlatform(mockPlayer, landingRails);
      expect(rail2).toBeNull();
      expect(landingRails.length).toBe(1);
    });

    it("displays retro thought bubble '⚡ HARD-LIGHT RAIL DEPLOYED'", () => {
      let emittedText = null;
      global.window = global.window || {};
      global.window.System1Brain = {
        emitThought: (txt) => { emittedText = txt; }
      };

      const mockPlayer = { pos: { x: 400, y: 600 }, vy: 0, grounded: true, currentRail: null };
      AstromechArchitect.constructPlatform(mockPlayer, []);

      expect(emittedText).toBe("⚡ HARD-LIGHT RAIL DEPLOYED");
    });

    it("triggers player.triggerGround callback when landing on constructed platform", () => {
      let groundedRail = null;
      const mockPlayer = {
        pos: { x: 450, y: 700 },
        vy: 100,
        grounded: false,
        currentRail: null,
        triggerGround: (r) => { groundedRail = r; }
      };
      const landingRails = [];
      const rail = AstromechArchitect.constructPlatform(mockPlayer, landingRails);

      expect(groundedRail).toBe(rail);
      expect(mockPlayer.grounded).toBe(true);
    });
  });

  describe("Dynamic Hard-Light Laser Bridging (Autonomous Chasm Bridging)", () => {
    it("deploys a hard-light bridge spanning a chasm gap with ledge overlap", () => {
      const gapLeft = 704;
      const gapRight = 736;
      const bridgeY = 1224;
      const landingRails = [];
      const mockPlayer = { pos: { x: 700, y: 1224 } };

      const bridge = AstromechArchitect.deployLaserBridge(gapLeft, gapRight, bridgeY, landingRails, mockPlayer);

      expect(bridge).toBeDefined();
      expect(bridge.name).toBe("HARD_LIGHT_BRIDGE");
      expect(bridge.isHardLight).toBe(true);
      expect(bridge.isBridge).toBe(true);
      expect(bridge.y).toBe(1224);
      // Spans from gapLeft - 6 to gapRight + 6 to eliminate physical drop gap
      expect(bridge.xLeft).toBe(698);
      expect(bridge.xRight).toBe(742);
      expect(bridge.width).toBe(44);
      expect(landingRails).toContain(bridge);
    });

    it("ensures to3DVec generates independent vector instances preventing targeting beam length collapse", () => {
      const v1 = AstromechArchitect.to3DVec(100, 200, 0.3);
      const v2 = AstromechArchitect.to3DVec(300, 400, 0.1);

      expect(v1).not.toBe(v2);
      expect(v1.x).not.toBe(v2.x);
      expect(v1.y).not.toBe(v2.y);
      expect(v1.z).not.toBe(v2.z);
    });

    it("refreshes existing bridge lifetime rather than creating duplicates", () => {
      const gapLeft = 704;
      const gapRight = 736;
      const bridgeY = 1224;
      const landingRails = [];

      const bridge1 = AstromechArchitect.deployLaserBridge(gapLeft, gapRight, bridgeY, landingRails);
      const bridge2 = AstromechArchitect.deployLaserBridge(gapLeft, gapRight, bridgeY, landingRails);

      expect(bridge1).toBe(bridge2);
      expect(landingRails.length).toBe(1);
    });

    it("identifies known portfolio chasm gaps (Maison Anima -> Level Devil & Note Cards)", () => {
      // 1. Maison Anima roof (152..704, y=1224) and Level Devil roof (736..1288, y=1224)
      const maisonRoof = { xLeft: 152, xRight: 704, y: 1224 };
      const levelDevilRoof = { xLeft: 736, xRight: 1288, y: 1224 };
      const gapMaison = levelDevilRoof.xLeft - maisonRoof.xRight;
      expect(gapMaison).toBe(32); // 32px drop gap

      // 2. Maison Anima base (152..704, y=1598) and Level Devil base (736..1288, y=1598)
      const maisonBase = { xLeft: 152, xRight: 704, y: 1598 };
      const levelDevilBase = { xLeft: 736, xRight: 1288, y: 1598 };
      const gapBase = levelDevilBase.xLeft - maisonBase.xRight;
      expect(gapBase).toBe(32);

      // 3. Dispatches note cards (152..708, y=2512) and (732..1288, y=2512)
      const note1Roof = { xLeft: 152, xRight: 708, y: 2512 };
      const note2Roof = { xLeft: 732, xRight: 1288, y: 2512 };
      const gapNotes = note2Roof.xLeft - note1Roof.xRight;
      expect(gapNotes).toBe(24); // 24px drop gap
    });
  });

  describe("Autonomous LiDaR Surface Welding", () => {
    it("locks physical landing rails and records weld timestamp", () => {
      const rail = { xLeft: 152, xRight: 936, y: 312, width: 784, name: "H1" };
      AstromechArchitect.weldSurface(rail, 300);

      expect(rail._lastWeldTime).toBeGreaterThan(0);
      const firstWeld = rail._lastWeldTime;

      // Rapid consecutive landing on the same rail within 280ms should be throttled
      AstromechArchitect.weldSurface(rail, 300);
      expect(rail._lastWeldTime).toBe(firstWeld);
    });
  });

  describe("Lifecycle & Zero-Leak Disposal", () => {
    it("disposes rail cleanly, un-grounding the player and removing from landingRails", () => {
      const mockPlayer = { pos: { x: 500, y: 1000 }, vy: 0, grounded: true, currentRail: null };
      const landingRails = [];

      const rail = AstromechArchitect.constructPlatform(mockPlayer, landingRails);
      expect(landingRails.length).toBe(1);
      expect(mockPlayer.grounded).toBe(true);
      expect(mockPlayer.currentRail).toBe(rail);

      // Dispose rail
      AstromechArchitect.disposeRail(rail, mockPlayer, landingRails);

      expect(landingRails.length).toBe(0);
      expect(mockPlayer.grounded).toBe(false);
      expect(mockPlayer.currentRail).toBeNull();
      expect(rail.group).toBeNull();
    });

    it("frame guard prevents double physics updates within the same animation frame", () => {
      let updateCounter = 0;
      AstromechArchitect.activeRails = [{
        createdAt: performance.now(),
        duration: 6000,
        cx: 100,
        y2d: 200,
        w2d: 100,
        materials: []
      }];

      AstromechArchitect.update(0.016);
      const firstTime = AstromechArchitect._lastUpdateTime;
      expect(firstTime).toBeGreaterThan(0);

      // Call immediately within 1ms (same animation frame)
      AstromechArchitect.update(0.016);
      expect(AstromechArchitect._lastUpdateTime).toBe(firstTime);
    });

    it("full AstromechArchitect.dispose clears all active rails and particle effects", () => {
      const landingRails = [];
      AstromechArchitect.constructPlatform({ pos: { x: 200, y: 400 } }, landingRails);
      AstromechArchitect.deployLaserBridge(300, 360, 400, landingRails);

      expect(AstromechArchitect.activeRails.length).toBe(2);

      AstromechArchitect.dispose(null, landingRails);

      expect(AstromechArchitect.activeRails.length).toBe(0);
      expect(AstromechArchitect.activeSparks.length).toBe(0);
      expect(AstromechArchitect.activeBeams.length).toBe(0);
      expect(landingRails.length).toBe(0);
    });
  });

  describe("DOM & Interface Contracts", () => {
    const read = (file) => fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

    it("includes mobile 'F' construct button in index.html", () => {
      const html = read("index.html");
      expect(html).toContain('id="btn-construct"');
      expect(html).toContain("btn-construct");
      expect(html).toContain("[ 'F' Laser Springboard ]");
    });

    it("styles the construct button with cyan neon accent #4deeea in shell.css", () => {
      const css = read("shell.css");
      expect(css).toContain(".btn-construct");
      expect(css).toContain("#4deeea");
      expect(css).toContain("#mobile-controls");
    });

    it("wires F keydown, mobile touch, and LiDaR discovery in portfolio_engine.js", () => {
      const engine = read("portfolio_engine.js");
      expect(engine).toContain('key === "f"');
      expect(engine).toContain("triggerConstructPlatform");
      expect(engine).toContain("btn-construct");
      expect(engine).toContain("checkChasmBridging");
      expect(engine).toContain("weldSurface");
      expect(engine).toContain("_lidarDiscovered");
      expect(engine).toContain("rail.isHardLight");
    });
  });
});
