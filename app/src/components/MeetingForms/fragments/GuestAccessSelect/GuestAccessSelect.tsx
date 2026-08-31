// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControl, FormLabel, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { GuestAccess } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { ChangeEvent, MouseEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { MeetingFormValues } from '../DashboardDateTimePicker';
import MeetingFormSwitch from '../MeetingFormSwitch';
import { computeFormValues, deriveUiState, WaitingRoomMode } from './guestAccessMapping';

interface GuestAccessSelectProps {
  formik: FormikProps<MeetingFormValues>;
  guestAccessAllowed?: boolean;
}

export function GuestAccessSelect({ formik, guestAccessAllowed = true }: GuestAccessSelectProps) {
  const { t } = useTranslation();

  const { guestAccess } = formik.values;
  const { setFieldValue } = formik;

  useEffect(() => {
    if (!guestAccessAllowed && guestAccess !== GuestAccess.Disabled) {
      setFieldValue('guestAccess', GuestAccess.Disabled);
    }
  }, [guestAccessAllowed, guestAccess, setFieldValue]);

  const derived = deriveUiState(formik.values);
  const guestAccessEnabled = guestAccessAllowed && derived.guestAccessEnabled;
  const waitingRoomMode =
    !guestAccessAllowed && derived.waitingRoomMode === WaitingRoomMode.GuestsOnly
      ? WaitingRoomMode.Inactive
      : derived.waitingRoomMode;

  const applyState = (mode: WaitingRoomMode, gaEnabled: boolean) => {
    const next = computeFormValues({ waitingRoomMode: mode, guestAccessEnabled: gaEnabled });
    formik.setFieldValue('waitingRoom', next.waitingRoom);
    formik.setFieldValue('guestAccess', next.guestAccess);
  };

  const handleGuestAccessSwitchChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const nextMode: WaitingRoomMode =
      !checked && waitingRoomMode === WaitingRoomMode.GuestsOnly ? WaitingRoomMode.Inactive : waitingRoomMode;
    applyState(nextMode, checked);
  };

  const handleWaitingRoomModeChange = (_event: MouseEvent<HTMLElement>, value: WaitingRoomMode | null) => {
    if (value === null) {
      return;
    }
    applyState(value, guestAccessEnabled);
  };

  return (
    <Stack spacing={3}>
      {guestAccessAllowed && (
        <MeetingFormSwitch
          checked={guestAccessEnabled}
          switchProps={{
            name: 'guestAccessEnabled',
            onChange: handleGuestAccessSwitchChange,
          }}
          switchValueLabel={t('guest-access-switch-label')}
        />
      )}
      <FormControl component="fieldset">
        <FormLabel component="legend" color="primary">
          {t('dashboard-meeting-waiting-room-switch')}
        </FormLabel>
        <ToggleButtonGroup value={waitingRoomMode} exclusive onChange={handleWaitingRoomModeChange} sx={{ mt: 1 }}>
          <ToggleButton value={WaitingRoomMode.Inactive}>{t('global-off')}</ToggleButton>
          <ToggleButton value={WaitingRoomMode.AllParticipants}>{t('global-for-all')}</ToggleButton>
          {guestAccessEnabled ? (
            <ToggleButton value={WaitingRoomMode.GuestsOnly}>{t('global-for-guests')}</ToggleButton>
          ) : (
            <Tooltip describeChild title={t('enable-guest-access-first')}>
              <span>
                <ToggleButton value={WaitingRoomMode.GuestsOnly} disabled>
                  {t('global-for-guests')}
                </ToggleButton>
              </span>
            </Tooltip>
          )}
        </ToggleButtonGroup>
      </FormControl>
    </Stack>
  );
}
