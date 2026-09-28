import { test, expect } from "@playwright/test";

test.describe("Website Legal Compliance & Statutory Workflows", () => {
  test("renders skip-to-content accessibility link on Home and Sales", async ({ page }) => {
    // 1. Home page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const homeSkip = page.locator(".skip-link");
    await expect(homeSkip).toBeAttached();
    await expect(homeSkip).toHaveAttribute("href", "#main-content");

    // 2. Sales page
    await page.goto("/sales", { waitUntil: "domcontentloaded" });
    const salesSkip = page.locator(".skip-link");
    await expect(salesSkip).toBeAttached();
    await expect(salesSkip).toHaveAttribute("href", "#main-content");
  });

  test("renders statutory legal footer on Home page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const footer = page.locator(".site-legal-footer");
    await expect(footer).toBeAttached();

    // Verify statutory badges
    await expect(footer).toContainText("DPDP ACT 2023 COMPLIANT");
    await expect(footer).toContainText("GDPR & PECR ALIGNED");
    await expect(footer).toContainText("WCAG 2.1 AA ACCESSIBILITY");
    await expect(footer).toContainText("IT ACT 2000 & 2021 RULES");

    // Verify Direct inquiries contact in bottom bar
    await expect(footer).toContainText("DIRECT INQUIRIES: APOORVXS@GMAIL.COM");
  });

  test("renders statutory legal footer on Sales page", async ({ page }) => {
    await page.goto("/sales", { waitUntil: "domcontentloaded" });
    const footer = page.locator(".site-legal-footer");
    await expect(footer).toBeAttached();

    await expect(footer).toContainText("DPDP ACT 2023 COMPLIANT");
    await expect(footer).toContainText("STATUTORY POLICIES");
    await expect(footer).toContainText("COMPLIANCE & ACCESS");
  });

  test("opens universal legal modal from footer and switches all 5 legal tabs", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open Privacy Policy via footer button
    const privacyBtn = page.locator('.site-legal-footer button:has-text("Privacy Policy (DPDP)")');
    await privacyBtn.click();

    const modal = page.locator("#universalLegalModal");
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(modal).toHaveAttribute("aria-modal", "true");

    // Verify Privacy Policy content
    const modalBody = page.locator("#legalModalContent");
    await expect(modalBody).toContainText("DIGITAL PERSONAL DATA PROTECTION");
    await expect(modalBody).toContainText("DATA CONTROLLER & FIDUCIARY");
    await expect(modalBody).toContainText("Direct Data Erasure");

    // Switch to Terms of Engagement
    await page.locator('#universalLegalModal .legal-modal-tab-btn[data-tab="terms"]').click();
    await expect(modalBody).toContainText("COMMERCIAL TERMS OF ENGAGEMENT");
    await expect(modalBody).toContainText("PRACTICE MANDATE");
    await expect(modalBody).toContainText("Milestone Structure");

    // Switch to Refunds & Milestones
    await page.locator('#universalLegalModal .legal-modal-tab-btn[data-tab="refunds"]').click();
    await expect(modalBody).toContainText("REFUND & CANCELLATION CONDITIONS");
    await expect(modalBody).toContainText("50% Upfront Advance Deposits");

    // Switch to Digital Accessibility
    await page.locator('#universalLegalModal .legal-modal-tab-btn[data-tab="accessibility"]').click();
    await expect(modalBody).toContainText("ACCESSIBILITY & INCLUSION STATEMENT");
    await expect(modalBody).toContainText("WCAG 2.1 Level AA");

    // Switch to Cookies & Local Storage
    await page.locator('#universalLegalModal .legal-modal-tab-btn[data-tab="cookies"]').click();
    await expect(modalBody).toContainText("LOCAL STORAGE, COOKIES & TRANSPARENCY");
    await expect(modalBody).toContainText("CLEAR ALL LOCAL DATA");

    // Test Escape key dismissal
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("dismisses modal with close button", async ({ page }) => {
    await page.goto("/sales", { waitUntil: "domcontentloaded" });

    // Open terms modal directly via APP_SHELL
    await page.evaluate(() => window.APP_SHELL.openLegalModal("terms"));
    const modal = page.locator("#universalLegalModal");
    await expect(modal).toBeVisible();

    // Click close button
    const closeBtn = page.locator("#universalLegalModal .legal-modal-close-btn");
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test("blocks inquiry submission on /sales when DPDP consent checkbox is unchecked", async ({ page }) => {
    await page.goto("/sales", { waitUntil: "domcontentloaded" });

    await page.locator("#inquiry-name").fill("Test Compliance User");
    await page.locator("#inquiry-email").fill("compliance@example.com");
    await page.locator("#inquiry-message").fill("Checking statutory DPDP consent enforcement.");

    // Ensure consent checkbox is unchecked
    const consentBox = page.locator("#inquiry-consent");
    await expect(consentBox).not.toBeChecked();

    // Attempt to submit
    await page.locator("#inquiry-submit-btn").click();

    // Verify submission was blocked and user notified
    const status = page.locator("#status");
    await expect(status).toContainText("Please accept the Terms of Engagement & DPDP Act consent");
  });

  test("allows inquiry submission on /sales when DPDP consent checkbox is checked", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: {} }) });
    });

    await page.goto("/sales", { waitUntil: "domcontentloaded" });

    await page.locator("#inquiry-name").fill("Verified Consent User");
    await page.locator("#inquiry-email").fill("consent@example.com");
    await page.locator("#inquiry-message").fill("Statutory DPDP consent verified and affirmed.");

    // Check consent checkbox
    await page.locator("#inquiry-consent").check();

    const requestPromise = page.waitForRequest("**/api/inquiry");
    await page.locator("#inquiry-submit-btn").click();
    await requestPromise;

    await expect(page.locator("#status")).toContainText("Inquiry received. Apoorv will follow up within 24 hours.");
  });
});
