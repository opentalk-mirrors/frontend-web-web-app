// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';

const MenuTitle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),

  '& .MuiSvgIcon-root': {
    fontSize: '1em',
  },
}));

const MenuSectionTitle = styled(MenuTitle)(({ theme }) => ({
  padding: theme.spacing(0, 1.5, 1),
}));

export { MenuTitle, MenuSectionTitle };
