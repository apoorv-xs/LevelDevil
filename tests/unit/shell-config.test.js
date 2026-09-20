import { describe, expect, it } from "vitest";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Unified application shell", () => {
  it("keeps portfolio game modules lazy", () => {
    const index = read("index.html");
    expect(index).toContain('src="shell.js"');
    expect(index).not.toContain('src="kaboom.js');
    expect(index).not.toContain('src="level_projects.js');
  });

  it("starts the portfolio without a visible start gate", () => {
    const index = read("index.html");
    const shell = read("shell.js");
    expect(index).not.toContain("start-overlay");
    expect(index).not.toContain("START GAME");
  });

  it("supports the sales deep-link family", () => {
    const shell = read("shell.js");
    expect(shell).toContain('pathname === "/sales"');
    expect(shell).toContain('pathname.startsWith("/sales/")');
    expect(shell).toContain('fetch("/sales.html")');
  });

  it("keeps public forms and protected entry in the sales view", () => {
    const sales = read("sales.html");
    expect(sales).toContain('id="inquiry-form"');
    expect(sales).toContain('id="application-form"');
    expect(sales).toContain('id="sign-in"');
    expect(sales).toContain('id="auth-placeholder"');
    expect(sales).toContain('href="/sales"');
    expect(sales).not.toContain("Firebase ID token");
    expect(sales).toContain('aria-label="Sales actions"');
    expect(sales).toContain('href="#inquiry-card"');
    expect(sales).toContain('href="#application-card"');
    expect(sales).toContain('href="#workspace-card"');
  });

  it("uses deployed API routes and surfaces API error messages", () => {
    const app = read("sales-app.js");
    expect(app).toContain('submitPublicForm(event, "/inquiry"');
    expect(app).toContain('submitPublicForm(event, "/application"');
    expect(app).toContain("payload.error?.message");
    expect(app).toContain("No workspace records yet.");
    expect(app).toContain("No applications yet.");
    expect(app).toContain("displayName");
  });

  it("normalizes Firebase user credentials for workspace sign-in", () => {
    const shell = read("shell.js");
    const auth = read("sales-auth.js");
    const config = read("sales-config.js");
    expect(shell).toContain("session.user.getIdToken");
    expect(shell).toContain("resumeRedirect");
    expect(shell).toContain("getIdTokenResult");
    expect(shell).toContain('loadScript("/sales-config.js")');
    expect(shell).toContain('loadScript("/sales-auth.js")');
    expect(auth).toContain("signInWithPopup");
    expect(auth).toContain("signInWithRedirect");
    expect(auth).toContain("getRedirectResult");
    expect(auth).toContain("auth/popup-closed-by-user");
    expect(config).toContain('projectId: "apoorv-sales"');
    expect(config).toContain('authDomain: "apoorv-sales.firebaseapp.com"');
    expect(config).not.toContain("speeddial-9b999");
    expect(config).not.toContain("measurementId");
  });

  it("uses the canonical retro visual tokens without rounded SaaS cards", () => {
    const salesCss = read("sales.css");
    const shellCss = read("shell.css");
    expect(salesCss).toContain("--amber:");
    expect(salesCss).toContain("--purple:");
    expect(salesCss).toContain('font-family: "Press Start 2P"');
    expect(salesCss).toContain("border-radius: 0");
    expect(salesCss).toContain("box-shadow: 8px 8px 0 var(--purple)");
    expect(shellCss).toContain("box-shadow: 5px 5px 0 var(--shell-line)");
  });
});
