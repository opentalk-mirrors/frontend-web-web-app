// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Theme } from '@mui/material';

import IconButton from './IconButton';

export const CircularIconButtonStyles = (theme: Theme) => ({
  padding: theme.spacing(1.5),
  border: 'solid',
  borderWidth: theme.typography.pxToRem(1),
  borderColor: 'currentColor',
  borderRadius: '100%',
  width: '2.5rem',
  height: '2.5rem',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
});

const CircularIconButton = styled(IconButton)(({ theme }) => ({
  ...CircularIconButtonStyles(theme),

  '& .MuiSvgIcon-root': {
    width: '1.5em',
    height: '1.5em',
  },

  '&&:hover, &&:focus, &&[aria-expanded="true"]': {
    background: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

export default CircularIconButton;
