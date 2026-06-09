// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { reactCommand } from '../../../api/types/outgoing/reaction';
import ReactionOffIcon from '../../../assets/icons/ReactionOffIcon';
import ReactionOnIcon from '../../../assets/icons/ReactionOnIcon';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectReactionAllowed } from '../../../store/slices/reactionSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { ReactionEmoji } from '../../../types/reaction';
import ReactionPopover from './ReactionPopover';
import ToolbarButton from './ToolbarButton';

const ReactionButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isReactionAllowed = useAppSelector(selectReactionAllowed);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const isDisabled = !isReactionAllowed || isRoomDeleted;

  const handleClick = (_event?: MouseEvent) => {
    setAnchorEl(buttonRef.current);
    setPopoverOpen((prev) => !prev);
  };

  const handleClose = () => {
    setPopoverOpen(false);
    buttonRef.current?.focus();
  };

  const handleSelect = (emoji: ReactionEmoji) => {
    setPopoverOpen(false);
    dispatch(reactCommand.action({ reaction: emoji }));
  };

  const renderTooltipText = () => {
    if (!isReactionAllowed) {
      return t('toolbar-button-reactions-disabled');
    }
    return t('toolbar-button-send-reaction-tooltip-title');
  };

  useEffect(() => {
    if (popoverOpen) {
      // Close popover when the button becomes disabled (e.g. permissions revoked).
      // Safe: only runs on isDisabled transitions, not on every render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPopoverOpen(false);
    }
    // Safe: popover is not a dependency, we can safely ignore it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled]);

  return (
    <>
      <ToolbarButton
        ref={buttonRef}
        tooltipTitle={renderTooltipText()}
        active={popoverOpen && isReactionAllowed}
        onClick={handleClick}
        data-testid="toolbarReactionButton"
        disabled={isDisabled}
        id={ToolbarButtonIds.Reaction}
        aria-expanded={popoverOpen && isReactionAllowed}
      >
        {isReactionAllowed ? <ReactionOnIcon /> : <ReactionOffIcon />}
      </ToolbarButton>
      <ReactionPopover
        anchorEl={anchorEl}
        open={popoverOpen && isReactionAllowed}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </>
  );
};

export default ReactionButton;
