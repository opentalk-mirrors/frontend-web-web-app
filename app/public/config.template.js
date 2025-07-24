// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

window.config = {
  controller: '${CONTROLLER_HOST}',
  insecure: false,
  baseUrl: '${BASE_URL}',
  helpdeskUrl: '${HELPDESK_URL}',
  imprintUrl: '${IMPRINT_URL}',
  contactSupportUrl: '${CONTACT_SUPPORT_URL}',
  dataProtectionUrl: '${DATA_PROTECTION_URL}',
  userSurveyUrl: '${USER_SURVEY_URL}',
  userSurveyApiKey: '${USER_SURVEY_API_KEY}',
  errorReportAddress: '${ERROR_REPORT_ADDRESS}',
  disallowCustomDisplayName: '${DISALLOW_CUSTOM_DISPLAY_NAME}',
  version: {
    product: '${PRODUCT_VERSION}',
    frontend: '$(cat /usr/share/nginx/html/FRONTEND_VERSION)',
  },
  beta: {
    isBeta: '${IS_BETA_RELEASE:-true}',
    badgeUrl: '${BETA_BADGE_URL}',
  },
  oidcConfig: {
    clientId: 'Frontend',
    redirectPath: '/auth/callback',
    signOutRedirectUri: '/dashboard',
    scope: 'openid profile email',
    popupRedirectPath: '/auth/popup_callback',
    authority: '${KEYCLOAK_HOST}',
  },
  changePassword: {
    active: '${CHANGE_PASSWORD_ACTIVE}',
    url: '${CHANGE_PASSWORD_URL}',
  },
  speedTest: {
    ndtServer: '${NDT_SERVER}',
    ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
    ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
  },
  livekit: {
    e2eeSalt: '${LIVEKIT_E2EE_SALT}',
  },
  features: {
    userSearch: true,
    muteUsers: true,
    resetHandraises: true,
    addUser: false,
    joinWithoutMedia: false,
    e2eEncryption: false,
  },
  settings: {
    waitingRoomDefaultValue: true,
  },
  provider: {
    active: false, // indicates if we are are in the provider context
    accountManagementUrl: '${ACCOUNT_MANAGEMENT_URL}',
  },
  videoBackgrounds: '${VIDEO_BACKGROUNDS}',
  maxVideoBandwidth: '${MAX_VIDEO_BANDWIDTH}',
  glitchtip: {
    dsn: '${SENTRY_DSN}',
  },
  libravatarDefaultImage: 'robohash',
};
