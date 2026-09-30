import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = path.resolve(__dirname, "../../");

test.describe("Two-Track Deal Closing Engine & Sovereign Payment Terminal E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Grant clipboard read/write permissions
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
      localStorage.setItem("sprintdial_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_google_user", JSON.stringify(user));
      localStorage.setItem("sprintdial_test_mode", "true");
      localStorage.setItem("sprintdial_onboarding_ack_" + (user.sub || user.email || "caller"), new Date().toISOString());
      localStorage.setItem("sprintdial_tour_completed", "true");
      window.__TEST_MODE__ = true;
    }, mockCaller);
  });

  test("1. Workspace Track 1: In-call direct close via sovereign payment modal", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Bypass onboarding overlay if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Wait for lazy-loaded prospects to populate queue
    await page.locator("#queueList > div").first().waitFor({ timeout: 10000 });

    // Connect call and choose Spoke to DM
    const callBtn = page.locator("#callActionBtn");
    await callBtn.click();
    await page.waitForTimeout(300);

    const btnReachDM = page.locator("#btnReachDM");
    await btnReachDM.click();
    await page.waitForTimeout(300);

    // Click [2] CLOSE (15%)
    const btnCloseDirect = page.locator('button[data-outcome="closed_won"]');
    await expect(btnCloseDirect).toBeVisible();
    await btnCloseDirect.click();
    await page.waitForTimeout(400);

    // Sovereign In-Call Payment Terminal must be visible
    const dealModal = page.locator("#dealCommitmentModal");
    await expect(dealModal).toBeVisible();

    // Verify 50% advance UPI QR code image loaded
    const upiQrImg = page.locator("#dealUpiQrImg");
    await expect(upiQrImg).toBeVisible();
    const qrSrc = await upiQrImg.getAttribute("src");
    expect(qrSrc).toContain("api.qrserver.com");
    expect(qrSrc).toContain("apoorvxs%40okaxis");

    // Select Tier 2 (3D Spatial Showcase ₹1,00,000 -> 50% = ₹50,000)
    const tier2Btn = page.locator("#dealTier2");
    await tier2Btn.click();
    await page.waitForTimeout(200);

    const advanceText = page.locator("#dealSummaryAdvance");
    await expect(advanceText).toHaveText("₹50,000");

    const commissionText = page.locator("#dealSummaryCommission");
    await expect(commissionText).toHaveText("₹15,000");

    // Mark 50% Deposit Received
    const markDepositBtn = page.locator('button:has-text("Mark 50% Deposit Received")');
    await markDepositBtn.click();
    await page.waitForTimeout(500);

    // Modal should close and active badge should reflect won status
    await expect(dealModal).toBeHidden();
  });

  test("2. Workspace Track 2: Executive handoff to Apoorv (10% Referral Safety Net)", async ({ page }) => {
    await page.goto("http://localhost:5173/workspace/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Bypass onboarding overlay if present
    const ackBtn = page.locator("#btnAcknowledgeOnboarding");
    if (await ackBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(300);
    }

    // Wait for lazy-loaded prospects to populate queue
    await page.locator("#queueList > div").first().waitFor({ timeout: 10000 });

    // Connect call and choose Spoke to DM
    const callBtn = page.locator("#callActionBtn");
    await callBtn.click();
    await page.waitForTimeout(300);

    const btnReachDM = page.locator("#btnReachDM");
    await btnReachDM.click();
    await page.waitForTimeout(300);

    // Click [1] FORWARD (10%)
    const btnForward = page.locator('button[data-outcome="discovery_booked"]');
    await expect(btnForward).toBeVisible();
    await btnForward.click();
    await page.waitForTimeout(400);

    // Executive Handoff Modal must be visible
    const handoffModal = page.locator("#executiveHandoffModal");
    await expect(handoffModal).toBeVisible();

    // Verify 10% safety net banner and preview
    await expect(page.locator("text=10% REFERRAL SAFETY NET ACTIVE").first()).toBeVisible();
    const briefPreview = page.locator("#handoffBriefPreview");
    await expect(briefPreview).toBeVisible();
    const briefContent = await briefPreview.textContent();
    expect(briefContent).toContain("EXECUTIVE HANDOFF BRIEF FOR APOORV");
    expect(briefContent).toContain("10% Referral Safety Net Active");

    // Close handoff modal
    const closeBtn = page.locator('#executiveHandoffModal button[aria-label="Close Handoff Window"]');
    await closeBtn.click();
    await page.waitForTimeout(200);
    await expect(handoffModal).toBeHidden();
  });

  test("3. Public Teardown on /sales with simulator and fast-track deposit terminal", async ({ page }) => {
    await page.goto("http://localhost:5173/sales?prospect=Kochi%20Grand%20Palace&fee=100000&partner=AFFILIATE_42");
    await page.waitForLoadState("domcontentloaded");

    // Teardown container should be visible
    const teardownSection = page.locator("#trojan-teardown-section");
    await expect(teardownSection).toBeVisible();

    // Credentials banner verification
    const dossierId = page.locator("#trojan-dossier-id");
    await expect(dossierId).toHaveText(/RADAR-KOCHIGRAND/i);
    const partnerId = page.locator("#trojan-partner-id");
    await expect(partnerId).toHaveText("AFFILIATE_42");

    // Revenue Recovery Simulator check
    const simulatorCard = page.locator("#trojan-simulator-card");
    await expect(simulatorCard).toBeVisible();
    const bleedVal = page.locator("#sim-bleed-val");
    await expect(bleedVal).toBeVisible();

    // Fast-Track Sovereign Payment Terminal toggle
    const paymentView = page.locator("#trojan-payment-view");
    await expect(paymentView).toBeHidden();

    const fasttrackBtn = page.locator("#trojan-fasttrack-btn");
    await fasttrackBtn.click();
    await page.waitForTimeout(300);

    // Now payment view is visible
    await expect(paymentView).toBeVisible();

    // Preselected Tier 2 (from fee=100000)
    const summaryTotal = page.locator("#publicSummaryTotal");
    await expect(summaryTotal).toHaveText("₹1,00,000");
    const summaryAdvance = page.locator("#publicSummaryAdvance");
    await expect(summaryAdvance).toHaveText("₹50,000");

    // Dynamic QR image
    const publicQrImg = page.locator("#publicUpiQrImg");
    await expect(publicQrImg).toBeVisible();
    const qrSrc = await publicQrImg.getAttribute("src");
    expect(qrSrc).toContain("api.qrserver.com");
    expect(qrSrc).toContain("50000");

    // Switch to Tier 3 (WebGPU Custom Engine ₹2,00,000)
    const tier3Btn = page.locator("#publicTier3");
    await tier3Btn.click();
    await page.waitForTimeout(200);

    await expect(summaryTotal).toHaveText("₹2,00,000");
    await expect(summaryAdvance).toHaveText("₹1,00,000");

    const qrSrcTier3 = await publicQrImg.getAttribute("src");
    expect(qrSrcTier3).toContain("100000");

    // WhatsApp proof link
    const waLink = page.locator("#btnPublicWhatsAppProof");
    const href = await waLink.getAttribute("href");
    expect(href).toContain("wa.me/919495462450");
    expect(href).toContain("AFFILIATE_42");
  });

  test("4. Direct Fast-Track Proposal URL (?proposal=...) auto-expands payment terminal", async ({ page }) => {
    await page.goto("http://localhost:5173/sales?proposal=Apex%20Hospitality&fee=50000&partner=LEAD_AGENT");
    await page.waitForLoadState("domcontentloaded");

    const teardownSection = page.locator("#trojan-teardown-section");
    await expect(teardownSection).toBeVisible();

    // Payment view should be auto-expanded
    const paymentView = page.locator("#trojan-payment-view");
    await expect(paymentView).toBeVisible();

    const summaryTotal = page.locator("#publicSummaryTotal");
    await expect(summaryTotal).toHaveText("₹50,000");
    const summaryAdvance = page.locator("#publicSummaryAdvance");
    await expect(summaryAdvance).toHaveText("₹25,000");
  });
});
