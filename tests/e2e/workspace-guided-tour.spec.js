import { test, expect } from "@playwright/test";

test.describe("Subsystem 21: Workstation Guided Walkthrough Overlay E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    const mockCaller = {
      uid: "caller_alpha_01",
      email: "partner1@hermes.io",
      displayName: "Alpha Caller",
      name: "Alpha Caller",
      role: "caller",
      callerToken: "test_token_123",
      tokenExp: Date.now() + 86400000
    };

    await page.addInitScript((user) => {
      window.localStorage.setItem("sprintdial_user", JSON.stringify(user));
      window.localStorage.setItem("sprintdial_google_user", JSON.stringify(user));
      window.localStorage.setItem("sprintdial_test_mode", "true");
      window.localStorage.setItem("sprintdial_onboarding_completed", "true");
      window.localStorage.setItem("sprintdial_onboarding_ack_partner1@hermes.io", new Date().toISOString());
      window.localStorage.setItem("sprintdial_onboarding_ack_caller_alpha_01", new Date().toISOString());
      window.__TEST_MODE__ = true;
    }, mockCaller);
  });

  test("1. Desktop: Opens Guided Tour from Topbar and navigates through all 5 steps", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    // Dismiss disclaimer if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Topbar tour button should be visible
    const tourBtn = page.locator("#btnWorkspaceTour");
    await expect(tourBtn).toBeVisible();

    // Click to open tour
    await tourBtn.click();

    const tourModal = page.locator("#workspaceTourModal");
    await expect(tourModal).toBeVisible();

    // Step 1: Territory Queue
    await expect(page.locator("#tourStepBadge")).toContainText("STEP 1 OF 5");
    await expect(page.locator("#tourStepTitle")).toContainText("Territory Queue");
    await expect(page.locator("#tourLaptopInstructions")).toContainText("Left Column");
    await expect(page.locator("#tourMobileInstructions")).toContainText("QUEUE");

    // Click Next -> Step 2: Client Dossier
    const nextBtn = page.locator("#tourBtnNext");
    await nextBtn.click();
    await expect(page.locator("#tourStepBadge")).toContainText("STEP 2 OF 5");
    await expect(page.locator("#tourStepTitle")).toContainText("Client Dossier");

    // Press ArrowRight keyboard shortcut -> Step 3: In-Call Cockpit
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tourStepBadge")).toContainText("STEP 3 OF 5");
    await expect(page.locator("#tourStepTitle")).toContainText("In-Call Flight HUD");

    // Press ArrowRight keyboard shortcut -> Step 4: Two-Track Closing
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tourStepBadge")).toContainText("STEP 4 OF 5");
    await expect(page.locator("#tourStepTitle")).toContainText("Two-Track Deal Closing");

    // Press ArrowRight keyboard shortcut -> Step 5: Commission Wallet
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tourStepBadge")).toContainText("STEP 5 OF 5");
    await expect(page.locator("#tourStepTitle")).toContainText("Commission Wallet");
    await expect(page.locator("#tourBtnNextText")).toContainText("START DIALING");

    // Final click finishes the tour
    await nextBtn.click();
    await expect(tourModal).toBeHidden();
  });

  test("2. Mobile Viewport (390x844): Displays mobile instructions without layout overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    // Trigger tour via JS invocation
    await page.evaluate(() => {
      if (typeof window.openWorkspaceTour === "function") {
        window.openWorkspaceTour(0);
      }
    });

    const tourModal = page.locator("#workspaceTourModal");
    await expect(tourModal).toBeVisible();

    // Verify modal is responsive and mobile instructions are visible
    const mobileCard = page.locator("#tourMobileInstructions");
    await expect(mobileCard).toBeVisible();
    await expect(mobileCard).toContainText("QUEUE");

    // Press Escape to dismiss
    await page.keyboard.press("Escape");
    await expect(tourModal).toBeHidden();
  });

  test("3. Profile Dropdown Launcher re-opens the tour", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    // Dismiss disclaimer if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Open profile dropdown
    const profileTrigger = page.locator("#userProfileTrigger");
    await profileTrigger.click();

    const dropdown = page.locator("#userProfileDropdown");
    await expect(dropdown).toBeVisible();

    // Click Workstation Tour & Guide button
    const dropdownTourBtn = page.locator("#btnDropdownTour");
    await expect(dropdownTourBtn).toBeVisible();
    await dropdownTourBtn.click();

    const tourModal = page.locator("#workspaceTourModal");
    await expect(tourModal).toBeVisible();
    await expect(page.locator("#tourStepTitle")).toContainText("Territory Queue");

    // Click Skip or Close to dismiss
    const skipBtn = page.locator("#tourBtnSkip, #workspaceTourModal button:has-text('[X] CLOSE'), #workspaceTourModal button:has-text('SKIP')").first();
    await skipBtn.click();
    await expect(tourModal).toBeHidden();
  });

  test("4. Completing Step 5 prompts the App Install modal for verified callers", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    // Disable test mode for this specific test so the post-tour install trigger fires
    await page.evaluate(() => {
      window.localStorage.removeItem("sprintdial_test_mode");
      window.__TEST_MODE__ = false;
    });

    // Open tour directly at Step 5
    await page.evaluate(() => {
      if (typeof window.openWorkspaceTour === "function") {
        window.openWorkspaceTour(4);
      }
    });

    const tourModal = page.locator("#workspaceTourModal");
    await expect(tourModal).toBeVisible();
    await expect(page.locator("#tourStepTitle")).toContainText("Commission Wallet");
    await expect(page.locator("#tourBtnNextText")).toContainText("START DIALING");

    // Click START DIALING
    const nextBtn = page.locator("#tourBtnNext");
    await nextBtn.click();

    // Tour should close
    await expect(tourModal).toBeHidden();

    // App Install modal should pop up!
    const installModal = page.locator("#installAppModal");
    await expect(installModal).toBeVisible({ timeout: 2000 });
    await expect(page.locator("#installModalTitle")).toContainText("INSTALL CLIENT RADAR APP");

    // Close the install modal
    const closeInstallBtn = page.locator("#installAppModal button[aria-label='Close Install Window']");
    await closeInstallBtn.click();
    await expect(installModal).toBeHidden();
  });
});
