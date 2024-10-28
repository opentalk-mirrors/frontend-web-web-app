// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tariff, TariffId } from '@opentalk/rest-api-rtk-query';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import { RootState } from '../';
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

export type DefaultAvatarImage = '404' | 'mm' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'pagan';

export enum FeaturesKeys {
  Home = 'home',
  UserSearch = 'userSearch',
  MuteUsers = 'muteUsers',
  ResetHandraises = 'resetHandraises',
  AddUser = 'addUser',
  JoinWithoutMedia = 'joinWithoutMedia',
  Debriefing = 'debriefing',
  SharedFolder = 'sharedFolder',
}

type Features = {
  [value in FeaturesKeys]?: boolean;
};

export interface Config {
  controller?: string;
  insecure?: boolean;
  baseUrl?: string;
  helpdeskUrl?: string;
  userSurveyUrl?: string;
  userSurveyApiKey?: string;
  errorReportAddress: string;
  disallowCustomDisplayName?: boolean;
  beta: Beta;
  livekit: {
    e2eeSalt?: string;
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

export interface ConfigState {
  controller: string;
  insecure: boolean;
  baseUrl: string;
  helpdeskUrl: string;
  userSurveyUrl?: string;
  userSurveyApiKey?: string;
  beta: Beta;
  errorReportAddress: string;
  disallowCustomDisplayName?: boolean;
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
  };
  readonly videoBackgrounds: readonly VideoBackground[];
  maxVideoBandwidth: number;
  readonly features: Features;
  libravatarDefaultImage: DefaultAvatarImage;
  tariff: Tariff;
  imprintUrl?: string;
  dataProtectionUrl?: string;
  version?: {
    product: `v${string}`;
    frontend: `v${string}`;
  };
  glitchtip?: {
    dsn?: string;
  };
}
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
  helpdeskUrl: 'HELPDESK',
  userSurveyUrl: undefined,
  userSurveyApiKey: undefined,
  errorReportAddress: 'report@opentalk.eu',
  disallowCustomDisplayName: false,
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
  },
  settings: {
    waitingRoomDefaultValue: true,
  },
  provider: {
    active: false,
  },
  videoBackgrounds: [],
  maxVideoBandwidth: 600000,
  libravatarDefaultImage: 'robohash',
  tariff: {
    id: '' as TariffId,
    name: '',
    quotas: {},
    enabledModules: [],
    modules: {},
  },
  glitchtip: {
    dsn: undefined,
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<Config>) => {
      merge(state, payload);
      console.debug('config updated to:', state, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload }) => {
      state.tariff = { ...payload.tariff };
    });
  },
});

export const { update } = configSlice.actions;
export const actions = configSlice.actions;

export const selectController = (state: RootState) => state.config.controller;
export const selectBaseUrl = (state: RootState) => state.config.baseUrl;
export const selectControllerUrl = (state: RootState) => {
  const prefix = state.config.insecure ? 'http' : 'https';
  return `${prefix}://${state.config.controller}/`;
};
export const selectHelpdeskUrl = (state: RootState) => state.config.helpdeskUrl;
export const selectWsController = (state: RootState) => state.config.insecure;
export const selectOidcConfig = (state: RootState) => state.config.oidcConfig;
export const selectSpeedTestConfig = (state: RootState) => state.config.speedTest;
export const selectFeatures = (state: RootState) => state.config.features;
export const selectVideoBackgrounds = (state: RootState) => state.config.videoBackgrounds;
export const selectMaxVideoBandwidth = (state: RootState) => state.config.maxVideoBandwidth;
export const selectLibravatarDefaultImage = (state: RootState) => state.config.libravatarDefaultImage;
export const selectUserSurveyUrl = (state: RootState) => state.config.userSurveyUrl;
export const selectIsBetaRelease = (state: RootState) => state.config.beta.isBeta;
export const selectBetaBadgeUrl = (state: RootState) => state.config.beta.badgeUrl;
export const selectLivekitE2EESalt = (state: RootState) => state.config.livekit?.e2eeSalt;
export const selectErrorReportEmail = (state: RootState) => state.config.errorReportAddress;
export const selectDisallowCustomDisplayName = (state: RootState) => state.config.disallowCustomDisplayName;
export const selectChangePassword = (state: RootState) => state.config.changePassword;
export const selectEnabledModules = (state: RootState) => state.config.tariff.enabledModules;
export const selectModules = (state: RootState) => state.config.tariff.modules;
export const selectAccountManagementUrl = (state: RootState) => state.config.provider.accountManagementUrl;
export const selectImprintUrl = (state: RootState) => state.config.imprintUrl;
export const selectIsProviderActive = (state: RootState) => state.config.provider.active;
export const selectDataProtectionUrl = (state: RootState) => state.config.dataProtectionUrl;
export const selectGlitchtipConfig = (state: RootState) => state.config.glitchtip;
export const selectIsGlitchtipConfigured = (state: RootState) => Boolean(state.config.glitchtip?.dsn);
export const selectShowmprintContainer = (state: RootState) => {
  if (state.config.imprintUrl || state.config.dataProtectionUrl) {
    return true;
  }
  return false;
};
export const selectWaitingRoomDefault = (state: RootState) => state.config.settings.waitingRoomDefaultValue;

export default configSlice.reducer;
