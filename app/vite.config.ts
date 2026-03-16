// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import babel from '@rolldown/plugin-babel';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { replacePlugin } from 'rolldown/plugins';
import { HmrContext, ResolvedConfig, Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

// We need to add file extension to import, to get rid of vite warning
// We use `*.js` instead of `*.ts` to avoid a typescript error
import { cleanPackageVersion } from './utils/build';

const DEFAULT_BUILD_PATH = '../dist';
const WARNINGS_TO_IGNORE = [['SOURCEMAP_ERROR', "Can't resolve original location of error"]];

const isProduction = process.env.NODE_ENV === 'production';

const sentryVersion = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).dependencies?.['@sentry/react'] ?? '0.0.0';

// Monorepo package aliases - used for both dev and prod
const monorepoPackageAliases = {
  '@opentalk/rest-api-rtk-query': path.resolve(import.meta.dirname, '../packages/rtk-rest-api/src/index.ts'),
  '@opentalk/redux-oidc': path.resolve(import.meta.dirname, '../packages/redux-oidc/src/index.ts'),
  '@opentalk/fluent_conv': path.resolve(import.meta.dirname, '../packages/fluent_conv/src/index.ts'),
  '@opentalk/i18next-fluent': path.resolve(import.meta.dirname, '../packages/i18next-fluent/src/index.ts'),
  'roughjs/bin/rough': path.resolve(import.meta.dirname, '../node_modules/roughjs/bin/rough.js'),
};

// This plugin is only for development.
// Enables Hot Module Replacement for the libs in the monorepo to speed up their development
const packagesHmrPlugin = (): Plugin => ({
  name: 'opentalk-packages-hmr-plugin',
  apply: 'serve',
  config: () => ({
    resolve: {
      alias: monorepoPackageAliases,
    },
  }),
});

// Found here https://stackoverflow.com/questions/69626090/how-to-watch-public-directory-in-vite-project-for-hot-reload
// `handleHotUpdate` hook will be deprecated in the future in favor of `hotUpdate`
const i18nHotReloadPlugin = () => ({
  name: 'i18n-hot-reload-plugin',
  handleHotUpdate: ({ file, server }: HmrContext) => {
    if (file.includes('locales') && file.endsWith('.ftl')) {
      console.log('Locale file updated');
      server.ws.send({
        type: 'custom',
        event: 'locales-update',
      });
    }
  },
});

const ignoreWarningsPlugin = () => ({
  name: 'ignore-warnings-plugin',
  configResolved(config: ResolvedConfig) {
    const originalWarn = config.logger.warn;
    config.logger.warn = (msg: string, options?: { clear?: boolean; timestamp?: boolean }) => {
      if (WARNINGS_TO_IGNORE.some(([id, text]) => msg.includes(id) && msg.includes(text))) {
        return;
      }
      originalWarn(msg, options);
    };
  },
});

export default defineConfig(({ command, mode }) => {
  const hmr = process.env.HMR === 'true';
  const buildPath = process.env.BUILD_PATH ?? DEFAULT_BUILD_PATH;

  const getAppVersion = () => {
    if (command === 'build') {
      const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
      return gitCommitHash;
    }
    return 'dev';
  };

  const profiling = isProduction &&
    mode === 'profiling' && {
      'react-dom/client': 'react-dom/profiling',
    };

  return {
    logLevel: 'info',
    define: {
      __SENTRY_VERSION__: JSON.stringify(cleanPackageVersion(sentryVersion)),
    },
    plugins: [
      hmr && packagesHmrPlugin(),
      i18nHotReloadPlugin(),
      replacePlugin(
        {
          VITE_APP_VERSION: getAppVersion(),
        },
        {
          preventAssignment: true,
        }
      ),
      ignoreWarningsPlugin(),
      sentryVitePlugin({
        telemetry: false,
        authToken: process.env.SENTRY_AUTH_TOKEN || '1234567890',
        org: process.env.SENTRY_ORG || '1234567890',
        project: process.env.SENTRY_PROJECT || '1234567890',
        reactComponentAnnotation: {
          enabled: true,
          ignoredComponents: ['ThemeProvider'],
          _experimentalInjectIntoHtml: true,
        },
      }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      svgr({
        svgrOptions: {
          titleProp: true,
        },
      }),
    ].filter(Boolean),
    server: {
      open: true,
      port: 3000,
    },
    optimizeDeps: {
      include: ['@reduxjs/toolkit', 'react', 'react-dom', 'react-redux'],
    },
    build: {
      outDir: buildPath,
      emptyOutDir: true,
      // Use 'hidden' for the public production build so source maps are still
      // emitted (and can be uploaded to Sentry) but the bundles do not advertise
      // them. The profiling build keeps full source maps with `sourceMappingURL`
      // references so browser devtools map logs/stack traces to the source.
      sourcemap: command === 'build' && mode !== 'profiling' ? 'hidden' : true,
      rolldownOptions: {
        external: ['/config.js'],
        output: {
          minify: {
            mangle: false,
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },

    resolve: {
      dedupe: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
      alias: {
        ...monorepoPackageAliases,
        ...profiling,
      },
    },
    test: {
      name: { label: 'app', color: 'yellow' },
      environment: 'happy-dom',
      logHeapUsage: true,
      globals: true,
      testTimeout: 10000,
      setupFiles: ['./src/setupTests.ts'],
      server: {
        deps: {
          inline: ['@excalidraw/excalidraw', 'roughjs'],
        },
      },
      env: {
        TZ: 'UTC',
      },
    },
  };
});
