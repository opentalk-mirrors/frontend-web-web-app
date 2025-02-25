// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext, useSpeakingParticipants } from '@livekit/components-react';
import { Slide, keyframes, styled } from '@mui/material';

import ParticipantWindow from '../../ParticipantWindow';

const breathe = keyframes`
  0% {
    opacity: 0.6;
  }

 100% {
    opacity: 1;
  }
`;

const CinemaCell = styled('div', {
  shouldForwardProp: (prop) => prop !== 'highlight',
})<{ highlight: boolean }>(({ theme, highlight }) => ({
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.borderRadius.card,
  position: 'relative',

  '&::before': {
    content: '""',
    display: 'block',
    height: 0,
    width: 0,
    paddingBottom: 'calc(9/16 * 100%)',
  },

  '&::after': {
    content: '""',
    position: 'absolute',
    display: 'block',
    width: '100%',
    height: '100%',
    inset: '0',
    borderRadius: theme.borderRadius.card,
    boxShadow: `inset 0px 0px 0px ${highlight ? 2 : 0}px ${theme.palette.primary.main}`,
    transition: 'all 300ms linear',
    pointerEvents: 'none',
    animation: highlight ? `${breathe} 1s infinite ease-in-out alternate` : 'none',
  },
}));

type GridCellProps = {
  direction: 'left' | 'right';
  highlight: boolean;
};

const GridCell = (props: GridCellProps) => {
  const participant = useParticipantContext();
  const { direction, highlight } = props;
  const speakingParticipants = useSpeakingParticipants();
  const highlightSpeaker =
    highlight && speakingParticipants.some((speaker) => speaker.identity === participant.identity);

  return (
    <Slide direction={direction} in mountOnEnter unmountOnExit>
      <CinemaCell data-testid="cinemaCell" highlight={highlightSpeaker}>
        <ParticipantWindow />
      </CinemaCell>
    </Slide>
  );
};

export default GridCell;
