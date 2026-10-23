// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setPinnedTile, selectPinnedTile } from '../../../store/slices/uiSlice';
import { ConnectionIdentifier, type MediaSessionType, TileIdentifier } from '../../../types';
import { isSameTile } from '../../../utils/isSameTile';
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

interface ThumbnailProps {
  width: number;
  source: MediaSessionType;
}

export const Thumbnail = ({ width, source }: ThumbnailProps) => {
  const participant = useParticipantContext();
  const pinnedTile = useAppSelector(selectPinnedTile);
  const dispatch = useAppDispatch();

  const togglePin = useCallback(() => {
    const tile: TileIdentifier = { connectionIdentifier: participant.identity as ConnectionIdentifier, source };
    dispatch(setPinnedTile(isSameTile(pinnedTile, tile) ? undefined : tile));
  }, [dispatch, participant.identity, pinnedTile, source]);

  return (
    <ThumbnailContainer onClick={togglePin} width={width} data-testid={`thumbnail-${participant.identity}`}>
      <ParticipantWindow isThumbnail={true} source={source} />
    </ThumbnailContainer>
  );
};

export default Thumbnail;
