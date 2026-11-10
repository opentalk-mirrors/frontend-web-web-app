// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';
import { RemoteParticipant } from 'livekit-client';
import { useMemo } from 'react';

import { useConferenceUiVersion } from '../../../hooks';
import type { CinemaViewParticipant } from '../../../hooks/useCinemaViewParticipants';
import { useSelfViewAnchor } from '../../../provider/SelfViewAnchorContext';
import TileParticipantProvider from '../../../provider/TileParticipantProvider';
import { TileIdentifier } from '../../../types';
import { constructConnectionIdentifier } from '../../../utils/constructConnectionIdentifier';
import ParticipantWindow from '../../ParticipantWindow';

export interface SpeakerWindowProps {
  speakerWindowWidth?: number;
  speakerWindowHeight?: number;
  cinemaViewParticipants: CinemaViewParticipant[];
  remoteParticipantsMap: Map<string, RemoteParticipant>;
  featuredTile: TileIdentifier | undefined;
}

const Container = styled('div', {
  shouldForwardProp: (prop) => !['width', 'height'].includes(prop as string),
})<{ width: number; height: number }>(({ theme, width, height }) => ({
  position: 'relative',
  borderRadius: theme.borderRadius.medium,
  overflow: 'hidden',
  width,
  height,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const SelfViewContainer = styled(Box)({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

const SpeakerWindow = ({
  speakerWindowWidth,
  speakerWindowHeight,
  cinemaViewParticipants,
  remoteParticipantsMap,
  featuredTile,
}: SpeakerWindowProps) => {
  const { isV2 } = useConferenceUiVersion();
  const { setAnchor } = useSelfViewAnchor();

  const selectedParticipant =
    featuredTile &&
    cinemaViewParticipants.find(
      (p) =>
        p.connections[0] && constructConnectionIdentifier(p.id, p.connections[0]) === featuredTile.connectionIdentifier
    );

  // Fit a 16:9 box entirely within the available area (contain), preserving the
  // aspect ratio so the video is never cropped or distorted when the window is resized.
  const { width, height } = useMemo(() => {
    if (speakerWindowWidth && speakerWindowHeight) {
      const aspectRatio = 16 / 9;
      const boxHeight = Math.min(speakerWindowWidth / aspectRatio, speakerWindowHeight);
      const boxWidth = boxHeight * aspectRatio;
      return { width: boxWidth, height: boxHeight };
    }
    return { width: 1, height: 1 };
  }, [speakerWindowWidth, speakerWindowHeight]);

  return (
    <Container width={width} height={height}>
      {featuredTile && (
        <TileParticipantProvider
          connectionIdentifier={featuredTile.connectionIdentifier}
          displayName={selectedParticipant?.displayName ?? ''}
          remoteParticipant={remoteParticipantsMap.get(featuredTile.connectionIdentifier)}
        >
          <ParticipantWindow alwaysShowOverlay source={featuredTile.source} />
        </TileParticipantProvider>
      )}
      {
        // V2-CLEANUP: Remove the isV2 guard after transition to V2
        // Provide a new anchor to self view, as we need it here in contrast to other layout
        isV2 && <SelfViewContainer ref={setAnchor} />
      }
    </Container>
  );
};

export default SpeakerWindow;
