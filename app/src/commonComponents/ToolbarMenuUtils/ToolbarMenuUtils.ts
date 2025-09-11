// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Typography, Menu, styled } from '@mui/material';

export interface ToolbarMenuProps {
  anchorEl: HTMLDivElement | null;
  onClose: () => void;
  open: boolean;
}

const ToolbarMenu = styled(Menu)(({ theme }) => ({
  maxWidth: '27rem',

  '& .MuiPaper-root': {
    paddingBottom: theme.spacing(2),
  },
}));

const ToolbarMenuItem = styled(MenuItem)(() => ({
  minWidth: '25rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.875rem',

  '& .MuiSvgIcon-root': {
    fontSize: '1.15em',
  },
}));

const MenuTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),

  '& .MuiSvgIcon-root': {
    fontSize: '1em',
  },
}));

export { ToolbarMenuItem, ToolbarMenu, MenuTitle };
