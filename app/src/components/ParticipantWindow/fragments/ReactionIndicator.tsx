// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled, Box as MuiBox } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import { selectParticipantReaction } from '../../../store/slices/reactionSlice';
import type { ParticipantId } from '../../../types';
import { REACTION_EMOJI_DISPLAY } from '../../../types/reaction';

const popIn = keyframes`
  0% { transform: scale(0) }
  50% { transform: scale(1.2) }
  100% { transform: scale(1) }
`;

const ReactionContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'display',
})<{ display?: boolean }>(({ display }) => ({
  width: 'clamp(24px, 10cqi, 48px)',
  height: 'clamp(24px, 10cqi, 48px)',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  fontSize: '1.5rem',
  transform: `scale(${display ? 1 : 0})`,
  transition: `transform 300ms ${display ? 'ease-out' : 'ease-in'}`,
  visibility: display ? 'visible' : 'hidden',
  animation: display ? `${popIn} 400ms ease-out` : 'none',
}));

const ReactionBox = styled(MuiBox)({
  position: 'absolute',
  left: 5,
  bottom: 5,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
});

const ReactionIndicator = ({ participantId }: { participantId: ParticipantId }) => {
  const reaction = useAppSelector((state) => selectParticipantReaction(state, participantId));

  return (
    <ReactionBox aria-live="polite">
      {reaction && (
        <ReactionContainer
          key={`${reaction.timestamp}-${reaction.reaction}`}
          display
          translate="no"
          aria-label={reaction.reaction}
        >
          {REACTION_EMOJI_DISPLAY[reaction.reaction]}
        </ReactionContainer>
      )}
    </ReactionBox>
  );
};

export default ReactionIndicator;
