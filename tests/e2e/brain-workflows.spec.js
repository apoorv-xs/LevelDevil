import { test, expect } from "@playwright/test";

test.describe("System 1 Decision Brain - Multi-Page Workflows", () => {
  test("Home (/) initializes brain and showcases projects", async ({ page }) => {
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      return Boolean(window.System1Brain && window.System1Brain.currentIntent !== undefined && window.player?.grounded);
    }, { timeout: 15000 });

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
      window.scrollTo(0, Math.max(0, 1100 - window.innerHeight * 0.45));
    });

    await page.waitForFunction(() => {
      const el = document.getElementById("companion-bubble");
      return Boolean((el && el.textContent) || window.System1Brain?.currentThought);
    }, { timeout: 10000 });

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

  test("Workspace (/workspace/) locks unauthenticated visitors behind auth gate overlay", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/", { waitUntil: "networkidle" });
    const authOverlay = page.locator("#authGateOverlay");
    await expect(authOverlay).toBeVisible();
    await expect(authOverlay).not.toHaveClass(/hidden/);
    await expect(page.locator("#googleSignInBtn")).toBeVisible();
  });

  test("Workspace (/workspace/) rejects unauthorized localStorage tampering without active session", async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate malicious stranger writing fake owner into localStorage
      localStorage.setItem('sprintdial_user', JSON.stringify({
        name: 'Attacker',
        email: 'apoorvxs@gmail.com',
        role: 'owner'
      }));
    });
    await page.goto("http://localhost:5173/workspace/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const authOverlay = page.locator("#authGateOverlay");
    await expect(authOverlay).toBeVisible();
    await expect(authOverlay).not.toHaveClass(/hidden/);
  });

  test("Workspace (/workspace/) classifies prospect audit, radar sweep, and call standby", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('sprintdial_test_mode', 'true');
      localStorage.setItem('sprintdial_user', JSON.stringify({
        name: 'Apoorv',
        email: 'apoorvxs@gmail.com',
        picture: 'https://ui-avatars.com/api/?name=Apoorv&background=1E3A8A&color=60A5FA&bold=true',
        role: 'owner',
        sub: 'mock-owner'
      }));
    });
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
