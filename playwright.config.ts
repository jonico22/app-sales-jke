import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const isCI = !!process.env.CI;
const port = 4173;
const previewServerCommand = `npm run build:e2e && npm run test:e2e:serve`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: previewServerCommand,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: isCI ? 180_000 : 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
