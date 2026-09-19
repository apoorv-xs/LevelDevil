import { test, expect } from "@playwright/test";

test.describe("Sales shell acquisition UX", () => {
  test("shows compact action rail above the fold on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sales", { waitUntil: "networkidle" });

    const rail = page.locator(".action-rail");
    await expect(rail).toBeVisible();
    for (const label of ["Project inquiry", "Sales rep apply", "Workspace"]) {
      const action = rail.getByRole("link", { name: label });
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
  });

  test("keeps keyboard focus order on navigation and action rail", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sales", { waitUntil: "networkidle" });

    await page.keyboard.press("Tab");
    await expect(page.locator(".brand")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-nav a").first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-nav a").nth(1)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".action-rail a").first()).toBeFocused();
  });

  test("keeps the portfolio route on the game experience", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#game-canvas")).toBeVisible();
    await expect(page.locator(".action-rail")).toHaveCount(0);
  });

  test("posts public forms to the deployed function routes", async ({ page }) => {
    const requests = [];
    await page.route("**/api/**", async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: {} }) });
    });
    await page.goto("/sales", { waitUntil: "networkidle" });
    await page.locator("#inquiry-form input[name=name]").fill("Ada");
    await page.locator("#inquiry-form input[name=email]").fill("ada@example.com");
    await page.locator("#inquiry-form textarea[name=message]").fill("Hello");
    const request = page.waitForRequest("**/api/inquiry");
    await page.locator("#inquiry-form button[type=submit]").click();
    await request;
    await expect(page.locator("#status")).toHaveText("Inquiry received. The owner will follow up.");
    expect(requests.some((url) => url.endsWith("/api/inquiry"))).toBe(true);
  });

  test("signs in and loads the protected workspace", async ({ page }) => {
    await page.addInitScript(() => {
      window.SALES_PLATFORM_AUTH = {
        signIn: async () => ({ user: { getIdToken: async () => "test-id-token" } }),
      };
    });
    await page.route("**/api/workspace", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer test-id-token");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { role: "owner", applications: [] } }),
      });
    });
    await page.goto("/sales", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page.locator("#workspace")).toBeVisible();
    await expect(page.locator("#auth-placeholder")).toBeHidden();
    await expect(page.locator("#workspace-role")).toHaveText("Signed in as owner");
  });
});
