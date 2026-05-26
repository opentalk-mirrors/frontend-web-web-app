// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse as MuiCollapse, Stack, styled, Tooltip, Typography, Box } from '@mui/material';
import { isPendingEvent, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { truncate, uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import { FavoriteIcon as OriginalFavoriteIcon } from '../../../assets/icons';
import EventTimePreview from '../../EventTimePreview';
import { MeetingCardFragmentProps } from './MeetingActions';
import { MeetingCardActions } from './MeetingCardActions';
import { PendingInviteIcon } from './PendingInviteIcon';

const CardWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
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

const FavoriteIcon = styled(OriginalFavoriteIcon)(({ theme }) => ({
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
  const isPending = isPendingEvent(event);

  const renderTimeString = () => {
    let timeString = t('dashboard-meeting-card-error');

    if (isAllDay) {
      timeString = t('dashboard-meeting-card-all-day');
    } else if (isTimeIndependent) {
      timeString = t('dashboard-meeting-card-timeindependent');
    } else if (endDate && startDate) {
      return (
        <Typography variant="body2" noWrap mb={isPending ? 0 : 1}>
          <EventTimePreview startDate={startDate} endDate={endDate} />
        </Typography>
      );
    }

    return (
      <Typography variant="body2" noWrap mb={isPending ? 0 : 1}>
        {timeString}
      </Typography>
    );
  };

  const renderCreator = () => {
    const authorWithPrefix = isMeetingCreator ? `${author} (${t('global-me')})` : author;

    return (
      <Typography variant="body2" noWrap margin={0} title={authorWithPrefix}>
        {t('dashboard-home-created-by', { author: authorWithPrefix })}
      </Typography>
    );
  };

  return (
    <CardWrapper>
      <Collapse in={isFavorite} data-testid={`favorite-icon${isFavorite ? '-visible' : ''}`}>
        <FavoriteIcon type="functional" title={t('global-favorite')} titleId={uniqueId('favorite-icon-')} />
      </Collapse>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {renderTimeString()}
        {isPending && (
          <Box display="flex" alignSelf="flex-end">
            <PendingInviteIcon />
          </Box>
        )}
      </Stack>
      <Stack justifyContent="space-between" flexDirection="row" flexWrap="wrap" gap={2}>
        <Stack justifyContent="space-between" gap={1} flex={1} minWidth={0}>
          <Tooltip translate="no" title={title || ''} describeChild placement="bottom-start">
            <Typography
              variant="h1"
              component="h3"
              noWrap
              sx={{
                fontWeight: 600,
                whiteSpace: 'normal',
                margin: 0,
              }}
            >
              {truncate(title, { length: 100 })}
            </Typography>
          </Tooltip>
          {renderCreator()}
        </Stack>
        <Stack>
          <Box mt="auto">
            <MeetingCardActions event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />
          </Box>
        </Stack>
      </Stack>
    </CardWrapper>
  );
};

export default StandardCard;
