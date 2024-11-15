// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import '@mui/material/ButtonBase';
import '@mui/material/InputBase';
import '@mui/material/styles/createTheme';

declare module '@mui/material/InputBase' {
  interface InputBaseProps {
    checked?: boolean;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }
}
declare module '@mui/material/Box' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/system' {
  interface Theme {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
      circle: string;
    };
  }

  interface ThemeOptions {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
      circle: string;
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

declare module '@mui/material/styles' {
  interface SvgIconProps {
    disabled?: boolean;
    width?: ResponsiveStyleValue<string | number>;
    height?: ResponsiveStyleValue<string | number>;
  }

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
  }

  interface PaletteOptions {
    outline?: string;
    avatar?: AvatarPalette;
    notistack?: NotistackPalette;
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
