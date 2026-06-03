// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions } from '@livekit/components-react';
import { ListItemIcon, MenuList, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ShareScreenOffIcon, ShareScreenOnIcon } from '../../../assets/icons';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../../constants';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useHotkeyCombination } from '../../../hooks/useHotkeyCombination';
import browser from '../../../modules/BrowserSupport';
import { setScreenShareEnabled, switchScreenShare } from '../../../store/commonActions';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
import {
  selectLivekitUnavailable,
  selectScreenshareChangeInProgress,
  selectScreenShareEnabled,
  selectScreensharePermissionDenied,
} from '../../../store/slices/livekitSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import ToolbarButton from './ToolbarButton';
import { ToolbarMenu, ToolbarMenuItem } from './ToolbarMenuUtils';

const ShareScreenButton = () => {
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const isScreenshareEnabled = useAppSelector(selectScreenShareEnabled) && !isLivekitUnavailable;
  const localParticipantPermissions = useLocalParticipantPermissions();
  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const isScreenshareChangeInProgress = useAppSelector(selectScreenshareChangeInProgress);
  const permissionDenied = useAppSelector(selectScreensharePermissionDenied);
  const isScreenShareSupported = browser.isScreenShareSupported();
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fullScreenElement = useAppSelector(selectFullscreenElement);
  const [showMenu, setShowMenu] = useState(false);
  const keyCombination = useHotkeyCombination('hotkey-screen-share-toggle');

  const handleMenuRef = useCallback((node: HTMLDivElement | null) => {
    setAnchorEl(node);
  }, []);

  const canPublishScreenShare =
    localParticipantPermissions?.canPublishSources?.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER) || false;
  const isModeratorOrPresenter = isModerator || canPublishScreenShare;

  const getToolTipTitle = () => {
    if (!isModeratorOrPresenter) {
      return t('toolbar-button-screen-share-tooltip-request-moderator-presenter-role');
    }
    if (permissionDenied) {
      return t('device-permission-denied');
    }
    if (isScreenshareEnabled) {
      return t('toolbar-button-screen-share-turn-off-tooltip-title');
    }
    return t('toolbar-button-screen-share-turn-on-tooltip-title');
  };

  const onClick = () => {
    if (isScreenshareEnabled) {
      setShowMenu(!showMenu);
      return;
    }
    dispatch(setScreenShareEnabled({ enabled: !isScreenshareEnabled }));
  };

  if (!isScreenShareSupported) {
    return null;
  }

  const menuOptions = [
    {
      label: 'toolbar-button-screen-share-different-screen-title',
      icon: <ShareScreenOnIcon />,
      action: () => {
        dispatch(switchScreenShare());
        setShowMenu(false);
      },
    },
    {
      label: 'toolbar-button-screen-share-turn-off-tooltip-title',
      icon: <ShareScreenOffIcon />,
      action: () => {
        dispatch(setScreenShareEnabled({ enabled: false }));
        setShowMenu(false);
      },
    },
  ];

  return (
    <div ref={handleMenuRef}>
      <ToolbarButton
        tooltipTitle={getToolTipTitle() + (isModeratorOrPresenter ? ` (${keyCombination})` : '')}
        onClick={onClick}
        active={isScreenshareEnabled && isModeratorOrPresenter}
        disabled={isScreenshareChangeInProgress || !isModeratorOrPresenter || isLivekitUnavailable || isRoomDeleted}
        data-testid="toolbarShareScreenButton"
        id={ToolbarButtonIds.ShareScreen}
      >
        <ShareScreenOnIcon />
      </ToolbarButton>
      <ToolbarMenu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: -4,
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={showMenu && isScreenshareEnabled}
        onClose={() => setShowMenu(false)}
        data-testid="moreMenu"
        container={fullScreenElement}
        slotProps={{
          paper: {
            'aria-label': t('toolbar-button-more-tooltip-title'),
          },
        }}
        aria-label={t('toolbar-button-more-tooltip-title')}
      >
        <MenuList autoFocusItem={Boolean(anchorEl)} aria-label={t('toolbar-button-more-tooltip-title')}>
          {menuOptions.map(({ label, action, icon }) => (
            <ToolbarMenuItem key={label} onClick={action}>
              <ListItemIcon>{icon}</ListItemIcon>
              <Typography variant="inherit" noWrap>
                {t(label)}
              </Typography>
            </ToolbarMenuItem>
          ))}
        </MenuList>
      </ToolbarMenu>
    </div>
  );
};

export default ShareScreenButton;
