// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, styled } from '@mui/material';
import { Track } from 'livekit-client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, PinIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectParticipantName } from '../../../store/slices/participantsSlice';
import { ParticipantId } from '../../../types';
import { OverlayIconButton } from './OverlayIconButton';
import Statistics from './Statistics';

export type PresenterVideoPosition = 'bottomLeft' | 'upperRight' | 'bottomRight';

const OverlayContainer = styled(Grid)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  fontSize: 'inherit',
  width: '100%',
  padding: theme.spacing(1),
  background: 'transparent',
  zIndex: theme.zIndex.mobileStepper,
}));

const IndicatorContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: theme.spacing(3),
  gap: theme.spacing(1),
}));

const ArrowIcon = styled(BackIcon, {
  shouldForwardProp: (prop) => prop !== 'rotate',
})<{ rotate: string }>(({ rotate }) => ({
  transform: rotate,
}));

export interface PresenterOverlayProps {
  participantId: ParticipantId;
  fullscreenMode?: boolean;
  isVideoPinned: boolean;
  videoPosition: PresenterVideoPosition;
  togglePin: () => void;
  changeVideoPosition: () => void;
}
export const PresenterOverlay = ({
  videoPosition,
  participantId,
  fullscreenMode,
  togglePin,
  changeVideoPosition,
  isVideoPinned,
}: PresenterOverlayProps) => {
  const { t } = useTranslation();

  const videoDescriptor = useMemo<MediaDescriptor>(
    () => ({ participantId, mediaType: Track.Source.Camera }),
    [participantId]
  );
  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));

  const arrowIconDirection = useMemo(() => {
    switch (videoPosition) {
      case 'bottomLeft':
        return 'rotate(135deg)';
      case 'upperRight':
        return 'rotate(-90deg)';
      default:
        return 'rotate(0)';
    }
  }, [videoPosition]);

  return (
    <OverlayContainer data-testid="screenShareVideoOverlay">
      <IndicatorContainer item>
        <OverlayIconButton onClick={changeVideoPosition} aria-label={t('indicator-change-position')} color="secondary">
          <ArrowIcon rotate={arrowIconDirection} />
        </OverlayIconButton>
        <Statistics descriptor={videoDescriptor} disablePopoverPortal={fullscreenMode} />
        <OverlayIconButton
          onClick={togglePin}
          translate="no"
          color={isVideoPinned ? 'primary' : 'secondary'}
          aria-label={t('indicator-pinned', {
            participantName: displayName || '',
          })}
        >
          <PinIcon />
        </OverlayIconButton>
      </IndicatorContainer>
    </OverlayContainer>
  );
};
