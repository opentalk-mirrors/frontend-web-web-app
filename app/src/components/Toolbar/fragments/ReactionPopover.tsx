// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Popover, popoverClasses, styled } from '@mui/material';

import { REACTION_EMOJI_DISPLAY, ReactionEmoji } from '../../../types/reaction';

const ArrowPopover = styled(Popover)(({ theme }) => ({
  [`& .${popoverClasses.paper}`]: {
    overflow: 'visible',
    marginTop: theme.spacing(-1),
    borderRadius: theme.borderRadius.large,

    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -6,
      left: '50%',
      width: 12,
      height: 12,
      transform: 'translateX(-50%)',
      backgroundColor: 'inherit',
      clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
    },
  },
}));

const EMOJI_ORDER: ReactionEmoji[] = [
  ReactionEmoji.ThumbsUp,
  ReactionEmoji.Clap,
  ReactionEmoji.Heart,
  ReactionEmoji.Tada,
  ReactionEmoji.OpenMouth,
  ReactionEmoji.Joy,
  ReactionEmoji.SmilingFaceWithTear,
  ReactionEmoji.ThumbsDown,
];

const EmojiRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
}));

const EmojiButton = styled('button')(({ theme }) => ({
  all: 'unset',
  cursor: 'pointer',
  fontSize: '1.5rem',
  lineHeight: 1,
  padding: theme.spacing(0.5),
  borderRadius: theme.borderRadius.medium,
  transition: 'transform 0.1s ease',
  '&:hover': {
    transform: 'scale(1.15)',
  },
  '&:focus-visible': {
    outline: theme.palette.focus.outline,
  },
}));

interface ReactionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: ReactionEmoji) => void;
}

const ReactionPopover = ({ anchorEl, open, onClose, onSelect }: ReactionPopoverProps) => (
  <ArrowPopover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <EmojiRow role="group" aria-label="Reactions">
      {EMOJI_ORDER.map((emoji) => (
        <EmojiButton key={emoji} onClick={() => onSelect(emoji)} aria-label={emoji} type="button">
          {REACTION_EMOJI_DISPLAY[emoji]}
        </EmojiButton>
      ))}
    </EmojiRow>
  </ArrowPopover>
);

export default ReactionPopover;
