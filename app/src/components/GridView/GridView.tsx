// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { Participant, RemoteParticipant } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  GRID_BIG_VIDEO_WIDTH,
  GRID_SMALL_VIDEO_WIDTH,
  MAX_GRID_TILES_DESKTOP,
  MAX_GRID_TILES_MOBILE,
} from '../../constants';
import { useAppSelector } from '../../hooks';
import { CinemaViewParticipant, useCinemaViewParticipants } from '../../hooks/useCinemaViewParticipants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  PaginationDirection,
  selectPaginationDirectionState,
  selectPaginationPageState,
} from '../../store/slices/uiSlice';
import { ConnectionIdentifier } from '../../types';
import { constructConnectionIdentifier } from '../../utils/constructConnectionIdentifier';
import GridCell from './fragments/GridCell';

const GridContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'videoWidth',
})<{ videoWidth: number }>(({ theme, videoWidth }) => ({
  width: '100%',
  display: 'grid',
  gridGap: theme.spacing(1),
  alignContent: 'center',
  gridAutoFlow: 'row',
  [theme.breakpoints.up('md')]: {
    height: '100%',
    gridTemplateColumns: `repeat(auto-fit, minmax(calc(${videoWidth}% - ${theme.spacing(1)}), 1fr))`,
  },
}));

export type GridViewProps = {
  participants: CinemaViewParticipant[];
  remoteParticipantsMap: Map<string, RemoteParticipant>;
  pageNumber: number;
  direction: PaginationDirection;
};

const GridView = () => {
  const { cinemaViewParticipants: participants, remoteParticipantsMap } = useCinemaViewParticipants();
  const [fallbackParticipantCache] = useState(() => new Map<ConnectionIdentifier, Participant>());
  const videoWidth = participants.length <= 4 ? GRID_BIG_VIDEO_WIDTH : GRID_SMALL_VIDEO_WIDTH;
  const isMobile = useIsMobile();
  const lastSpokenParticipant = useMemo(() => {
    return participants.reduce<CinemaViewParticipant | undefined>((latest, current) => {
      if (!current.lastSpokeAt) {
        return latest;
      }
      if (!latest?.lastSpokeAt) {
        return current;
      }
      return current.lastSpokeAt > latest.lastSpokeAt ? current : latest;
    }, undefined);
  }, [participants]);
  const pageNumber = useAppSelector(selectPaginationPageState);
  const direction = useAppSelector(selectPaginationDirectionState);
  const gridViewParticipants = useMemo(() => {
    const MAX_GRID_TILES = isMobile ? MAX_GRID_TILES_MOBILE : MAX_GRID_TILES_DESKTOP;

    if (!lastSpokenParticipant) {
      return participants.slice((pageNumber - 1) * MAX_GRID_TILES, pageNumber * MAX_GRID_TILES);
    }

    // I need to place last spoken participant on the first page if not already present
    // specifically on the last spot of the first page, pushing everyone else forward
    const firstPageLastSpotIndex = MAX_GRID_TILES - 1;
    const lastSpokenParticipantIndex = participants.findIndex((p) => p.id === lastSpokenParticipant!.id);
    if (lastSpokenParticipantIndex >= 0 && lastSpokenParticipantIndex < MAX_GRID_TILES) {
      // already on the first page
      return participants.slice((pageNumber - 1) * MAX_GRID_TILES, pageNumber * MAX_GRID_TILES);
    }

    const participantsWithoutLastSpoken = participants.filter((p) => p.id !== lastSpokenParticipant.id);
    const gridViewParticipants = [
      ...participantsWithoutLastSpoken.slice(0, firstPageLastSpotIndex),
      lastSpokenParticipant,
      ...participantsWithoutLastSpoken.slice(firstPageLastSpotIndex),
    ].slice((pageNumber - 1) * MAX_GRID_TILES, pageNumber * MAX_GRID_TILES);
    return gridViewParticipants;
  }, [participants, pageNumber, isMobile, lastSpokenParticipant]);

  const highlight = gridViewParticipants.length >= 2;

  useEffect(() => {
    const activeIds = new Set(
      gridViewParticipants.flatMap((p) => p.connections.map((c) => constructConnectionIdentifier(p.id, c)))
    );
    for (const key of fallbackParticipantCache.keys()) {
      if (remoteParticipantsMap.has(key) || !activeIds.has(key)) {
        fallbackParticipantCache.delete(key);
      }
    }
  }, [gridViewParticipants, remoteParticipantsMap, fallbackParticipantCache]);

  const createOrGetFallbackParticipant = useCallback(
    (connectionIdentifier: ConnectionIdentifier, displayName: string) => {
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

  const gridCells = useMemo(() => {
    return gridViewParticipants.map((participant) => {
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
  }, [gridViewParticipants, remoteParticipantsMap, createOrGetFallbackParticipant, direction, highlight]);

  const areGridCellsLoading = gridViewParticipants.length > 1 && gridCells.length === 0;

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

  return <GridContainer videoWidth={videoWidth}>{areGridCellsLoading ? loadingGrids : gridCells}</GridContainer>;
};

export default GridView;
