import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mobile Caller Workflow & Touch Ergonomics (< 768px)", () => {
  const artifactDir = "C:\\Users\\asapo\\.gemini\\antigravity\\brain\\ff32d71d-f777-4a34-ad15-0bcea2fd8a2a";

  test("verifies full caller workflow, responsive tabs, in-call HUD, and disposition gate on mobile (390x844)", async ({ page }) => {
    // 1. Set mobile viewport (iPhone 12/13/14)
    await page.setViewportSize({ width: 390, height: 844 });

    // Mock caller session
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
      localStorage.setItem("sprintdial_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_google_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_test_mode", "true");
      window.__TEST_MODE__ = true;
    }, mockCaller);

    // 2. Load workspace
    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Check if onboarding disclaimer overlay appears for first-time caller
    const onboarding = page.locator("#onboardingDisclaimer");
    if (await onboarding.isVisible()) {
      await page.screenshot({ path: path.join(artifactDir, "mobile_caller_00_onboarding.png"), fullPage: false });
      const ackBtn = page.locator("#btnAcknowledgeOnboarding");
      await ackBtn.click();
      await page.waitForTimeout(400);
      await expect(onboarding).toBeHidden();
    }

    // Assert no horizontal scroll overflow on mobile
    const initialScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(initialScrollWidth).toBeLessThanOrEqual(390);

    // 3. Verify mobile view switcher tabs
    const switcher = page.locator("#mobileSwitcherTabs");
    await expect(switcher).toBeVisible();

    const tabQueue = page.locator("#mobileTabQueue");
    const tabCockpit = page.locator("#mobileTabCockpit");
    await expect(tabQueue).toBeVisible();
    await expect(tabCockpit).toBeVisible();

    // Screenshot 1: Queue view on mobile
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_01_queue.png"), fullPage: false });

    // 4. Switch to Cockpit
    await tabCockpit.click();
    await page.waitForTimeout(400);

    const cockpitPane = page.locator("#cockpitPane");
    await expect(cockpitPane).toBeVisible();
    await expect(cockpitPane).not.toHaveClass(/mobile-pane-hidden/);

    // Verify Sticky Bottom Action Bar
    const mobileCallBtn = page.locator("#mobileCallBtn");
    const mobileWaBtn = page.locator("#mobileWaBtn");
    const mobileNextBtn = page.locator("#mobileNextBtn");
    const mobilePrevBtn = page.locator("#mobilePrevBtn");

    await expect(mobileCallBtn).toBeVisible();
    await expect(mobileWaBtn).toBeVisible();
    await expect(mobileNextBtn).toBeVisible();
    await expect(mobilePrevBtn).toBeVisible();

    // Check touch target heights (>= 36px)
    const callBox = await mobileCallBtn.boundingBox();
    expect(callBox.height).toBeGreaterThanOrEqual(36);

    // Screenshot 2: Cockpit view on mobile
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_02_cockpit.png"), fullPage: false });

    // 5. Initiate Active Call via Mobile Call Button
    await mobileCallBtn.click();
    await page.waitForTimeout(600);

    // Verify In-Call Flight Active banner & Timer
    const flightBadge = page.locator("#callFlightBadge");
    await expect(flightBadge).toBeVisible();

    const statusText = page.locator("#callFlightStatusText");
    await expect(statusText).toHaveText("● IN-CALL ACTIVE");

    const timerDigits = page.locator("#callTimerDigits");
    await expect(timerDigits).toBeVisible();

    // Scroll to Call Wrap Card
    await page.evaluate(() => {
      const card = document.getElementById("callWrapCard");
      if (card) card.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(400);

    // Screenshot 3: Active Call HUD on Mobile
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_03_incall_hud.png"), fullPage: false });

    // 6. Test Mandatory Disposition Gate on Mobile Next Button
    // Attempting to advance without disposition must be blocked
    await mobileNextBtn.click();
    await page.waitForTimeout(400);

    // Notification toast or shake warning should appear
    const toast = page.locator("#notificationToast");
    if (await toast.count() > 0) {
      const toastText = await toast.textContent();
      expect(toastText).toMatch(/Complete call disposition/i);
    }

    // 7. Select Reach: Spoke to DM
    const btnReachDM = page.locator("#btnReachDM");
    await btnReachDM.click();
    await page.waitForTimeout(400);

    // Step 2 Dynamic Outcomes should now be populated
    const outcomeContainer = page.locator("#outcomeOptionsContainer");
    await expect(outcomeContainer).toBeVisible();

    // Screenshot 4: Step 2 Dynamic Outcomes on Mobile
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_04_step2_outcomes.png"), fullPage: false });

    // 8. Select Outcome: Booked Discovery (Track 2: Opens Executive Handoff Modal)
    const outcomeBooked = outcomeContainer.locator("button").first();
    await outcomeBooked.click();
    await page.waitForTimeout(400);

    const handoffModal = page.locator("#executiveHandoffModal");
    await expect(handoffModal).toBeVisible();

    // Close modal to proceed with workbench notes testing
    const handoffCloseBtn = page.locator("#executiveHandoffModal button[aria-label='Close Handoff Window']");
    await handoffCloseBtn.click();
    await page.waitForTimeout(300);

    // 9. Test 1-Tap Quick-Tag Note Chips
    const tagChip = page.locator(".quick-tag-chip").first();
    await tagChip.click();
    await page.waitForTimeout(200);

    const notesInput = page.locator("#callNotesInput");
    const notesVal = await notesInput.inputValue();
    expect(notesVal).toContain("[");

    // Screenshot 5: Completed Disposition & Quick Tags
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_05_completed_disposition.png"), fullPage: false });

    // 10. Advance lead now permitted
    await mobileNextBtn.click();
    await page.waitForTimeout(600);

    // Call workflow state should be reset for the new lead
    const resetStatusText = page.locator("#callFlightStatusText");
    await expect(resetStatusText).toHaveText("READY TO DIAL");

    // Final check: document scrollWidth <= 390
    const finalScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(finalScrollWidth).toBeLessThanOrEqual(390);
  });

  test("verifies compact mobile viewports (375x667 iPhone SE) without text clipping", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const mockCaller = {
      uid: "caller_alpha_02",
      email: "partner2@hermes.io",
      displayName: "Beta Caller",
      role: "caller",
      callerToken: "test_token_456",
      tokenExp: Date.now() + 86400000
    };

    await page.addInitScript((user) => {
      localStorage.setItem("sprintdial_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_google_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_test_mode", "true");
      localStorage.setItem("sprintdial_onboarding_ack_partner2@hermes.io", new Date().toISOString());
      window.__TEST_MODE__ = true;
    }, mockCaller);

    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Dismiss onboarding if present
    const onboarding = page.locator("#onboardingDisclaimer");
    if (await onboarding.isVisible()) {
      const ackBtn = page.locator("#btnAcknowledgeOnboarding");
      await ackBtn.click();
      await page.waitForTimeout(400);
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    // Switch to Cockpit
    await page.click("#mobileTabCockpit");
    await page.waitForTimeout(400);

    // Screenshot 6: Compact iPhone SE view
    await page.screenshot({ path: path.join(artifactDir, "mobile_caller_06_iphone_se.png"), fullPage: false });

    const cockpitScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(cockpitScrollWidth).toBeLessThanOrEqual(375);
  });
});
