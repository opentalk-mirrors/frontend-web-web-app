// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { Box, CircularProgress, Grid, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { CSSProperties, useEffect, useState } from 'react';

import { useAppSelector } from '../../hooks';
import { useBestFitGridLayout } from '../../hooks/useBestFitGridLayout';
import { useCinemaViewParticipants } from '../../hooks/useCinemaViewParticipants';
import { useCinemaViewParticipantsOrdering } from '../../hooks/useCinemaViewParticipantsOrdering';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { selectPaginationDirectionState } from '../../store/slices/uiSlice';
import { ConnectionIdentifier } from '../../types';
import { constructConnectionIdentifier } from '../../utils/constructConnectionIdentifier';
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
  const { cinemaViewParticipants, remoteParticipantsMap } = useCinemaViewParticipants();
  const { pageParticipants: participants } = useCinemaViewParticipantsOrdering(cinemaViewParticipants);
  const [fallbackParticipantCache] = useState(() => new Map<ConnectionIdentifier, Participant>());
  const direction = useAppSelector(selectPaginationDirectionState);

  const tileCount = participants.reduce((sum, participant) => sum + participant.connections.length, 0);
  const isMobile = useIsMobile();
  const { containerRef, layout, isScrolling } = useBestFitGridLayout(tileCount, {
    gap: GRID_GAP,
    allowScroll: isMobile,
  });
  const highlight = participants.length >= 2;

  useEffect(() => {
    const activeIds = new Set(
      participants.flatMap((p) => p.connections.map((c) => constructConnectionIdentifier(p.id, c)))
    );
    for (const key of fallbackParticipantCache.keys()) {
      if (remoteParticipantsMap.has(key) || !activeIds.has(key)) {
        fallbackParticipantCache.delete(key);
      }
    }
  }, [participants, remoteParticipantsMap, fallbackParticipantCache]);

  const createOrGetFallbackParticipant = (connectionIdentifier: ConnectionIdentifier, displayName: string) => {
    if (!fallbackParticipantCache.has(connectionIdentifier)) {
      fallbackParticipantCache.set(
        connectionIdentifier,
        new Participant(connectionIdentifier, connectionIdentifier, displayName)
      );
    }
    return fallbackParticipantCache.get(connectionIdentifier)!;
  };

  const gridCells = participants.map((participant) => {
    return participant.connections.map((connection) => {
      const connectionIdentifier = constructConnectionIdentifier(participant.id, connection);

      // We will use participant data from the controller until we get the more preferable data from the livekit server
      const participantData =
        remoteParticipantsMap.get(connectionIdentifier) ||
        createOrGetFallbackParticipant(connectionIdentifier, participant.displayName);

      return (
        <ParticipantContext.Provider value={participantData} key={connectionIdentifier}>
          <GridCell direction={direction} highlight={highlight} />
        </ParticipantContext.Provider>
      );
    });
  });

  const areGridCellsLoading = participants.length > 1 && gridCells.length === 0;

  const loadingGrids = (
    <Grid
      container
      sx={{
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <CircularProgress />
    </Grid>
  );

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
      {areGridCellsLoading ? loadingGrids : gridCells}
    </GridContainer>
  );
};

export default GridView;
