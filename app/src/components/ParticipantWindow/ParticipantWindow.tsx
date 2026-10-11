// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext, useRemoteParticipant } from '@livekit/components-react';
import { Box as MuiBox, styled } from '@mui/material';
import { ParticipantEvent } from 'livekit-client';
import { useState } from 'react';

import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { selectFullscreenActive } from '../../store/slices/fullscreen/slice';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import type { ConnectionIdentifier, MediaSessionType } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';
import ReactionIndicator from '../ReactionIndicator';
import ParticipantHandRaisedIndicator from './fragments/ParticipantHandRaisedIndicator';
import ParticipantVideo from './fragments/ParticipantVideo';
import VideoOverlay from './fragments/VideoOverlay';

const PositionedReactionIndicator = styled(ReactionIndicator)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
  bottom: theme.spacing(1),
}));

const Container = styled(MuiBox)(({ theme }) => ({
  containerType: 'inline-size',

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
  flex: 1,
}));

interface ParticipantWindowProps {
  activePresenter?: boolean;
  alwaysShowOverlay?: boolean;
  isThumbnail?: boolean;
  source: MediaSessionType;
}

const ParticipantWindow = ({ source, activePresenter, alwaysShowOverlay, isThumbnail }: ParticipantWindowProps) => {
  const participant = useParticipantContext();
  const connectionIdentifier = participant.identity as ConnectionIdentifier;
  const remoteParticipant = useRemoteParticipant(connectionIdentifier, {
    updateOnlyOn: [
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
    ],
  });
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
        source={source}
      />
      <VideoOverlay
        connectionIdentifier={connectionIdentifier}
        source={source}
        active={activeOverlay && !isFullscreenActive}
      />
      {!isFullscreenActive && (
        <NameTile
          displayName={displayName || participant.name || ''}
          videoOn={remoteParticipant?.isCameraEnabled}
          audioOn={remoteParticipant?.isMicrophoneEnabled}
          className="positionBottom"
        />
      )}
      <ParticipantHandRaisedIndicator participantId={participantId} />
      <PositionedReactionIndicator participantId={participantId} />
    </Container>
  );
};

export default ParticipantWindow;
