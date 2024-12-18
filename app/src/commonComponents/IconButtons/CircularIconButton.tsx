// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Theme } from '@mui/material';

import IconButton from './IconButton';

export const CircularIconButtonStyles = (theme: Theme) => ({
  padding: theme.spacing(1),
  border: 'solid',
  borderWidth: theme.typography.pxToRem(1),
  borderColor: theme.palette.background.paper,
  borderRadius: '100%',
  width: '2rem',
  height: '2rem',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
});

const CircularIconButton = styled(IconButton)(({ theme }) => ({
  ...CircularIconButtonStyles(theme),
  '& .MuiSvgIcon-root': {
    fill: theme.palette.background.paper,
    width: '1.5em',
    height: '1.5em',
  },

  '&&:hover, &&:focus, &&[aria-expanded="true"]': {
    background: theme.palette.secondary.lightest,
    '& .MuiSvgIcon-root': {
      fill: theme.palette.text.primary,
    },
  },
}));

export default CircularIconButton;
