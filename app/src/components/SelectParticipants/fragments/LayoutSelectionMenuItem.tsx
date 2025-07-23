// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem as MuiMenuItem, ListItemIcon, styled } from '@mui/material';
import type { MenuItemProps } from '@mui/material';
import { forwardRef } from 'react';

import { CheckIcon } from '../../../assets/icons';

type LayoutSelectionMenuItemProps = MenuItemProps & {
  showCheckIcon?: boolean;
  content: string;
  icon?: React.JSX.Element;
  hasIndicator?: boolean;
};

const MenuItem = styled(MuiMenuItem, { shouldForwardProp: (prop) => prop !== 'hasIndicator' })<{
  hasIndicator?: boolean;
}>(({ theme, hasIndicator }) => ({
  padding: theme.spacing(1),
  '& .MuiListItemIcon-root .MuiSvgIcon-root': {
    position: 'relative',
    fontSize: theme.typography.pxToRem(16),
    [theme.breakpoints.down('md')]: { fontSize: theme.typography.pxToRem(20) },
  },
  '&:after': {
    content: '""',
    display: hasIndicator ? 'block' : 'none',
    width: '0.5rem',
    height: '0.5rem',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    marginLeft: '0.5rem',
  },
}));

const LayoutSelectionMenuItem = forwardRef<HTMLLIElement, LayoutSelectionMenuItemProps>(
  ({ showCheckIcon = false, hasIndicator = false, onClick, icon, content, ...props }, ref) => (
    <MenuItem
      ref={ref}
      onClick={onClick}
      hasIndicator={hasIndicator}
      role="menuitemradio"
      aria-checked={showCheckIcon}
      {...props}
    >
      <ListItemIcon>{showCheckIcon && <CheckIcon data-testid="CheckIcon" />}</ListItemIcon>
      <ListItemIcon aria-hidden={true}>{icon}</ListItemIcon>
      {content}
    </MenuItem>
  )
);

LayoutSelectionMenuItem.displayName = 'LayoutSelectionMenuItem';

export default LayoutSelectionMenuItem;
