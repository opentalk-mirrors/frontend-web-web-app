// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext, useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { styled } from '@mui/material';
import { Participant, RemoteParticipant } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectPinnedParticipantId } from '../../../store/slices/uiSlice';
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
  const sortedParticipants = useSortedParticipants(useRemoteParticipants());
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
  const currentSpeakerId = pinnedParticipantId || sortedParticipants[0]?.identity;
  const [{ width, height }, setDimensions] = useState({ width: 1, height: 1 });

  const selectedSpeaker = useMemo(
    () => sortedParticipants.find((participant) => participant.identity === currentSpeakerId),
    [sortedParticipants, currentSpeakerId]
  );

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | RemoteParticipant | undefined>(
    selectedSpeaker
  );

  useEffect(() => {
    if (!selectedParticipant || !sortedParticipants.some((p) => p.identity === selectedParticipant.identity)) {
      setSelectedParticipant(sortedParticipants[0]);
    }
  }, [sortedParticipants, selectedParticipant]);

  const calculateCellDimensions = useCallback(() => {
    if (speakerWindowWidth && speakerWindowHeight) {
      const aspectRatio = 16 / 9;
      const height = Math.min(speakerWindowWidth / aspectRatio, speakerWindowHeight);
      const width = height * aspectRatio;

      setDimensions({ width, height });
    }
  }, [speakerWindowWidth, speakerWindowHeight]);

  useEffect(() => {
    calculateCellDimensions();
  }, [calculateCellDimensions]);

  return (
    <Container width={width} height={height} data-testid="SpeakerWindow1">
      {selectedParticipant && (
        <ParticipantContext.Provider value={selectedSpeaker || selectedParticipant}>
          <ParticipantWindow alwaysShowOverlay />
        </ParticipantContext.Provider>
      )}
    </Container>
  );
};

export default SpeakerWindow;
