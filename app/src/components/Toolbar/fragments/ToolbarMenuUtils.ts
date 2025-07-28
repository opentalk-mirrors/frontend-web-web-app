// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Popover, styled } from '@mui/material';

export interface ToolbarMenuProps {
  anchorEl: HTMLDivElement | null;
  onClose: () => void;
  open: boolean;
}

const ToolbarMenu = styled(Popover)(({ theme }) => ({
  maxWidth: '27rem',

  '& .MuiPaper-root': {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
}));

const ToolbarMenuItem = styled(MenuItem)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.875rem',
  color: theme.palette.text.primary,

  '& .MuiSvgIcon-root': {
    fontSize: '1.15em',
    color: 'currentColor',
  },
}));

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

export { ToolbarMenuItem, ToolbarMenu, MenuTitle, MenuSectionTitle };
