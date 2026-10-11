// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { RemoteParticipant } from 'livekit-client';
import { useState } from 'react';

import { useConferenceUiVersion, useOrderedTiles } from '../../../hooks';
import type { CinemaViewParticipant } from '../../../hooks/useCinemaViewParticipants';
import TileParticipantProvider from '../../../provider/TileParticipantProvider';
import { TileIdentifier } from '../../../types';
import IconSlideButton from './IconSlideButton';
import { Thumbnail } from './Thumbnail';

const FilmstripContainer = styled(Stack)(({ theme }) => ({
  gridGap: theme.spacing(2),
  width: '100%',
}));

export interface FilmstripProps {
  thumbnailWidth: number;
  visibleThumbnails: number;
  cinemaViewParticipants: CinemaViewParticipant[];
  remoteParticipantsMap: Map<string, RemoteParticipant>;
  featuredTile: TileIdentifier | undefined;
}

const Filmstrip = ({
  thumbnailWidth,
  visibleThumbnails,
  cinemaViewParticipants,
  remoteParticipantsMap,
  featuredTile,
}: FilmstripProps) => {
  const { isV2 } = useConferenceUiVersion();
  const { orderedTiles } = useOrderedTiles(cinemaViewParticipants, { unbounded: true });

  // V2-CLEANUP: after transition to V2 compare the source always
  const isFeaturedTile = (tile: (typeof orderedTiles)[number]) =>
    tile.connectionIdentifier === featuredTile?.connectionIdentifier && (!isV2 || tile.source === featuredTile.source);

  //Don't render thumbnails while there is no featured title (e.g. no connection to LiveKit)
  const tiles = featuredTile ? orderedTiles.filter((tile) => !isFeaturedTile(tile)) : [];

  // Adjust the index if it would show fewer than visibleThumbnails items when there are enough participants
  const [firstVisibleTileIndex, setFirstVisibleTileIndex] = useState(0);
  const maxIndex = Math.max(0, tiles.length - visibleThumbnails);
  const adjustedIndex = Math.min(firstVisibleTileIndex, maxIndex);
  const lastVisibleTileIndex = Math.min(adjustedIndex + visibleThumbnails, tiles.length);
  const visibleTiles = tiles.slice(adjustedIndex, lastVisibleTileIndex);

  const slideLeft = () => {
    setFirstVisibleTileIndex((prevIndex) => Math.max(prevIndex - visibleThumbnails, 0));
  };

  const slideRight = () => {
    setFirstVisibleTileIndex((prevIndex) => Math.min(prevIndex + visibleThumbnails, tiles.length - visibleThumbnails));
  };

  return (
    <FilmstripContainer direction="row" sx={{ gap: 1 }} data-testid="filmstrip">
      {adjustedIndex > 0 && <IconSlideButton direction="left" aria-label="navigate-to-left" onClick={slideLeft} />}
      {visibleTiles.map(({ participant, connectionIdentifier, tileKey, source }) => (
        <TileParticipantProvider
          key={tileKey}
          connectionIdentifier={connectionIdentifier}
          displayName={participant.displayName}
          remoteParticipant={remoteParticipantsMap.get(connectionIdentifier)}
        >
          <Thumbnail width={thumbnailWidth} source={source} />
        </TileParticipantProvider>
      ))}
      {lastVisibleTileIndex < tiles.length && (
        <IconSlideButton direction="right" aria-label="navigate-to-right" onClick={slideRight} />
      )}
    </FilmstripContainer>
  );
};

export default Filmstrip;
