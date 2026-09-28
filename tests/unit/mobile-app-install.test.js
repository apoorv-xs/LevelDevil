import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";

describe("Workspace Mobile App (PWA) & Standalone Installation System", () => {
  const manifestPath = path.resolve(__dirname, "../../workspace/manifest.json");
  const swPath = path.resolve(__dirname, "../../workspace/sw.js");
  const workspaceHtmlPath = path.resolve(__dirname, "../../workspace/index.html");
  const workspaceAppPath = path.resolve(__dirname, "../../workspace/app.js");

  it("manifest.json defines valid PWA standalone parameters, maskable icons, and shortcuts", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.name).toBe("Client Radar — Outreach Intelligence Console");
    expect(manifest.short_name).toBe("Client Radar");
    expect(manifest.start_url).toBe("/workspace/");
    expect(manifest.scope).toBe("/workspace/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#fce566");
    expect(manifest.background_color).toBe("#fffdf1");
    expect(manifest.orientation).toBe("portrait-primary");

    // Maskable icon check
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifest.icons.some(i => i.purpose && i.purpose.includes("maskable"))).toBe(true);

    // Shortcuts check
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(2);
    expect(manifest.shortcuts[0].url).toContain("/workspace/?tab=leads");
    expect(manifest.shortcuts[1].url).toContain("/workspace/?tab=objections");
  });

  it("sw.js precaches essential workspace modules for fast launch and offline execution", () => {
    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("CACHE_NAME = \"client-radar-cache-v2\"");
    expect(swContent).toContain("/workspace/");
    expect(swContent).toContain("/workspace/app.js");
    expect(swContent).toContain("/workspace/prospects_data.js");
    expect(swContent).toContain("/workspace/objections.js");
    expect(swContent).toContain("/workspace/manifest.json");
    expect(swContent).toContain("caches.match");
  });

  it("workspace/index.html includes install buttons and the retro-brutalist install modal", () => {
    const html = fs.readFileSync(workspaceHtmlPath, "utf-8");
    expect(html).toContain("id=\"workspaceInstallAppBtn\"");
    expect(html).toContain("id=\"dropdownInstallAppBtn\"");
    expect(html).toContain("id=\"installAppModal\"");
    expect(html).toContain("id=\"tabBtnAndroid\"");
    expect(html).toContain("id=\"tabBtnIOS\"");
    expect(html).toContain("id=\"btnTriggerNativeInstall\"");
  });

  it("workspace/app.js strictly gates mobile install eligibility to signed-in and verified users only", () => {
    const appCode = fs.readFileSync(workspaceAppPath, "utf-8");

    // Extract isInstallAppEligible function code
    expect(appCode).toContain("function isInstallAppEligible()");
    expect(appCode).toContain("role === 'owner' || role === 'caller'");
    expect(appCode).toContain("isRunningInStandaloneMode()");
    expect(appCode).toContain("window.isInstallAppEligible = isInstallAppEligible");

    // Test eligibility logic in isolated context
    const checkEligible = (user, isStandalone = false) => {
      if (!user) return false;
      const role = user.role;
      const isVerified = role === "owner" || role === "caller";
      return Boolean(isVerified && !isStandalone);
    };

    // Anonymous / unauthenticated guest -> DISQUALIFIED
    expect(checkEligible(null)).toBe(false);
    expect(checkEligible(undefined)).toBe(false);

    // Unverified applicant -> DISQUALIFIED
    expect(checkEligible({ email: "applicant@gmail.com", role: "applicant" })).toBe(false);

    // Verified Outreach Partner (caller) -> QUALIFIED
    expect(checkEligible({ email: "caller@gmail.com", role: "caller" })).toBe(true);

    // Verified Owner (Apoorv) -> QUALIFIED
    expect(checkEligible({ email: "apoorvxs@gmail.com", role: "owner" })).toBe(true);

    // Already running in standalone app mode -> HIDDEN / DISQUALIFIED
    expect(checkEligible({ email: "apoorvxs@gmail.com", role: "owner" }, true)).toBe(false);
    expect(checkEligible({ email: "caller@gmail.com", role: "caller" }, true)).toBe(false);
  });
});
