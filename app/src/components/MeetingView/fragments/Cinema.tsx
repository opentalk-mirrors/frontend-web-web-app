// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useEffect, useRef } from 'react';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { fullscreenActions, selectFullscreenActive } from '../../../store/slices/fullscreen/slice';
import { selectLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { selectCinemaLayout } from '../../../store/slices/uiSlice';
import FullscreenView from '../../FullscreenView';
import GridView from '../../GridView';
import MeetingNotesView from '../../MeetingNotesView';
import SpeakerView from '../../SpeakerView';
import WhiteboardView from '../../Whiteboard';
import MediaReconnectionDialog from './MediaReconnectionDialog';

const Container = styled('main')({
  gridArea: 'main',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
});

const Cinema = () => {
  const userLayout = useAppSelector(selectCinemaLayout);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);
  const refForFullscreen = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (refForFullscreen.current) {
      dispatch(fullscreenActions.setElement({ element: refForFullscreen.current }));
    }
    return () => {
      dispatch(fullscreenActions.setElement({ element: undefined }));
    };
  }, [refForFullscreen]);

  const renderView = () => {
    if (isFullscreenActive) {
      return <FullscreenView />;
    }

    switch (userLayout) {
      case LayoutOptions.Speaker:
        return <SpeakerView />;
      case LayoutOptions.Whiteboard:
        return <WhiteboardView />;
      case LayoutOptions.MeetingNotes:
        return <MeetingNotesView />;
      case LayoutOptions.Grid:
        return <GridView />;
    }
  };

  return (
    <Container ref={refForFullscreen}>
      <VisuallyHiddenTitle component="h2" label="videoroom-hidden-heading" />
      {isLivekitUnavailable && <MediaReconnectionDialog />}
      {renderView()}
    </Container>
  );
};

export default Cinema;
