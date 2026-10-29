import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173', headless: true },
  webServer: [
    {
      command:
        'pnpm --filter @pocket-ledger/api db:migrate:e2e && pnpm --filter @pocket-ledger/api dev:e2e',
      url: 'http://127.0.0.1:3333/api/health',
      reuseExistingServer: true
    },
    {
      command: 'pnpm dev --host 127.0.0.1',
      url: 'http://localhost:5173',
      reuseExistingServer: true
    }
  ]
});
