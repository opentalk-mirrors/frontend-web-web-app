// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControl, FormLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { GuestAccess } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { MeetingFormValues } from '../DashboardDateTimePicker';

interface GuestAccessSelectProps {
  formik: FormikProps<MeetingFormValues>;
}

export function GuestAccessSelect({ formik }: GuestAccessSelectProps) {
  const { t } = useTranslation();

  const handleGuestAccessChange = (_event: MouseEvent<HTMLElement>, value: GuestAccess) => {
    if (value !== null) {
      formik.setFieldValue('guestAccess', value);
    }
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" color="primary">
        {t('guest-access-switch-label')}
      </FormLabel>
      <ToggleButtonGroup
        value={formik.values.guestAccess}
        exclusive
        onChange={handleGuestAccessChange}
        aria-label={t('guest-access-switch-label')}
        sx={{ mt: 1 }}
      >
        <ToggleButton value={GuestAccess.Disabled}>Disabled</ToggleButton>
        <ToggleButton value={GuestAccess.WaitingRoom}>{t('guest-access-select-waiting-room-option')}</ToggleButton>
        <ToggleButton value={GuestAccess.DirectAccess} disabled={formik.values.waitingRoom}>
          {t('guest-access-select-direct-access-option')}
        </ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}
