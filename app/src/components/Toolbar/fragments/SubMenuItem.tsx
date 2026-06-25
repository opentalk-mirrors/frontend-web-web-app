// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ClickAwayListener, ListItemIcon, ListItemText, MenuList, Paper, Popper, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';

import { ArrowRightIcon, DoneIcon } from '../../../assets/icons';
import { ToolbarMenuItem } from './ToolbarMenuUtils';

const SUBMENU_CLOSE_DELAY_MS = 150;

export interface SubmenuEntry {
  label: string;
  action: () => void;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: (children: React.ReactNode) => React.ReactNode;
}

interface SubmenuMenuItemProps {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  submenu: Array<SubmenuEntry>;
  container?: Element | null;
}

const SubmenuMenuItem = ({ label, icon, disabled, submenu, container }: SubmenuMenuItemProps) => {
  const [submenuAnchor, setSubmenuAnchor] = useState<HTMLElement | null>(null);
  const [openedByKeyboard, setOpenedByKeyboard] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubmenu = (viaKeyboard = false) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    if (itemRef.current) {
      setOpenedByKeyboard(viaKeyboard);
      setSubmenuAnchor(itemRef.current);
    }
  };

  const scheduleClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    closeTimeout.current = setTimeout(() => setSubmenuAnchor(null), SUBMENU_CLOSE_DELAY_MS);
  };

  const closeSubmenu = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setSubmenuAnchor(null);
  };

  return (
    <ToolbarMenuItem
      ref={itemRef}
      disabled={disabled}
      onMouseEnter={() => openSubmenu(false)}
      onMouseLeave={scheduleClose}
      onClick={() => openSubmenu(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          openSubmenu(true);
        }
      }}
      aria-haspopup="menu"
      aria-expanded={Boolean(submenuAnchor)}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { variant: 'inherit', noWrap: true } }} />
      <ArrowRightIcon fontSize="small" sx={{ ml: 1 }} />
      <Popper
        open={Boolean(submenuAnchor)}
        anchorEl={submenuAnchor}
        placement="right-start"
        container={container}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            // Ignore clicks on the trigger itself
            if (itemRef.current?.contains(event.target as Node)) {
              return;
            }
            closeSubmenu();
          }}
        >
          <Paper
            onMouseEnter={() => openSubmenu(false)}
            onMouseLeave={scheduleClose}
            // Prevent keyboard events in the submenu from bubbling up the
            // React tree to the parent MoreMenu's MenuList, which would
            // otherwise intercept Arrow/Home/End/Tab and steal focus
            onKeyDown={(event) => event.stopPropagation()}
          >
            <MenuList aria-label={label} autoFocusItem={openedByKeyboard}>
              {submenu.map((option) => {
                const isSelected = option.selected ?? false;

                const menuItem = (
                  <ToolbarMenuItem
                    key={option.label}
                    disabled={option.disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      closeSubmenu();

                      if (!isSelected) {
                        option.action();
                      }
                    }}
                    selected={isSelected}
                  >
                    <ListItemIcon>{isSelected ? <DoneIcon /> : <span style={{ width: '1.15em' }} />}</ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      {option.label}
                    </Typography>
                  </ToolbarMenuItem>
                );

                return option.tooltip ? (
                  <React.Fragment key={option.label}>{option.tooltip(menuItem)}</React.Fragment>
                ) : (
                  menuItem
                );
              })}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </ToolbarMenuItem>
  );
};

export default SubmenuMenuItem;
