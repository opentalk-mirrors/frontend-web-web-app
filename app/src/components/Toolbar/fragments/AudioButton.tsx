// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions } from '@livekit/components-react';
import { styled } from '@mui/material';
import { LocalAudioTrack } from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOffIcon, MicOnIcon } from '../../../assets/icons';
import { showConsentNotification, SuspenseLoading } from '../../../commonComponents';
import { LIVEKIT_AUDIO_PERMISSION_NUMBER, ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { selectLivekitUnavailable } from '../../../store/slices/livekitSlice';
import {
  selectAudioChangeInProgress,
  selectAudioEnabled,
  selectAudioPermissionDenied,
  selectMediaChangeInProgress,
  startMedia,
} from '../../../store/slices/mediaSlice';
import { selectNeedRecordingConsent } from '../../../store/slices/streamingSlice';
import AudioIndicator from './AudioIndicator';
import AudioMenu from './AudioMenu';
import ToolbarButton from './ToolbarButton';

const MicOnStyled = styled(MicOnIcon)({
  zIndex: 1,
});

interface AudioButtonProps {
  localAudioTrack?: LocalAudioTrack;
  isLobby?: boolean;
}

const AudioButton = ({ localAudioTrack, isLobby = false }: AudioButtonProps) => {
  const { t } = useTranslation();
  const askConsent = useAppSelector(selectNeedRecordingConsent);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const dispatch = useAppDispatch();
  const audioEnabled = useAppSelector(selectAudioEnabled);
  const localParticipantPermissions = (!isLobby && useLocalParticipantPermissions()) || undefined;
  const microphoneEnabled = audioEnabled && !isLivekitUnavailable;
  const permissionDenied = useAppSelector(selectAudioPermissionDenied);
  const audioChangeInProgress = useAppSelector(selectAudioChangeInProgress);
  const mediaChangeInProgress = useAppSelector(selectMediaChangeInProgress);

  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [canPublishAudio, setCanPublishAudio] = useState(true);

  const { devices } = useMediaDevice({
    kind: 'audioinput',
  });

  const onClick = async () => {
    if (askConsent && !audioEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }

    dispatch(startMedia({ kind: 'audioinput', enabled: !audioEnabled }));
  };

  const indicator = useMemo(() => {
    if (audioChangeInProgress || (!localAudioTrack && microphoneEnabled)) {
      return <SuspenseLoading size="1rem" />;
    }

    if (microphoneEnabled && localAudioTrack) {
      return (
        <>
          <AudioIndicator shape="circle" localAudioTrack={localAudioTrack} />
          <MicOnStyled data-testid="toolbarAudioButtonOn" />
        </>
      );
    }

    return <MicOffIcon data-testid="toolbarAudioButtonOff" />;
  }, [microphoneEnabled, localAudioTrack, audioChangeInProgress]);

  const tooltipText = () => {
    if (permissionDenied === true) {
      return t('device-permission-denied');
    }
    if (microphoneEnabled) {
      return t('toolbar-button-audio-turn-off-tooltip-title');
    }
    return t('toolbar-button-audio-turn-on-tooltip-title');
  };

  useEffect(() => {
    if (!isLobby) {
      const canPublishAudio = localParticipantPermissions?.canPublishSources?.includes(LIVEKIT_AUDIO_PERMISSION_NUMBER);

      if (canPublishAudio !== undefined) {
        setCanPublishAudio(canPublishAudio);
        if (!canPublishAudio && microphoneEnabled) {
          dispatch(startMedia({ kind: 'audioinput', enabled: false }));
        }
      }
    }
  }, [isLobby, localParticipantPermissions, microphoneEnabled]);

  return (
    <div ref={menuRef}>
      <ToolbarButton
        tooltipTitle={tooltipText()}
        onClick={onClick}
        hasContext
        contextDisabled={mediaChangeInProgress || devices.length === 0}
        disabled={!canPublishAudio || mediaChangeInProgress || devices.length === 0 || isLivekitUnavailable}
        openMenu={() => setShowMenu(true)}
        active={Boolean(microphoneEnabled && localAudioTrack)}
        isLobby={isLobby}
        data-testid="toolbarAudioButton"
        contextTitle={t('toolbar-button-audio-context-title')}
        contextMenuId="audio-context-menu"
        contextMenuExpanded={showMenu}
        id={ToolbarButtonIds.Audio}
      >
        {indicator}
      </ToolbarButton>
      <AudioMenu open={showMenu} onClose={() => setShowMenu(false)} anchorEl={menuRef.current} />
    </div>
  );
};

export default AudioButton;
