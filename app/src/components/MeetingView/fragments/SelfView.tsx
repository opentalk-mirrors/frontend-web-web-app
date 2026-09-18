// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { TrackReference } from '@livekit/components-core';
import { VideoTrack } from '@livekit/components-react';
import { useLocalParticipant } from '@livekit/components-react';
import { Box, Portal, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NameTile } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { useSelfViewAnchor } from '../../../provider/SelfViewAnchorContext';
import { selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';

const Video = styled(VideoTrack, {
  shouldForwardProp: (prop) => !['mirroringEnabled'].includes(prop as string),
})<{ mirroringEnabled?: boolean }>(({ mirroringEnabled }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: mirroringEnabled ? 'scale(-1,1)' : 'none',
}));

const SelfViewNameTile = styled(NameTile)(({ theme }) => ({
  position: 'absolute',
  borderRadius: theme.borderRadius.small,
  bottom: theme.spacing(0.5),
  left: theme.spacing(0.5),
  fontSize: 'clamp(0.5rem, 7cqi, 0.9rem)',
  '& .MuiTypography-root': { fontSize: 'inherit' },
}));

const SelfViewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  borderRadius: theme.borderRadius.medium,
  maskImage: 'linear-gradient(black, white)',
  containerType: 'inline-size',
  zIndex: theme.zIndex.fab,
  [theme.breakpoints.down('md')]: {
    width: '93px',
    height: '140px',
  },
  [theme.breakpoints.up('md')]: {
    width: '120px',
    height: '80px',
  },
  [theme.breakpoints.up('lg')]: {
    width: '150px',
    height: '100px',
  },
}));

const SelfView = () => {
  const { t } = useTranslation();
  const { cameraTrack, localParticipant, isCameraEnabled } = useLocalParticipant();
  const { anchor } = useSelfViewAnchor();

  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);

  const videoTrackRef: TrackReference | undefined = cameraTrack && {
    participant: localParticipant,
    publication: cameraTrack,
    source: cameraTrack.source,
  };

  if (!isCameraEnabled || !videoTrackRef) {
    return null;
  }

  return (
    // E.g. in case of speaker view layout we need to portal self view to a different location
    <Portal container={anchor} disablePortal={!anchor}>
      <SelfViewContainer data-testid="selfview-container">
        <Video trackRef={videoTrackRef} mirroringEnabled={mirroredVideoEnabled} />
        <SelfViewNameTile displayName={t('global-you')} showIcons={false} />
      </SelfViewContainer>
    </Portal>
  );
};

export default SelfView;
