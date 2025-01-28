// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Select, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { TimePerspectiveFilter } from '../../../../utils/eventUtils';
import { DashboardEventsFilters, FilterChangeCallbackType, TimeFilter } from '../types';

type EventPageFiltersProps = {
  filters: DashboardEventsFilters;
  visuallyDivide?: boolean;
  onFilterChange: FilterChangeCallbackType;
  isMobile?: boolean;
  showTimePerspectiveFilter: boolean;
};

const timePerspectiveFilterOptions: Array<TimePerspectiveFilter> = [
  TimePerspectiveFilter.TimeIndependent,
  TimePerspectiveFilter.Future,
  TimePerspectiveFilter.Past,
];

const timeFilterOptions: Array<TimeFilter> = [TimeFilter.Month, TimeFilter.Week, TimeFilter.Day];

const CustomSelect = styled(Select, {
  shouldForwardProp: (prop) => !(['isMobile', 'showTimePerspectiveFilter'] as PropertyKey[]).includes(prop),
})<Pick<EventPageFiltersProps, 'isMobile' | 'showTimePerspectiveFilter'>>(
  ({ isMobile, showTimePerspectiveFilter }) => ({
    '& .MuiSelect-icon': {
      padding: 0,
    },
    ...(isMobile && showTimePerspectiveFilter && { flex: 1 }),
  })
);

export const EventPageFilters = ({
  filters,
  onFilterChange,
  visuallyDivide,
  isMobile,
  showTimePerspectiveFilter,
}: EventPageFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: visuallyDivide ? 'space-between' : undefined,
        flex: isMobile ? 1 : undefined,
      }}
    >
      <CustomSelect
        value={filters.timePerspective}
        onChange={(e) => onFilterChange('timePerspective', e.target.value as TimePerspectiveFilter)}
        showTimePerspectiveFilter={showTimePerspectiveFilter}
        isMobile={isMobile}
      >
        {timePerspectiveFilterOptions.map((option) => {
          return (
            <MenuItem key={option} value={option}>
              {t(`dashboard-meeting-details-page-${option}`)}
            </MenuItem>
          );
        })}
      </CustomSelect>
      {showTimePerspectiveFilter && (
        <CustomSelect
          value={filters.timePeriod}
          onChange={(e) => onFilterChange('timePeriod', e.target.value as TimeFilter)}
          showTimePerspectiveFilter={showTimePerspectiveFilter}
          isMobile={isMobile}
        >
          {timeFilterOptions.map((option) => {
            return (
              <MenuItem key={option} value={option}>
                {t(`global-${option}`)}
              </MenuItem>
            );
          })}
        </CustomSelect>
      )}
    </Stack>
  );
};
