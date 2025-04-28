// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent } from '@testing-library/react';
import { addMinutes } from 'date-fns';
import { Formik } from 'formik';

import roundToUpper30 from '../../../utils/roundToUpper30';
import { renderWithProviders } from '../../../utils/testUtils';
import { DashboardDateTimePicker } from './DashboardDateTimePicker';

const DEFAULT_MINUTES_DIFFERENCE = 30;

const defaultStartDate = roundToUpper30();
const defaultEndDate = addMinutes(defaultStartDate, DEFAULT_MINUTES_DIFFERENCE);

const initialValues = {
  startDate: defaultStartDate.toISOString(),
  endDate: defaultEndDate.toISOString(),
  waitingRoom: false,
  isTimeDependent: false,
  sharedFolder: false,
  recurrencePattern: '' as RecurrencePattern,
  streaming: {
    enabled: false,
  },
  showMeetingDetails: false,
  e2eEncryption: false,
};

describe('DashboardDateTimePicker', () => {
  const mockOnChange = jest.fn();

  const renderComponent = (type: 'start' | 'end' = 'start', initialErrors = {}) =>
    renderWithProviders(
      <Formik initialErrors={initialErrors} initialValues={initialValues} onSubmit={() => {}}>
        {(formikProps) => (
          <DashboardDateTimePicker
            type={type}
            formik={formikProps}
            onChange={mockOnChange}
            minTimeDate={new Date()}
            helperText="Custom helper text"
          />
        )}
      </Formik>,
      { provider: { mui: true } }
    );

  it('renders textfield and helperText correctly', () => {
    renderComponent();
    expect(screen.getByText('dashboard-meeting-date-start')).toBeInTheDocument();
    expect(screen.getByText('Custom helper text')).toBeInTheDocument();
  });

  it('calls onChange when date is changed', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '2025-12-31T12:00' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('displays error message when start time has an error', () => {
    renderComponent('start', { startDate: 'invalid date' });
    expect(screen.getByText('invalid date')).toBeInTheDocument();
  });

  it('displays error message when end time has an error', () => {
    renderComponent('end', { endDate: 'invalid date' });
    expect(screen.getByText('invalid date')).toBeInTheDocument();
  });
});
