// Vitest's default include pattern would swallow tests/e2e/*.spec.ts and
// run Playwright specs in a Node environment, where they fail on import.
// The two suites are separate gates: `npm run test` is pure and fast,
// `npm run test:e2e` needs a built site behind a server.
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...defaultExclude, 'tests/e2e/**'],
  },
});
