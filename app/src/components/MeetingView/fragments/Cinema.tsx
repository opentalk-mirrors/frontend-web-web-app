// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppSelector } from '../../../hooks';
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import { selectCinemaLayout } from '../../../store/slices/uiSlice';
import FullscreenView from '../../FullscreenView';
import GridView from '../../GridView';
import MeetingNotesView from '../../MeetingNotesView';
import SpeakerView from '../../SpeakerView';
import WhiteboardView from '../../Whiteboard';

const Container = styled('main')({
  gridArea: 'main',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
});

const Cinema = () => {
  const userLayout = useAppSelector(selectCinemaLayout);
  const fullscreenHandle = useFullscreenContext();

  const renderView = () => {
    if (fullscreenHandle.active) {
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
    <Container ref={fullscreenHandle.node}>
      <VisuallyHiddenTitle component="h2" label="videoroom-hidden-heading" />
      {renderView()}
    </Container>
  );
};

export default Cinema;
