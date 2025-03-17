// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, MenuList, MenuItem as MuiMenuItem, Popover as MuiPopover, Stack, styled } from '@mui/material';
import { Event, EventException, EventId, InviteStatus } from '@opentalk/rest-api-rtk-query';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  useDeclineEventInviteMutation,
  useLazyGetRoomInvitesQuery,
  useMarkFavoriteEventMutation,
  useUnmarkFavoriteEventMutation,
} from '../../../api/rest';
import { MoreIcon } from '../../../assets/icons';
import { IconButton, notifications } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectBaseUrl } from '../../../store/slices/configSlice';
import { composeInviteUrl } from '../../../utils/apiUtils';
import getReferrerRouterState from '../../../utils/getReferrerRouterState';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

export interface MeetingCardBaseProps {
  event: Event | EventException;
  highlighted?: boolean;
}

export interface MeetingCardProps extends MeetingCardBaseProps {
  overview?: boolean;
}

export interface MeetingCardFragmentProps extends MeetingCardBaseProps {
  isMeetingCreator: boolean;
}

interface IMeetingCardOptionItem {
  disabled?: boolean;
  i18nKey: string;
  action: () => void;
}

const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  justifyContent: 'space-between',
  fontSize: theme.typography.pxToRem(14),
  [theme.breakpoints.down('md')]: {
    fontSize: theme.typography.pxToRem(12),
  },
  '&.Mui-selected, &.Mui-selected:hover, &:hover': {
    backgroundColor: theme.palette.secondary.lighter,
  },
}));

const MoreButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
  padding: theme.spacing(1),

  '& svg': {
    width: theme.typography.pxToRem(20),
    height: theme.typography.pxToRem(20),
  },
}));

const MeetingPopover = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
  const { t } = useTranslation();
  const { isFavorite, title } = event;
  const eventId = event.id as EventId;
  const roomId = event.room?.id;

  const [markEvent] = useMarkFavoriteEventMutation();
  const [unmarkEvent] = useUnmarkFavoriteEventMutation();
  const [declineEventInvitation] = useDeclineEventInviteMutation();
  const [isConfirmDialogVisible, showConfirmDialog] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const baseUrl = useAppSelector(selectBaseUrl);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [getRoomInvites, { data: invites, isLoading: isGetInvitesLoading }] = useLazyGetRoomInvitesQuery();

  const openPopupMenu = (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
    stopPropagation(mouseEvent);
    setPopoverOpen(true);
  };

  const stopPropagation = (mouseEvent: React.MouseEvent<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>) => {
    mouseEvent.stopPropagation();
  };

  const navigate = useNavigate();
  const updateMeeting = () => {
    navigate(`/dashboard/meetings/update/${eventId}/0`, { state: { ...getReferrerRouterState(window.location) } });
  };
  const viewMeetingDetails = () => {
    navigate(`/dashboard/meetings/${eventId}`, { state: { ...getReferrerRouterState(window.location) } });
  };

  const copyMeetingLink = (): void => {
    setPopoverOpen(false);
    const link = `${baseUrl}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    notifications.success(t('global-copy-link-success'));
  };

  const getGuestLink = async () => {
    if (roomId) {
      try {
        const invitesList = invites ? invites : await getRoomInvites({ roomId }).unwrap();
        const permanentInvite = invitesList.find((invite) => invite.active && invite.expiration === null);

        if (permanentInvite) {
          setPopoverOpen(false);
          const inviteURLString = composeInviteUrl(baseUrl, roomId, permanentInvite.inviteCode).toString();
          navigator.clipboard.writeText(inviteURLString);
          notifications.success(t('global-copy-link-success'));
        } else {
          notifications.error(t('global-copy-permanent-guest-link-error'), { persist: true });
        }
      } catch (_error) {
        notifications.error(t('global-copy-permanent-guest-link-error'));
      }
    }
  };

  const handleClose = () => {
    setPopoverOpen(false);
  };

  const declineInvite = async () => {
    try {
      await declineEventInvitation({ eventId }).unwrap();
      notifications.success(
        t('dashbooard-event-decline-invitation-notification', {
          meetingTitle: title,
        })
      );
    } catch (_error) {
      notifications.error(
        t('error-general', {
          meetingTitle: title,
        })
      );
    }
  };

  const showDialog = () => {
    showConfirmDialog(true);
  };

  const meetingOptionItems: IMeetingCardOptionItem[] = [
    isFavorite
      ? {
          i18nKey: 'dashboard-meeting-card-popover-remove',
          action: () => {
            unmarkEvent(eventId);
            setPopoverOpen(false);
          },
        }
      : {
          i18nKey: 'dashboard-meeting-card-popover-add',
          action: () => {
            markEvent(eventId);
            setPopoverOpen(false);
          },
        },
    ...((event as Event).inviteStatus !== InviteStatus.Declined && !isMeetingCreator
      ? [
          {
            i18nKey: 'dashboard-meeting-card-popover-decline',
            action: declineInvite,
          },
        ]
      : []),
    {
      i18nKey: 'dashboard-meeting-card-popover-details',
      action: viewMeetingDetails,
    },
    {
      i18nKey: 'dashboard-meeting-card-popover-copy-link',
      action: copyMeetingLink,
    },
  ];

  const creatorMeetingOptionItems: IMeetingCardOptionItem[] = [
    { i18nKey: 'dashboard-meeting-card-popover-update', action: updateMeeting },
    ...meetingOptionItems,
    //At this time requests for invites will only be available to creators in the dashboard - extended to moderator later
    {
      i18nKey: 'dashboard-meeting-card-popover-copy-guest-link',
      action: getGuestLink,
      //Prevents doing multiple requests while loading
      disabled: isGetInvitesLoading,
    },
    { i18nKey: 'dashboard-meeting-card-popover-delete', action: showDialog },
  ];

  const options = isMeetingCreator ? creatorMeetingOptionItems : meetingOptionItems;
  const renderMenuOptionItems = () =>
    options.map((option) => (
      <MenuItem
        disabled={option.disabled}
        key={option.i18nKey}
        onClick={option.action}
        aria-label={t(`${option.i18nKey}-label`, { title })}
      >
        {t(option.i18nKey)}
      </MenuItem>
    ));

  const handleCloseConfirmDeleteDialog = () => {
    showConfirmDialog(false);
  };

  return (
    <Stack
      sx={{
        flexDirection: 'row',
      }}
    >
      <MoreButton
        color="inherit"
        aria-label={t('toolbar-button-more-tooltip-title')}
        size="small"
        onMouseDown={openPopupMenu}
        onClick={openPopupMenu}
        ref={moreButtonRef}
        aria-expanded={popoverOpen}
        aria-haspopup="menu"
      >
        <MoreIcon />
      </MoreButton>
      <MuiPopover
        open={popoverOpen}
        anchorEl={moreButtonRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onMouseDown={stopPropagation}
      >
        <MenuList autoFocusItem={true}>{renderMenuOptionItems()}</MenuList>
      </MuiPopover>
      <ConfirmDeleteDialog open={isConfirmDialogVisible} onClose={handleCloseConfirmDeleteDialog} event={event} />
      <Button
        color="secondary"
        variant={highlighted ? 'contained' : 'outlined'}
        to={`/room/${roomId}`}
        component={NavLink}
        target="_blank"
        onMouseDown={stopPropagation}
        aria-label={t('dashboard-home-join-label', { title })}
      >
        {t('dashboard-home-join')}
      </Button>
    </Stack>
  );
};

export default MeetingPopover;
