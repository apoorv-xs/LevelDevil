import { test, expect } from "@playwright/test";

test.describe("Cross-route Google Auth Synchronization", () => {
  test("logging in on /workspace/ immediately reflects on /sales", async ({ page, context }) => {
    // 1. Start on /workspace/ with 1440px desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Mock an authenticated Google session (e.g. Apoorv as Owner)
    const mockUser = {
      uid: "apoorv_owner_1",
      email: "apoorvxs@gmail.com",
      displayName: "Apoorv A S",
      role: "owner",
      photoURL: "https://lh3.googleusercontent.com/a/ACg8ocL_TEST"
    };

    await page.evaluate((u) => {
      localStorage.setItem("sprintdial_user", JSON.stringify(u));
      localStorage.setItem("sprintdial_google_user", JSON.stringify(u));
    }, mockUser);

    // Reload workspace to verify it picked it up
    await page.goto("/workspace/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const workspaceUserChip = page.locator("#userChipHeader");
    await expect(workspaceUserChip).toBeVisible();

    // 2. Navigate directly to /sales
    await page.goto("/sales", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    // Verify topbar shows user session, not sign in button
    const topbarSignIn = page.locator("#topbar-sign-in");
    const topbarUser = page.locator("#topbar-user");
    const topbarEmail = page.locator("#topbar-user-email");
    const topbarImg = page.locator("#topbar-user-img");

    await expect(topbarSignIn).toBeHidden();
    await expect(topbarUser).toBeVisible();
    await expect(page.locator("#topbar-user-name")).toHaveText("Apoorv A S");
    await expect(topbarImg).toBeVisible();
    await expect(topbarImg).toHaveAttribute("src", /googleusercontent|ui-avatars/);

    // Verify form auth status auto-filled verified badge
    const formAuthStatus = page.locator("#form-auth-status");
    await expect(formAuthStatus).toContainText("Verified with Google");

    // Take screenshot of 1440px topbar on /sales
    await page.screenshot({ path: "C:/Users/asapo/.gemini/antigravity/brain/ff32d71d-f777-4a34-ad15-0bcea2fd8a2a/sales_authenticated_topbar_1440.png" });

    // Test at 1280px
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: "C:/Users/asapo/.gemini/antigravity/brain/ff32d71d-f777-4a34-ad15-0bcea2fd8a2a/sales_authenticated_topbar_1280.png" });

    // 3. Test Sign Out via Profile Dropdown
    if (await page.locator("#userProfileTrigger").isVisible()) {
      await page.locator("#userProfileTrigger").click();
      await page.waitForTimeout(300);
    }
    const topbarSignOut = page.locator("#topbar-sign-out");
    await topbarSignOut.click();
    await page.waitForTimeout(600);

    await expect(topbarSignIn).toBeVisible();
    await expect(topbarUser).toBeHidden();

    const storedUser = await page.evaluate(() => localStorage.getItem("sprintdial_user"));
    expect(storedUser).toBeNull();
  });
});
