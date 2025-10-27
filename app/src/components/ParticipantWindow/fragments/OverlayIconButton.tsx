// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, styled } from '@mui/material';

export const OverlayIconButton = styled(IconButton)(({ theme, 'aria-pressed': ariaPressed }) => ({
  height: theme.spacing(3),
  width: theme.spacing(3),
  padding: theme.spacing(1),
  opacity: 0.8,
  backgroundColor: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.primary,
  color: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(13),
    fill: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  },
  ':hover': {
    opacity: 1,
    backgroundColor: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.primary,
    color: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  },
  ':focus': {
    outline: theme.palette.focus.outline,
    outlineOffset: theme.palette.focus.outlineOffset,
  },
}));
