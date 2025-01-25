// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid, styled, Typography, Collapse, Stack, Tooltip, Hidden } from '@mui/material';
import { Event, EventId, isTimelessEvent, isEventException, isRecurringEvent } from '@opentalk/rest-api-rtk-query';
import { Property } from 'csstype';
import { uniqueId } from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAcceptEventInviteMutation, useDeclineEventInviteMutation } from '../../../api/rest';
import { FavoriteIcon, InviteIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import getReferrerRouterState from '../../../utils/getReferrerRouterState';
import EventTimePreview from '../../EventTimePreview/EventTimePreview';
import MeetingPopover, { MeetingCardFragmentProps } from './MeetingPopover';

interface MouseValues {
  x: number;
  y: number;
  holdTime: number;
}

const CardWrapper = styled(Grid)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing(2),
  gap: theme.spacing(1),
  marginBottom: 'auto',
  cursor: 'pointer',
  '&:not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
  '& .favoriteIcon': {
    margin: theme.spacing('auto', 2),
  },
  '& svg': {
    width: 20,
    height: 20,
    [theme.breakpoints.down('md')]: {
      width: theme.typography.pxToRem(16),
      height: theme.typography.pxToRem(16),
    },
  },
}));

const InviteContainer = styled('div')(({ theme }) => ({
  borderRadius: theme.borderRadius.large,
  background: theme.palette.warning.main,
  width: theme.typography.pxToRem(52),
  height: theme.typography.pxToRem(44),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& svg': {
    fill: theme.palette.common.white,
  },
}));

const DeclineButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const MaxWidthTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'maxWidth',
})<{ maxWidth: Property.MaxWidth }>(({ maxWidth }) => ({
  maxWidth,
}));

// For some reason, the `maxWidth` props is causing console error when structured like styled(MaxWidthTypography)
const TitleTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'maxWidth',
})<{ maxWidth: Property.MaxWidth }>(({ maxWidth }) => ({
  maxWidth,
  fontSize: '1rem',
  margin: 0,
}));

const OverviewCard = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
  const { createdBy, isFavorite, title } = event;
  const eventId = event.id as EventId;
  const [acceptEventInvitation] = useAcceptEventInviteMutation();
  const [declineEventInvitation] = useDeclineEventInviteMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const acceptInvite = async () => {
    try {
      await acceptEventInvitation({ eventId }).unwrap();
      notifications.success(
        t(`dashbooard-event-accept-invitation-notification`, {
          meetingTitle: title,
        })
      );
    } catch (error) {
      notifications.error(
        t(`error-general`, {
          meetingTitle: title,
        })
      );
    }
  };

  const declineInvite = async () => {
    try {
      await declineEventInvitation({ eventId }).unwrap();
      notifications.success(
        t(`dashbooard-event-decline-invitation-notification`, {
          meetingTitle: title,
        })
      );
    } catch (error) {
      notifications.error(
        t(`error-general`, {
          meetingTitle: title,
        })
      );
    }
  };

  const getTimePreview = () => {
    if (!isTimelessEvent(event) && !isEventException(event)) {
      const startDate = new Date(event.startsAt.datetime);
      const endDate = new Date(event.endsAt.datetime);

      return (
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
          }}
        >
          <EventTimePreview startDate={startDate} endDate={endDate} />
        </Typography>
      );
    }

    return (
      <Typography
        variant="body1"
        sx={{
          fontWeight: 400,
        }}
      >
        {t('dashboard-meeting-card-time-independent')}
      </Typography>
    );
  };

  const getActionButtons = () => {
    if ((event as Event).inviteStatus === 'pending') {
      return (
        <Stack
          sx={{
            flexDirection: 'row',
          }}
        >
          <DeclineButton
            color="secondary"
            variant="outlined"
            onClick={declineInvite}
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            {t('global-decline')}
          </DeclineButton>
          <Button color="secondary" onClick={acceptInvite} onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}>
            {t('global-accept')}
          </Button>
        </Stack>
      );
    }

    return <MeetingPopover event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />;
  };

  const getIcons = () => {
    if ((event as Event).inviteStatus === 'pending') {
      return (
        <InviteContainer>
          <InviteIcon type="functional" title={t('global-invite')} titleId={uniqueId('invite-icon-')} />
        </InviteContainer>
      );
    }
    return (
      <Collapse in={isFavorite} data-testid={`favorite-icon${isFavorite ? '-visible' : ''}`}>
        <FavoriteIcon
          type="functional"
          className="favoriteIcon"
          title={t('global-favorite')}
          titleId={uniqueId('favorite-icon-')}
        />
      </Collapse>
    );
  };

  const mouseValues = useRef<MouseValues>({
    x: 0,
    y: 0,
    holdTime: 0,
  });

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = event.nativeEvent;

    mouseValues.current = {
      x,
      y,
      holdTime: Date.now(),
    };
  };

  const onMouseUp = (mouseEvent: React.MouseEvent<HTMLDivElement>) => {
    mouseEvent.preventDefault();
    const isRecurring = isRecurringEvent(event);
    // Recurring event instance details are passed as search params to specify instance
    const recurringEventDetails = isRecurring ? `?start=${event.startsAt.datetime}&end=${event.endsAt.datetime}` : '';

    if (
      Date.now() - mouseValues.current.holdTime < 200 &&
      mouseValues.current.x === mouseEvent.nativeEvent.x &&
      mouseValues.current.y === mouseEvent.nativeEvent.y
    ) {
      navigate(`/dashboard/meetings/${eventId}${recurringEventDetails}`, {
        state: {
          ...getReferrerRouterState(window.location),
        },
      });
    }
  };

  return (
    <CardWrapper
      data-testid="MeetingOverviewCard"
      container
      columns={16}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <Grid
        item
        xs="auto"
        sm={1}
        sx={{
          margin: 'auto',
        }}
      >
        {getIcons()}
      </Grid>
      <Grid
        item
        xs={12}
        sm={3}
        sx={{
          margin: 'auto',
        }}
      >
        {getTimePreview()}
      </Grid>
      <Grid
        item
        xs={16}
        sm={3}
        sx={{
          margin: 'auto',
        }}
      >
        <Tooltip translate="no" title={title || ''} describeChild placement="bottom-start">
          <TitleTypography maxWidth="50ch" variant="body1" noWrap as="h3">
            {title}
          </TitleTypography>
        </Tooltip>
      </Grid>
      <Hidden xsDown>
        <Grid
          item
          xs={16}
          sm={3}
          sx={{
            margin: 'auto',
          }}
        >
          <MaxWidthTypography maxWidth="50ch" variant="body1" fontWeight={400} noWrap translate="no">
            {t('dashboard-home-created-by', { author: createdBy.displayName })}
          </MaxWidthTypography>
        </Grid>
      </Hidden>
      <Grid
        item
        xs={16}
        sm={4}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'flex-end',
          paddingRight: 0,
          textAlign: 'end',
        }}
      >
        {getActionButtons()}
      </Grid>
    </CardWrapper>
  );
};

export default OverviewCard;
