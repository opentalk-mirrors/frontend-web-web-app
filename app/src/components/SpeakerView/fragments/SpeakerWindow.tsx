// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useMemo } from 'react';

import { useCinemaViewParticipants } from '../../../hooks/useCinemaViewParticipants';
import ParticipantWindow from '../../ParticipantWindow';

interface SpeakerWindowProps {
  speakerWindowWidth?: number;
  speakerWindowHeight?: number;
}

const Container = styled('div', {
  shouldForwardProp: (prop) => !['width', 'height'].includes(prop as string),
})<{ width: number; height: number }>(({ theme, width, height }) => ({
  borderRadius: theme.borderRadius.medium,
  overflow: 'hidden',
  width,
  height,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const SpeakerWindow = ({ speakerWindowWidth, speakerWindowHeight }: SpeakerWindowProps) => {
  const { cinemaViewParticipants, remoteParticipantsMap, currentSpeakerId } = useCinemaViewParticipants();
  const selectedParticipant = (() => {
    if (currentSpeakerId) {
      const remoteParticipant = remoteParticipantsMap.get(currentSpeakerId);
      if (remoteParticipant) {
        return remoteParticipant;
      }

      // Create a fallback participant when LiveKit data isn't available yet
      const speaker = cinemaViewParticipants.find(
        (p) => p.connections[0] && currentSpeakerId.includes(p.connections[0])
      );
      return new Participant(currentSpeakerId, currentSpeakerId, speaker?.displayName ?? '');
    }

    // Smooth out the transition between grid and speaker view by showing the first available participant
    const firstRemote = remoteParticipantsMap.values().next();
    return firstRemote.done ? undefined : firstRemote.value;
  })();

  // Fit a 16:9 box entirely within the available area (contain), preserving the
  // aspect ratio so the video is never cropped or distorted when the window is resized.
  const { width, height } = useMemo(() => {
    if (speakerWindowWidth && speakerWindowHeight) {
      const aspectRatio = 16 / 9;
      const boxHeight = Math.min(speakerWindowWidth / aspectRatio, speakerWindowHeight);
      const boxWidth = boxHeight * aspectRatio;
      return { width: boxWidth, height: boxHeight };
    }
    return { width: 1, height: 1 };
  }, [speakerWindowWidth, speakerWindowHeight]);

  return (
    <Container width={width} height={height}>
      {selectedParticipant && (
        <ParticipantContext.Provider value={selectedParticipant}>
          <ParticipantWindow alwaysShowOverlay />
        </ParticipantContext.Provider>
      )}
    </Container>
  );
};

export default SpeakerWindow;
