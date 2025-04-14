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

declare module '@mui/material/styles' {
  interface Theme {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
    };
  }

  interface ThemeOptions {
    borderRadius: {
      small: number | string;
      medium: number | string;
      large: number | string;
    };
  }
}

type TypeOutline = string;

type AvatarPalette = {
  background: string;
  colorTable: Array<string>;
};

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    overlay?: string;
    defaultGradient?: string;
    video?: string;
    secondaryOverlay?: string;
  }

  interface Palette {
    outline: TypeOutline;
    avatar: AvatarPalette;
  }

  interface PaletteOptions {
    outline?: string;
    avatar?: AvatarPalette;
  }

  interface PaletteColor {
    lighter?: string;
    lightest?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    lightest?: string;
  }
}
