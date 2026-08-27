import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'], // Ignora a pasta de E2E do Playwright
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});