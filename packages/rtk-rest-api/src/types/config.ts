// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export type ColorKey =
  | 'primary'
  | 'secondary'
  | 'background'
  | 'error'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'textPrimary'
  | 'textSecondary'
  | 'textError';

export type BasePalette = Record<ColorKey, string>;

export type Mode = 'light' | 'dark';

export type ThemeBasePalette = Record<Mode, BasePalette>;
