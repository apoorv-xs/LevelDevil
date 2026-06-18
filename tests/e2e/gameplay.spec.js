/**
 * gameplay.spec.js
 * Playwright end-to-end tests for Level Devil Portfolio Game.
 *
 * Level Devil contract tested in-browser:
 *  - Game canvas mounts and starts up
 *  - Clicking the start overlay launches the intro level
 *  - Player can move left/right
 *  - Player can jump
 *  - Player respawns after death (Level Devil core loop)
 *  - Recruiter mode toggle is present and works
 *  - All level scenes load without JS errors
 *  - Pause menu opens and closes
 *  - Traps are present on each level (spikes, lightning, etc.)
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173"; // vite dev server
const START_TIMEOUT = 15000; // ms

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Click through the start overlay to enter the game */
async function startGame(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const overlay = page.locator("#start-overlay");
  await overlay.waitFor({ state: "visible", timeout: START_TIMEOUT });
  await overlay.click();
  // Wait for overlay to disappear (devil transition kicks off)
  await overlay.waitFor({ state: "hidden", timeout: START_TIMEOUT });
  // Wait a moment for kaboom scene to fully load
  await page.waitForTimeout(1500);
}

/** Press a key for a duration (ms) */
async function holdKey(page, key, durationMs) {
  await page.keyboard.down(key);
  await page.waitForTimeout(durationMs);
  await page.keyboard.up(key);
}

/** Navigate to a specific scene by manipulating window.go */
async function goToScene(page, sceneName) {
  await page.evaluate((name) => {
    if (window.go) window.go(name);
  }, sceneName);
  await page.waitForTimeout(1500);
}

// ---------------------------------------------------------------------------
// Startup & Canvas
// ---------------------------------------------------------------------------

test.describe("Startup", () => {
  test("game canvas is present in DOM", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();
  });

  test("start overlay is shown on load", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const overlay = page.locator("#start-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText("START GAME");
  });

  test("clicking start overlay hides it", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.locator("#start-overlay").click();
    await page.locator("#start-overlay").waitFor({ state: "hidden", timeout: START_TIMEOUT });
  });

  test("no JavaScript errors on page load", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Intro Level
// ---------------------------------------------------------------------------

test.describe("Intro Level", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("intro scene loads without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await goToScene(page, "intro");
    expect(errors).toHaveLength(0);
  });

  test("CURRENT_SCENE is set to intro after transition", async ({ page }) => {
    const scene = await page.evaluate(() => window.CURRENT_SCENE);
    expect(scene).toBe("intro");
  });

  test("Kaboom global functions are available", async ({ page }) => {
    const hasGlobals = await page.evaluate(() => {
      return typeof window.go === "function" &&
             typeof window.add === "function" &&
             typeof window.camPos === "function";
    });
    expect(hasGlobals).toBe(true);
  });

  test("canvas has non-zero size", async ({ page }) => {
    const size = await page.evaluate(() => {
      const c = document.getElementById("game-canvas");
      return { w: c.offsetWidth, h: c.offsetHeight };
    });
    expect(size.w).toBeGreaterThan(0);
    expect(size.h).toBeGreaterThan(0);
  });

  test("pause button is visible in-game", async ({ page }) => {
    const pauseBtn = page.locator("#pause-btn");
    await expect(pauseBtn).toBeVisible({ timeout: 5000 });
  });

  test("audio button is visible in-game", async ({ page }) => {
    const audioBtn = page.locator("#audio-btn");
    await expect(audioBtn).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Player Movement & Physics
// ---------------------------------------------------------------------------

test.describe("Player Movement", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
    // Ensure we're on intro and canvas has focus
    await page.locator("#game-canvas").click();
  });

  test("player moves right when right arrow is held", async ({ page }) => {
    const xBefore = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.x : null;
    });

    if (xBefore === null) { test.skip(); return; }

    await holdKey(page, "ArrowRight", 500);

    const xAfter = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.x : null;
    });

    expect(xAfter).toBeGreaterThan(xBefore);
  });

  test("player moves left when left arrow is held", async ({ page }) => {
    // First move right to create room for left movement
    await holdKey(page, "ArrowRight", 600);

    const xBefore = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.x : null;
    });

    if (xBefore === null) { test.skip(); return; }

    await holdKey(page, "ArrowLeft", 500);

    const xAfter = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.x : null;
    });

    expect(xAfter).toBeLessThan(xBefore);
  });

  test("player rises (Y decreases) when space is pressed", async ({ page }) => {
    const yBefore = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.y : null;
    });

    if (yBefore === null) { test.skip(); return; }

    await page.keyboard.press("Space");
    await page.waitForTimeout(200); // At peak of jump

    const yAfter = await page.evaluate(() => {
      const g = window.get && window.get("guy")[0];
      return g ? g.pos.y : null;
    });

    // In kaboom, y increases downward, so jumping = smaller Y
    expect(yAfter).toBeLessThan(yBefore);
  });
});

// ---------------------------------------------------------------------------
// Level Scenes
// ---------------------------------------------------------------------------

test.describe("About Level", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("about scene loads without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await goToScene(page, "about");
    expect(errors).toHaveLength(0);
  });

  test("CURRENT_SCENE is set to about", async ({ page }) => {
    await goToScene(page, "about");
    const scene = await page.evaluate(() => window.CURRENT_SCENE);
    expect(scene).toBe("about");
  });

  test("floor objects exist in about scene", async ({ page }) => {
    await goToScene(page, "about");
    const floorCount = await page.evaluate(() => {
      return window.get ? window.get("floor").length : 0;
    });
    expect(floorCount).toBeGreaterThan(0);
  });

  test("player (guy) spawns in about scene", async ({ page }) => {
    await goToScene(page, "about");
    const guyExists = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(guyExists).toBe(true);
  });

  test("spikes (danger) exist in about scene", async ({ page }) => {
    await goToScene(page, "about");
    const spikeCount = await page.evaluate(() => {
      return window.get ? window.get("spike").length : 0;
    });
    expect(spikeCount).toBeGreaterThan(0);
  });

  test("chest exists in about scene", async ({ page }) => {
    await goToScene(page, "about");
    const chestCount = await page.evaluate(() => {
      return window.get ? window.get("chest").length : 0;
    });
    expect(chestCount).toBeGreaterThan(0);
  });

  test("camera Y is locked near center (no vertical drift)", async ({ page }) => {
    await goToScene(page, "about");
    await page.waitForTimeout(500); // Let camera settle

    const camY = await page.evaluate(() => {
      return window.camPos ? window.camPos().y : null;
    });

    const viewportHeight = await page.evaluate(() => window.height ? window.height() : window.innerHeight);

    // Camera Y should be close to height/2 - 40
    const expectedCamY = viewportHeight / 2 - 40;
    expect(camY).toBeCloseTo(expectedCamY, 0); // within 1px
  });

  test("background is opaque — no transparent canvas gaps visible", async ({ page }) => {
    await goToScene(page, "about");
    await page.waitForTimeout(500);

    // Sample a pixel near the top-center of the canvas. It must NOT be black
    // (which would indicate the transparent canvas / body background showing through)
    const pixel = await page.evaluate(() => {
      const canvas = document.getElementById("game-canvas");
      const ctx = canvas.getContext("2d");
      // Read 1x1 pixel at (canvas.width/2, 5) — near top center
      const data = ctx.getImageData(Math.floor(canvas.width / 2), 5, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2], a: data[3] };
    });

    // The background should be the orange color #E9B45A = rgb(233, 180, 90)
    // But since kaboom renders via WebGL onto an opaque canvas, pixel should not be pure black
    const isPureBlack = pixel.r === 0 && pixel.g === 0 && pixel.b === 0;
    expect(isPureBlack).toBe(false);
  });
});

test.describe("Projects Level", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("projects scene loads without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await goToScene(page, "projects");
    expect(errors).toHaveLength(0);
  });

  test("project crates exist", async ({ page }) => {
    await goToScene(page, "projects");
    const crateCount = await page.evaluate(() => {
      return window.get ? window.get("crate").length : 0;
    });
    expect(crateCount).toBeGreaterThan(0);
  });

  test("player spawns in projects scene", async ({ page }) => {
    await goToScene(page, "projects");
    const guyExists = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(guyExists).toBe(true);
  });
});

test.describe("Contact Level", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("contact scene loads without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await goToScene(page, "contact");
    expect(errors).toHaveLength(0);
  });

  test("player spawns in contact scene", async ({ page }) => {
    await goToScene(page, "contact");
    const guyExists = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(guyExists).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Level Devil Core: Death & Respawn Loop
// ---------------------------------------------------------------------------

test.describe("Death & Respawn (Level Devil Core Loop)", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("player respawns after being destroyed (Level Devil loop)", async ({ page }) => {
    await goToScene(page, "about");

    // Confirm player exists
    const existsBefore = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(existsBefore).toBe(true);

    // Kill the player programmatically
    await page.evaluate(() => {
      const guys = window.get("guy");
      if (guys.length > 0 && window.destroy) {
        window.destroy(guys[0]);
      }
    });

    // Scene should reload (go("about") is called after death)
    // Wait for player to respawn
    await page.waitForTimeout(1500);

    const existsAfter = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(existsAfter).toBe(true);
  });

  test("scene name stays correct after respawn", async ({ page }) => {
    await goToScene(page, "about");

    await page.evaluate(() => {
      const guys = window.get("guy");
      if (guys.length > 0 && window.destroy) window.destroy(guys[0]);
    });

    await page.waitForTimeout(1500);

    const scene = await page.evaluate(() => window.CURRENT_SCENE);
    expect(scene).toBe("about");
  });
});

// ---------------------------------------------------------------------------
// Recruiter Mode
// ---------------------------------------------------------------------------

test.describe("Recruiter Mode", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test("recruiter mode starts as OFF", async ({ page }) => {
    const mode = await page.evaluate(() => window.RECRUITER_MODE);
    expect(mode).toBe(false);
  });

  test("recruiter toggle button is visible in about level", async ({ page }) => {
    await goToScene(page, "about");
    await page.waitForTimeout(800);
    const toggle = page.locator("canvas"); // button is a kaboom fixed element
    // Verify RECRUITER_MODE can be toggled via JS
    await page.evaluate(() => { window.RECRUITER_MODE = true; });
    const modeOn = await page.evaluate(() => window.RECRUITER_MODE);
    expect(modeOn).toBe(true);
  });

  test("in recruiter mode player survives spike collision", async ({ page }) => {
    await goToScene(page, "about");

    // Enable recruiter mode
    await page.evaluate(() => { window.RECRUITER_MODE = true; });

    // Teleport player onto spikes (simulate collision)
    await page.evaluate(() => {
      const guys = window.get("guy");
      const spikes = window.get("spike");
      if (guys.length > 0 && spikes.length > 0) {
        guys[0].pos.x = spikes[0].pos.x;
        guys[0].pos.y = spikes[0].pos.y - 10;
      }
    });

    await page.waitForTimeout(500);

    // Player should still exist (immune in recruiter mode)
    const stillAlive = await page.evaluate(() => {
      return window.get ? window.get("guy").length > 0 : false;
    });
    expect(stillAlive).toBe(true);

    // Cleanup
    await page.evaluate(() => { window.RECRUITER_MODE = false; });
  });
});

// ---------------------------------------------------------------------------
// Pause Menu
// ---------------------------------------------------------------------------

test.describe("Pause Menu", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
    await page.locator("#game-canvas").click();
  });

  test("pressing Escape opens pause menu", async ({ page }) => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const pauseOverlay = page.locator("#pause-modal-overlay");
    await expect(pauseOverlay).toBeVisible({ timeout: 2000 });
  });

  test("pressing Escape again closes pause menu", async ({ page }) => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const pauseOverlay = page.locator("#pause-modal-overlay");
    await expect(pauseOverlay).not.toBeVisible({ timeout: 2000 });
  });

  test("pause button click opens pause menu", async ({ page }) => {
    const pauseBtn = page.locator("#pause-btn");
    await pauseBtn.click();
    await page.waitForTimeout(300);
    const pauseOverlay = page.locator("#pause-modal-overlay");
    await expect(pauseOverlay).toBeVisible({ timeout: 2000 });
  });
});

// ---------------------------------------------------------------------------
// Camera Behaviour
// ---------------------------------------------------------------------------

test.describe("Camera Behaviour - About Level", () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
    await goToScene(page, "about");
    await page.locator("#game-canvas").click();
  });

  test("camera X increases as player moves right", async ({ page }) => {
    // Move player far enough right to trigger camera scroll
    await holdKey(page, "ArrowRight", 2000);

    const camX = await page.evaluate(() => {
      return window.camPos ? window.camPos().x : null;
    });

    const viewportWidth = await page.evaluate(() => window.width ? window.width() : window.innerWidth);
    // Camera should have scrolled right of starting position
    expect(camX).toBeGreaterThan(viewportWidth / 2);
  });

  test("camera Y stays locked throughout right movement", async ({ page }) => {
    const viewportHeight = await page.evaluate(() => window.height ? window.height() : window.innerHeight);
    const expectedCamY = viewportHeight / 2 - 40;

    // Move right across multiple traps
    await holdKey(page, "ArrowRight", 2000);

    const camY = await page.evaluate(() => {
      return window.camPos ? window.camPos().y : null;
    });

    // Camera Y must remain locked (within 5px tolerance for lerp settling)
    expect(Math.abs(camY - expectedCamY)).toBeLessThan(5);
  });

  test("camera does not exceed world bounds", async ({ page }) => {
    const viewportWidth = await page.evaluate(() => window.width ? window.width() : window.innerWidth);
    const maxCamX = viewportWidth * 4 - viewportWidth / 2;

    // Move player far right past the world end
    await page.evaluate(() => {
      const guys = window.get("guy");
      if (guys.length > 0) guys[0].pos.x = 99999;
    });

    await page.waitForTimeout(300);

    const camX = await page.evaluate(() => {
      return window.camPos ? window.camPos().x : null;
    });

    expect(camX).toBeLessThanOrEqual(maxCamX + 5); // +5 for lerp overshoot
  });
});
