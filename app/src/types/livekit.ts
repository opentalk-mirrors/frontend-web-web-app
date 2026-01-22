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

export enum VideoCodec {
  VP8 = 'vp8',
  VP9 = 'vp9',
  AV1 = 'av1',
}
