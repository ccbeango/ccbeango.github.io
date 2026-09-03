import { defineConfig, devices } from "@playwright/test";

const useDevServer = process.env.PLAYWRIGHT_USE_DEV_SERVER === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results/playwright",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: useDevServer ? "http://127.0.0.1:5173" : "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: useDevServer
      ? "pnpm dev --host 127.0.0.1 --port 5173"
      : "pnpm preview --host 127.0.0.1 --port 4173",
    url: useDevServer ? "http://127.0.0.1:5173" : "http://127.0.0.1:4173",
    reuseExistingServer: useDevServer,
    timeout: 30_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
