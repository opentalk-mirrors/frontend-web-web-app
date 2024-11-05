// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const DEFAULT_BUILD_PATH = '../dist';
const WARNINGS_TO_IGNORE = [['SOURCEMAP_ERROR', "Can't resolve original location of error"]];

// This plugin is only for development.
// Enables Hot Module Replacement for the libs in the monorepo to speed up their development
const packagesHmrPlugin = () => ({
  name: 'opentalk-packages-hmr-plugin',
  apply: 'serve',
  config: () => ({
    resolve: {
      alias: {
        '@opentalk/rest-api-rtk-query': path.resolve(__dirname, '../packages/rtk-rest-api/index.ts'),
        '@opentalk/redux-oidc': path.resolve(__dirname, '../packages/redux-oidc/index.ts'),
        '@opentalk/fluent_conv': path.resolve(__dirname, '../packages/fluent_conv/src/index.ts'),
        '@opentalk/i18next-fluent': path.resolve(__dirname, '../packages/i18next-fluent/src/index.ts'),
      },
    },
  }),
});

// Currently vite has some problems with sourcemaps of particular libraries (such as mui)
// It's a known issue https://github.com/vitejs/vite/issues/15012
// A workaround is to mute this warnings
// Took from https://github.com/vitejs/vite/issues/15012#issuecomment-1825035992
const muteWarningsPlugin = (warningsToIgnore) => {
  const mutedMessages = new Set();
  return {
    name: 'mute-warnings',
    enforce: 'pre',
    config: (userConfig) => ({
      build: {
        rollupOptions: {
          onwarn(warning, defaultHandler) {
            if (warning.code) {
              const muted = warningsToIgnore.find(
                ([code, message]) => code == warning.code && warning.message.includes(message)
              );
              if (muted) {
                mutedMessages.add(muted.join());
                return;
              }
            }

            if (userConfig.build?.rollupOptions?.onwarn) {
              userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
            } else {
              defaultHandler(warning);
            }
          },
        },
      },
    }),
    closeBundle() {
      const diff = warningsToIgnore.filter((x) => !mutedMessages.has(x.join()));
      if (mutedMessages.size > 0) {
        this.warn('Some warnings has been muted during the build process:');
        mutedMessages.forEach((m) => this.warn(m));
      }
      if (diff.length > 0) {
        this.warn('Some of your muted warnings never appeared during the build process:');
        diff.forEach((m) => this.warn(`- ${m.join(': ')}`));
      }
    },
  };
};

export default defineConfig(({ command }) => {
  const hmr = process.env.HMR === 'true';
  const buildPath = process.env.BUILD_PATH ?? DEFAULT_BUILD_PATH;

  const getAppVersion = () => {
    if (command === 'build') {
      const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
      return gitCommitHash;
    }
    return 'dev';
  };

  return {
    logLevel: 'info',
    plugins: [
      hmr && packagesHmrPlugin(),
      replace({
        VITE_APP_VERSION: getAppVersion(),
        preventAssignment: true,
      }),
      muteWarningsPlugin(WARNINGS_TO_IGNORE),
      react(),
      svgr(),
    ],
    server: {
      open: true,
      port: 3000,
    },
    build: {
      outDir: buildPath,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        external: ['/config.js'],
      },
    },
  };
});
