// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext, useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { styled } from '@mui/material';
import { RoomEvent } from 'livekit-client';

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
  const sortedParticipants = useSortedParticipants(
    useRemoteParticipants({
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.ActiveSpeakersChanged,
        RoomEvent.TrackPublished,
      ],
    })
  ); //TODO: Recheck for ActiveSpeakersChanged

  const currentSpeakerId = useCurrentSpeaker();

  const selectedSpeaker = sortedParticipants.find((participant) => participant.identity === currentSpeakerId);

  const selectedParticipant = selectedSpeaker || sortedParticipants[0];

  const calculateDimensions = () => {
    if (speakerWindowWidth && speakerWindowHeight) {
      const aspectRatio = 16 / 9;
      const height = Math.min(speakerWindowWidth / aspectRatio, speakerWindowHeight);
      const width = height * aspectRatio;
      return { width, height };
    }
    return { width: 1, height: 1 };
  };

  const { width, height } = calculateDimensions();

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
