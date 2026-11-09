import { defineConfig } from 'vitest/config'

// Its own settings, so vitest doesn't pick up the app's vite.config.ts from the folder above.
export default defineConfig({
  test: { environment: 'node', include: ['*.test.ts'] },
})
