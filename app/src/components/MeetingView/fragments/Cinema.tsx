// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import {
  useAppDispatch,
  useAppSelector,
  useCinemaViewParticipants,
  useConferenceUiVersion,
  useOrderedTiles,
} from '../../../hooks';
import SelfViewAnchorContext from '../../../provider/SelfViewAnchorContext';
import { selectCurrentBreakoutRoomId } from '../../../store/slices/breakoutSlice';
import { fullscreenActions, selectFullscreenActive } from '../../../store/slices/fullscreen/slice';
import { selectLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { selectRoomId } from '../../../store/slices/roomSlice';
import { selectCinemaLayout, selectIsSelfViewMinimized } from '../../../store/slices/uiSlice';
import FloatingReactionsOverlay from '../../FloatingReactions/FloatingReactionsOverlay';
import FullscreenView from '../../FullscreenView';
import GridView from '../../GridView';
import MeetingNotesView from '../../MeetingNotesView';
import SpeakerView from '../../SpeakerView';
import TranscriptionSubtitlesDisplay from '../../TranscriptionSubtitlesDisplay';
import WhiteboardView from '../../WhiteboardView';
import MediaReconnectionDialog from './MediaReconnectionDialog';
import SelfView from './SelfView';

const Container = styled('main', { shouldForwardProp: (prop) => prop !== 'reserveSelfViewSpace' })<{
  reserveSelfViewSpace: boolean;
}>(({ theme, reserveSelfViewSpace }) => ({
  gridArea: 'main',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.typography.pxToRem(16),
  ...(reserveSelfViewSpace && {
    paddingRight: theme.spacing(10),
    [theme.breakpoints.up('sm')]: {
      paddingRight: theme.spacing(15),
    },
  }),
}));

const RoomCinema = () => {
  const { isV2 } = useConferenceUiVersion();
  const [selfViewAnchor, setSelfViewAnchor] = useState<HTMLElement | null>(null);
  const userLayout = useAppSelector(selectCinemaLayout);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);
  const refForFullscreen = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const isSelfViewMinimized = useAppSelector(selectIsSelfViewMinimized);
  const shouldReserveSpaceForSelfView =
    isV2 && !isSelfViewMinimized && !isFullscreenActive && userLayout === LayoutOptions.Grid;
  const participantsState = useCinemaViewParticipants();
  const { pageTiles } = useOrderedTiles(participantsState.cinemaViewParticipants, {
    featuredConnectionIdentifier: participantsState.featuredTile?.connectionIdentifier,
    suspendReordering: userLayout !== LayoutOptions.Grid || isFullscreenActive,
  });

  useEffect(() => {
    if (refForFullscreen.current) {
      dispatch(fullscreenActions.setElement({ element: refForFullscreen.current }));
    }
    return () => {
      dispatch(fullscreenActions.setElement({ element: undefined }));
    };
  }, [dispatch, refForFullscreen]);

  const renderView = () => {
    if (isFullscreenActive) {
      return <FullscreenView />;
    }

    switch (userLayout) {
      case LayoutOptions.Speaker:
        return <SpeakerView {...participantsState} />;
      case LayoutOptions.Whiteboard:
        return <WhiteboardView />;
      case LayoutOptions.MeetingNotes:
        return <MeetingNotesView />;
      case LayoutOptions.Grid:
        return <GridView pageTiles={pageTiles} remoteParticipantsMap={participantsState.remoteParticipantsMap} />;
    }
  };

  return (
    <SelfViewAnchorContext.Provider value={{ anchor: selfViewAnchor, setAnchor: setSelfViewAnchor }}>
      <Container reserveSelfViewSpace={shouldReserveSpaceForSelfView} ref={refForFullscreen}>
        <VisuallyHiddenTitle component="h2" label="videoroom-hidden-heading" />
        {isLivekitUnavailable && <MediaReconnectionDialog />}
        {renderView()}
        <FloatingReactionsOverlay />
        <TranscriptionSubtitlesDisplay />
        {
          // V2-CLEANUP: Remove the isV2 guard after transition to V2
          isV2 && <SelfView />
        }
      </Container>
    </SelfViewAnchorContext.Provider>
  );
};

const Cinema = () => {
  const roomId = useAppSelector(selectRoomId);
  const breakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  return <RoomCinema key={JSON.stringify([roomId, breakoutRoomId])} />;
};

export default Cinema;
