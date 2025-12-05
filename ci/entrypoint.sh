#!/usr/bin/env sh

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

HTML_ROOT=/usr/share/nginx/html

ACTIVE_FEATURES="{
    userSearch: ${FEATURE_USER_SEARCH:-true},
    muteUsers: ${FEATURE_MUTE_USER:-true},
    resetHandraises: ${FEATURE_RESET_HANDRAISES:-true},
    addUser: ${FEATURE_ADD_USER:-false},
    joinWithoutMedia: ${FEATURE_JOIN_WITHOUT_MEDIA:-false},
    e2eEncryption: ${FEATURE_E2E_ENCRYPTION:-false},
    innovafoneAPI: ${FEATURE_INNOVAFONE_API:-false},
}"

DEFAULT_VIDEO_BACKGROUNDS="[
    {
      altText: 'Elevate',
      url: '/assets/videoBackgrounds/elevate-bg.png',
      thumb: '/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png',
    },
    {
      altText: 'Living room',
      url: '/assets/videoBackgrounds/ot1.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot1-thumb.png',
    },
    {
      altText: 'Conference room',
      url: '/assets/videoBackgrounds/ot2.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot2-thumb.png',
    },
    {
      altText: 'Beach at sunset',
      url: '/assets/videoBackgrounds/ot3.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot3-thumb.png',
    },
    {
      altText: 'Boat on shore',
      url: '/assets/videoBackgrounds/ot4.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot4-thumb.png',
    },
    {
      altText: 'Pink living room',
      url: '/assets/videoBackgrounds/ot5.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot5-thumb.png',
    },
    {
      altText: 'Bookshelf',
      url: '/assets/videoBackgrounds/ot6.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot6-thumb.png',
    },
    {
      altText: 'Bookshelves surround an open door',
      url: '/assets/videoBackgrounds/ot7.png',
      thumb: '/assets/videoBackgrounds/thumbs/ot7-thumb.png',
    }
  ]"

# Deprecated fallback for $KEYCLOAK_AUTHORITY
if [[ x"${KEYCLOAK_AUTHORITY}" != "x" ]]; then
    OIDC_ISSUER=$KEYCLOAK_AUTHORITY
fi

if [[ x"${BASE_URL}" == "x" ]]; then
  BASE_URL="location.origin"
else
  BASE_URL=\"${BASE_URL}\"
fi 

cat >$HTML_ROOT/config.js << EOF
window.config = {
  logLevel: "${LOG_LEVEL:-info}",
  controller: "${CONTROLLER_HOST}",
  insecure: ${INSECURE:-false},
  baseUrl: ${BASE_URL},
  helpdeskUrl: "${HELPDESK_URL}",
  contactSupportUrl: "${CONTACT_SUPPORT_URL}",
  imprintUrl: "${IMPRINT_URL}",
  dataProtectionUrl: "${DATA_PROTECTION_URL}",
  provider: {
    active: false,
    accountManagementUrl: "${ACCOUNT_MANAGEMENT_URL}",
  },
  version: {
    product: "${PRODUCT_VERSION}",
    frontend: "$(cat /usr/share/nginx/html/FRONTEND_VERSION)"
  },
  errorReportAddress: "${ERROR_REPORT_ADDRESS}",
  beta: {
    isBeta: ${IS_BETA_RELEASE:-true},
    badgeUrl: "${BETA_BADGE_URL}",
  },
  livekit: {
    e2eeSalt: "${LIVEKIT_E2EE_SALT}",
  },
  libravatarDefaultImage: "${LIBRAVATAR_DEFAULT_IMAGE:-robohash}",
  disallowCustomDisplayName: ${DISALLOW_CUSTOM_DISPLAY_NAME:-false},
  oidcConfig: {
    authority: "${OIDC_ISSUER}",
    clientId: "${OIDC_CLIENT_ID:-Frontend}",
    scope: "openid profile email",
    redirectPath: "/auth/callback",
    signOutRedirectUri: "${SIGN_OUT_REDIRECT_URI:-/dashboard}",
    popupRedirectPath: "/auth/popup_callback",
  },
  changePassword: {
    active: ${CHANGE_PASSWORD_ACTIVE:-false},
    url: "${CHANGE_PASSWORD_URL}",
  },
  userSurveyUrl: "${USER_SURVEY_URL}",
  userSurveyApiKey: "${USER_SURVEY_API_KEY}",
  speedTest: {
    ndtServer: "${NDT_SERVER}",
    ndtDownloadWorkerJs: "/workers/ndt7-download-worker.js",
    ndtUploadWorkerJs: "/workers/ndt7-upload-worker.js",
  },
  features: ${ACTIVE_FEATURES},
  videoBackgrounds: ${VIDEO_BACKGROUNDS:-${DEFAULT_VIDEO_BACKGROUNDS}},
  maxVideoBandwidth: ${MAX_VIDEO_BANDWIDTH:-600000},
  glitchtip: {
    dsn: "${SENTRY_DSN}",
  },
  settings: {
    waitingRoomDefaultValue: ${WAITING_ROOM_DEFAULT_VALUE:-false},
    suppressBrowserCompatibilityInfo: ${SUPPRESS_BROWSER_COMPATIBILITY_INFO:-false}
  }
}
EOF

if [[ "$CONTROLLER_HOST" =~ ^https?:// ]]; then
  BASE_URL="$CONTROLLER_HOST"
else
  CONTROLLER_SCHEMA="https"
  if [[ "$INSECURE" == "true" ]]; then
    CONTROLLER_SCHEMA="http"
  fi
  BASE_URL="$CONTROLLER_SCHEMA://$CONTROLLER_HOST"
fi

mkdir -p $HTML_ROOT/.well-known/opentalk
cat >$HTML_ROOT/.well-known/opentalk/client << EOF
{
  "opentalk_controller": {
    "base_url": "$BASE_URL"
  }
}
EOF
