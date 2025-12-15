// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { styled } from '@mui/material';
import { Track } from 'livekit-client';
import React, { useState, useMemo } from 'react';

import { useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectQualityCap } from '../../../store/slices/livekitSlice';
import { PresenterVideoPosition } from '../../../store/slices/uiSlice';
import { ConnectionIdentifier, VideoSetting } from '../../../types';
import { deconstructIdentity } from '../../../utils/deconstructIdentity';
import { AvatarContainer } from './AvatarContainer';
import { PresenterOverlay } from './PresenterOverlay';
import RemoteVideo from './RemoteVideo';

const SharedPresenterVideo = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '18%',
  maxHeight: '20%',
  overflow: 'hidden',
  position: 'absolute',
  borderRadius: theme.borderRadius.medium,
  background: theme.palette.common.black,

  '&.bottomLeft': {
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
  '&.upperRight': {
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  '&.bottomRight': {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },

  '&::before': {
    content: '""',
    paddingBottom: 'calc(9/16 * 100%)',
  },
}));

interface ScreenPresenterVideoProps {
  connectionIdentifier: ConnectionIdentifier;
  isVideoPinned: boolean;
  videoPosition: PresenterVideoPosition;
  togglePin: () => void;
  changeVideoPosition: () => void;
  isThumbnail?: boolean;
}

const ScreenPresenterVideo = React.forwardRef<HTMLDivElement, ScreenPresenterVideoProps>(
  ({ connectionIdentifier, isVideoPinned, togglePin, videoPosition, changeVideoPosition, isThumbnail }, ref) => {
    const { participantId } = deconstructIdentity(connectionIdentifier);
    const videoDescriptor = useMemo<MediaDescriptor>(
      () => ({ connectionIdentifier, mediaType: Track.Source.Camera }),
      [connectionIdentifier]
    );
    const [mouseOver, setMouseOver] = useState<boolean>(false);
    const qualityCap = useAppSelector(selectQualityCap);
    const participant = useParticipantContext();
    const showVideo = participant.isCameraEnabled && qualityCap !== VideoSetting.Off;

    const videoTile = useMemo(() => {
      return showVideo ? (
        <RemoteVideo descriptor={videoDescriptor} />
      ) : (
        <AvatarContainer participantId={participantId} />
      );
    }, [showVideo, videoDescriptor, participantId]);

    return (
      <SharedPresenterVideo
        ref={ref}
        className={videoPosition}
        data-testid="sharedPresenterVideo"
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
      >
        {mouseOver && !isThumbnail && (
          <PresenterOverlay
            videoPosition={videoPosition}
            participantId={participantId}
            isVideoPinned={isVideoPinned}
            togglePin={togglePin}
            changeVideoPosition={changeVideoPosition}
          />
        )}
        {videoTile}
      </SharedPresenterVideo>
    );
  }
);
ScreenPresenterVideo.displayName = 'ScreenPresenterVideo';

export default ScreenPresenterVideo;
