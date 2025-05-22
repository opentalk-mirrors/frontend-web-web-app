// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, Popover, styled } from '@mui/material';
import { useState } from 'react';

import { VisuallyHiddenTitle } from '../../commonComponents';

const PopoverIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.8),
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(25),
  },
}));

const PopoverContainer = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    backgroundColor: theme.palette.background.voteResult,
    padding: theme.spacing(1),
  },
  '& .MuiTypography-root': {
    pointerEvents: 'none',
  },
}));

interface PopoverButtonProps {
  icon: React.ReactNode;
  content: React.ReactNode;
  buttonLabel: string;
  titleLabel: string;
  popoverTitleId: string;
}

const PopoverButton = ({ icon, content, buttonLabel, titleLabel, popoverTitleId }: PopoverButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <PopoverIconButton
        onClick={open ? handlePopoverClose : handlePopoverOpen}
        aria-label={buttonLabel}
        onKeyDown={handleKeyDown}
      >
        {icon}
      </PopoverIconButton>
      <PopoverContainer
        aria-labelledby={popoverTitleId}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
      >
        <VisuallyHiddenTitle label={titleLabel} component="h1" id={popoverTitleId} />
        {content}
      </PopoverContainer>
    </>
  );
};

export default PopoverButton;
