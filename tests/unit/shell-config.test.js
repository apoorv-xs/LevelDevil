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
    expect(sales).not.toContain("Firebase ID token");
  });
});
