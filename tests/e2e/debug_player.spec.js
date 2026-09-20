import { test, expect } from "@playwright/test";

test("diagnose player position, rails, and jump behaviour", async ({ page }) => {
  page.on("console", (msg) => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => console.log(`[PAGE ERROR] ${err.message}`));

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Track position over 20 intervals without input
  console.log("=== TRACKING IDLE ===");
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100);
    const state = await page.evaluate((idx) => {
      const p = window.player;
      return {
        idx,
        x: p?.pos.x,
        y: p?.pos.y,
        vy: p?.vy,
        grounded: p?.grounded,
        rail: p?.currentRail?.domElement?.tagName || (p?.currentRail ? "unknown" : "null"),
        controlMode: window.controlMode
      };
    }, i);
    if (i % 4 === 0 || !state.grounded) {
      console.log(`Idle step ${i}:`, JSON.stringify(state));
    }
  }

  // Now press Space to jump
  console.log("=== PRESSING SPACE ===");
  // Focus canvas or document body
  await page.keyboard.press("Space");

  // Track each 20ms for 2 seconds
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(50);
    const state = await page.evaluate((idx) => {
      const p = window.player;
      return {
        idx,
        x: p?.pos.x,
        y: p?.pos.y,
        vy: p?.vy,
        grounded: p?.grounded,
        rail: p?.currentRail?.domElement?.tagName || (p?.currentRail ? "unknown" : "null"),
        railText: p?.currentRail?.domElement?.textContent?.slice(0, 20),
        controlMode: window.controlMode
      };
    }, i);
    console.log(`Jump step ${i}:`, JSON.stringify(state));
  }
});
