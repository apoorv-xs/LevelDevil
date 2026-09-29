import { test, expect } from "@playwright/test";

test.describe("Category C: Partner Gamification, Commission Wallet & Retention Engine E2E", () => {
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
      window.__TEST_MODE__ = true;

      window.localStorage.setItem("sprintdial_partner_upi", "partner@okaxis");
      window.localStorage.setItem("sprintdial_dials_today", "5");
      window.localStorage.setItem("sprintdial_lead_overrides", JSON.stringify({
        "p-1": {
          status: "closed_won",
          closedTier: 1,
          depositPaid: 25000,
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        "p-2": {
          status: "connected_callback",
          updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString() // 36h ago (Overdue)
        },
        "p-3": {
          status: "connected_callback",
          updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString() // 72h ago (Zombie)
        }
      }));
    }, mockCaller);
  });

  test("1. Displays Topbar Live Wallet Pill with earned balance and opens Partner Wallet Modal", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Bypass onboarding overlay if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify topbar wallet pill is rendered with live cleared earnings
    const walletPill = page.locator("#topbarWalletPill");
    await expect(walletPill).toBeVisible();

    const walletAmount = page.locator("#topbarWalletAmount");
    // p-1 is closed_won (Tier 1 = ₹7,500 commission)
    await expect(walletAmount).toContainText("₹7,500");

    // Click Topbar Wallet Pill to open modal
    await walletPill.click();

    const walletModal = page.locator("#partnerWalletModal");
    await expect(walletModal).toBeVisible();

    // Verify Financial Cards
    await expect(page.locator("#walletClearedBalance")).toContainText("₹7,500");
    await expect(page.locator("#partnerUpiInput")).toHaveValue("partner@okaxis");

    // Verify Itemized Ledger has record for p-1
    const ledger = page.locator("#walletLedgerList");
    await expect(ledger).toContainText("₹7,500");

    // Press Escape to dismiss modal
    await page.keyboard.press("Escape");
    await expect(walletModal).toBeHidden();
  });

  test("2. Callbacks Tab prioritizes Overdue and Zombie leads with alert badges", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Bypass onboarding overlay if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Switch to Callbacks tab
    const callbackTab = page.locator("#statusTabCallbacks");
    await callbackTab.click();

    // Verify queue items show aging badges
    const queueList = page.locator("#queueList");
    await expect(queueList).toBeVisible();

    // The Zombie lead (>48h) or Overdue lead should show alert badges
    const zombieBadge = page.locator("#queueList").getByText(/ZOMBIE|OVERDUE/i).first();
    await expect(zombieBadge).toBeVisible();
  });

  test("3. Cockpit Notes Area provides 1-Tap Callback Nudge button", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Bypass onboarding overlay if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify 1-Tap Nudge button is visible in notes quick-tag strip
    const nudgeBtn = page.locator("#btnCallbackNudge");
    await expect(nudgeBtn).toBeVisible();
    await expect(nudgeBtn).toContainText("1-TAP NUDGE");
  });
});
