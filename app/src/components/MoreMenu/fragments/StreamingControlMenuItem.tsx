// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { sendStartStreamSignal, sendStopStreamSignal } from '../../../api/types/outgoing/streaming';
import { LiveIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import { selectActiveStreamIds, selectInactiveStreamIds } from '../../../store/slices/streamingSlice';
import HighSecurityTooltip from './HighSecurityTooltip';
import MoreMenuItem from './MoreMenuItem';

interface StreamingControlMenuItemProps {
  onClose: () => void;
}

const StreamingControlMenuItem = ({ onClose }: StreamingControlMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeStreamIds = useAppSelector(selectActiveStreamIds);
  const inactiveStreamIds = useAppSelector(selectInactiveStreamIds);
  const highSecurityEnabled = useAppSelector(selectE2EEncryption);

  if (activeStreamIds.length > 0) {
    return (
      <MoreMenuItem
        onClick={() => {
          dispatch(sendStopStreamSignal.action({ targetIds: activeStreamIds }));
          onClose();
        }}
      >
        <ListItemIcon>
          <LiveIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-stop-streaming')}
        </Typography>
      </MoreMenuItem>
    );
  }

  if (inactiveStreamIds.length > 0) {
    const menuItem = (
      <MoreMenuItem
        disabled={highSecurityEnabled}
        onClick={() => {
          dispatch(sendStartStreamSignal.action({ targetIds: inactiveStreamIds }));
          onClose();
        }}
      >
        <ListItemIcon>
          <LiveIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-start-streaming')}
        </Typography>
      </MoreMenuItem>
    );
    if (highSecurityEnabled) {
      return <HighSecurityTooltip>{menuItem}</HighSecurityTooltip>;
    }
    return menuItem;
  }

  return null;
};

export default StreamingControlMenuItem;
