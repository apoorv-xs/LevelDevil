import { test, expect } from "@playwright/test";

test.describe("Sales & Inquiry Acquisition UX", () => {
  test("shows compact action rail above the fold on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sales", { waitUntil: "networkidle" });

    const rail = page.locator(".action-rail");
    await expect(rail).toBeVisible();
    for (const label of ["Project inquiry", "Direct engagement"]) {
      const action = rail.getByRole("link", { name: label });
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
  });

  test("keeps navigation and branding accessible on sales page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/sales", { waitUntil: "networkidle" });

    const brand = page.locator(".topbar-brand");
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute("href", "/");

    const nav = page.locator(".site-nav");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/sales");
    await expect(nav.getByRole("link", { name: "Workspace" })).toHaveAttribute("href", "/workspace/");
  });

  test("keeps keyboard focus order on topbar and navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sales", { waitUntil: "networkidle" });

    await page.locator(".topbar-brand").focus();
    await expect(page.locator(".topbar-brand")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-nav a").first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-nav a").nth(1)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-nav a").nth(2)).toBeFocused();
  });

  test("keeps the portfolio route on the 3D canvas experience without action rail", async ({ page }) => {
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
    await page.locator("#inquiry-form textarea[name=message]").fill("Hello, let's build 60 FPS shaders.");
    const requestPromise = page.waitForRequest("**/api/inquiry");
    await page.locator("#inquiry-form button[type=submit]").click();
    await requestPromise;
    await expect(page.locator("#status")).toHaveText("Inquiry received. Apoorv will follow up within 24 hours.");
    expect(requests.some((url) => url.endsWith("/api/inquiry"))).toBe(true);
  });

  test("displays Google fast-track inquiry authentication banner", async ({ page }) => {
    await page.goto("/sales", { waitUntil: "networkidle" });
    const authBox = page.locator("#form-google-auth-box");
    await expect(authBox).toBeVisible();
    await expect(page.locator("#sign-in")).toBeVisible();
    await expect(page.locator("#topbar-sign-in")).toBeVisible();
  });

  test("displays DPDP Act 2023 & GDPR privacy disclaimer under inquiry form", async ({ page }) => {
    await page.goto("/sales", { waitUntil: "networkidle" });
    const privacy = page.locator(".privacy-note");
    await expect(privacy).toBeVisible();
    await expect(privacy).toContainText("PRIVACY // Coordinates provided are used exclusively");
  });
});
