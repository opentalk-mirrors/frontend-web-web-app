// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions, useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ShareScreenOffIcon, ShareScreenOnIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectIsModerator } from '../../../store/slices/userSlice';
import { ToolbarButtonIds } from '../Toolbar';
import ToolbarButton from './ToolbarButton';

export const LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER = 3;

const ShareScreenButton = () => {
  const { toggle, enabled, pending } = useTrackToggle({ source: Track.Source.ScreenShare });
  const localParticipantPermissions = useLocalParticipantPermissions();
  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
    if (enabled) {
      return t('toolbar-button-screen-share-turn-off-tooltip-title');
    }
    return t('toolbar-button-screen-share-turn-on-tooltip-title');
  };

  const onClick = () => {
    toggle().catch((error: Error) => {
      setPermissionDenied(true);
      if (error.name !== 'NotAllowedError') {
        console.error('Error while screen sharing: ', error);
      }
    });
  };

  return (
    <ToolbarButton
      tooltipTitle={getToolTipTitle()}
      onClick={onClick}
      active={enabled && isModeratorOrPresenter}
      disabled={pending || !isModeratorOrPresenter}
      data-testid="toolbarBlurScreenButton"
      id={ToolbarButtonIds.ShareScreen}
    >
      {enabled ? <ShareScreenOnIcon /> : <ShareScreenOffIcon />}
    </ToolbarButton>
  );
};

export default ShareScreenButton;
