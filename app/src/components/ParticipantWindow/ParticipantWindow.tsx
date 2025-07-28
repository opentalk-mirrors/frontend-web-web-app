// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { styled, Box as MuiBox } from '@mui/material';
import { useState } from 'react';

import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { useFullscreenContext } from '../../hooks/useFullscreenContext';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import type { ParticipantId } from '../../types';
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
  const participantId = participant.identity as ParticipantId;

  const fullscreenHandle = useFullscreenContext();
  const displayName = useAppSelector((state) => selectParticipantName(state, participant.identity as ParticipantId));
  const [activeOverlay, setActiveOverlay] = useState<boolean>(!!alwaysShowOverlay);

  const handleDisplayOverlay = (show: boolean) => !alwaysShowOverlay && setActiveOverlay(show);

  return (
    <Container
      onMouseEnter={() => handleDisplayOverlay(true)}
      onMouseLeave={() => handleDisplayOverlay(false)}
      data-testid="ParticipantWindow"
    >
      <ParticipantVideo
        participantId={participantId}
        presenterVideoIsActive={activePresenter}
        isThumbnail={isThumbnail}
      />
      <VideoOverlay participantId={participantId} active={activeOverlay && !fullscreenHandle.active} />
      {!fullscreenHandle.active && (
        <NameTile
          displayName={displayName || participant.name || ''}
          participantId={participantId}
          className="positionBottom"
        />
      )}
      <HandRaisedIndicator participantId={participantId} />
    </Container>
  );
};

export default ParticipantWindow;
