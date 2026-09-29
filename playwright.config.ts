// The layout gate, mobile and (since amendment 21) desktop. Everything here runs against the built site
// served by `astro preview`, because the compact rules and Pagefind both
// need real layout and a real index; jsdom cannot lay out, so it cannot
// answer the only question this suite asks.
//
// Chromium only. This suite guards layout contracts (target sizes, no
// horizontal overflow, the disclosure's default state), not engine
// differences, and a second browser would double CI time for coverage
// this file is not designed to give.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list']] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      // iPhone-class portrait viewport: the 375px the build plan has
      // claimed since phase 4.
      name: 'mobile-chromium',
      testIgnore: /desktop\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      // Amendment 21's row card at a laptop viewport: one spec, so the
      // desktop layout contract has a gate of its own.
      name: 'desktop-chromium',
      testMatch: /desktop\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
