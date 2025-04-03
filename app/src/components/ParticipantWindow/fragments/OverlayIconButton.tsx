// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, styled } from '@mui/material';

export const OverlayIconButton = styled(IconButton)(({ theme }) => ({
  '&.MuiIconButton-colorPrimary, &.MuiIconButton-colorSecondary': {
    height: theme.spacing(2.5),
    width: theme.spacing(3),
    padding: theme.spacing(1),
    opacity: 0.8,
    color: theme.palette.primary.contrastText,
    '& .MuiSvgIcon-root': {
      fontSize: theme.typography.pxToRem(13),
    },
    ':hover': {
      opacity: 1,
    },
  },

  '&.MuiIconButton-colorPrimary': {
    svg: {
      fill: theme.palette.secondary.contrastText,
    },
    ':hover': {
      backgroundColor: theme.palette.primary.main,
    },
    ':focus': {
      outline: theme.palette.focus?.outline,
      outlineOffset: theme.palette.focus?.outlineOffset,
    },
  },

  '&.MuiIconButton-colorSecondary': {
    ':hover': {
      color: theme.palette.secondary.contrastText,
      backgroundColor: theme.palette.secondary.light,
    },
    ':focus': {
      outline: theme.palette.focus?.outline,
      outlineOffset: theme.palette.focus?.outlineOffset,
    },
  },
}));
