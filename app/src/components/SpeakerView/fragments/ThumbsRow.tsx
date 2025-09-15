// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sortParticipants } from '@livekit/components-core';
import { ParticipantLoop, useRemoteParticipants } from '@livekit/components-react';
import { Stack, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectAllOnlineParticipants } from '../../../store/slices/participantsSlice';
import { selectPinnedParticipantId } from '../../../store/slices/uiSlice';
import { ParticipantId } from '../../../types';
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
  const signalingParticipants = useAppSelector(selectAllOnlineParticipants);
  const remoteParticipants = useRemoteParticipants();
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);

  // TODO: repeting logic here in SpeakerView and in Fullscreen view - need refactoring
  const lastSpeakerId = useMemo(() => {
    const activeSpeaker = sortParticipants(remoteParticipants)?.at(0);
    return activeSpeaker?.identity as ParticipantId | undefined;
  }, [remoteParticipants]);

  const selectedParticipantId = pinnedParticipantId || lastSpeakerId;

  // Create a map for quick lookups of remoteParticipants by identity
  const remoteParticipantsMap = useMemo(() => {
    return new Map(remoteParticipants.map((p) => [p.identity, p]));
  }, [remoteParticipants]);

  const participants = useMemo(
    () =>
      signalingParticipants
        .filter((participant) => participant.id !== selectedParticipantId)
        .map(
          (participant) =>
            remoteParticipantsMap.get(participant.id) ||
            new Participant(participant.id, participant.id, participant.displayName)
        ),
    [signalingParticipants, remoteParticipantsMap, selectedParticipantId]
  );

  const [firstVisibleParticipantIndex, setFirstVisibleParticipantIndex] = useState(0);
  const lastVisibleParticipantIndex = Math.min(firstVisibleParticipantIndex + thumbsPerWindow, participants.length);
  const currentlyVisibleParticipantsNumber = lastVisibleParticipantIndex - firstVisibleParticipantIndex;

  const slideLeft = () => {
    setFirstVisibleParticipantIndex((prevIndex) => Math.max(prevIndex - thumbsPerWindow, 0));
  };

  const slideRight = () => {
    // we compare number of visible participants (thumbnails) with the participants length, to detect
    // if a participant, we were showing in the thumbnails row, has left the meeting
    // if there is a gap -> we update the firstVisibleParticipantIndex and move the whole row to the left
    setFirstVisibleParticipantIndex((prevIndex) =>
      Math.min(prevIndex + thumbsPerWindow, participants.length - thumbsPerWindow)
    );
  };

  const visibleParticipants = useMemo(
    () => participants.slice(firstVisibleParticipantIndex, lastVisibleParticipantIndex),
    [participants, firstVisibleParticipantIndex, lastVisibleParticipantIndex]
  );

  useEffect(() => {
    if (currentlyVisibleParticipantsNumber < participants.length) {
      setFirstVisibleParticipantIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  }, [participants.length, currentlyVisibleParticipantsNumber]);

  return (
    <ThumbsHolder direction="row" gap={1} tracks={thumbsPerWindow} data-testid="ThumbsHolder">
      {firstVisibleParticipantIndex > 0 && (
        <IconSlideButton direction="left" aria-label="navigate-to-left" onClick={slideLeft} />
      )}
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
