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
import { ParticipantId, VideoSetting } from '../../../types';
import { AvatarContainer } from './AvatarContainer';
import { PresenterVideoPosition } from './PresenterOverlay';
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
  background: theme.palette.background.video,

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
  participantId: ParticipantId;
  isVideoPinned: boolean;
  videoPosition: PresenterVideoPosition;
  togglePin: () => void;
  changeVideoPosition: () => void;
  isThumbnail?: boolean;
}

const ScreenPresenterVideo = React.forwardRef<HTMLDivElement, ScreenPresenterVideoProps>(
  ({ participantId, isVideoPinned, togglePin, videoPosition, changeVideoPosition, isThumbnail }, ref) => {
    const videoDescriptor = useMemo<MediaDescriptor>(
      () => ({ participantId, mediaType: Track.Source.Camera }),
      [participantId]
    );
    const [mouseOver, setMouseOver] = useState<boolean>(false);
    const qualityCap = useAppSelector(selectQualityCap);
    const participant = useParticipantContext();
    const showVideo = participant.isCameraEnabled && qualityCap !== VideoSetting.Off;

    const videoTile = useMemo(() => {
      return showVideo ? (
        <RemoteVideo descriptor={videoDescriptor} />
      ) : (
        <AvatarContainer participantId={videoDescriptor.participantId} />
      );
    }, [showVideo, videoDescriptor]);

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

export default ScreenPresenterVideo;
