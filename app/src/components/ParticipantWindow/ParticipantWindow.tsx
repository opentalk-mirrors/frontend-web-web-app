// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { Box as MuiBox, styled } from '@mui/material';
import { useState } from 'react';

import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { selectFullscreenActive } from '../../store/slices/fullscreen/slice';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import type { ConnectionIdentifier } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';
import HandRaisedIndicator from './fragments/HandRaisedIndicator';
import ParticipantVideo from './fragments/ParticipantVideo';
import VideoOverlay from './fragments/VideoOverlay';

const Container = styled(MuiBox)(({ theme }) => ({
  position: 'relative',
  width: 'inherit',
  height: 'inherit',
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.background.customPaper.primary,
}));

interface ParticipantWindowProps {
  activePresenter?: boolean;
  alwaysShowOverlay?: boolean;
  isThumbnail?: boolean;
}

const ParticipantWindow = ({ activePresenter, alwaysShowOverlay, isThumbnail }: ParticipantWindowProps) => {
  const participant = useParticipantContext();
  const connectionIdentifier = participant.identity as ConnectionIdentifier;
  const { participantId } = deconstructConnectionIdentifier(connectionIdentifier);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);

  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));
  const [activeOverlay, setActiveOverlay] = useState<boolean>(!!alwaysShowOverlay);

  const handleDisplayOverlay = (show: boolean) => !alwaysShowOverlay && setActiveOverlay(show);

  return (
    <Container
      onMouseEnter={() => handleDisplayOverlay(true)}
      onMouseLeave={() => handleDisplayOverlay(false)}
      data-testid="ParticipantWindow"
    >
      <ParticipantVideo
        connectionIdentifier={connectionIdentifier}
        presenterVideoIsActive={activePresenter}
        isThumbnail={isThumbnail}
      />
      <VideoOverlay connectionIdentifier={connectionIdentifier} active={activeOverlay && !isFullscreenActive} />
      {!isFullscreenActive && (
        <NameTile
          displayName={displayName || participant.name || ''}
          connectionIdentifier={connectionIdentifier}
          className="positionBottom"
        />
      )}
      <HandRaisedIndicator participantId={participantId} />
    </Container>
  );
};

export default ParticipantWindow;
