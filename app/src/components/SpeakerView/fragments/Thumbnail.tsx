// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { pinnedParticipantIdSet, selectPinnedParticipantId } from '../../../store/slices/uiSlice';
import { ParticipantId } from '../../../types';
import ParticipantWindow from '../../ParticipantWindow';

const ThumbnailContainer = styled('div')<{ width: number }>(({ width, theme }) => ({
  width: width,
  height: '100%',
  position: 'relative',
  borderRadius: theme.borderRadius.medium,
  overflow: 'hidden',
  padding: 0,
  cursor: 'pointer',
  aspectRatio: '16/9',
  '& .MuiAvatar-root, & .MuiAvatar-circular, & .MuiAvatar-colorDefault': {
    maxWidth: theme.typography.pxToRem(48),
    maxHeight: theme.typography.pxToRem(48),
  },
  '& video': {
    width: '100%',
  },
}));

export const Thumbnail = ({ width }: { width: number }) => {
  const participant = useParticipantContext();
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
  const dispatch = useAppDispatch();

  const togglePin = useCallback(() => {
    const updatePinnedId =
      pinnedParticipantId === participant.identity ? undefined : (participant.identity as ParticipantId);
    dispatch(pinnedParticipantIdSet(updatePinnedId));
  }, [dispatch, participant.identity, pinnedParticipantId]);

  return (
    <ThumbnailContainer onClick={togglePin} width={width} data-testid={`thumbsVideo-${participant.identity}`}>
      <ParticipantWindow isThumbnail={true} />
    </ThumbnailContainer>
  );
};

export default Thumbnail;
