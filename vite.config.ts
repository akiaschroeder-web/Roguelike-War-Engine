import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  base: './',
  // Agent worktrees live under .claude/; their copies of the tests aren't ours to run.
  test: { exclude: [...configDefaults.exclude, '.claude/**'] },
} as Parameters<typeof defineConfig>[0]);
