import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    // La URL de tu servidor de desarrollo de Vite
    baseURL: 'http://localhost:5173', 
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Levanta tu app automáticamente antes de los tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Puedes añadir Firefox o Webkit si lo necesitas
  ],
});
