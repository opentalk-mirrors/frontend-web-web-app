// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, MenuList, MenuItem as MuiMenuItem, Popover as MuiPopover, Stack, styled } from '@mui/material';
import {
  CoreFeatures,
  Event,
  EventInstance,
  InviteStatus,
  isEvent,
  isRecurringEvent,
  getEventId,
  GuestAccess,
} from '@opentalk/rest-api-rtk-query';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useCallback, useMemo, useState } from 'react';
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
  event: Event | EventInstance;
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
    backgroundColor: theme.palette.background.highlight.primary,
  },
}));

const MoreButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
  padding: theme.spacing(1.25),

  '& svg': {
    width: theme.typography.pxToRem(20),
    height: theme.typography.pxToRem(20),
  },

  '&:focus': {
    outline: theme.palette.focus.outline,
    outlineOffset: theme.palette.focus.outlineOffset,
  },
}));

export const MeetingActions = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
  const { t } = useTranslation();
  const { isFavorite, title } = event;

  const eventId = getEventId(event);
  const roomId = event.room?.id;

  const [markEvent] = useMarkFavoriteEventMutation();
  const [unmarkEvent] = useUnmarkFavoriteEventMutation();
  const [declineEventInvitation] = useDeclineEventInviteMutation();
  const [isConfirmDialogVisible, showConfirmDialog] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLButtonElement | null>(null);
  const baseUrl = useAppSelector(selectBaseUrl);
  const popoverOpen = Boolean(popoverAnchor);

  const [getRoomInvites, { data: invites, isLoading: isGetInvitesLoading }] = useLazyGetRoomInvitesQuery();

  const { data: roomTariff } = useGetRoomTariffQuery(roomId ?? skipToken);
  const isInviteAllowed = Boolean(
    roomTariff &&
    isFeatureEnabledPredicate(CoreFeatures.GuestsAllowed, roomTariff.modules) &&
    !event.room?.e2eEncryption &&
    event.room?.guestAccess !== GuestAccess.Disabled
  );

  const stopPropagation = useCallback(
    (mouseEvent: React.MouseEvent<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>) => {
      mouseEvent.stopPropagation();
    },
    []
  );

  const handleOpenPopover = useCallback(
    (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
      stopPropagation(mouseEvent);
      setPopoverAnchor(mouseEvent.currentTarget);
    },
    [stopPropagation]
  );

  const handleClose = useCallback(() => {
    setPopoverAnchor(null);
  }, []);

  const navigate = useNavigate();
  const updateMeeting = useCallback(() => {
    navigate(`/dashboard/meetings/update/${eventId}/0`, { state: { ...getReferrerRouterState(window.location) } });
  }, [eventId, navigate]);

  // For a recurring event we need to pass start and end dates of a particular event instance,
  const searchParams = useMemo(() => {
    return isRecurringEvent(event) === true
      ? createSearchParams({ start: event.startsAt.datetime, end: event.endsAt.datetime }).toString()
      : undefined;
  }, [event]);

  const viewMeetingDetails = useCallback(() => {
    navigate(
      {
        pathname: `/dashboard/meetings/${eventId}`,
        search: searchParams,
      },
      { state: { ...getReferrerRouterState(window.location) } }
    );
  }, [eventId, navigate, searchParams]);

  const copyMeetingLink = useCallback(async () => {
    handleClose();
    const link = `${baseUrl}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    notifications.success(t('global-copy-link-success'));
  }, [baseUrl, handleClose, roomId, t]);

  const getGuestLink = useCallback(async () => {
    if (roomId) {
      try {
        const invitesList = invites ? invites : await getRoomInvites({ roomId }).unwrap();
        const permanentInvite = findPermanentRoomInvite(invitesList);

        if (permanentInvite) {
          handleClose();
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
  }, [baseUrl, getRoomInvites, handleClose, invites, roomId, t]);

  const showDialog = useCallback(() => {
    showConfirmDialog(true);
  }, [showConfirmDialog]);

  const declineInvite = useCallback(async () => {
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
  }, [declineEventInvitation, eventId, t, title]);

  // We do not show the options popover unless the meeting is accepted
  const declineInviteOptions = useMemo(() => {
    const isAccepted = isEvent(event) && event.inviteStatus === InviteStatus.Accepted;
    const isRecurring = isRecurringEvent(event);

    if (isAccepted && !isMeetingCreator) {
      return [
        {
          i18nKey: isRecurring ? 'decline-meeting-series-button' : 'global-decline',
          action: declineInvite,
        },
      ];
    }

    return [];
  }, [declineInvite, event, isMeetingCreator]);

  const meetingOptionItems = useMemo<IMeetingCardOptionItem[]>(() => {
    const toggleFavorite = isFavorite
      ? {
          i18nKey: 'dashboard-meeting-card-popover-remove',
          action: () => {
            unmarkEvent(eventId);
            handleClose();
          },
        }
      : {
          i18nKey: 'dashboard-meeting-card-popover-add',
          action: () => {
            markEvent(eventId);
            handleClose();
          },
        };

    return [
      toggleFavorite,
      ...declineInviteOptions,
      {
        i18nKey: 'dashboard-meeting-card-popover-details',
        action: viewMeetingDetails,
      },
      {
        i18nKey: 'dashboard-meeting-card-popover-copy-link',
        action: copyMeetingLink,
      },
    ];
  }, [
    copyMeetingLink,
    declineInviteOptions,
    eventId,
    handleClose,
    isFavorite,
    markEvent,
    unmarkEvent,
    viewMeetingDetails,
  ]);

  const copyGuestLinkOption = useMemo<IMeetingCardOptionItem>(
    () => ({
      i18nKey: 'dashboard-meeting-card-popover-copy-guest-link',
      action: getGuestLink,
      // Prevent doing multiple requests while loading
      disabled: isGetInvitesLoading,
    }),
    [getGuestLink, isGetInvitesLoading]
  );

  const deleteMeetingOption = useMemo<IMeetingCardOptionItem>(
    () => ({
      i18nKey: 'dashboard-meeting-card-popover-delete',
      action: showDialog,
    }),
    [showDialog]
  );

  const creatorMeetingOptionItems = useMemo(() => {
    const creatorOptions: IMeetingCardOptionItem[] = [
      { i18nKey: 'dashboard-meeting-card-popover-update', action: updateMeeting },
      ...meetingOptionItems,
    ];

    if (isInviteAllowed) {
      creatorOptions.push(copyGuestLinkOption);
    }

    creatorOptions.push(deleteMeetingOption);

    return creatorOptions;
  }, [copyGuestLinkOption, deleteMeetingOption, isInviteAllowed, meetingOptionItems, updateMeeting]);

  const menuOptions = useMemo(
    () => (isMeetingCreator ? creatorMeetingOptionItems : meetingOptionItems),
    [creatorMeetingOptionItems, isMeetingCreator, meetingOptionItems]
  );

  const renderedMenuOptionItems = useMemo(
    () =>
      menuOptions.map((option) => (
        <MenuItem
          disabled={option.disabled}
          key={option.i18nKey}
          onClick={option.action}
          aria-label={t(`${option.i18nKey}-label`, { title })}
        >
          {t(option.i18nKey)}
        </MenuItem>
      )),
    [menuOptions, t, title]
  );

  const handleCloseConfirmDeleteDialog = useCallback(() => {
    showConfirmDialog(false);
  }, [showConfirmDialog]);

  return (
    <Stack direction="row">
      <MoreButton
        aria-label={t('toolbar-button-more-tooltip-title')}
        size="small"
        onMouseDown={handleOpenPopover}
        onClick={handleOpenPopover}
        aria-expanded={popoverOpen}
        aria-haspopup="menu"
      >
        <MoreIcon />
      </MoreButton>
      <MuiPopover
        open={popoverOpen}
        anchorEl={popoverAnchor}
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
        <MenuList autoFocusItem={true}>{renderedMenuOptionItems}</MenuList>
      </MuiPopover>
      <ConfirmDeleteDialog open={isConfirmDialogVisible} onClose={handleCloseConfirmDeleteDialog} event={event} />
      <Button
        variant={highlighted ? 'contained' : 'outlined'}
        to={`/room/${roomId}`}
        component={NavLink}
        target="_blank"
        onMouseDown={stopPropagation}
        aria-label={t('dashboard-home-join-label', { title })}
        color="primary"
      >
        {t('dashboard-home-join')}
      </Button>
    </Stack>
  );
};
