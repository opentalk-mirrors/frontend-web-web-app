// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions } from '@livekit/components-react';
import { useTranslation } from 'react-i18next';

import { ShareScreenOffIcon, ShareScreenOnIcon } from '../../../assets/icons';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../../constants';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import browser from '../../../modules/BrowserSupport';
import { setScreenShareEnabled } from '../../../store/commonActions';
import {
  selectLivekitUnavailable,
  selectScreenshareChangeInProgress,
  selectScreenShareEnabled,
  selectScreensharePermissionDenied,
} from '../../../store/slices/livekitSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import ToolbarButton from './ToolbarButton';

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
    dispatch(setScreenShareEnabled({ enabled: !isScreenshareEnabled }));
  };

  if (!isScreenShareSupported) {
    return null;
  }

  return (
    <ToolbarButton
      tooltipTitle={getToolTipTitle()}
      onClick={onClick}
      active={isScreenshareEnabled && isModeratorOrPresenter}
      disabled={isScreenshareChangeInProgress || !isModeratorOrPresenter || isLivekitUnavailable || isRoomDeleted}
      data-testid="toolbarShareScreenButton"
      id={ToolbarButtonIds.ShareScreen}
    >
      {isScreenshareEnabled ? <ShareScreenOnIcon /> : <ShareScreenOffIcon />}
    </ToolbarButton>
  );
};

export default ShareScreenButton;
