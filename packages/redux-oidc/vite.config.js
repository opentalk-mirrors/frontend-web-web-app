// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return `main.js`;
        } else if (format === 'cjs') {
          return `main.cjs`;
        }
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
      rollupTypes: true,
    }),
  ],
});
