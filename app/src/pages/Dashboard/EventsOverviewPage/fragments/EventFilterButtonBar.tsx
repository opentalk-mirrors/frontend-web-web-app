// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, Stack, Tooltip, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FavoriteIcon, InviteIcon } from '../../../../assets/icons';
import { DashboardEventsFilters, FilterChangeCallbackType } from '../types';

const IconButtonBig = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'active' })<{ active?: boolean }>(
  ({ theme, active }) => ({
    color: active ? theme.palette.primary.contrastText : theme.palette.background.highlightContrast.contrastText,
    backgroundColor: active ? theme.palette.primary.main : theme.palette.background.highlightContrast.primary,
    borderRadius: theme.borderRadius.circle,
    width: '3rem',
    height: '3rem',
    '.MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    '&:focus': {
      outline: theme.palette.focus.outline,
      outlineOffset: theme.palette.focus.outlineOffset,
    },
  })
);

type EventFilterButtonBarProps = {
  filters: DashboardEventsFilters;
  onFilterChange: FilterChangeCallbackType;
};

export const EventFilterButtonBar = ({ filters, onFilterChange }: EventFilterButtonBarProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip placement="top" title={t('dashboard-events-filter-by-invites')}>
        <IconButtonBig
          data-testid="filter-by-invites"
          active={filters.openInvitedMeeting}
          aria-pressed={filters.openInvitedMeeting}
          onClick={() => onFilterChange('openInvitedMeeting', !filters.openInvitedMeeting)}
        >
          <InviteIcon />
        </IconButtonBig>
      </Tooltip>
      <Tooltip placement="top" title={t('dashboard-events-filter-by-favorites')}>
        <IconButtonBig
          data-testid="favoriteMeeting"
          active={filters.favoriteMeetings}
          aria-pressed={filters.favoriteMeetings}
          onClick={() => onFilterChange('favoriteMeetings', !filters.favoriteMeetings)}
        >
          <FavoriteIcon />
        </IconButtonBig>
      </Tooltip>
    </Stack>
  );
};
