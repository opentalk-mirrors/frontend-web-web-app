// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
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
      external: ['react', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
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
    name: { label: 'packages/redux-oidc', color: 'green' },
    logHeapUsage: true,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
  },
});
