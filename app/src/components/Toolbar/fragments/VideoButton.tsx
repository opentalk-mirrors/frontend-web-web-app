// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CameraOffIcon, CameraOnIcon } from '../../../assets/icons';
import { SuspenseLoading, showConsentNotification } from '../../../commonComponents';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import {
  selectLivekitUnavailable,
  selectVideoChangeInProgress,
  selectVideoPermissionDenied,
} from '../../../store/slices/livekitSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectNeedRecordingConsent } from '../../../store/slices/streamingSlice';
import MeetingSettingsDialog from '../../MeetingSettingsDialog';
import ToolbarButton from './ToolbarButton';

interface VideoButtonProps {
  isLobby?: boolean;
  videoEnabled: boolean;
  onVideoButtonToggle: () => void;
}

const VideoButton = ({ isLobby = false, videoEnabled, onVideoButtonToggle }: VideoButtonProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const askConsent = useAppSelector(selectNeedRecordingConsent);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const cameraEnabled = (videoEnabled || false) && !isLivekitUnavailable;

  const videoChangeInProgress = useAppSelector(selectVideoChangeInProgress);
  const videoPermissionDenied = useAppSelector(selectVideoPermissionDenied);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { devices } = useMediaDevice({
    kind: 'videoinput',
  });

  const onClick = async () => {
    if (askConsent && !cameraEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }
    onVideoButtonToggle();
  };

  const tooltipText = () => {
    if (videoPermissionDenied) {
      return t('device-permission-denied');
    }
    if (cameraEnabled) {
      return t('toolbar-button-video-turn-off-tooltip-title');
    }
    return t('toolbar-button-video-turn-on-tooltip-title');
  };

  let buttonIcon = cameraEnabled ? <CameraOnIcon /> : <CameraOffIcon />;
  if (videoChangeInProgress) {
    buttonIcon = <SuspenseLoading size="1rem" />;
  }

  return (
    <div ref={menuRef}>
      <ToolbarButton
        tooltipTitle={tooltipText()}
        onClick={onClick}
        hasContext
        contextDisabled={videoChangeInProgress}
        contextTitle={t('toolbar-button-video-context-title')}
        contextMenuId="video-context-menu"
        contextMenuExpanded={showMenu}
        disabled={videoChangeInProgress || devices.length === 0 || isLivekitUnavailable || isRoomDeleted}
        active={cameraEnabled}
        openMenu={() => {
          setShowMenu(true);
        }}
        isLobby={isLobby}
        data-testid="toolbarVideoButton"
        id={ToolbarButtonIds.Video}
      >
        {buttonIcon}
      </ToolbarButton>
      <MeetingSettingsDialog open={showMenu} onClose={() => setShowMenu(false)} setting="camera" />
    </div>
  );
};

export default VideoButton;
