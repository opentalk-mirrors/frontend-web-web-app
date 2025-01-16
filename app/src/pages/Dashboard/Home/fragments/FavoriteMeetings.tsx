// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Skeleton, Typography } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetEventsQuery } from '../../../../api/rest';
import FavoriteMeetingsCard, { FavoriteMeetingProps } from '../../../../components/FavoriteMeetingsCard';

const FavoriteMeetings = () => {
  const { t } = useTranslation();

  const { data: favoritesEvents, isLoading: favoritesEventsIsLoading } = useGetEventsQuery({
    favorites: true,
  });

  const getMappedFavoriteMeetings = (): Array<FavoriteMeetingProps> =>
    favoritesEvents?.data
      ?.filter((favoritesEvent) => !isEmpty(favoritesEvent.title))
      .map((favoritesEvent) => ({
        subject: favoritesEvent.title ? favoritesEvent.title : '',
        roomId: favoritesEvent.room?.id ? (favoritesEvent.room.id as RoomId) : ('' as RoomId),
      })) || [];

  if (favoritesEventsIsLoading) {
    return (
      <Stack width="100%">
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" height={200} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2} flex={1} justifyContent="flex-end">
      <Typography variant="body1" component="h2">
        {t('dashboard-favorite-meetings')}
      </Typography>
      <FavoriteMeetingsCard meetings={getMappedFavoriteMeetings()} />
    </Stack>
  );
};

export default FavoriteMeetings;
