// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext, useRemoteParticipants } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useMemo } from 'react';

import { useAppSelector } from '../../hooks';
import { useGridViewParticipants } from '../../hooks/useGridViewParticipants';
import { selectPaginationDirectionState } from '../../store/slices/uiSlice';
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

const GridView = () => {
  const remoteParticipants = useRemoteParticipants();
  const participants = useGridViewParticipants();
  const direction = useAppSelector(selectPaginationDirectionState);

  // Create a map for quick lookups of remoteParticipants by identity
  const remoteParticipantsMap = useMemo(() => {
    return new Map(remoteParticipants.map((p) => [p.identity, p]));
  }, [remoteParticipants]);

  const videoWidth = useMemo(() => (participants.length <= 4 ? 50 : 33.3), [participants.length]);

  const highlight = participants.length >= 2;

  const gridCells = participants.map((participant) => {
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
