// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled, Tooltip, Link as MuiLink, List, ListItem, Typography } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { FavoriteIcon as Favorite } from '../../assets/icons';
import getReferrerRouterState from '../../utils/getReferrerRouterState';

const FavoritesWrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.secondary.main,
  borderRadius: theme.borderRadius.medium,
  position: 'relative',
  padding: theme.spacing(1.5, 2, 1),
  height: '100%',
  minHeight: '5rem',
  maxHeight: '13rem',

  [theme.breakpoints.down('md')]: {
    overflow: 'auto',
    maxHeight: '25rem',
  },
}));

const FavoritesContainer = styled(List)({
  height: '100%',
  overflow: 'auto',
});

const FavoriteIcon = styled(Favorite)(({ theme }) => ({
  position: 'absolute',
  top: -2,
  fill: theme.palette.secondary.contrastText,
  width: theme.typography.pxToRem(20),
  height: theme.typography.pxToRem(20),
  right: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    width: theme.typography.pxToRem(16),
    height: theme.typography.pxToRem(16),
    right: theme.spacing(2),
  },
}));

const FavoriteEntry = styled(ListItem)(({ theme }) => ({
  '&:not(:first-of-type):not(:last-child)': {
    padding: theme.spacing(2, 0, 2, 0.5),
  },

  '&:first-of-type': {
    padding: theme.spacing(1, 0, 2, 0.5),
  },

  '&:last-child': {
    padding: theme.spacing(2, 0, 1, 0.5),
  },

  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.secondary.contrastText}`,
  },

  '& > a': {
    color: theme.palette.secondary.contrastText,
    textDecoration: 'none',
  },
}));

const EmptyEntry = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.secondary.contrastText,
}));

// todo Define what the link should do. Currently it is undefined whether the link should lead to the room or to the meeting overview of the meeting. The naming defines if we call this roomId or meetingId
export interface FavoriteMeetingProps {
  subject: string;
  roomId: RoomId;
}

const FavoriteMeetingsCard = ({ meetings }: { meetings: Array<FavoriteMeetingProps> }) => {
  const sortedMeetings = _.sortBy(meetings, ['subject']);
  const { t } = useTranslation();

  const renderFavorites = () => {
    if (sortedMeetings.length > 0) {
      return (
        <FavoritesContainer>
          {sortedMeetings.map(({ subject, roomId }) => (
            <FavoriteEntry key={roomId}>
              <Typography noWrap component={Link} to={`/room/${roomId}`} target="_blank">
                {subject}
              </Typography>
            </FavoriteEntry>
          ))}
        </FavoritesContainer>
      );
    }

    return (
      <Tooltip title={t('tooltip-empty-favourites') || ''}>
        <MuiLink
          component={Link}
          sx={{ textDecoration: 'none' }}
          to="/dashboard/meetings"
          state={{ ...getReferrerRouterState(window.location) }}
        >
          <EmptyEntry data-testid="empty-entry">{t('no-favorite-meetings')}</EmptyEntry>
        </MuiLink>
      </Tooltip>
    );
  };

  return (
    <FavoritesWrapper>
      <FavoriteIcon />
      {renderFavorites()}
    </FavoritesWrapper>
  );
};

export default FavoriteMeetingsCard;
