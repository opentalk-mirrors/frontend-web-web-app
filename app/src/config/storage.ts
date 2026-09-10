// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export enum sessionStorageItems {
  redirectUri = 'redirect-uri',
}

export enum localStorageItems {
  browserConfirmed = 'browser-confirmed',
  safariNotificationKey = 'safari-warning-notification',
  devMode = 'devMode',
  meetingsFilter = 'dashboard-meetings-filter',
  conferenceUiVersion = 'conference-ui-version', // V2-CLEANUP
}
