// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GuestAccess, RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, FormikProps } from 'formik';

import { MeetingFormValues } from '../DashboardDateTimePicker';
import { GuestAccessSelect } from './GuestAccessSelect';

const baseValues: MeetingFormValues = {
  trainingParticipationReport: { enabled: false },
  waitingRoom: false,
  isTimeDependent: false,
  startDate: '',
  endDate: '',
  recurrencePattern: '' as RecurrencePattern,
  sharedFolder: false,
  streaming: { enabled: false },
  showMeetingDetails: false,
  e2eEncryption: false,
  guestAccess: GuestAccess.DirectAccess,
};

const renderWithFormik = (
  initialValues: MeetingFormValues,
  formikRef: { current: FormikProps<MeetingFormValues> | null }
) =>
  render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(formik) => {
        formikRef.current = formik;
        return <GuestAccessSelect formik={formik} />;
      }}
    </Formik>
  );

describe('GuestAccessSelect — handleGuestAccessSwitchChange', () => {
  it('falls back to "Inactive" mode when guest access is disabled while mode was "GuestsOnly"', async () => {
    const user = userEvent.setup();
    const formikRef: { current: FormikProps<MeetingFormValues> | null } = { current: null };
    renderWithFormik({ ...baseValues, waitingRoom: false, guestAccess: GuestAccess.WaitingRoom }, formikRef);

    const guestsOnlyButton = screen.getByRole('button', {
      name: 'dashboard-meeting-waiting-room-option-guests-only',
    });
    expect(guestsOnlyButton).toHaveAttribute('aria-pressed', 'true');
    expect(guestsOnlyButton).not.toBeDisabled();

    const guestAccessSwitch = screen.getByRole('switch', { name: 'guest-access-switch-label' });
    expect(guestAccessSwitch).toBeChecked();
    await user.click(guestAccessSwitch);

    await waitFor(() => {
      expect(formikRef.current?.values.guestAccess).toBe(GuestAccess.Disabled);
      expect(formikRef.current?.values.waitingRoom).toBe(false);
    });

    const inactiveButton = screen.getByRole('button', {
      name: 'dashboard-meeting-waiting-room-option-disabled',
    });
    expect(inactiveButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'dashboard-meeting-waiting-room-option-guests-only' })).toBeDisabled();
  });

  it('preserves the current waiting-room mode when guest access is disabled from a non-"GuestsOnly" mode', async () => {
    const user = userEvent.setup();
    const formikRef: { current: FormikProps<MeetingFormValues> | null } = { current: null };
    renderWithFormik({ ...baseValues, waitingRoom: true, guestAccess: GuestAccess.WaitingRoom }, formikRef);

    const allParticipantsButton = screen.getByRole('button', {
      name: 'dashboard-meeting-waiting-room-option-all-participants',
    });
    expect(allParticipantsButton).toHaveAttribute('aria-pressed', 'true');

    const guestAccessSwitch = screen.getByRole('switch', { name: 'guest-access-switch-label' });
    await user.click(guestAccessSwitch);

    await waitFor(() => {
      expect(formikRef.current?.values.waitingRoom).toBe(true);
      expect(formikRef.current?.values.guestAccess).toBe(GuestAccess.Disabled);
    });
    expect(
      screen.getByRole('button', { name: 'dashboard-meeting-waiting-room-option-all-participants' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('preserves the current waiting-room mode when guest access is enabled (checked=true branch)', async () => {
    const user = userEvent.setup();
    const formikRef: { current: FormikProps<MeetingFormValues> | null } = { current: null };
    renderWithFormik({ ...baseValues, waitingRoom: false, guestAccess: GuestAccess.Disabled }, formikRef);

    const guestAccessSwitch = screen.getByRole('switch', { name: 'guest-access-switch-label' });
    expect(guestAccessSwitch).not.toBeChecked();

    await user.click(guestAccessSwitch);

    await waitFor(() => {
      expect(formikRef.current?.values.guestAccess).toBe(GuestAccess.DirectAccess);
      expect(formikRef.current?.values.waitingRoom).toBe(false);
    });
  });
});
