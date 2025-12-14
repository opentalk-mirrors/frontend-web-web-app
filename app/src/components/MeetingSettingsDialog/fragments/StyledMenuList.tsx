// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, MenuList } from '@mui/material';

const StyledMenuList = styled(MenuList)(({ theme }) => ({
  paddingRight: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    color: 'currentColor',
    fontSize: '1.15em',
  },
  '& .MuiListSubheader-root': {
    color: 'currentColor',
    backgroundColor: 'inherit',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 1.5, 1),
    fontSize: '1rem',
    font: 'inherit',
  },
}));

export default StyledMenuList;
