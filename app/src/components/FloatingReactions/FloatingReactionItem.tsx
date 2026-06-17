// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import { FLOATING_REACTION_DURATION } from '../../store/slices/reactionSlice';
import { selectOurUuid } from '../../store/slices/userSlice';
import type { ParticipantId } from '../../types';
import { REACTION_EMOJI_DISPLAY, ReactionEmoji } from '../../types/reaction';

/* Float upward across the overlay column while staying fully visible until ~2s,
 * then fade out so the reaction is invisible by ~3s. The fade completes before
 * the emoji reaches the top of the overlay so it never appears cut off.
 * Animating `transform` (rather than `bottom`) keeps the motion on the compositor
 * so an uncapped number of simultaneous reactions stays smooth. The container
 * fills the overlay height, so translateY(-100%) travels the full column. */
const floatAndFade = keyframes`
  0% { transform: translate(-50%, 0%); opacity: 0; }
  8% { opacity: 1; }
  66% { opacity: 1; }
  90% { opacity: 0; }
  100% { transform: translate(-50%, -100%); opacity: 0; }
`;

const popIn = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const Container = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(0.25),
  transform: 'translateX(-50%)',
  userSelect: 'none',
  animation: `${floatAndFade} ${FLOATING_REACTION_DURATION}ms linear forwards`,
  willChange: 'transform, opacity',
}));

const Emoji = styled('span')({
  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
  lineHeight: 1,
  animation: `${popIn} 400ms ease-out`,
});

const Label = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  maxWidth: '10ch',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  // Self-contained contrast pill so the label stays legible over any
  // background (bright light-theme surfaces, video tiles, etc.) regardless
  // of the user-selected color theme.
  color: theme.palette.common.white,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius,
}));

type FloatingReactionItemProps = {
  participantId: ParticipantId;
  reaction: ReactionEmoji;
};

const FloatingReactionItem = ({ participantId, reaction }: FloatingReactionItemProps) => {
  const { t } = useTranslation();
  const ourUuid = useAppSelector(selectOurUuid);
  const participantName = useAppSelector((state) => selectParticipantName(state, participantId));

  // Stable random horizontal position within the overlay, picked once on mount.
  const [leftPercent] = useState(() => 10 + Math.random() * 80);

  const isOwnReaction = ourUuid === participantId;
  const label = isOwnReaction ? t('reaction-floating-self-label') : (participantName ?? '');

  return (
    <Container style={{ left: `${leftPercent}%` }}>
      <Emoji translate="no" aria-label={reaction}>
        {REACTION_EMOJI_DISPLAY[reaction]}
      </Emoji>
      <Label>{label}</Label>
    </Container>
  );
};

export default FloatingReactionItem;
