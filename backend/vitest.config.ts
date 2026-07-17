import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Disable parallel execution of test files so they do not conflict
    // on the shared SQLite database (dev.db)
    fileParallelism: false,
    // Ensure sequential run of tests inside files as well
    sequence: {
      concurrent: false,
    },
  },
});
