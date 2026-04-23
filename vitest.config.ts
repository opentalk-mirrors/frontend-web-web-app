// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    pool: 'threads',
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'json', 'text', 'html'],
      reportsDirectory: './coverage',
      include: ['packages/**/*.{ts,js,jsx,tsx}', 'app/**/*.{ts,js,jsx,tsx}'],
      exclude: [
        'packages/notistack/**',
        '**/node_modules/**',
        '**/assets/**',
        '**/types/**',
        '**/dist/**',
        '**/build/**',
        '**/public/**',
        '**/devPublic/**',
        '**/tests/**',
        '**/test/**',
        '**/example/**',
        '**/stories/**',
        '**/hotReload/**',
        '**/coverage/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.d.ts',
        '**/setupTests.{ts,js}',
        '**/.eslintrc.{ts,js,cjs}',
        '**/rollup.config.js',
        '**/banner.js',
        '**/tsHelper.ts',
        '**/setupProxy.ts',
        '**/reportWebVitals.ts',
        '**/glitchtip.ts',
        '**/vite.config.ts',
      ],
    },
    logHeapUsage: true,
    globals: true,
    projects: [
      'app/vite.config.ts',
      'packages/fluent_conv/vite.config.ts',
      'packages/i18next-fluent/vite.config.ts',
      'packages/redux-oidc/vite.config.ts',
      'packages/rtk-rest-api/vite.config.ts',
    ],
  },
});
