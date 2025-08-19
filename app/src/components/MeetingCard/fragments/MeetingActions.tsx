// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, MenuList, MenuItem as MuiMenuItem, Popover as MuiPopover, Stack, styled } from '@mui/material';
import { Event, EventException, EventId, InviteStatus, isEvent, isRecurringEvent } from '@opentalk/rest-api-rtk-query';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate, createSearchParams } from 'react-router-dom';

import {
  useDeclineEventInviteMutation,
  useLazyGetRoomInvitesQuery,
  useMarkFavoriteEventMutation,
  useUnmarkFavoriteEventMutation,
  useGetRoomTariffQuery,
} from '../../../api/rest';
import { MoreIcon } from '../../../assets/icons';
import { IconButton, notifications } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectBaseUrl } from '../../../store/slices/configSlice';
import { composeInviteUrl, findPermanentRoomInvite } from '../../../utils/apiUtils';
import getReferrerRouterState from '../../../utils/getReferrerRouterState';
import { isFeatureEnabledPredicate } from '../../../utils/moduleUtils';
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

export const MeetingActions = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
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

  const { data: roomTariff } = useGetRoomTariffQuery(roomId ?? skipToken);
  const isGuestsAllowedFeatureEnabled = Boolean(
    roomTariff && isFeatureEnabledPredicate('guests_allowed', roomTariff.modules)
  );

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

  // For a recurring event we need to pass start and end dates of a particular event instance,
  const getSearchParams = () => {
    return isRecurringEvent(event) === true
      ? createSearchParams({ start: event.startsAt.datetime, end: event.endsAt.datetime }).toString()
      : undefined;
  };

  const viewMeetingDetails = () => {
    navigate(
      {
        pathname: `/dashboard/meetings/${eventId}`,
        search: getSearchParams(),
      },
      { state: { ...getReferrerRouterState(window.location) } }
    );
  };

  const copyMeetingLink = async () => {
    setPopoverOpen(false);
    const link = `${baseUrl}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    notifications.success(t('global-copy-link-success'));
  };

  const getGuestLink = async () => {
    if (roomId) {
      try {
        const invitesList = invites ? invites : await getRoomInvites({ roomId }).unwrap();
        const permanentInvite = findPermanentRoomInvite(invitesList);

        if (permanentInvite) {
          setPopoverOpen(false);
          const inviteURLString = composeInviteUrl(baseUrl, roomId, permanentInvite.inviteCode).toString();
          await navigator.clipboard.writeText(inviteURLString);
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

  const showDialog = () => {
    showConfirmDialog(true);
  };

  const declineInvite = async () => {
    try {
      await declineEventInvitation({ eventId }).unwrap();
      notifications.success(
        t('dashboard-event-decline-invitation-notification', {
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

  //We do not show the options popover unless the meeting is accepted
  const getDeclineInviteActionButton = () => {
    const options: IMeetingCardOptionItem[] = [];
    const isAccepted = isEvent(event) && event.inviteStatus === InviteStatus.Accepted;

    if (isAccepted && !isMeetingCreator) {
      options.push({
        i18nKey: 'global-decline',
        action: declineInvite,
      });
    }

    return options;
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
    ...getDeclineInviteActionButton(),
    {
      i18nKey: 'dashboard-meeting-card-popover-details',
      action: viewMeetingDetails,
    },
    {
      i18nKey: 'dashboard-meeting-card-popover-copy-link',
      action: copyMeetingLink,
    },
  ];

  const copyGuestLinkOption: IMeetingCardOptionItem = {
    i18nKey: 'dashboard-meeting-card-popover-copy-guest-link',
    action: getGuestLink,
    //Prevents doing multiple requests while loading
    disabled: isGetInvitesLoading,
  };

  const deleteMeetingOption: IMeetingCardOptionItem = {
    i18nKey: 'dashboard-meeting-card-popover-delete',
    action: showDialog,
  };

  const creatorMeetingOptionItems: IMeetingCardOptionItem[] = [
    { i18nKey: 'dashboard-meeting-card-popover-update', action: updateMeeting },
    ...meetingOptionItems,
  ];
  if (isGuestsAllowedFeatureEnabled) {
    creatorMeetingOptionItems.push(copyGuestLinkOption);
  }
  creatorMeetingOptionItems.push(deleteMeetingOption);

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
    <Stack direction="row">
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
