import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
const r = (p: string) => resolve(__dirname, p);

const alias = {
  '@': r('./'),
  'vite-plugin-iconfont': r('packages/vite-plugin-iconfont/src')
};

export default defineConfig({
  resolve: {
    alias
  },
  test: {
    setupFiles: ['./mocks/setup.ts']
  }
});
