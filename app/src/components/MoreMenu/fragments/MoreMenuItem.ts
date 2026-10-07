// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, styled } from '@mui/material';

const MoreMenuItem = styled(MenuItem)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.875rem',
  color: theme.palette.text.primary,

  '& .MuiSvgIcon-root': {
    fontSize: '1.15em',
    color: 'currentColor',
  },
}));

export default MoreMenuItem;
