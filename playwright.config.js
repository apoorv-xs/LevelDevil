import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 1,           // Level Devil philosophy: retry once before failing
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/results/e2e-report", open: "never" }]
  ],

  use: {
    baseURL: "http://localhost:5173",
    // Headless so CI can run it; set to false to watch gameplay during tests
    headless: true,
    viewport: { width: 1280, height: 720 },
    // Capture screenshot on failure (useful for debugging visual bugs like the sinking bg)
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  // Run the vite dev server before tests
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox can be added later:
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
