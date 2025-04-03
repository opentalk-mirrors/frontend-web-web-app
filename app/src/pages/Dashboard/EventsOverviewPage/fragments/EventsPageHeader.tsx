// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { EventType, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TimePerspectiveFilter } from '../../../../utils/eventUtils';
import { DashboardEventsFilters, FilterChangeCallbackType, MeetingsProp, TimeFilter } from '../types';
import { CreateNewMeetingButton } from './CreateNewMeetingButton';
import { EventFilterButtonBar } from './EventFilterButtonBar';
import { EventPageFilters } from './EventPageFilters';

// In order to avoid circular dependency I moved file to common parent folder "../types",
// many files are actually importing this interface from here, which is why I re-exported it
// for compatibility reasons. And to avoid touching many files, increasing the end size of the PR.
export { TimeFilter };

interface EventsPageHeaderProps {
  filters: DashboardEventsFilters;
  onFilterChange: FilterChangeCallbackType;
  entries: MeetingsProp[];
  title: string;
}

const EventsPageHeader = ({ onFilterChange, filters, entries, title }: EventsPageHeaderProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'xl'));
  // https://mui.com/material-ui/react-stack/#margin-on-the-children
  // Our main component uses Stack which has a problem with margin overwriting.
  const resetMarginTop = theme.spacing(2);
  const resetMarginLeft = theme.spacing(-2);

  const isContainingRecurringEvents = useMemo(() => {
    return entries.find((meetings) =>
      meetings?.events?.find((event) => !isTimelessEvent(event) && event.type === EventType.Recurring)
    );
  }, [entries]);

  const showTimePerspectiveFilter = [TimePerspectiveFilter.Future, TimePerspectiveFilter.Past].includes(
    filters.timePerspective
  );

  if (isDesktop) {
    return (
      <Grid
        container
        component="header"
        rowSpacing={0}
        columnSpacing={2}
        style={{ marginTop: resetMarginTop, marginLeft: resetMarginLeft }}
        data-testid="events-page-header-desktop"
        sx={{
          alignItems: 'center',
        }}
      >
        <Grid
          size={{ xs: 'auto' }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          <EventPageFilters
            filters={filters}
            onFilterChange={onFilterChange}
            showTimePerspectiveFilter={showTimePerspectiveFilter}
          />
        </Grid>
        <Grid
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <EventFilterButtonBar filters={filters} onFilterChange={onFilterChange} />
          <CreateNewMeetingButton />
        </Grid>
        {isContainingRecurringEvents && (
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mt: 2,
              }}
            >
              {t('dashboard-events-note-limited-view')}
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  }

  if (isTablet) {
    return (
      <Grid
        container
        component="header"
        spacing={2}
        columns={12}
        style={{ marginTop: resetMarginTop, marginLeft: resetMarginLeft }}
        data-testid="events-page-header-tablet"
        sx={{
          alignItems: 'center',
        }}
      >
        <Grid
          container
          size={{ xs: 12 }}
          rowSpacing={0}
          columnSpacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          <Grid size={{ xs: 'auto' }}>
            <EventPageFilters
              filters={filters}
              onFilterChange={onFilterChange}
              showTimePerspectiveFilter={showTimePerspectiveFilter}
            />
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <EventFilterButtonBar filters={filters} onFilterChange={onFilterChange} />
            <CreateNewMeetingButton />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          {isContainingRecurringEvents && (
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mt: 2,
              }}
            >
              {t('dashboard-events-note-limited-view')}
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      container
      component="header"
      spacing={0}
      columns={12}
      style={{ marginLeft: resetMarginLeft, paddingLeft: theme.spacing(2), width: `calc(100% + ${theme.spacing(2)})` }}
      data-testid="events-page-header-mobile"
      sx={{
        alignItems: 'center',
      }}
    >
      <Grid
        size={{ xs: 12 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 0,
        }}
      >
        <EventPageFilters
          filters={filters}
          visuallyDivide
          onFilterChange={onFilterChange}
          isMobile
          showTimePerspectiveFilter={showTimePerspectiveFilter}
        />
        {!showTimePerspectiveFilter && (
          <>
            <EventFilterButtonBar filters={filters} onFilterChange={onFilterChange} />
            <CreateNewMeetingButton />
          </>
        )}
      </Grid>
      {showTimePerspectiveFilter && (
        <Grid
          size={{ xs: 12 }}
          sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <EventFilterButtonBar filters={filters} onFilterChange={onFilterChange} />
          <CreateNewMeetingButton />
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        {isContainingRecurringEvents && (
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mt: 2,
            }}
          >
            {t('dashboard-events-note-limited-view')}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default EventsPageHeader;
