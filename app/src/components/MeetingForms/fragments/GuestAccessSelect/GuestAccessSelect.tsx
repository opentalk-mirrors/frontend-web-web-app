// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControl, FormLabel, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormikProps } from 'formik';
import { ChangeEvent, MouseEvent } from 'react';
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
    <Stack spacing={1}>
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
          <ToggleButton value={WaitingRoomMode.Inactive}>
            {t('dashboard-meeting-waiting-room-option-disabled')}
          </ToggleButton>
          <ToggleButton value={WaitingRoomMode.GuestsOnly} disabled={!guestAccessEnabled}>
            {t('dashboard-meeting-waiting-room-option-guests-only')}
          </ToggleButton>
          <ToggleButton value={WaitingRoomMode.AllParticipants}>
            {t('dashboard-meeting-waiting-room-option-all-participants')}
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
    </Stack>
  );
}
