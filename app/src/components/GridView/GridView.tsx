// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';
import { CSSProperties } from 'react';

import { useAppSelector, useOrderedTiles, useCinemaViewParticipants } from '../../hooks';
import { useBestFitGridLayout } from '../../hooks/useBestFitGridLayout';
import { useIsMobile } from '../../hooks/useMediaQuery';
import TileParticipantProvider from '../../provider/TileParticipantProvider';
import { selectParticipantsTotal } from '../../store/slices/participantsSlice';
import { selectPaginationDirectionState } from '../../store/slices/uiSlice';
import GridCell from './fragments/GridCell';
import { GRID_COLUMNS_VAR, GRID_GAP, GRID_GAP_VAR, GRID_TILE_WIDTH_VAR } from './gridLayout';

const GridContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isScrolling',
})<{ isScrolling: boolean }>(({ isScrolling }) => ({
  [GRID_GAP_VAR]: `${GRID_GAP}px`,
  flex: 1,
  minHeight: 0,
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  gap: `var(${GRID_GAP_VAR})`,
  justifyContent: 'center',
  alignContent: isScrolling ? 'flex-start' : 'center',
  alignItems: 'center',
  // Keep overflow-x explicitly hidden: leaving it unset makes it compute to `auto`
  // (because overflow-y is not `visible`), so a transient horizontal scrollbar could
  // steal height and flip the row count while shrinking the width.
  overflowX: 'hidden',
  overflowY: isScrolling ? 'auto' : 'hidden',
}));

const GridView = () => {
  const { cinemaViewParticipants, remoteParticipantsMap, featuredTile } = useCinemaViewParticipants();
  const { pageTiles } = useOrderedTiles(cinemaViewParticipants, {
    featuredConnectionIdentifier: featuredTile?.connectionIdentifier,
  });
  const direction = useAppSelector(selectPaginationDirectionState);

  const isMobile = useIsMobile();
  const { containerRef, layout, isScrolling } = useBestFitGridLayout(pageTiles.length, {
    gap: GRID_GAP,
    allowScroll: isMobile,
  });

  const participantsCount = useAppSelector(selectParticipantsTotal);
  const highlight = participantsCount > 2;

  const gridCells = pageTiles.map(({ participant, connectionIdentifier, tileKey, source }) => (
    <TileParticipantProvider
      key={tileKey}
      connectionIdentifier={connectionIdentifier}
      displayName={participant.displayName}
      remoteParticipant={remoteParticipantsMap.get(connectionIdentifier)}
    >
      <GridCell direction={direction} highlight={highlight} source={source} />
    </TileParticipantProvider>
  ));

  // Leave the variables unset until measured, so GridCell can apply its own fallback size.
  // The column count fixes how tiles wrap; the pixel width only caps their max size, so a
  // stale measurement can no longer push a tile onto an extra row while the width shrinks.
  const tileSizeStyle =
    layout.columns > 0 && layout.tileWidth > 0
      ? ({
          [GRID_COLUMNS_VAR]: layout.columns,
          [GRID_TILE_WIDTH_VAR]: `${Math.floor(layout.tileWidth)}px`,
        } as CSSProperties)
      : undefined;

  return (
    <GridContainer data-testid="gridContainer" ref={containerRef} isScrolling={isScrolling} style={tileSizeStyle}>
      {gridCells}
    </GridContainer>
  );
};

export default GridView;
