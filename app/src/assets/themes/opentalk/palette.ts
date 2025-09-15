// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { type PaletteOptions } from '@mui/material';
import { ThemeBasePalette, BasePalette } from '@opentalk/rest-api-rtk-query';

import { getContrastText, otDarken, otLighten } from './colorUtils';

const LIGHTNESS_STEP = 0.09;

export const defaultLightModeColors: BasePalette = {
  primary: '#20434F',
  secondary: '#D1E545',
  background: '#f1f3f4',
  error: '#ff7f74',
  danger: '#ff6e65',
  success: '#66d669',
  warning: '#fe9b34',
  info: '#66b5ff',
  textPrimary: '#20434F',
  textSecondary: '#D1E545',
  textError: '#a42424',
};

export const defaultDarkModeColors: BasePalette = {
  primary: '#dfe2e2',
  secondary: '#D1E545',
  background: '#20434F',
  error: '#db3836',
  danger: '#a42424',
  success: '#36943b',
  warning: '#b56701',
  info: '#0080dc',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1E545',
  textError: '#ff7f74',
};

// FIXME: These colors should be replaced by BasePalette items
export const avatarBg = '#00212E';

export const avatarColorTable: Array<string> = [
  '#03BEF7',
  '#18BA80',
  '#FE8845',
  '#D05EFA',
  '#FD7171',
  '#F7BF03',
  '#FFFFFF',
  '#D4E862',
  '#77D854',
  '#E0386A',
  '#FFCCCC',
  '#2DEBD5',
  '#B817C1',
  '#FFF969',
  '#468EFF',
  '#765FFF',
];

export function getColorSchemes(
  basePalette: ThemeBasePalette = { light: defaultLightModeColors, dark: defaultDarkModeColors }
) {
  const lightComputedPalette: PaletteOptions = {
    primary: {
      main: basePalette.light.primary,
      dark: otDarken(basePalette.light.primary, LIGHTNESS_STEP),
      light: otLighten(basePalette.light.primary, LIGHTNESS_STEP),
    },
    secondary: {
      main: basePalette.light.secondary,
      dark: otDarken(basePalette.light.secondary, LIGHTNESS_STEP),
      light: otLighten(basePalette.light.secondary, LIGHTNESS_STEP),
    },
    text: {
      primary: basePalette.light.textPrimary,
      secondary: basePalette.light.textSecondary,
      disabled: otLighten(basePalette.light.textPrimary, LIGHTNESS_STEP),
      error: basePalette.light.textError,
    },
    success: {
      main: basePalette.light.success,
    },
    info: {
      main: basePalette.light.info,
    },
    warning: {
      main: basePalette.light.warning,
    },
    error: {
      main: basePalette.light.error,
    },
    danger: {
      main: basePalette.light.danger,
      light: otDarken(basePalette.light.danger, LIGHTNESS_STEP),
      dark: otLighten(basePalette.light.danger, LIGHTNESS_STEP),
      contrastText: getContrastText(basePalette.light.textPrimary, basePalette.light.danger),
    },
    avatar: {
      background: avatarBg,
      colorTable: avatarColorTable,
    },
    background: {
      main: {
        primary: basePalette.light.background,
        contrastText: getContrastText(basePalette.light.textPrimary, basePalette.light.background),
      },
      highlight: {
        primary: otDarken(basePalette.light.background, LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.light.textPrimary,
          otDarken(basePalette.light.background, LIGHTNESS_STEP)
        ),
      },
      highlightContrast: {
        primary: otDarken(basePalette.light.background, 2 * LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.light.textPrimary,
          otLighten(basePalette.light.background, 2 * LIGHTNESS_STEP)
        ),
      },
      customPaper: {
        primary: otLighten(basePalette.light.background, LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.light.textPrimary,
          otLighten(basePalette.light.background, LIGHTNESS_STEP)
        ),
      },
    },
    focus: {
      color: basePalette.light.primary,
      outline: `2px solid ${basePalette.light.primary}`,
      outlineOffset: '2px',
      contrastColor: basePalette.light.primary,
      contrastOutline: `2px solid ${basePalette.light.primary}`,
    },
  };

  const darkComputedPalette: PaletteOptions = {
    primary: {
      main: basePalette.dark.primary,
      dark: otDarken(basePalette.dark.primary, LIGHTNESS_STEP),
      light: otLighten(basePalette.dark.primary, LIGHTNESS_STEP),
    },
    secondary: {
      main: basePalette.dark.secondary,
      dark: otDarken(basePalette.dark.secondary, LIGHTNESS_STEP),
      light: otLighten(basePalette.dark.secondary, LIGHTNESS_STEP),
    },
    text: {
      primary: basePalette.dark.textPrimary,
      secondary: basePalette.dark.textSecondary,
      disabled: otDarken(basePalette.dark.textPrimary, LIGHTNESS_STEP),
      error: basePalette.dark.textError,
    },
    success: {
      main: basePalette.dark.success,
    },
    info: {
      main: basePalette.dark.info,
    },
    warning: {
      main: basePalette.dark.warning,
    },
    error: {
      main: basePalette.dark.error,
    },
    danger: {
      main: basePalette.dark.danger,
      light: otLighten(basePalette.dark.danger, LIGHTNESS_STEP),
      dark: otDarken(basePalette.dark.danger, LIGHTNESS_STEP),
      contrastText: getContrastText(basePalette.dark.textPrimary, basePalette.dark.danger),
    },
    avatar: {
      background: avatarBg,
      colorTable: avatarColorTable,
    },
    background: {
      main: {
        primary: basePalette.dark.background,
        contrastText: getContrastText(basePalette.dark.textPrimary, basePalette.dark.background),
      },
      highlight: {
        primary: otLighten(basePalette.dark.background, LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.dark.textPrimary,
          otLighten(basePalette.dark.background, LIGHTNESS_STEP)
        ),
      },
      highlightContrast: {
        primary: otLighten(basePalette.dark.background, 2 * LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.dark.textPrimary,
          otLighten(basePalette.dark.background, 2 * LIGHTNESS_STEP)
        ),
      },
      customPaper: {
        primary: otDarken(basePalette.dark.background, LIGHTNESS_STEP),
        contrastText: getContrastText(
          basePalette.dark.textPrimary,
          otDarken(basePalette.dark.background, LIGHTNESS_STEP)
        ),
      },
    },
    focus: {
      color: basePalette.dark.secondary,
      outline: `2px solid ${basePalette.dark.secondary}`,
      outlineOffset: '2px',
      contrastColor: basePalette.dark.secondary,
      contrastOutline: `2px solid ${basePalette.dark.secondary}`,
    },
  };

  return {
    dark: {
      palette: darkComputedPalette,
    },
    light: {
      palette: lightComputedPalette,
    },
  };
}
