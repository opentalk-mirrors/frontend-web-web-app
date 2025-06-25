// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import eslint from '@eslint/js';
import jest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
    settings: {
      jest: {
        version: 'detect',
      },
    },
    files: ['**/*.test.{ts,tsx}'],
    plugins: { jest, 'testing-library': testingLibrary },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      ...testingLibrary.configs['flat/react'].rules,
      'jest/no-commented-out-tests': 'off',
      'jest/no-disabled-tests': 'off',
      'jest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
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
