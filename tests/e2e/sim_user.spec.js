import { test, expect } from "@playwright/test";

test("simulate user interactions: mouse move, jump, scroll", async ({ page }) => {
  page.on("console", (msg) => console.log(`[CONSOLE] ${msg.text()}`));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // 1. Check initial perching
  const start = await page.evaluate(() => ({
    x: window.player?.pos.x,
    y: window.player?.pos.y,
    vy: window.player?.vy,
    grounded: window.player?.grounded,
    rail: window.player?.currentRail?.domElement?.tagName,
    mode: window.controlMode
  }));
  console.log("START:", JSON.stringify(start));

  // 2. What happens when mouse moves?
  console.log("=== MOVING MOUSE TO (400, 150) ===");
  await page.mouse.move(400, 150);
  await page.waitForTimeout(500);

  const afterMouse = await page.evaluate(() => ({
    x: window.player?.pos.x,
    y: window.player?.pos.y,
    grounded: window.player?.grounded,
    rail: window.player?.currentRail?.domElement?.tagName,
    mode: window.controlMode
  }));
  console.log("AFTER MOUSE:", JSON.stringify(afterMouse));

  // 3. What if double click happens? (Switches to ambient)
  console.log("=== DOUBLE CLICK (SWITCH TO AMBIENT) ===");
  await page.mouse.dblclick(500, 200);
  await page.waitForTimeout(500);
  const afterDblClick = await page.evaluate(() => ({
    x: window.player?.pos.x,
    y: window.player?.pos.y,
    grounded: window.player?.grounded,
    rail: window.player?.currentRail?.domElement?.tagName,
    mode: window.controlMode
  }));
  console.log("AFTER DBLCLICK:", JSON.stringify(afterDblClick));

  // 4. Move mouse outside platform while in ambient mode
  console.log("=== MOVE MOUSE TO (50, 150) ===");
  await page.mouse.move(50, 150);
  await page.waitForTimeout(500);
  const afterMoveLeft = await page.evaluate(() => ({
    x: window.player?.pos.x,
    y: window.player?.pos.y,
    grounded: window.player?.grounded,
    rail: window.player?.currentRail?.domElement?.tagName,
    mode: window.controlMode
  }));
  console.log("AFTER MOVE LEFT:", JSON.stringify(afterMoveLeft));

  // 5. Test jump on every platform!
  // Let's see what happens if player falls or walks off
  console.log("=== TEST FALLING / RESPAWNING ===");
  // Move player off edge manually
  await page.evaluate(() => {
    window.controlMode = "manual";
  });
  // Press arrow right for 3 seconds
  await page.keyboard.down("ArrowRight");
  for (let s = 0; s < 10; s++) {
    await page.waitForTimeout(300);
    const snap = await page.evaluate(() => ({
      x: window.player?.pos.x,
      y: window.player?.pos.y,
      vy: window.player?.vy,
      grounded: window.player?.grounded,
      rail: window.player?.currentRail?.domElement?.tagName,
      railClass: window.player?.currentRail?.domElement?.className
    }));
    console.log(`Walk right ${s}:`, JSON.stringify(snap));
  }
  await page.keyboard.up("ArrowRight");

  // Now wait and see where player lands
  await page.waitForTimeout(1000);
  const landSnap = await page.evaluate(() => ({
    x: window.player?.pos.x,
    y: window.player?.pos.y,
    vy: window.player?.vy,
    grounded: window.player?.grounded,
    rail: window.player?.currentRail?.domElement?.tagName,
    railClass: window.player?.currentRail?.domElement?.className
  }));
  console.log("AFTER FALL/LAND:", JSON.stringify(landSnap));

  // Now press jump from wherever player landed!
  console.log("=== PRESS JUMP AFTER FALL/LAND ===");
  await page.keyboard.press("Space");
  for (let j = 0; j < 15; j++) {
    await page.waitForTimeout(50);
    const jSnap = await page.evaluate(() => ({
      x: window.player?.pos.x,
      y: window.player?.pos.y,
      vy: window.player?.vy,
      grounded: window.player?.grounded,
      rail: window.player?.currentRail?.domElement?.tagName,
      railClass: window.player?.currentRail?.domElement?.className
    }));
    console.log(`Jump frame ${j}:`, JSON.stringify(jSnap));
  }
});
