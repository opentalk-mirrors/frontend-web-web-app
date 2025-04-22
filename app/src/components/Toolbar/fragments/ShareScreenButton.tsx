// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions, useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ShareScreenOffIcon, ShareScreenOnIcon } from '../../../assets/icons';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../../constants';
import { ToolbarButtonIds } from '../../../constants';
import { useAppSelector } from '../../../hooks';
import log from '../../../logger';
import browser from '../../../modules/BrowserSupport';
import { selectLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import ToolbarButton from './ToolbarButton';

const ShareScreenButton = () => {
  const { toggle, enabled, pending } = useTrackToggle({
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, systemAudio: 'include' },
  });
  const localParticipantPermissions = useLocalParticipantPermissions();
  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isScreenShareSupported = browser.isScreenShareSupported();
  const isScreenShareEnabled = enabled && !isLivekitUnavailable;

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
    if (isScreenShareEnabled) {
      return t('toolbar-button-screen-share-turn-off-tooltip-title');
    }
    return t('toolbar-button-screen-share-turn-on-tooltip-title');
  };

  const onClick = () => {
    toggle().catch((error: Error) => {
      setPermissionDenied(true);
      if (error.name !== 'NotAllowedError') {
        log.error('Error while screen sharing: ', error);
      }
    });
  };

  if (!isScreenShareSupported) {
    return null;
  }

  return (
    <ToolbarButton
      tooltipTitle={getToolTipTitle()}
      onClick={onClick}
      active={isScreenShareEnabled && isModeratorOrPresenter}
      disabled={pending || !isModeratorOrPresenter || isLivekitUnavailable || isRoomDeleted}
      data-testid="toolbarShareScreenButton"
      id={ToolbarButtonIds.ShareScreen}
    >
      {isScreenShareEnabled ? <ShareScreenOnIcon /> : <ShareScreenOffIcon />}
    </ToolbarButton>
  );
};

export default ShareScreenButton;
