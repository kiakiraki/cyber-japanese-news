import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'frontend',
    include: ['src/**/*.test.ts'],
  },
});
