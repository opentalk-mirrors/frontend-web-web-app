// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Popover, popoverClasses, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
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
  ReactionEmoji.Heart,
  ReactionEmoji.ThumbsUp,
  ReactionEmoji.Tada,
  ReactionEmoji.Clap,
  ReactionEmoji.Joy,
  ReactionEmoji.OpenMouth,
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
  userSelect: 'none',
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

const ReactionPopover = ({ anchorEl, open, onClose, onSelect }: ReactionPopoverProps) => {
  const fullscreenElement = useAppSelector(selectFullscreenElement);

  return (
    <ArrowPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      container={fullscreenElement}
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
};

export default ReactionPopover;
