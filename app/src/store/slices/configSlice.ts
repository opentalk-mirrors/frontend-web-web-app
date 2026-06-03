// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendFeatures, BackendModules, Tariff, TariffId } from '@opentalk/rest-api-rtk-query';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import type { RootState } from '../';
import log from '../../logger';
import { EnabledModules, SignalingTariff } from '../../types';
import type { VideoCodec } from '../../types/livekit';
import { Seconds } from '../../utils/tsUtils';
import { joinSuccess } from '../commonActions';

// Map is not recommended by redux/immer

type VideoBackground = {
  altText: string;
  url: string;
  thumb: string;
};

type Beta = {
  isBeta?: boolean;
  badgeUrl?: string;
};

type Spacedeck = {
  enabled: boolean;
};

export type DefaultAvatarImage = '404' | 'mm' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'pagan';

export enum FeaturesKeys {
  Home = 'home',
  UserSearch = 'userSearch',
  MuteUsers = 'muteUsers',
  ResetHandraises = 'resetHandraises',
  AddUser = 'addUser',
  JoinWithoutMedia = 'joinWithoutMedia',
  Debriefing = 'debriefing',
  E2eEncryption = 'e2eEncryption',
  InnovafoneAPI = 'innovafoneAPI',
}

type Features = {
  [value in FeaturesKeys]?: boolean;
};

export interface Config {
  controller?: string;
  insecure?: boolean;
  baseUrl?: string;
  helpdeskUrl?: string;
  contactSupportUrl?: string;
  userSurveyUrl?: string;
  userSurveyApiKey?: string;
  errorReportAddress: string;
  disallowCustomDisplayName?: boolean;
  meetingInactivityMediaDisableSeconds?: Seconds;
  meetingInactivityWarningSeconds?: Seconds;
  meetingInactivityTerminationSeconds?: Seconds;
  logLevel?: string;
  beta: Beta;
  livekit: {
    e2eeSalt?: string;
    preferredVideoCodec?: VideoCodec.VP9 | VideoCodec.AV1;
  };
  oidcConfig?: {
    clientId?: string;
    authority?: string;
    redirectUri?: string;
    signOutRedirectUri?: string;
    popupRedirectUri?: string;
    scope?: string;
  };
  changePassword: {
    active: boolean;
    url?: string;
  };
  speedTest: {
    ndtServer: string;
    ndtDownloadWorkerJs: string;
    ndtUploadWorkerJs: string;
  };
  features: Features;
  settings: {
    waitingRoomDefaultValue: boolean;
    suppressBrowserCompatibilityInfo: boolean;
  };
  videoBackgrounds: VideoBackground[];
  maxVideoBandwidth: number;
  libravatarDefaultImage?: DefaultAvatarImage;
  tariff?: Tariff;
  provider: {
    active: boolean;
    accountManagementUrl?: string;
  };
  imprintUrl?: string;
  dataProtectionUrl?: string;
  version?: {
    product: `v${string}`;
    frontend: `v${string}`;
  };
}

// is a `type` instead of being an `interface`, to be safely imported by commonActions.ts
// otherwise causes circular dependency
export type ConfigState = {
  controller: string;
  insecure: boolean;
  baseUrl: string;
  helpdeskUrl?: string;
  contactSupportUrl?: string;
  userSurveyUrl?: string;
  userSurveyApiKey?: string;
  beta: Beta;
  errorReportAddress: string;
  disallowCustomDisplayName?: boolean;
  meetingInactivityMediaDisableSeconds: Seconds;
  meetingInactivityWarningSeconds: Seconds;
  meetingInactivityTerminationSeconds: Seconds;
  logLevel?: string;
  oidcConfig: {
    clientId: string;
    redirectPath: string;
    signOutRedirectUri: string;
    popupRedirectPath: string;
    scope: string;
    authority: string;
  };
  livekit?: {
    e2eeSalt?: string;
    preferredVideoCodec?: VideoCodec.VP9 | VideoCodec.AV1;
  };
  changePassword: {
    active: boolean;
    url?: string;
  };
  speedTest: {
    ndtServer: string;
    ndtDownloadWorkerJs: string;
    ndtUploadWorkerJs: string;
  };
  provider: {
    active: boolean;
    accountManagementUrl?: string;
  };
  settings: {
    waitingRoomDefaultValue: boolean;
    suppressBrowserCompatibilityInfo: boolean;
  };
  readonly videoBackgrounds: readonly VideoBackground[];
  maxVideoBandwidth: number;
  readonly features: Features;
  libravatarDefaultImage: DefaultAvatarImage;
  enabledModules: EnabledModules;
  tariff: SignalingTariff;
  imprintUrl?: string;
  dataProtectionUrl?: string;
  version?: {
    product: `v${string}`;
    frontend: `v${string}`;
  };
  glitchtip?: {
    dsn?: string;
  };
  spacedeck: Spacedeck;
};
/**
 * Initial Configuration.
 *
 * Some URLs are left empty, please populate the config.js in the public dir which should live at /config.js when deployed.
 * This invalid URLs are valid, as we check for the loaded property before loading any app related component.
 *
 * These initial state is merged with the content from config.js, thus some defaults are reasonable.
 * DEPLOYMENT should be set to your deployed app. When using `pnpm start`, this is http://localhost:3000/
 * CONTROLLER and WS_CONTROLLER MUST be set.
 * OP is your OpenIDConnect Provider
 */
export const initialState: ConfigState = {
  controller: 'CONTROLLER',
  insecure: false,
  baseUrl: 'http://localhost',
  helpdeskUrl: undefined,
  contactSupportUrl: undefined,
  userSurveyUrl: undefined,
  userSurveyApiKey: undefined,
  errorReportAddress: 'report@opentalk.eu',
  disallowCustomDisplayName: false,
  meetingInactivityMediaDisableSeconds: 120 as Seconds,
  meetingInactivityWarningSeconds: 900 as Seconds,
  meetingInactivityTerminationSeconds: 3600 as Seconds,
  logLevel: undefined,
  beta: {
    isBeta: true,
  },
  oidcConfig: {
    authority: 'OP',
    clientId: 'Frontend',
    redirectPath: '/auth/callback',
    signOutRedirectUri: '/dashboard',
    popupRedirectPath: '/auth/popup_callback',
    scope: 'openid profile email',
  },
  changePassword: {
    active: false,
  },
  speedTest: {
    ndtServer: 'NDT_SERVER',
    ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
    ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
  },
  features: {
    home: true,
    userSearch: true,
    muteUsers: true,
    resetHandraises: true,
    debriefing: true,
    addUser: false,
    e2eEncryption: false,
    innovafoneAPI: false,
  },
  settings: {
    waitingRoomDefaultValue: true,
    suppressBrowserCompatibilityInfo: false,
  },
  provider: {
    active: false,
  },
  videoBackgrounds: [],
  maxVideoBandwidth: 600000,
  libravatarDefaultImage: 'robohash',
  enabledModules: {},
  tariff: {
    id: '' as TariffId,
    name: '',
    quotas: {},
    usedQuota: {},
    disabledFeatures: [],
  },
  glitchtip: {
    dsn: undefined,
  },
  spacedeck: {
    enabled: true,
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<Config>) => {
      merge(state, payload);
      log.debug('config updated to:', state, payload);
    },
    setStorageQuota: (state, { payload }: PayloadAction<{ total?: number; used: number }>) => {
      state.tariff.usedQuota['maxStorage'] = payload.used;
      if (payload.total !== undefined) {
        state.tariff.quotas['maxStorage'] = payload.total;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload }) => {
      state.tariff = { ...payload.tariff };
      state.enabledModules = payload.enabledModules;
    });
  },
});

export const { update, setStorageQuota } = configSlice.actions;
export const actions = configSlice.actions;

export const selectController = (state: RootState) => state.config.controller;
export const selectBaseUrl = (state: RootState) => state.config.baseUrl;
export const selectControllerUrl = (state: RootState) => {
  const prefix = state.config.insecure ? 'http' : 'https';
  return `${prefix}://${state.config.controller}/`;
};
export const selectHelpdeskUrl = (state: RootState) => state.config.helpdeskUrl;
export const selectContactSupportUrl = (state: RootState) => state.config.contactSupportUrl;
export const selectOidcConfig = (state: RootState) => state.config.oidcConfig;
export const selectSpeedTestConfig = (state: RootState) => state.config.speedTest;
export const selectConfigFeatures = (state: RootState) => state.config.features;
export const selectVideoBackgrounds = (state: RootState) => state.config.videoBackgrounds;
export const selectLibravatarDefaultImage = (state: RootState) => state.config.libravatarDefaultImage;
export const selectUserSurveyUrl = (state: RootState) => state.config.userSurveyUrl;
export const selectIsBetaRelease = (state: RootState) => state.config.beta.isBeta;
export const selectBetaBadgeUrl = (state: RootState) => state.config.beta.badgeUrl;
export const selectLivekitE2EESalt = (state: RootState) => state.config.livekit?.e2eeSalt;
export const selectLivekitPreferredVideoCodec = (state: RootState) => state.config.livekit?.preferredVideoCodec;
export const selectErrorReportEmail = (state: RootState) => state.config.errorReportAddress;
export const selectDisallowCustomDisplayName = (state: RootState) => state.config.disallowCustomDisplayName;
export const selectLogLevel = (state: RootState) => state.config.logLevel;
export const selectChangePassword = (state: RootState) => state.config.changePassword;
export const selectEnabledModulesList = createSelector(
  (state: RootState) => state.config.enabledModules,
  (enabledModules) => Object.keys(enabledModules ?? {}) as BackendModules[]
);
export const selectIsModuleEnabled = (module: BackendModules) => (state: RootState) =>
  module in (state.config.enabledModules ?? {});
export const selectIsFeatureEnabled = (module: BackendModules, featureKey: BackendFeatures) => (state: RootState) =>
  (state.config.enabledModules?.[module] ?? []).includes(featureKey);
export const selectAccountManagementUrl = (state: RootState) => state.config.provider.accountManagementUrl;
export const selectImprintUrl = (state: RootState) => state.config.imprintUrl;
export const selectIsProviderActive = (state: RootState) => state.config.provider.active;
export const selectDataProtectionUrl = (state: RootState) => state.config.dataProtectionUrl;
export const selectGlitchtipConfig = (state: RootState) => state.config.glitchtip;
export const selectIsGlitchtipConfigured = (state: RootState) => Boolean(state.config.glitchtip?.dsn);
export const selectWaitingRoomDefault = (state: RootState) => state.config.settings.waitingRoomDefaultValue;
export const selectSuppressBrowserCompatibilityInfo = (state: RootState) =>
  state.config.settings.suppressBrowserCompatibilityInfo;
export const selectMeetingInactivityMediaDisableSeconds = (state: RootState) =>
  state.config.meetingInactivityMediaDisableSeconds;
export const selectMeetingInactivityWarningSeconds = (state: RootState) => state.config.meetingInactivityWarningSeconds;
export const selectMeetingInactivityTerminationSeconds = (state: RootState) =>
  state.config.meetingInactivityTerminationSeconds;
export const selectIsSpacedeckEnabled = (state: RootState) => state.config.spacedeck.enabled;
export const selectStorageUsed = (state: RootState) => state.config.tariff?.usedQuota['maxStorage'];
export const selectStorageTotal = (state: RootState) => state.config.tariff?.quotas['maxStorage'];

export default configSlice.reducer;
