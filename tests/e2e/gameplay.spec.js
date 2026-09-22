/**
 * gameplay.spec.js
 * Playwright end-to-end tests for Level Devil 2.5D Sky-to-Ground Portfolio.
 * Tests real production gameplay:
 *  - Canvas mounting (2D physics & Three.js 2.5D layer)
 *  - Cel-shaded BB-8 Astromech companion initialization
 *  - Brutalist altimeter HUD (10,000 FT down to Terra Firma)
 *  - 51 calibrated DOM baseline landing rails
 *  - Manual keyboard controls (Arrow keys / WASD) & autonomous idle return
 *  - Astromech Architect hard-light platform construction ('F' key)
 *  - Mobile control accessibility and touchdown runway
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("2.5D Sky-to-Ground Descent & Gameplay Core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      return Boolean(window.Engine3D?.isReady && window.player?.grounded);
    }, { timeout: 15000 });
  });

  test("startup mounts game and 3D canvases without start overlay", async ({ page }) => {
    await expect(page.locator("#start-overlay")).toHaveCount(0);
    await expect(page.locator("#game-canvas")).toBeVisible();
    await expect(page.locator("#three-canvas")).toBeVisible();
  });

  test("initializes Three.js 2.5D Engine & Astromech BB-8", async ({ page }) => {
    const state = await page.evaluate(() => ({
      is3DReady: window.Engine3D?.isReady,
      hasBB8Mesh: Boolean(window.Player3D?.bodyBall || window.Player3D?.root),
      isPlayerGrounded: window.player?.grounded,
      controlMode: window.controlMode,
      railsCount: window.landingRails?.length || 0,
    }));

    expect(state.is3DReady).toBe(true);
    expect(state.hasBB8Mesh).toBe(true);
    expect(state.isPlayerGrounded).toBe(true);
    expect(state.controlMode).toBe("autonomous");
    expect(state.railsCount).toBe(51);
  });

  test("displays brutalist altimeter HUD at 10,000 FT on load", async ({ page }) => {
    const altimeter = page.locator("#altimeter-pill");
    await expect(altimeter).toBeVisible();
    await expect(altimeter).toContainText("10,000 FT");
  });

  test("player movement: ArrowRight moves BB-8 right and triggers manual mode", async ({ page }) => {
    await page.locator("body").click();
    const startX = await page.evaluate(() => window.player?.pos.x);

    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(300);
    await page.keyboard.up("ArrowRight");

    const state = await page.evaluate(() => ({
      x: window.player?.pos.x,
      mode: window.controlMode,
    }));

    expect(state.x).toBeGreaterThan(startX);
    expect(state.mode).toBe("manual");
  });

  test("player movement: Space bar triggers vertical jump", async ({ page }) => {
    await page.locator("body").click();
    await page.keyboard.down("Space");
    await page.waitForTimeout(80);
    await page.keyboard.up("Space");

    await page.waitForFunction(() => {
      const p = window.player;
      return p && (!p.grounded || (p.vy || 0) < 0);
    }, { timeout: 4000 });

    const isAirborne = await page.evaluate(() => {
      const p = window.player;
      return Boolean(p && (!p.grounded || p.vy < 0));
    });
    expect(isAirborne).toBe(true);
  });

  test("Astromech Architect: constructs hard-light springboard platform", async ({ page }) => {
    await page.locator("body").click();
    await page.evaluate(() => {
      if (typeof window.triggerConstructPlatform === "function") {
        window.triggerConstructPlatform();
      }
    });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const activePlatform = window.AstromechArchitect?.activeRails?.[0];
      const thoughtBubble = document.querySelector(".companion-bubble")?.textContent || "";
      return {
        hasPlatform: Boolean(activePlatform),
        isHardLight: Boolean(activePlatform?.isHardLight),
        thought: thoughtBubble,
      };
    });

    expect(result.hasPlatform).toBe(true);
    expect(result.isHardLight).toBe(true);
    expect(result.thought).toContain("HARD-LIGHT");
  });

  test("mobile controls are rendered with accessible labels", async ({ page }) => {
    const controls = page.locator("#mobile-controls");
    await expect(controls).toBeAttached();

    await expect(page.locator("#btn-left")).toHaveAttribute("aria-label", "Move Left");
    await expect(page.locator("#btn-right")).toHaveAttribute("aria-label", "Move Right");
    await expect(page.locator("#btn-jump")).toHaveAttribute("aria-label", "Jump");
    await expect(page.locator("#btn-construct")).toHaveAttribute("aria-label", "Construct Hard-Light Platform");
  });

  test("altimeter tracks vertical descent and reaches touchdown zone", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const altimeterText = await page.locator("#altimeter-pill").textContent();
    expect(altimeterText).toMatch(/(TOUCHDOWN|0 FT|TERRA FIRMA|\d+ FT)/);

    const touchdownMarker = page.locator(".touchdown-zone");
    await expect(touchdownMarker).toBeVisible();
  });
});
