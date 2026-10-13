// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled, Box } from '@mui/material';

import { useAppSelector } from '../../hooks';
import { selectParticipantReaction } from '../../store/slices/reactionSlice';
import type { ParticipantId } from '../../types';
import { REACTION_EMOJI_DISPLAY } from '../../types/reaction';

const popIn = keyframes`
  0% { transform: scale(0) }
  50% { transform: scale(1.2) }
  100% { transform: scale(1) }
`;

const ReactionContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'display',
})<{ display?: boolean }>(({ display }) => ({
  width: 'clamp(24px, 10cqi, 48px)',
  height: 'clamp(24px, 10cqi, 48px)',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  userSelect: 'none',
  fontSize: 'clamp(0.875rem, 5cqi, 1.75rem)',
  transform: `scale(${display ? 1 : 0})`,
  transition: `transform 300ms ${display ? 'ease-out' : 'ease-in'}`,
  visibility: display ? 'visible' : 'hidden',
  animation: display ? `${popIn} 400ms ease-out` : 'none',
}));

const ReactionBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

type ReactionIndicatorProps = {
  participantId: ParticipantId;
  className?: string;
};

const ReactionIndicator = ({ participantId, className }: ReactionIndicatorProps) => {
  const reaction = useAppSelector((state) => selectParticipantReaction(state, participantId));

  return (
    <ReactionBox aria-live="polite" className={className}>
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
