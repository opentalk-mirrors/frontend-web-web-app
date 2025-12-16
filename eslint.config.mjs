// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import eslint from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import testingLibrary from 'eslint-plugin-testing-library';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    'app/public/tflite/**',
    'app/public/config.js',
    'packages/rtk-rest-api/example/**',
  ]),
  {
    name: 'react-hooks (with ignores)',
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
    },
    ignores: [
      'app/src/components/BreakoutRoomTab/fragments/ParticipantsSelector.tsx',
      'packages/redux-oidc/src/authProvider.tsx',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  reactRefresh.configs.recommended,
  {
    name: 'root config',
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      curly: 'error',
    },
  },
  {
    name: 'tests',
    files: ['**/*.test.{ts,tsx}'],
    plugins: { vitest, 'testing-library': testingLibrary },
    rules: {
      ...vitest.configs.recommended.rules,
      ...testingLibrary.configs['flat/react'].rules,
      'vitest/no-commented-out-tests': 'off',
      'vitest/no-disabled-tests': 'off',
      'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
      parserOptions: {
        projectService: true,
        allowAutomaticSingleRunInference: true,
      },
    },
  },
  {
    name: 'app',
    files: ['app/**/*.{js,ts,jsx,tsx,}'],
    plugins: {
      react,
      jsxA11y,
      reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    name: 'redux-oidc',
    files: ['packages/redux-oidc/**/*.{js,ts,jsx,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    name: 'track-processors-js-main',
    files: ['packages/track-processors-js-main/**/*.{js,ts,jsx,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
