// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { Participant, RemoteParticipant } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { GRID_SIZES, GRID_VIDEO_WIDTHS } from '../../constants';
import { useAppSelector } from '../../hooks';
import { CinemaViewParticipant, useCinemaViewParticipants } from '../../hooks/useCinemaViewParticipants';
import { useCinemaViewParticipantsOrdering } from '../../hooks/useCinemaViewParticipantsOrdering';
import { PaginationDirection, selectPaginationDirectionState } from '../../store/slices/uiSlice';
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
  const { cinemaViewParticipants, remoteParticipantsMap } = useCinemaViewParticipants();
  const participants = useCinemaViewParticipantsOrdering(cinemaViewParticipants);
  const [fallbackParticipantCache] = useState(() => new Map<ConnectionIdentifier, Participant>());
  const direction = useAppSelector(selectPaginationDirectionState);

  const videoWidthIndex = GRID_SIZES.findIndex((videoWidth) => participants.length <= videoWidth) ?? 0;
  const videoWidth = GRID_VIDEO_WIDTHS[videoWidthIndex];
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
    return participants.map((participant) => {
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
  }, [participants, remoteParticipantsMap, createOrGetFallbackParticipant, direction, highlight]);

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

  return <GridContainer videoWidth={videoWidth}>{areGridCellsLoading ? loadingGrids : gridCells}</GridContainer>;
};

export default GridView;
