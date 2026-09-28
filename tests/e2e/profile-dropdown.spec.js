import { test, expect } from "@playwright/test";

test.describe("Workspace Profile Dropdown & Real-Time Sales Telemetry", () => {
  test("toggles profile dropdown with live telemetry, hotkey dispositions, and dismissal", async ({ page }) => {
    // 1. Set viewport to 1440px desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Load workspace
    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Mock an authenticated Google session (Apoorv as Owner)
    const mockUser = {
      uid: "apoorv_owner_1",
      email: "apoorvxs@gmail.com",
      displayName: "Apoorv A S",
      name: "Apoorv A S",
      role: "owner",
      picture: "https://ui-avatars.com/api/?name=Apoorv+A+S&background=fce566&color=17120f"
    };

    await page.evaluate((u) => {
      localStorage.setItem("sprintdial_user", JSON.stringify(u));
      localStorage.setItem("sprintdial_google_user", JSON.stringify(u));
      localStorage.setItem("sprintdial_dials_today", "7");
    }, mockUser);

    // Reload workspace to verify authenticated state
    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    // Assert profile trigger is visible
    const trigger = page.locator("#userProfileTrigger");
    await expect(trigger).toBeVisible();

    const dropdown = page.locator("#userProfileDropdown");
    await expect(dropdown).toBeHidden();

    // 3. Click profile trigger to open dropdown
    await trigger.click();
    await page.waitForTimeout(400);

    await expect(dropdown).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Assert Identity information
    await expect(page.locator("#dropdownUserName")).toHaveText(/Apoorv/);
    await expect(page.locator("#dropdownUserEmail")).toHaveText("apoorvxs@gmail.com");
    await expect(page.locator("#dropdownRolePill")).toHaveText("OWNER");

    // Assert Telemetry values are rendered
    const dialsToday = page.locator("#profileDialsToday");
    await expect(dialsToday).toBeVisible();
    const dialsVal = await dialsToday.textContent();
    expect(Number(dialsVal)).toBeGreaterThanOrEqual(7);

    const successCount = page.locator("#profileSuccessCount");
    const rejectionCount = page.locator("#profileRejectionCount");
    const callbackCount = page.locator("#profileCallbackCount");

    await expect(successCount).toBeVisible();
    await expect(rejectionCount).toBeVisible();
    await expect(callbackCount).toBeVisible();

    // Capture visual screenshot of open profile dropdown on 1440px desktop
    await page.screenshot({ path: "C:/Users/asapo/.gemini/antigravity/brain/ff32d71d-f777-4a34-ad15-0bcea2fd8a2a/workspace_profile_dropdown_verified.png" });

    // 4. Test Escape key dismissal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(dropdown).toBeHidden();

    // 5. Test Click outside dismissal
    await trigger.click();
    await page.waitForTimeout(300);
    await expect(dropdown).toBeVisible();

    // Click outside on the cockpit background
    await page.locator("#workspaceCockpitContainer").click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(300);
    await expect(dropdown).toBeHidden();

    // 6. Test Live Telemetry updates when logging dispositions
    await page.keyboard.press("1"); // Log Interested [Hotkey: 1]
    await page.waitForTimeout(300);

    await trigger.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#profileSuccessCount")).toHaveText("1");
    await expect(page.locator("#profileWinRateBadge")).toHaveText("100% WIN");

    // Rejection disposition on next lead
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await page.keyboard.press("j"); // Advance to Lead 2
    await page.waitForTimeout(300);
    await page.keyboard.press("3"); // Log Disqualified [Hotkey: 3]
    await page.waitForTimeout(300);

    await trigger.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#profileSuccessCount")).toHaveText("1");
    await expect(page.locator("#profileRejectionCount")).toHaveText("1");
    await expect(page.locator("#profileWinRateBadge")).toHaveText("50% WIN");
  });
});
