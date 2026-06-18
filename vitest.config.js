import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only - no browser, no DOM needed
    environment: "node",
    include: ["tests/unit/**/*.test.js"],
    reporters: ["verbose"],
    // Fail fast on first error to mirror Level Devil "die and retry" loop
    bail: 0,
    // Show each test by name
    outputFile: {
      json: "./tests/results/unit-results.json"
    }
  }
});
