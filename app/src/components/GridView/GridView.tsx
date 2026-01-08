// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { Participant, RemoteParticipant } from 'livekit-client';
import { useMemo } from 'react';

import { MAX_GRID_TILES_DESKTOP, MAX_GRID_TILES_MOBILE } from '../../constants';
import { useAppSelector } from '../../hooks';
import { CinemaViewParticipant, useCinemaViewParticipants } from '../../hooks/useCinemaViewParticipants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  PaginationDirection,
  selectPaginationDirectionState,
  selectPaginationPageState,
} from '../../store/slices/uiSlice';
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
  const videoWidth = useMemo(() => (participants.length <= 4 ? 50 : 33.3), [participants.length]);
  const isMobile = useIsMobile();
  const lastSpokenParticipant = useMemo(() => {
    let lastSpokenParticipant: CinemaViewParticipant | undefined;
    for (const participant of participants) {
      if (!participant.lastSpokeAt) {
        continue;
      }
      if (
        !lastSpokenParticipant ||
        !lastSpokenParticipant.lastSpokeAt ||
        participant.lastSpokeAt.getTime() > lastSpokenParticipant.lastSpokeAt.getTime()
      ) {
        lastSpokenParticipant = participant;
      }
    }

    return lastSpokenParticipant;
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

  const gridCells = gridViewParticipants.map((participant) => {
    // We will use participant data from the controller until we get the more preferable data from the livekit server
    const participantData =
      remoteParticipantsMap.get(participant.id) ||
      new Participant(participant.id, participant.id, participant.displayName);

    return (
      <ParticipantContext.Provider value={participantData} key={participant.id}>
        <GridCell direction={direction} highlight={highlight} />
      </ParticipantContext.Provider>
    );
  });

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
