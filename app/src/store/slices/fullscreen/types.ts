// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export type RequestFullscreenPayload = {
  element?: HTMLElement;
};

export type FullscreenState = {
  supported: boolean;
  active: boolean;
  error?: string;
} & RequestFullscreenPayload;
