// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

// V2-CLEANUP: entire file is part of the v1/v2 transition - delete when v2 is the default
export const ConferenceUiVersion = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type ConferenceUiVersion = (typeof ConferenceUiVersion)[keyof typeof ConferenceUiVersion];

export const isConferenceUiVersion = (value: unknown): value is ConferenceUiVersion =>
  value === ConferenceUiVersion.V1 || value === ConferenceUiVersion.V2;
