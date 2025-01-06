// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMaybeRoomContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { LocalAudioTrack } from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOffIcon, MicOnIcon } from '../../../assets/icons';
import { SuspenseLoading, showConsentNotification } from '../../../commonComponents';
import { LIVEKIT_AUDIO_PERMISSION_NUMBER, ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { useMediaChoices } from '../../../provider/MediaChoicesProvider';
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
  const dispatch = useAppDispatch();
  const room = useMaybeRoomContext();
  const mediaChoices = useMediaChoices();
  const microphoneEnabled = mediaChoices?.userChoices.audioEnabled || false;

  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [canPublishAudio, setCanPublishAudio] = useState(true);

  const { startMedia, permissionDenied, devices } = useMediaDevice({
    kind: 'audioinput',
  });

  const onClick = async () => {
    if (askConsent && !mediaChoices?.userChoices.audioEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }

    if (mediaChoices?.userChoices.audioEnabled) {
      mediaChoices.saveAudioInputEnabled(false);
      if (!isLobby) {
        await room?.localParticipant.setMicrophoneEnabled(false);
      }
    } else {
      if (!isLobby && !room?.localParticipant.isMicrophoneEnabled) {
        mediaChoices?.saveAudioInputEnabled(true);
        await room?.localParticipant.setMicrophoneEnabled(true);
      }
      await startMedia(true);
    }
  };

  const pendingPermission = permissionDenied === 'pending';

  const indicator = useMemo(() => {
    if (pendingPermission || (!localAudioTrack && microphoneEnabled)) {
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
  }, [microphoneEnabled, localAudioTrack, pendingPermission]);

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
      const localParticipantPermissions = room?.localParticipant.permissions;
      const canPublishAudio = localParticipantPermissions?.canPublishSources?.includes(LIVEKIT_AUDIO_PERMISSION_NUMBER);

      if (canPublishAudio !== undefined) {
        setCanPublishAudio(canPublishAudio);
        if (!canPublishAudio && microphoneEnabled) {
          mediaChoices?.saveAudioInputEnabled(false);
        }
      }
    }
  }, [isLobby, room?.localParticipant.permissions, microphoneEnabled, mediaChoices?.saveAudioInputEnabled]);

  return (
    <div ref={menuRef}>
      <ToolbarButton
        tooltipTitle={tooltipText()}
        onClick={onClick}
        hasContext
        contextDisabled={pendingPermission || devices.length === 0}
        disabled={!canPublishAudio || pendingPermission || devices.length === 0}
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
