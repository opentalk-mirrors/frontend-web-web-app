// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext, useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { styled } from '@mui/material';
import { RoomEvent } from 'livekit-client';
import { useMemo } from 'react';

import { useCurrentSpeaker } from '../../../hooks/useCurrentSpeaker';
import ParticipantWindow from '../../ParticipantWindow';

interface SpeakerViewProps {
  speakerWindowWidth?: number;
  speakerWindowHeight?: number;
}

const Container = styled('div', {
  shouldForwardProp: (prop) => !['height', 'width'].includes(prop as string),
})<{ width: number; height: number }>(({ theme, width, height }) => ({
  borderRadius: theme.borderRadius.medium,
  overflow: 'hidden',
  width,
  height,
  margin: 'auto',
  display: 'flex',
}));

const SpeakerWindow = ({ speakerWindowWidth, speakerWindowHeight }: SpeakerViewProps) => {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.ActiveSpeakersChanged,
      RoomEvent.TrackPublished,
    ],
  });
  const sortedParticipants = useSortedParticipants(remoteParticipants);
  const currentSpeakerId = useCurrentSpeaker();

  const selectedParticipant = useMemo(() => {
    const selectedSpeaker = sortedParticipants.find((participant) => participant.identity === currentSpeakerId);
    return selectedSpeaker || sortedParticipants[0];
  }, [sortedParticipants, currentSpeakerId]);

  const { width, height } = useMemo(() => {
    if (speakerWindowWidth && speakerWindowHeight) {
      const aspectRatio = 16 / 9;
      const height = Math.min(speakerWindowWidth / aspectRatio, speakerWindowHeight);
      const width = height * aspectRatio;
      return { width, height };
    }
    return { width: 1, height: 1 };
  }, [speakerWindowWidth, speakerWindowHeight]);

  return (
    <Container width={width} height={height} data-testid="SpeakerWindow1">
      {selectedParticipant && (
        <ParticipantContext.Provider value={selectedParticipant}>
          <ParticipantWindow alwaysShowOverlay />
        </ParticipantContext.Provider>
      )}
    </Container>
  );
};

export default SpeakerWindow;
