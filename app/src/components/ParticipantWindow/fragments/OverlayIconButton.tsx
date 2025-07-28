// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, styled } from '@mui/material';

export const OverlayIconButton = styled(IconButton)(({ theme }) => ({
  '&.MuiIconButton-colorPrimary, &.MuiIconButton-colorSecondary': {
    height: theme.spacing(3),
    width: theme.spacing(3),
    padding: theme.spacing(1),
    opacity: 0.8,
    backgroundColor: theme.palette.background.highlight.primary,
    '& .MuiSvgIcon-root': {
      fontSize: theme.typography.pxToRem(13),
      fill: theme.palette.background.highlight.contrastText,
    },
    ':hover': {
      opacity: 1,
    },
  },

  '&.MuiIconButton-colorPrimary': {
    ':hover': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiSvgIcon-root': {
        fill: theme.palette.primary.contrastText,
      },
    },
    ':focus': {
      outline: theme.palette.focus.outline,
      outlineOffset: theme.palette.focus.outlineOffset,
    },
  },

  '&.MuiIconButton-colorSecondary': {
    backgroundColor: theme.palette.secondary.main,
    '& .MuiSvgIcon-root': {
      fill: theme.palette.secondary.contrastText,
    },
    ':hover': {
      backgroundColor: theme.palette.secondary.main,
      '& .MuiSvgIcon-root': {
        fill: theme.palette.secondary.contrastText,
      },
    },
    ':focus': {
      outline: theme.palette.focus.outline,
      outlineOffset: theme.palette.focus.outlineOffset,
    },
  },
}));
