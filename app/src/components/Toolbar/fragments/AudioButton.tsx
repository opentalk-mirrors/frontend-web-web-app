// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMaybeRoomContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { LocalAudioTrack } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOffIcon, MicOnIcon } from '../../../assets/icons';
import { SuspenseLoading, showConsentNotification } from '../../../commonComponents';
import { LIVEKIT_AUDIO_PERMISSION_NUMBER, ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useHotkeyCombination } from '../../../hooks/useHotkeyCombination';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { changeMedia } from '../../../store/commonActions';
import {
  selectAudioChangeInProgress,
  selectAudioPermissionDenied,
  selectLivekitUnavailable,
} from '../../../store/slices/livekitSlice';
import { selectShouldForceMuted } from '../../../store/slices/moderationSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectNeedRecordingConsent } from '../../../store/slices/streamingSlice';
import MeetingSettingsDialog from '../../MeetingSettingsDialog';
import AudioIndicator from './AudioIndicator';
import ToolbarButton from './ToolbarButton';

const MicOnStyled = styled(MicOnIcon)({
  zIndex: 1,
});

interface AudioButtonProps {
  localAudioTrack?: LocalAudioTrack;
  isLobby?: boolean;
  audioEnabled: boolean;
  onAudioButtonToggle: () => void;
}

const AudioButton = ({ localAudioTrack, isLobby = false, audioEnabled, onAudioButtonToggle }: AudioButtonProps) => {
  const { t } = useTranslation();
  const askConsent = useAppSelector(selectNeedRecordingConsent);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const dispatch = useAppDispatch();
  const room = useMaybeRoomContext();
  const microphoneEnabled = audioEnabled && !isLivekitUnavailable;
  const permissionDenied = useAppSelector(selectAudioPermissionDenied);
  const audioChangeInProgress = useAppSelector(selectAudioChangeInProgress);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const shouldForceMute = useAppSelector(selectShouldForceMuted);
  const keyCombination = useHotkeyCombination('hotkey-microphone-toggle');

  const [showMenu, setShowMenu] = useState(false);

  const { devices } = useMediaDevice({
    kind: 'audioinput',
  });

  const canPublishAudio = useMemo(() => {
    if (isLobby) {
      return true;
    }

    if (isLivekitUnavailable || shouldForceMute) {
      return false;
    }

    const hasPermission = room?.localParticipant.permissions?.canPublishSources.includes(
      LIVEKIT_AUDIO_PERMISSION_NUMBER
    );

    return hasPermission ?? true;
  }, [isLobby, room, isLivekitUnavailable, shouldForceMute]);

  const onClick = async () => {
    if (askConsent && !audioEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }
    onAudioButtonToggle();
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
    if (!canPublishAudio) {
      return t('toolbar-button-audio-disabled-tooltip');
    }
    if (microphoneEnabled) {
      return t('toolbar-button-audio-turn-off-tooltip-title') + ` (${keyCombination})`;
    }
    return t('toolbar-button-audio-turn-on-tooltip-title') + ` (${keyCombination})`;
  };

  useEffect(() => {
    if (!canPublishAudio && microphoneEnabled) {
      dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
    }
  }, [canPublishAudio, microphoneEnabled, dispatch]);

  return (
    <>
      <ToolbarButton
        tooltipTitle={tooltipText()}
        onClick={onClick}
        hasContext
        contextDisabled={audioChangeInProgress || devices.length === 0}
        disabled={
          !canPublishAudio || audioChangeInProgress || devices.length === 0 || isLivekitUnavailable || isRoomDeleted
        }
        openMenu={() => setShowMenu(true)}
        active={Boolean(microphoneEnabled)}
        isLobby={isLobby}
        data-testid="toolbarAudioButton"
        contextTitle={t('toolbar-button-audio-context-title')}
        contextMenuId="audio-context-menu"
        contextMenuExpanded={showMenu}
        id={ToolbarButtonIds.Audio}
      >
        {indicator}
      </ToolbarButton>
      <MeetingSettingsDialog open={showMenu} onClose={() => setShowMenu(false)} setting="audio" />
    </>
  );
};

export default AudioButton;
