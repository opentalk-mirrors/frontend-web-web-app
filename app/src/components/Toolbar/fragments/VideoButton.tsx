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
import { selectLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { selectVideoEnabled, setVideoEnabled } from '../../../store/slices/mediaSlice';
import { selectNeedRecordingConsent } from '../../../store/slices/streamingSlice';
import ToolbarButton from './ToolbarButton';
import VideoMenu from './VideoMenu';

interface VideoButtonProps {
  isLobby?: boolean;
}

const VideoButton = ({ isLobby = false }: VideoButtonProps) => {
  const { t } = useTranslation();
  const askConsent = useAppSelector(selectNeedRecordingConsent);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const dispatch = useAppDispatch();
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const cameraEnabled = (videoEnabled || false) && !isLivekitUnavailable;

  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { startMedia, devices, permissionDenied } = useMediaDevice({
    kind: 'videoinput',
  });

  const onClick = async () => {
    if (askConsent && !cameraEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }

    if (cameraEnabled) {
      dispatch(setVideoEnabled(false));
    } else {
      try {
        await startMedia(true);
      } catch (e) {
        console.error('Unable to start video: ', e);
      }
    }
  };

  const tooltipText = () => {
    if (permissionDenied === true) {
      return t('device-permission-denied');
    }
    if (cameraEnabled) {
      return t('toolbar-button-video-turn-off-tooltip-title');
    }
    return t('toolbar-button-video-turn-on-tooltip-title');
  };

  const pendingPermission = permissionDenied === 'pending';

  const ButtonIcon = () => {
    if (pendingPermission) {
      return <SuspenseLoading size="1rem" />;
    }
    return cameraEnabled ? <CameraOnIcon /> : <CameraOffIcon />;
  };

  return (
    <div ref={menuRef}>
      <ToolbarButton
        tooltipTitle={tooltipText()}
        onClick={onClick}
        hasContext
        contextDisabled={pendingPermission || devices.length === 0}
        contextTitle={t('toolbar-button-video-context-title')}
        contextMenuId="video-context-menu"
        contextMenuExpanded={showMenu}
        disabled={pendingPermission || devices.length === 0 || isLivekitUnavailable}
        active={cameraEnabled}
        openMenu={() => {
          setShowMenu(true);
        }}
        isLobby={isLobby}
        data-testid="toolbarVideoButton"
        id={ToolbarButtonIds.Video}
      >
        <ButtonIcon />
      </ToolbarButton>
      <VideoMenu
        anchorEl={menuRef.current}
        onClose={() => {
          setShowMenu(false);
        }}
        open={showMenu}
        videoEnabled={cameraEnabled}
        isLobby={isLobby}
      />
    </div>
  );
};

export default VideoButton;
