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
});
