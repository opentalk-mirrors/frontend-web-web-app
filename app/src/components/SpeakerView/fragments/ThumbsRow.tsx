// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantLoop } from '@livekit/components-react';
import { Stack, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useMemo, useState } from 'react';

import { useCinemaViewParticipants } from '../../../hooks/useCinemaViewParticipants';
import { useCurrentSpeaker } from '../../../hooks/useCurrentSpeaker';
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
  const { cinemaViewParticipants, remoteParticipantsMap } = useCinemaViewParticipants();
  const selectedParticipantId = useCurrentSpeaker();

  const participants = useMemo(
    () =>
      cinemaViewParticipants
        .filter((participant) => participant.id !== selectedParticipantId)
        .map(
          (participant) =>
            remoteParticipantsMap.get(participant.id) ||
            new Participant(participant.id, participant.id, participant.displayName)
        ),
    [cinemaViewParticipants, remoteParticipantsMap, selectedParticipantId]
  );

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
