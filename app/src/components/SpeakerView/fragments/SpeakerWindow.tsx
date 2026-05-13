// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { Participant } from 'livekit-client';

import { useCinemaViewParticipants } from '../../../hooks/useCinemaViewParticipants';
import ParticipantWindow from '../../ParticipantWindow';

const Container = styled('div')(({ theme }) => ({
  borderRadius: theme.borderRadius.medium,
  overflow: 'hidden',
  aspectRatio: '16 / 9',
  flex: 1,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const SpeakerWindow = () => {
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

  return (
    <Container>
      {selectedParticipant && (
        <ParticipantContext.Provider value={selectedParticipant}>
          <ParticipantWindow alwaysShowOverlay />
        </ParticipantContext.Provider>
      )}
    </Container>
  );
};

export default SpeakerWindow;
