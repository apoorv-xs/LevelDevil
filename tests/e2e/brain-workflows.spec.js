import { test, expect } from "@playwright/test";

test.describe("System 1 Decision Brain - Multi-Page Workflows", () => {
  test("Home (/) initializes brain and showcases projects", async ({ page }) => {
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const isBrainActive = await page.evaluate(() => {
      return !!window.System1Brain && window.System1Brain.currentIntent !== undefined;
    });
    expect(isBrainActive).toBe(true);

    // Place BB-8 on ERAVEX Studio project card rail
    await page.evaluate(() => {
      const eravexRail = (window.landingRails || []).find(r => r.name?.includes("featured-project-card") || r.name?.includes("eravex"));
      if (eravexRail && window.player) {
        window.player.pos.x = eravexRail.xLeft + 50;
        window.player.pos.y = eravexRail.y;
        window.player.grounded = true;
        window.player.currentRail = eravexRail;
      } else if (window.player) {
        window.player.pos.y = 1100;
        window.player.grounded = true;
      }
      window.scrollTo(0, 900);
    });
    await page.waitForTimeout(2500);

    const thought = await page.evaluate(() => {
      const el = document.getElementById("companion-bubble");
      return (el && el.textContent) || window.System1Brain?.currentThought || null;
    });
    expect(thought).toBeTruthy();
  });

  test("Sales (/sales) classifies scope, tier, and validation alerts", async ({ page }) => {
    await page.goto("http://localhost:5173/sales", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Select scope
    await page.selectOption('select[name="scope"]', "3D Web Feature");
    await page.waitForTimeout(500);
    const scopeIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(scopeIntent).toBe("CALIBRATE_SCOPE");

    // Select budget tier
    await page.selectOption('select[name="budget"]', "$15k+");
    await page.waitForTimeout(500);
    const tierIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(tierIntent).toBe("VALIDATE_TIER");

    // Click submit with empty required inputs
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    const validationIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(validationIntent).toBe("ALERT_VALIDATION");
  });

  test("Workspace (/workspace/) classifies prospect audit, radar sweep, and call standby", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Select second prospect
    await page.evaluate(() => {
      const items = document.querySelectorAll("#queueList > div");
      if (items[1]) items[1].click();
    });
    await page.waitForTimeout(1000);
    const prospectIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(prospectIntent).toBe("AUDIT_PROSPECT");

    // Click a city tab
    await page.evaluate(() => {
      const tabs = document.querySelectorAll(".city-tab");
      if (tabs[2]) tabs[2].click();
    });
    await page.waitForTimeout(500);
    const radarIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(radarIntent).toBe("RADAR_SWEEP");

    // Start call
    await page.evaluate(() => {
      const btn = document.getElementById("callActionBtn");
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);
    const callIntent = await page.evaluate(() => window.System1Brain?.currentIntent);
    expect(callIntent).toBe("CALL_STANDBY");
  });
});
