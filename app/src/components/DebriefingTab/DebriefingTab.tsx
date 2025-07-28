// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { debrief } from '../../api/types/outgoing/moderation';
import { useAppDispatch } from '../../hooks';
import { KickScope } from '../../types';

const DebriefingTab = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const resetAllHandraises = useCallback(
    (kickScope: KickScope) => {
      dispatch(debrief.action({ kickScope }));
    },
    [dispatch]
  );

  return (
    <Stack spacing={2}>
      <Button onClick={() => resetAllHandraises(KickScope.All)} color="secondary">
        {t('debriefing-button-all')}
      </Button>
      <Typography>{t('debriefing-moderator-section-title')}</Typography>
      <Button onClick={() => resetAllHandraises(KickScope.UsersAndGuests)} color="secondary">
        {t('debriefing-button-moderators')}
      </Button>
      <Button onClick={() => resetAllHandraises(KickScope.Guests)} color="secondary">
        {t('debriefing-button-moderators-and-users')}
      </Button>
    </Stack>
  );
};

export default DebriefingTab;
