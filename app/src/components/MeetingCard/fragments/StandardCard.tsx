// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse as MuiCollapse, Grid, Stack, styled, Tooltip, Typography } from '@mui/material';
import { isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { FavoriteIcon } from '../../../assets/icons';
import EventTimePreview from '../../EventTimePreview';
import MeetingPopover, { MeetingCardFragmentProps } from './MeetingPopover';

const CardWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  background: theme.palette.background.paper,
  borderRadius: theme.borderRadius ? theme.borderRadius.medium : 0,
  padding: theme.spacing(3),
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    '& .MuiTypography-root': {
      lineHeight: 1.1,
    },
  },
}));

const Collapse = styled(MuiCollapse)(({ theme }) => ({
  position: 'absolute',
  top: `-2%`,
  right: theme.spacing(6),
}));

const Favorite = styled(FavoriteIcon)(({ theme }) => ({
  width: 20,
  height: 20,

  [theme.breakpoints.down('md')]: {
    width: theme.typography.pxToRem(16),
    height: theme.typography.pxToRem(16),
  },
}));

const StandardCard = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
  const { t } = useTranslation();
  const { title, isFavorite } = event;
  const author = `${event.createdBy.firstname} ${event.createdBy.lastname}`;
  const isAllDay = !isTimelessEvent(event) ? !!event.isAllDay : false;
  const startDate = !isTimelessEvent(event) && event.startsAt ? new Date(event.startsAt.datetime) : undefined;
  const endDate = !isTimelessEvent(event) && event.endsAt ? new Date(event.endsAt.datetime) : undefined;
  const isTimeIndependent = !!event.isTimeIndependent;

  //TODO This can be improved upon. We need to agree on some requirements
  const renderTimeString = () => {
    let timeString = t('dashboard-meeting-card-error');

    if (isAllDay) {
      timeString = t('dashboard-meeting-card-all-day');
    } else if (isTimeIndependent) {
      timeString = t('dashboard-meeting-card-timeindependent');
    } else if (endDate && startDate) {
      return <EventTimePreview startDate={startDate} endDate={endDate} />;
    }

    return (
      <Typography variant="body2" noWrap>
        {timeString}
      </Typography>
    );
  };

  const renderCreator = () => {
    const authorWithPrefix = isMeetingCreator ? `${author} (${t('global-me')})` : author;

    return (
      <Typography variant="body2" noWrap>
        {t('dashboard-home-created-by', { author: authorWithPrefix })}
      </Typography>
    );
  };

  return (
    <CardWrapper>
      <Collapse in={isFavorite} data-testid={`favorite-icon${isFavorite ? '-visible' : ''}`}>
        <Favorite aria-label={t('global-favorite')} />
      </Collapse>
      <Grid container alignItems="flex-end" justifyContent="space-between" spacing={2}>
        <Grid item>
          <Stack spacing={2}>
            {renderTimeString()}
            <Tooltip translate="no" title={title || ''} describeChild placement="bottom-start">
              <Typography variant="h1" component="h2" fontWeight={600} noWrap>
                {title}
              </Typography>
            </Tooltip>
            {renderCreator()}
          </Stack>
        </Grid>
        <Grid item>
          <MeetingPopover event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />
        </Grid>
      </Grid>
    </CardWrapper>
  );
};

export default StandardCard;
