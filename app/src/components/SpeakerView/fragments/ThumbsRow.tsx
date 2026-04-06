// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantLoop } from '@livekit/components-react';
import { Stack, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useCallback, useMemo, useState } from 'react';

import { useCinemaViewParticipants } from '../../../hooks/useCinemaViewParticipants';
import { constructConnectionIdentifier } from '../../../utils/constructConnectionIdentifier';
import IconSlideButton from './IconSlideButton';
import { Thumbnail } from './Thumbnail';

// ThumbsHolder: the surrounding container of the thumbnails
const ThumbsHolder = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'tracks',
})<{ tracks: number }>(({ theme }) => ({
  margin: theme.spacing(2, 0, 0, 0),
  gridGap: theme.spacing(2),
  width: '100%',
}));

export interface ThumbsProps {
  thumbWidth: number;
  thumbsPerWindow: number;
}

const ThumbsRow = ({ thumbWidth, thumbsPerWindow }: ThumbsProps) => {
  const { cinemaViewParticipants, remoteParticipantsMap, currentSpeakerId } = useCinemaViewParticipants();
  const [fallbackParticipantCache] = useState(() => new Map<string, Participant>());

  const createOrGetFallbackParticipant = useCallback(
    (connectionIdentifier: string, displayName: string) => {
      if (!fallbackParticipantCache.has(connectionIdentifier)) {
        fallbackParticipantCache.set(
          connectionIdentifier,
          new Participant(connectionIdentifier, connectionIdentifier, displayName)
        );
      }
      return fallbackParticipantCache.get(connectionIdentifier)!;
    },
    [fallbackParticipantCache]
  );

  const participants = useMemo(() => {
    return cinemaViewParticipants.flatMap((participant) =>
      participant.connections
        .filter((connection) => {
          if (!currentSpeakerId) {
            return true;
          }
          const combinedId = constructConnectionIdentifier(participant.id, connection);
          return combinedId !== currentSpeakerId;
        })
        .map((connection) => {
          const combinedId = constructConnectionIdentifier(participant.id, connection);
          return (
            remoteParticipantsMap.get(combinedId) ?? createOrGetFallbackParticipant(combinedId, participant.displayName)
          );
        })
    );
  }, [cinemaViewParticipants, remoteParticipantsMap, currentSpeakerId, createOrGetFallbackParticipant]);

  const [firstVisibleParticipantIndex, setFirstVisibleParticipantIndex] = useState(0);

  // Adjust the index if it would show fewer than thumbsPerWindow items when there are enough participants
  const adjustedIndex = useMemo(() => {
    const maxIndex = Math.max(0, participants.length - thumbsPerWindow);
    return Math.min(firstVisibleParticipantIndex, maxIndex);
  }, [firstVisibleParticipantIndex, participants.length, thumbsPerWindow]);

  const lastVisibleParticipantIndex = Math.min(adjustedIndex + thumbsPerWindow, participants.length);

  const slideLeft = () => {
    setFirstVisibleParticipantIndex((prevIndex) => Math.max(prevIndex - thumbsPerWindow, 0));
  };

  const slideRight = () => {
    setFirstVisibleParticipantIndex((prevIndex) =>
      Math.min(prevIndex + thumbsPerWindow, participants.length - thumbsPerWindow)
    );
  };

  const visibleParticipants = useMemo(
    () => participants.slice(adjustedIndex, lastVisibleParticipantIndex),
    [participants, adjustedIndex, lastVisibleParticipantIndex]
  );

  return (
    <ThumbsHolder direction="row" gap={1} tracks={thumbsPerWindow} data-testid="ThumbsHolder">
      {adjustedIndex > 0 && <IconSlideButton direction="left" aria-label="navigate-to-left" onClick={slideLeft} />}
      <ParticipantLoop participants={visibleParticipants}>
        <Thumbnail width={thumbWidth} />
      </ParticipantLoop>
      {lastVisibleParticipantIndex < participants.length && (
        <IconSlideButton direction="right" aria-label="navigate-to-right" onClick={slideRight} />
      )}
    </ThumbsHolder>
  );
};

export default ThumbsRow;
