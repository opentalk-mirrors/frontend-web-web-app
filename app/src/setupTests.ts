// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TariffId } from '@opentalk/rest-api-rtk-query';
import '@testing-library/jest-dom/vitest';
import { fetch, Request, Response } from 'cross-fetch';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { ConfigState, DefaultAvatarImage } from './store/slices/configSlice';
import { Seconds } from './utils/tsUtils';

/*
This will stop the tests directly if an unhandled rejection occurs, so that is easier to debug.

process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});
 */
vi.stubGlobal('Response', Response);
vi.stubGlobal('Request', Request);
vi.stubGlobal('fetch', fetch);

const handlers = [
  http.get('http://OP/.well-known/openid-configuration', () => {
    return HttpResponse.json({
      issuer: 'http://localhost/',
      authorization_endpoint: 'http://localhost/auth',
      token_endpoint: 'http://localhost/token',
      revocation_endpoint: 'revoke',
    });
  }),
  http.get('/notes', () => {
    return HttpResponse.html('<div>Mocked Notes Page</div>');
  }),
  http.get('/locales/en-US/k3k.ftl', () => {
    return HttpResponse.text('Mocked FTL Content');
  }),
  http.get('/locales/en/k3k.ftl', () => {
    return HttpResponse.text('Mocked FTL Content');
  }),
];

// Start msw node mock server
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const config: ConfigState = {
  controller: 'localhost:8000',
  insecure: false,
  baseUrl: location.origin,
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
    disabledFeatures: [],
  },
  enabledModules: {},
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
    userSearch: true,
    muteUsers: true,
    addUser: false,
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
    suppressBrowserCompatibilityInfo: false,
  },
  meetingInactivityMediaDisableSeconds: 120 as Seconds,
  meetingInactivityWarningSeconds: 900 as Seconds,
  meetingInactivityTerminationSeconds: 3600 as Seconds,
};

window.config = config;

vi.mock('@opentalk/i18next-fluent', () => {
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
  return {
    default: Fluent,
  };
});

beforeEach(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getDisplayMedia: vi.fn(),
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

vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => vi.fn(),
}));

export const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  // this mock makes sure any components using translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: mockChangeLanguage,
        language: {
          split: () => ['en', 'de'],
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

global.ImageData = vi.fn();
