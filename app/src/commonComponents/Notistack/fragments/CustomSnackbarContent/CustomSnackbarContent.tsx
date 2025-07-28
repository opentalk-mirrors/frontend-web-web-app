// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { SnackbarContent } from 'notistack';

export const CustomSnackbarContent = styled(SnackbarContent, {
  shouldForwardProp: (prop) => {
    return prop !== 'type';
  },
})<{ type?: 'success' | 'warning' }>(({ theme, type = 'success' }) => ({
  backgroundColor: theme.palette[type].main,
  color: theme.palette[type].contrastText,
  padding: theme.spacing(1.75, 3, 1.75, 2.25),
  borderRadius: theme.spacing(1),
}));
