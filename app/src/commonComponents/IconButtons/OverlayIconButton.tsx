// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, styled } from '@mui/material';

const OverlayIconButton = styled(IconButton)(({ theme, 'aria-pressed': ariaPressed }) => ({
  padding: 0,
  // Reset the padding set by the theme, to have round overlay buttons even in `md`
  [theme.breakpoints.down('md')]: {
    padding: 0,
  },
  opacity: 0.8,
  backgroundColor: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.primary,
  color: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  '& .MuiSvgIcon-root': {
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
  variants: [
    {
      props: { size: 'small' },
      style: {
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
        '& .MuiSvgIcon-root': { fontSize: theme.typography.pxToRem(10) },
      },
    },
    {
      // If `size` prop is not set, treat it as `medium` by default
      props: ({ size }) => size === undefined || size === 'medium',
      style: {
        height: theme.spacing(3),
        width: theme.spacing(3),
        '& .MuiSvgIcon-root': { fontSize: theme.typography.pxToRem(13) },
      },
    },
    {
      props: { size: 'large' },
      style: {
        height: theme.spacing(4),
        width: theme.spacing(4),
        '& .MuiSvgIcon-root': { fontSize: theme.typography.pxToRem(16) },
      },
    },
  ],
}));

export default OverlayIconButton;
