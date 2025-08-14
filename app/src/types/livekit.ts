// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export interface BackgroundConfig {
  style: 'blur' | 'color' | 'image' | 'off';
  color?: string;
  imageUrl?: string;
}
export interface BackgroundEffect extends BackgroundConfig {
  loading?: boolean;
}
