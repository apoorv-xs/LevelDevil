import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Phase 1: Smartphone Scan-to-Dial QR Modal UI and Hotkey Q', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const mockCaller = {
      uid: 'caller_alpha_01',
      email: 'partner1@hermes.io',
      displayName: 'Alpha Caller',
      name: 'Alpha Caller',
      role: 'caller',
      callerToken: 'test_token_123',
      tokenExp: Date.now() + 86400000
    };

    await page.addInitScript((user) => {
      window.localStorage.setItem('sprintdial_user', JSON.stringify(user));
      window.localStorage.setItem('sprintdial_google_user', JSON.stringify(user));
      window.localStorage.setItem('sprintdial_test_mode', 'true');
      window.localStorage.setItem('sprintdial_onboarding_completed', 'true');
      window.localStorage.setItem('sprintdial_onboarding_ack_partner1@hermes.io', new Date().toISOString());
      window.localStorage.setItem('sprintdial_onboarding_ack_caller_alpha_01', new Date().toISOString());
      window.localStorage.setItem('sprintdial_tour_dismissed', 'true');
      window.__TEST_MODE__ = true;
    }, mockCaller);
  });

  test('Verify Desktop Scan-to-Dial QR modal, tab switching, and keyboard hotkeys', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/workspace/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    // Dismiss disclaimer or tour if present
    const ackBtn = page.locator('#btnAcknowledgeOnboarding');
    if (await ackBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await ackBtn.click();
      await page.waitForTimeout(200);
    }
    const tourModal = page.locator('#workspaceTourModal');
    if (await tourModal.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // Ensure prospect is loaded
    await expect(page.locator('#activeName')).toBeVisible();

    // Test 1: Click the QR Call button and wait for QR image response
    const qrBtn = page.locator('#btnQrDialAction');
    await expect(qrBtn).toBeVisible();

    const [responseCall] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('api.qrserver.com') && resp.status() === 200, { timeout: 10000 }),
      qrBtn.click()
    ]);
    expect(responseCall.ok()).toBe(true);

    // Modal should be visible
    const qrModal = page.locator('#qrDialModal');
    await expect(qrModal).toBeVisible();

    // Verify client name, phone display, and QR image
    const clientName = page.locator('#qrDialClientName');
    await expect(clientName).not.toBeEmpty();
    const phoneDisplay = page.locator('#qrDialPhoneDisplay');
    await expect(phoneDisplay).not.toBeEmpty();

    const qrImg = page.locator('#qrDialCodeImg');
    await expect(qrImg).toBeVisible();
    await page.waitForTimeout(500); // Allow image rendering onto canvas/DOM

    // Capture screenshot of Cellular Call QR modal
    const screenshotCallPath = path.resolve('C:/Users/asapo/.gemini/antigravity/brain/ff32d71d-f777-4a34-ad15-0bcea2fd8a2a/qr_dial_modal_cellular.png');
    await page.screenshot({ path: screenshotCallPath });

    // Test 2: Switch to WhatsApp Tab and wait for image response
    const waTab = page.locator('#qrTabWa');
    const [responseWa] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('api.qrserver.com') && resp.status() === 200, { timeout: 10000 }),
      waTab.click()
    ]);
    expect(responseWa.ok()).toBe(true);
    await page.waitForTimeout(500);

    // Capture screenshot of WhatsApp QR modal
    const screenshotWaPath = path.resolve('C:/Users/asapo/.gemini/antigravity/brain/ff32d71d-f777-4a34-ad15-0bcea2fd8a2a/qr_dial_modal_whatsapp.png');
    await page.screenshot({ path: screenshotWaPath });

    // Test 3: Press Escape to close
    await page.keyboard.press('Escape');
    await expect(qrModal).not.toBeVisible();

    // Test 4: Press Hotkey Q to reopen
    await page.keyboard.press('q');
    await expect(qrModal).toBeVisible();

    // Close via Q key
    await page.keyboard.press('q');
    await expect(qrModal).not.toBeVisible();
  });
});
