// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, styled } from '@mui/material';

export const MeetingHeaderButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'active' })<{
  active?: boolean;
}>(({ theme, active }) => ({
  background: active ? theme.palette.secondary.main : theme.palette.background.customPaper.primary,
  borderRadius: '0.25rem',
  '& .MuiSvgIcon-root': {
    fill: active ? theme.palette.secondary.contrastText : theme.palette.background.customPaper.contrastText,
  },
  '&:hover .MuiSvgIcon-root': {
    fill: theme.palette.background.customPaper.contrastText,
  },
}));
