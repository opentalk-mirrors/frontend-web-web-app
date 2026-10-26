// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem as MuiMenuItem, Menu, PopoverActions, styled, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface ParticipantMenuOption {
  disabled?: boolean;
  i18nKey: string;
  action: () => void;
}

interface ParticipantMenuProps<T> {
  id: string;
  open: boolean;
  setAnchorEl: Dispatch<SetStateAction<T | undefined>>;
  anchorEl: (T & Element) | undefined;
  onClose?: () => void;
  options: ParticipantMenuOption[];
}

const MenuItem = styled(MuiMenuItem)({
  justifyContent: 'space-between',
  '& .MuiTypography-root': {
    fontWeight: 400,
  },
});

function ParticipantMenu<T>({ setAnchorEl, anchorEl, open, onClose, options, id }: ParticipantMenuProps<T>) {
  const { t } = useTranslation();
  const menuActions = useRef<PopoverActions>(null);

  // MUI debounces its own resize handling, which leaves the menu behind while the panel reflows
  useEffect(() => {
    if (!open) {
      return;
    }

    const reposition = () => menuActions.current?.updatePosition();

    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [open]);

  const handleClose = () => {
    setAnchorEl(undefined);
    onClose && onClose();
  };

  const renderMenuOptionItems = () =>
    options.map((option) => (
      <MenuItem disabled={option.disabled} key={option.i18nKey} onClick={option.action}>
        <Typography>{t(option.i18nKey)}</Typography>
      </MenuItem>
    ));

  return (
    <Menu
      id={id}
      action={menuActions}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        list: {
          'aria-label': t('participant-menu-label'),
        },
      }}
    >
      {renderMenuOptionItems()}
    </Menu>
  );
}

export default ParticipantMenu;
