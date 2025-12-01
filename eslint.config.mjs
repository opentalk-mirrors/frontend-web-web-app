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
      'app/src/commonComponents/DurationField/DurationField.tsx',
      'app/src/commonComponents/Notistack/fragments/variations/CustomNotification.tsx',
      'app/src/components/Ballot/fragments/PollContainer.tsx',
      'app/src/components/Ballot/fragments/ReportSection.tsx',
      'app/src/components/Ballot/fragments/VoteResult.tsx',
      'app/src/components/Ballot/fragments/VoteResultTable.tsx',
      'app/src/components/BreakoutRoomTab/fragments/CreateRoomsForm.tsx',
      'app/src/components/BreakoutRoomTab/fragments/ParticipantsEditor.tsx',
      'app/src/components/BreakoutRoomTab/fragments/ParticipantsSelector.tsx',
      'app/src/components/BreakoutRoomTab/fragments/RoomOverview.tsx',
      'app/src/components/Chat/Chat.tsx',
      'app/src/components/Chat/fragments/ChatAnnouncement.tsx',
      'app/src/components/Chat/fragments/ChatForm.tsx',
      'app/src/components/Chat/fragments/ChatList.tsx',
      'app/src/components/Chat/fragments/ChatMessage.tsx',
      'app/src/components/ChatOverview/fragments/ChatOverviewItem.tsx',
      'app/src/components/CoffeeBreakView/fragments/CoffeeBreakTimer.tsx',
      'app/src/components/DashboardNavigation/fragments/SecondaryNavigation.tsx',
      'app/src/components/GlitchtipErrorDialog/GlitchtipErrorDialog.tsx',
      'app/src/components/LegalVoteTab/fragments/CreateLegalVoteForm.tsx',
      'app/src/components/LegalVoteTab/fragments/ParticipantSelector.tsx',
      'app/src/components/MeetingForms/fragments/TrainingParticipationReportSelect/TrainingParticipationReportSelect.tsx',
      'app/src/components/MeetingHeader/fragments/SharedFolderPopover.tsx',
      'app/src/components/MeetingHeader/fragments/WaitingParticipantsPopover.tsx',
      'app/src/components/MeetingNotesTab/MeetingNotesTab.tsx',
      'app/src/components/MeetingSettingsDialog/fragments/CameraSettingsPanel.tsx',
      'app/src/components/MeetingView/fragments/Cinema.tsx',
      'app/src/components/ParticipantWindow/fragments/ParticipantVideo.tsx',
      'app/src/components/ParticipantWindow/fragments/VideoOverlay.tsx',
      'app/src/components/Participants/fragments/ParticipantListItem.tsx',
      'app/src/components/Participants/fragments/SearchTextField.tsx',
      'app/src/components/SelectParticipants/SelectParticipants.tsx',
      'app/src/components/TimerPopover/fragments/NormalTimerPopover.tsx',
      'app/src/components/Toolbar/fragments/AudioButton.tsx',
      'app/src/components/Toolbar/fragments/AudioIndicator.tsx',
      'app/src/components/Toolbar/fragments/MoreButton.tsx',
      'app/src/components/Toolbar/fragments/MoreMenu.tsx',
      'app/src/components/Toolbar/fragments/VideoButton.tsx',
      'app/src/components/VoteAndPollCountdown/VoteAndPollCountdown.tsx',
      'app/src/components/WaitingParticipantsList/fragments/WaitingParticipantsItem.tsx',
      'app/src/config/fragments/routesFragments.tsx',
      'app/src/hooks/useMediaQuery.ts',
      'app/src/hooks/useNavigateToHome.tsx',
      'app/src/hooks/useRemainingDurationOfTimer.ts',
      'app/src/hooks/useUpdateDocumentTitle.ts',
      'app/src/pages/Dashboard/CreateEventsPage/CreateEventsPage.tsx',
      'app/src/pages/Dashboard/EditEventsPage/EditEventsPage.tsx',
      'packages/redux-oidc/src/authCallbackComponent.tsx',
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
