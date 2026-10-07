// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { disableRaiseHands, enableRaiseHands } from '../../../api/types/outgoing/raiseHands';
import { RaiseHandOffIcon, RaiseHandOnIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectRaiseHandsEnabled } from '../../../store/slices/moderationSlice';
import MoreMenuItem from './MoreMenuItem';

interface ToggleHandraisesMenuItemProps {
  onClose: () => void;
}

const ToggleHandraisesMenuItem = ({ onClose }: ToggleHandraisesMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hasHandraisesEnabled = useAppSelector(selectRaiseHandsEnabled);

  if (hasHandraisesEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          onClose();
          dispatch(disableRaiseHands.action());
        }}
      >
        <ListItemIcon>
          <RaiseHandOffIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-turn-handraises-off')}
        </Typography>
      </MoreMenuItem>
    );
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(enableRaiseHands.action());
      }}
    >
      <ListItemIcon>
        <RaiseHandOnIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-turn-handraises-on')}
      </Typography>
    </MoreMenuItem>
  );
};

export default ToggleHandraisesMenuItem;
