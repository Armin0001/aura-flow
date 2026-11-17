import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    // Run the tests west of UTC. Parsing "YYYY-MM-DD" as UTC midnight puts due dates on the
    // previous day there, a bug that never shows in UTC or in Europe.
    env: { TZ: 'America/New_York' },
  },
});
