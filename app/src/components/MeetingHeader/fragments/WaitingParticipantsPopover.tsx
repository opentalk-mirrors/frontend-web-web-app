// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Badge, Popover } from '@mui/material';
import { keyframes } from '@mui/system';
import { useEffect, useState } from 'react';

import { SpeakerQueueIcon } from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectParticipantsWaitingCount } from '../../../store/slices/participantsSlice';
import WaitingParticipantsList from '../../WaitingParticipantsList';

const blink = keyframes`from { opacity: 1; } to { opacity: 0.3; }`;

const WaitingListButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.background.video,
  borderRadius: '0.25rem',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    color: theme.palette.secondary.contrastText,
    background: theme.palette.primary.main,
    animation: `${blink} 1s ease alternate`,
    animationIterationCount: 'infinite',
  },
}));

const WaitingParticipantsPopoverRoot = styled(Popover)(({ theme }) => ({
  '.MuiPaper-root': {
    padding: theme.spacing(1, 1, 1, 2),
  },
}));

const WaitingParticipantsPopover = () => {
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

  const participantsInWaitingRoomCount = useAppSelector(selectParticipantsWaitingCount);
  const isWaitingRoomEmpty = participantsInWaitingRoomCount === 0;
  const isExpanded = Boolean(anchorElement);

  //onClose is not called when participants reach 0 so we explicitly reset the anchor
  useEffect(() => {
    if (isWaitingRoomEmpty) {
      setAnchorElement(null);
    }
  }, [participantsInWaitingRoomCount, isWaitingRoomEmpty]);

  if (isWaitingRoomEmpty) {
    return null;
  }

  return (
    <StyledBadge
      badgeContent={participantsInWaitingRoomCount}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <WaitingListButton
        data-testid="waiting-list-button"
        // TODO: define content and add aria-label instead of the testid.
        aria-controls="waiting-list-popover"
        aria-haspopup="true"
        aria-expanded={isExpanded}
        onClick={(event) => setAnchorElement(event.currentTarget)}
      >
        <SpeakerQueueIcon />
      </WaitingListButton>
      <WaitingParticipantsPopoverRoot
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={() => setAnchorElement(null)}
        disablePortal
      >
        <WaitingParticipantsList id="waiting-list-popover" />
      </WaitingParticipantsPopoverRoot>
    </StyledBadge>
  );
};

export default WaitingParticipantsPopover;
