// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { TariffId } from '@opentalk/rest-api-rtk-query';
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
import failOnConsole from 'jest-fail-on-console';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';

import { DefaultAvatarImage } from './store/slices/configSlice';

failOnConsole();

global.React = React;

global.console = {
  ...console,
};

const config = {
  controller: 'localhost:8000',
  insecure: false,
  baseUrl: 'http://localhost:3000',
  helpdeskUrl: '',
  imprintUrl: '',
  dataProtectionUrl: '',
  userSurveyUrl: '',
  userSurveyApiKey: '',
  errorReportAddress: '',
  tariff: {
    id: '' as TariffId,
    name: '',
    quotas: {},
    modules: {},
  },
  beta: {
    isBeta: false,
    badgeUrl: '',
  },
  livekit: {
    e2eeSalt: '',
  },
  oidcConfig: {
    clientId: 'Frontend',

    redirectPath: '/auth/callback',
    signOutRedirectUri: '/dashboard',
    scope: 'openid profile email',
    popupRedirectPath: '/auth/callback',
    authority: 'http://localhost:8080/auth/realms/OPENTALK',
  },
  changePassword: {
    active: false,
    url: '',
  },
  speedTest: {
    ndtServer: '',
    ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
    ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
  },
  features: {
    enterpriseChat: true,
    userSearch: true,
    muteUsers: true,
    breakoutRooms: true,
    poll: true,
    vote: true,
    timer: true,
    autoModeration: false,
    protocol: true,
    addUser: false,
    talkingStick: false,
    wheelOfNames: false,
    recorder: true,
    recording: true,
    e2eEncryption: false,
  },
  provider: {
    active: false, // indicates if we are in the provider context
    accountManagementUrl: '',
  },
  videoBackgrounds: [
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/elevate-bg.png',
      thumb: '/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot1.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot1-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot2-png',
      thumb: '/assets/videoBackgrounds/thumbs/ot2-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot3.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot3-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot4.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot4-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot5.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot5-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot6.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot6-thumb.png',
    },
    {
      altText: 'OpenTalk',
      url: '/assets/videoBackgrounds/ot7.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot7-thumb.png',
    },
  ],
  maxVideoBandwidth: 8000000,
  libravatarDefaultImage: 'robohash' as DefaultAvatarImage,
  settings: {
    waitingRoomDefaultValue: false,
  },
};

window.config = config;

const handlers = [
  http.get('http://OP/.well-known/openid-configuration', async () => {
    return HttpResponse.json({
      issuer: 'http://localhost/',
      authorization_endpoint: 'http://localhost/auth',
      token_endpoint: 'http://localhost/token',
      revocation_endpoint: 'revoke',
    });
  }),
  http.get('http://localhost/locales/en-US/k3k.ftl', async () => {
    return HttpResponse.text('Mocked FTL Content');
  }),
  http.get('http://localhost/locales/en/k3k.ftl', async () => {
    return HttpResponse.text('Mocked FTL Content');
  }),
];

// Start msw node mock server
const server = setupServer(...handlers);

global.beforeAll(() => server.listen());
global.afterEach(() => server.resetHandlers());

jest.mock('@opentalk/i18next-fluent', () => {
  class Fluent {
    static type: string;
    constructor() {
      this.init();
    }

    init() {
      // Validate backendOptions
    }
  }
  Fluent.type = 'fluent';
  return Fluent;
});

global.beforeEach(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getDisplayMedia: jest.fn(),
    },
  });

  // to prevent console warning: unstable_flushDiscreteUpdates
  // https://github.com/testing-library/react-testing-library/issues/470
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    set: () => {
      console.log('setting muted');
    },
  });
});

jest.mock('@livekit/components-react', () => ({
  useRoomContext: () => jest.fn(),
}));

export const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: mockChangeLanguage,
        language: {
          split: () => ['en'],
        },
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  Trans: ({ i18nKey }: { children: React.ReactNode; i18nKey: string }) => i18nKey,
}));

jest.mock('i18next', () => {
  const module = jest.requireActual('i18next');

  return {
    __esModule: true,
    default: module,
    t: (key: string) => key,
  };
});
