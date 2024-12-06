// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid, List, ListItem, Skeleton, Stack, styled, Typography } from '@mui/material';
import { DateTime, Event, EventException, RoomId } from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetEventsQuery } from '../../../api/rest';
import { AddIcon, RectAddPlusIcon, CameraOnIcon } from '../../../assets/icons';
import FavoriteMeetingsCard, { FavoriteMeetingProps } from '../../../components/FavoriteMeetingsCard';
import { default as DefaultJoinMeetingDialog } from '../../../components/JoinMeetingDialog';
import MeetingCard from '../../../components/MeetingCard';
import StartMeetingImage from '../../../components/StartMeetingImage';
import { useHeader } from '../../../hooks/useHeader';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { appendRecurringEventInstances, TimePerspectiveFilter } from '../../../utils/eventUtils';
import getReferrerRouterState from '../../../utils/getReferrerRouterState';
import { BannerContainer } from './fragments/BannerContainer';

const Container = styled('div')(({ theme }) => ({
  display: 'grid',
  rowGap: theme.spacing(3),
  overflow: 'auto',

  [theme.breakpoints.up('md')]: {
    columnGap: theme.spacing(5),
    gridTemplateColumns: '256px 1fr',
  },
}));

const HeaderContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  flexDirection: 'column-reverse',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    gridColumnStart: 2,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
}));

const HeaderButtonsContainer = styled(Grid)(({ theme }) => ({
  rowGap: theme.spacing(2),
  justifyContent: 'space-between',
}));

const CustomList = styled(List)({
  width: '100%',
  overflow: 'auto',
});

const Home = () => {
  const [animated, setAnimated] = useState<boolean>(false);
  const { t } = useTranslation();
  const maxEventsPerPage = 4;
  const maxConsideredMonths = 12;
  const { setHeader } = useHeader();

  const { data: favoritesEvents, isLoading: favoritesEventsIsLoading } = useGetEventsQuery({
    favorites: true,
  });
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const { data: upcomingEvents, isLoading: upcomingEventsIsLoading } = useGetEventsQuery({
    timeMin: formatRFC3339(currentDate) as DateTime,
    perPage: maxEventsPerPage,
    adhoc: false,
  });

  const { data: timeIndependentEvents, isLoading: timeIndependentEventsIsLoading } = useGetEventsQuery({
    perPage: maxEventsPerPage,
    adhoc: false,
    timeIndependent: true,
  });
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setHeader(<BannerContainer />);
    return () => {
      setHeader(undefined);
    };
  }, []);

  const pageHeading = t('dashboard-meeting-card-title-next-meetings');

  useUpdateDocumentTitle(pageHeading);

  const renderStartDirectMeetingButton = () => (
    <Button
      component={Link}
      to="/dashboard/meetings/meet-now"
      onMouseEnter={toggleAnimation}
      onMouseLeave={toggleAnimation}
      startIcon={<CameraOnIcon />}
      size="large"
      fullWidth={isDesktop}
      state={{
        ...getReferrerRouterState(window.location),
      }}
    >
      {isDesktop
        ? t('dashboard-meeting-card-button-start-direct')
        : t('dashboard-meeting-card-button-start-direct-mobile')}
    </Button>
  );

  const renderNewMeetingButton = () => (
    <Button
      component={Link}
      to="/dashboard/meetings/create"
      startIcon={<AddIcon />}
      color="secondary"
      size="large"
      state={{
        ...getReferrerRouterState(window.location),
      }}
    >
      {isDesktop ? t('dashboard-plan-new-meeting') : t('dashboard-plan-new-meeting-mobile')}
    </Button>
  );

  const renderFavoriteEventsLoading = () => (
    <Stack width="100%">
      <Skeleton variant="text" />
      <Skeleton variant="rectangular" height={200} />
    </Stack>
  );

  const getMappedFavoriteMeetings = (): Array<FavoriteMeetingProps> =>
    favoritesEvents?.data
      ?.filter((favoritesEvent) => !isEmpty(favoritesEvent.title))
      .map((favoritesEvent) => ({
        subject: favoritesEvent.title ? favoritesEvent.title : '',
        roomId: favoritesEvent.room?.id ? (favoritesEvent.room.id as RoomId) : ('' as RoomId),
      })) || [];

  const renderFavoriteEvents = () => {
    if (favoritesEventsIsLoading) {
      return renderFavoriteEventsLoading();
    }
    return (
      <Stack spacing={2} flex={1} justifyContent="flex-end">
        <Typography variant="body1" component="h2">
          {t('dashboard-meeting-card-title-favorite-meetings')}
        </Typography>
        <FavoriteMeetingsCard meetings={getMappedFavoriteMeetings()} />
      </Stack>
    );
  };

  const renderCurrentEventsLoading = () => (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={130} />
      <Skeleton variant="rectangular" height={130} />
      <Skeleton variant="rectangular" height={130} />
      <Skeleton variant="rectangular" height={130} />
    </Stack>
  );

  const renderCurrentEvents = () => {
    if (upcomingEventsIsLoading || timeIndependentEventsIsLoading) {
      return renderCurrentEventsLoading();
    }

    if (isEmpty(timeIndependentEvents?.data) && isEmpty(upcomingEvents?.data)) {
      return undefined;
    }

    if (timeIndependentEvents?.data) {
      let tiEvents = Array.from(timeIndependentEvents.data);
      if (upcomingEvents?.data) {
        const ucEvents = Array.from(upcomingEvents.data);
        const expandedEvents = appendRecurringEventInstances(
          ucEvents,
          true,
          maxConsideredMonths,
          TimePerspectiveFilter.Future
        );
        tiEvents = tiEvents.concat(expandedEvents.slice(0, maxEventsPerPage - tiEvents.length));
      }
      return <CustomList>{tiEvents.map((upcomingEvent) => renderEvent(upcomingEvent))}</CustomList>;
    }

    return <CustomList>{upcomingEvents?.data.map((upcomingEvent) => renderEvent(upcomingEvent))}</CustomList>;
  };

  const renderEvent = (event: Event | EventException) => {
    let startsAt = '';
    if (!event.isTimeIndependent && event.startsAt) {
      startsAt = event.startsAt.datetime;
    }
    return (
      <ListItem key={`${event.id}${startsAt}`} disableGutters>
        <MeetingCard event={event} />
      </ListItem>
    );
  };

  const JoinMeetingDialog = () => (
    <DefaultJoinMeetingDialog
      openButtonProps={{
        size: 'large',
        startIcon: <RectAddPlusIcon />,
        fullWidth: isDesktop,
      }}
    />
  );

  const renderLogoAndFavoriteBar = () => (
    <Stack flexDirection="column" flex={1} spacing={12.5} justifyContent="space-between">
      <Stack justifyContent="center" alignItems="center" spacing={1}>
        <StartMeetingImage animated={animated} width={146} height={140} />
        {renderStartDirectMeetingButton()}
        <JoinMeetingDialog />
      </Stack>
      {renderFavoriteEvents()}
    </Stack>
  );

  const toggleAnimation = () => {
    setAnimated(!animated);
  };

  return (
    <Container>
      <HeaderContainer>
        <Typography component="h1" variant="body1">
          {pageHeading}
        </Typography>
        {!isDesktop ? (
          <HeaderButtonsContainer container>
            {renderStartDirectMeetingButton()}
            <JoinMeetingDialog />
            {renderNewMeetingButton()}
          </HeaderButtonsContainer>
        ) : (
          renderNewMeetingButton()
        )}
      </HeaderContainer>
      {isDesktop && renderLogoAndFavoriteBar()}
      {renderCurrentEvents()}
    </Container>
  );
};

export default Home;
