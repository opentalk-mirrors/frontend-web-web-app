// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, MenuItem, Stack } from '@mui/material';
import { GuestAccess } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../../commonComponents';
import { formikSwitchProps } from '../../../../utils/formikUtils';
import { MeetingFormValues } from '../DashboardDateTimePicker';
import MeetingFormSwitch from '../MeetingFormSwitch';

interface GuestAccessSelectProps {
  formik: FormikProps<MeetingFormValues>;
}

export function GuestAccessSelect({ formik }: GuestAccessSelectProps) {
  const enabled = formik.values.guestAccess !== GuestAccess.Disabled;
  const expanded = enabled && !formik.values.waitingRoom;
  const { t } = useTranslation();

  const handleGuestAccessChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const nextValue = isChecked
      ? formik.values.waitingRoom
        ? GuestAccess.WaitingRoom
        : GuestAccess.DirectAccess
      : GuestAccess.Disabled;

    formik.setFieldValue('guestAccess', nextValue);
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as GuestAccess;
    formik.setFieldValue('guestAccess', value);
  };

  return (
    <Stack spacing={2}>
      <MeetingFormSwitch
        checked={formik.values.guestAccess !== GuestAccess.Disabled}
        switchProps={{
          ...formikSwitchProps('guestAccess', formik),
          checked: formik.values.guestAccess !== GuestAccess.Disabled,
          onChange: handleGuestAccessChange,
        }}
        switchValueLabel={t('guest-access-switch-label')}
      />
      <Collapse orientation="vertical" in={expanded}>
        <CommonTextField select value={formik.values.guestAccess} onChange={handleSelect}>
          <MenuItem value={GuestAccess.WaitingRoom}>{t('guest-access-select-waiting-room-option')}</MenuItem>
          <MenuItem value={GuestAccess.DirectAccess}>{t('guest-access-select-direct-access-option')}</MenuItem>
        </CommonTextField>
      </Collapse>
    </Stack>
  );
}
