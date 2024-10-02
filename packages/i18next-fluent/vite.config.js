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
      output: {
        exports: 'named',
        external: ['i18next'],
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
