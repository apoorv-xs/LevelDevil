import { test, expect } from "@playwright/test";

test("check why player didn't move on ArrowRight", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Click inside the window to guarantee focus
  await page.locator("body").click();

  const focus1 = await page.evaluate(() => document.hasFocus());
  console.log("document.hasFocus():", focus1);

  // Check key down
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(100);

  const keyState = await page.evaluate(() => {
    return {
      hasFocus: document.hasFocus(),
      controlMode: window.controlMode,
      isKeyDownRight: typeof isKeyDown === "function" ? isKeyDown("right") : null,
      isKeyDownD: typeof isKeyDown === "function" ? isKeyDown("d") : null,
      posX: window.player?.pos.x,
      posY: window.player?.pos.y,
    };
  });
  console.log("KEY STATE with ArrowRight:", JSON.stringify(keyState));
  await page.keyboard.up("ArrowRight");

  // Now test with key 'd'
  await page.keyboard.down("d");
  await page.waitForTimeout(200);
  const keyStateD = await page.evaluate(() => {
    return {
      hasFocus: document.hasFocus(),
      controlMode: window.controlMode,
      isKeyDownRight: typeof isKeyDown === "function" ? isKeyDown("right") : null,
      isKeyDownD: typeof isKeyDown === "function" ? isKeyDown("d") : null,
      posX: window.player?.pos.x,
      posY: window.player?.pos.y,
    };
  });
  console.log("KEY STATE with 'd':", JSON.stringify(keyStateD));
  await page.keyboard.up("d");
});
