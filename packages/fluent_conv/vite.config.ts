import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return 'main.js';
        } else if (format === 'cjs') {
          return 'main.cjs';
        }
        return 'main.js';
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  test: {
    name: { label: 'packages/fluent_conv', color: 'cyan' },
    environment: 'jsdom',
    logHeapUsage: true,
    globals: true,
  },
});
