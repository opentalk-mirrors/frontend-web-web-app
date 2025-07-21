// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, styled, Typography, Collapse, Tooltip } from '@mui/material';
import {
  EventId,
  isTimelessEvent,
  isEventException,
  isRecurringEvent,
  isPendingEvent,
} from '@opentalk/rest-api-rtk-query';
import { Property } from 'csstype';
import { uniqueId } from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { FavoriteIcon } from '../../../assets/icons';
import getReferrerRouterState from '../../../utils/getReferrerRouterState';
import EventTimePreview from '../../EventTimePreview/EventTimePreview';
import { MeetingCardFragmentProps } from './MeetingActions';
import { MeetingCardActions } from './MeetingCardActions';
import { PendingInviteIcon } from './PendingInviteIcon';

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

  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const getIcons = () => {
    if (isPendingEvent(event)) {
      return <PendingInviteIcon />;
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
      size="grow"
      gap="2"
    >
      <Grid
        size={{ xs: 'auto', sm: 1 }}
        sx={{
          margin: 'auto',
        }}
      >
        {getIcons()}
      </Grid>
      <Grid
        size={{ xs: 12, sm: 3 }}
        sx={{
          margin: 'auto',
        }}
      >
        {getTimePreview()}
      </Grid>
      <Grid
        size={{ xs: 16, sm: 3 }}
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
      <Grid
        size={{ xs: 16, sm: 3 }}
        sx={{
          margin: 'auto',
        }}
      >
        <MaxWidthTypography maxWidth="50ch" variant="body1" fontWeight={400} noWrap translate="no">
          {t('dashboard-home-created-by', { author: createdBy.displayName })}
        </MaxWidthTypography>
      </Grid>
      <Grid size={{ xs: 16, sm: 4 }} container justifyContent="flex-end">
        <MeetingCardActions event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />
      </Grid>
    </CardWrapper>
  );
};

export default OverviewCard;
