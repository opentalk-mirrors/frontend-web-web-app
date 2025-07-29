// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext, useRemoteParticipants } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { Participant } from 'livekit-client';
import { useEffect, useMemo, useRef } from 'react';

import { MAX_GRID_TILES_DESKTOP } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectParticipantsTotal, selectSlicedParticipants } from '../../store/slices/participantsSlice';
import { selectGridViewOrder, selectPaginationPageState, setVisibleParticipantIds } from '../../store/slices/uiSlice';
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
  const dispatch = useAppDispatch();
  const remoteParticipants = useRemoteParticipants();
  const selectedPage = useAppSelector(selectPaginationPageState);
  const gridViewOrder = useAppSelector(selectGridViewOrder);
  const totalParticipants = useAppSelector(selectParticipantsTotal);
  const slicedParticipants = useAppSelector((state) =>
    selectSlicedParticipants(state, gridViewOrder, selectedPage, MAX_GRID_TILES_DESKTOP)
  );
  const slicedParticipantIds = slicedParticipants.map((participant) => participant.id);

  useEffect(() => {
    dispatch(setVisibleParticipantIds(slicedParticipantIds));
  }, [slicedParticipantIds, dispatch]);

  // Create a map for quick lookups of remoteParticipants by identity
  const remoteParticipantsMap = useMemo(() => {
    return new Map(remoteParticipants.map((p) => [p.identity, p]));
  }, [remoteParticipants]);

  const lastPage = useRef<number>(0);

  const videoWidth = useMemo(() => (slicedParticipants.length <= 4 ? 50 : 33.3), [slicedParticipants.length]);

  const direction = useMemo(() => {
    const dir = selectedPage > lastPage.current ? 'left' : 'right';
    lastPage.current = selectedPage;
    return dir;
  }, [selectedPage]);

  const highlight = slicedParticipants.length >= 2;

  const gridCells = useMemo(
    () =>
      slicedParticipants.map((participant) => {
        // We will use participant data from the controller until we get the more preferable data from the livekit server
        const participantData =
          remoteParticipantsMap.get(participant.id) ||
          new Participant(participant.id, participant.id, participant.displayName);

        return (
          <ParticipantContext.Provider value={participantData} key={participant.id}>
            <GridCell direction={direction} highlight={highlight} />
          </ParticipantContext.Provider>
        );
      }),
    [remoteParticipantsMap, slicedParticipants, direction, highlight]
  );

  const areGridCellsLoading = totalParticipants > 1 && gridCells.length === 0;

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
