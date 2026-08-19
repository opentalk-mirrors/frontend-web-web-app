// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions } from '@livekit/components-react';
import { TrackSource } from '@livekit/protocol';
import { useTranslation } from 'react-i18next';

import { ShareScreenOnIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useHotkeyCombination } from '../../../hooks/useHotkeyCombination';
import browser from '../../../modules/BrowserSupport';
import { setScreenShareEnabled, switchScreenShare } from '../../../store/commonActions';
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
  const keyCombination = useHotkeyCombination('hotkey-screen-share-toggle');

  const canPublishScreenShare =
    localParticipantPermissions?.canPublishSources?.includes(TrackSource.SCREEN_SHARE) || false;
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

  const isActive = isScreenshareEnabled && isModeratorOrPresenter;
  return (
    <ToolbarButton
      tooltipTitle={getToolTipTitle() + (isModeratorOrPresenter ? ` (${keyCombination})` : '')}
      onClick={onClick}
      hasContext={isActive}
      active={isActive}
      disabled={isScreenshareChangeInProgress || !isModeratorOrPresenter || isLivekitUnavailable || isRoomDeleted}
      contextTitle={t('toolbar-button-screen-share-context-title')}
      id={ToolbarButtonIds.ShareScreen}
      openMenu={() => {
        dispatch(switchScreenShare());
      }}
    >
      <ShareScreenOnIcon />
    </ToolbarButton>
  );
};

export default ShareScreenButton;
