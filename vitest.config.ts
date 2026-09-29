import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Only run tests in the tests/ directory, not in .next/
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
