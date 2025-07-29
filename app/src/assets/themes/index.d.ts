// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import '@mui/material';
import '@mui/material/ButtonBase';
import '@mui/material/InputBase';
import { SvgIconProps as OriginalSvgProps } from '@mui/material/SvgIcon';
import '@mui/material/styles/createTheme';
import type {} from '@mui/x-date-pickers/PickersTextField';

declare module '@mui/material/InputBase' {
  interface InputBaseProps {
    checked?: boolean;
  }
}

declare module '@mui/x-date-pickers/PickersTextField' {
  interface PickerTextFieldProps {
    checked?: boolean;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }

  interface ButtonPropsVariantOverrides {
    'conference-inactive': true;
  }
}
declare module '@mui/material/Box' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
      circle: string;
      card: number | string;
    };
  }

  interface ThemeOptions {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
      circle: string;
      card: number | string;
    };
  }
}

type TypeOutline = string;

type AvatarPalette = {
  background: string;
  colorTable: Array<string>;
};

type NotificationVariant = {
  backgroundColor: string;
  color: string;
  hovered?: string;
};

type NotistackPalette = {
  error: NotificationVariant;
  warning: NotificationVariant;
  info: NotificationVariant;
  success: NotificationVariant;
  primary: NotificationVariant;
  secondary: NotificationVariant;
};

type FocusOutlinePalette = {
  color: string;
  outline: string;
  outlineOffset: string;
  contrastColor: string;
  contrastOutline: string;
};

declare module '@mui/material' {
  type AccessibleSvgType = 'functional' | 'decorative' | undefined;
  interface BaseSvgIconProps extends OriginalSvgProps {
    disabled?: boolean;
    width?: ResponsiveStyleValue<string | number>;
    height?: ResponsiveStyleValue<string | number>;
    type?: AccessibleSvgType;
  }
  interface FunctionalSvgIconProps extends BaseSvgIconProps {
    type?: 'functional';
    title: string;
    titleId: string;
  }
  interface DecorativeSvgIconProps extends BaseSvgIconProps {
    type?: 'decorative' | undefined;
  }

  type SvgIconProps = FunctionalSvgIconProps | DecorativeSvgIconProps;
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    overlay?: string;
    defaultGradient?: string;
    video?: string;
    secondaryOverlay?: string;
    voteResult?: string;
    light?: string;
  }

  interface Palette {
    outline: TypeOutline;
    avatar: AvatarPalette;
    notistack: NotistackPalette;
    focus: FocusOutlinePalette;
  }

  interface PaletteOptions {
    outline?: string;
    avatar?: AvatarPalette;
    notistack?: NotistackPalette;
    focus: FocusOutlinePalette;
  }

  interface PaletteColor {
    lighter?: string;
    lightest?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    lightest?: string;
  }

  interface ZIndex {
    jumpLink: number;
  }

  interface TypeText {
    placeholder: string;
  }
}
