// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext, useSpeakingParticipants } from '@livekit/components-react';
import { Slide, keyframes, styled, Box } from '@mui/material';
import { Track } from 'livekit-client';

import { MediaSessionType } from '../../../types';
import ParticipantWindow from '../../ParticipantWindow';
import { GRID_CELL_WIDTH } from '../gridLayout';

const breathe = keyframes`
  0% {
    opacity: 0.6;
  }

 100% {
    opacity: 1;
  }
`;

const CinemaCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'highlight',
})<{ highlight: boolean }>(({ theme, highlight }) => ({
  width: GRID_CELL_WIDTH,
  height: 'auto',
  aspectRatio: '16 / 9',
  flex: '0 0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  // Stretch so the child fills the aspect-ratio height; it inherits height from here and
  // would otherwise collapse to its content because the cell has no definite pixel height.
  alignItems: 'stretch',
  overflow: 'hidden',
  borderRadius: theme.borderRadius.card,
  position: 'relative',

  '&::after': {
    content: '""',
    position: 'absolute',
    display: 'block',
    width: '100%',
    height: '100%',
    inset: '0',
    borderRadius: theme.borderRadius.card,
    boxShadow: `inset 0px 0px 0px ${highlight ? 2 : 0}px ${theme.palette.secondary.main}`,
    transition: 'all 300ms linear',
    pointerEvents: 'none',
    animation: highlight ? `${breathe} 1s infinite ease-in-out alternate` : 'none',
  },
}));

type GridCellProps = {
  direction: 'left' | 'right';
  highlight: boolean;
  source: MediaSessionType;
};

const GridCell = (props: GridCellProps) => {
  const participant = useParticipantContext();
  const { direction, highlight, source } = props;
  const speakingParticipants = useSpeakingParticipants();
  const isScreenShare = source === Track.Source.ScreenShare;
  const highlightSpeaker =
    highlight && !isScreenShare && speakingParticipants.some((speaker) => speaker.identity === participant.identity);

  return (
    <Slide direction={direction} in mountOnEnter unmountOnExit>
      <CinemaCell data-testid="cinemaCell" highlight={highlightSpeaker}>
        <ParticipantWindow source={source} />
      </CinemaCell>
    </Slide>
  );
};

export default GridCell;
