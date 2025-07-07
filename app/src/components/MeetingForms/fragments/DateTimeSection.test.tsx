// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, TimedEvent } from '@opentalk/rest-api-rtk-query';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Formik, FormikProps } from 'formik';

import { mockedMeetingFormValues, mockedSingleEvent } from '../../../utils/testUtils';
import { MeetingFormValues, DashboardDateTimePickerProps } from './DashboardDateTimePicker';
import DateTimeSection from './DateTimeSection';

let mockTestOnChangeValue: Date | null = null;
let formikInstance: FormikProps<MeetingFormValues> | null = null;

jest.mock('./DashboardDateTimePicker', () => ({
  DashboardDateTimePicker: ({ type, onChange, minTimeDate }: DashboardDateTimePickerProps) => {
    return (
      <div data-testid={`datetime-picker-${type}`}>
        <button data-testid={`trigger-onchange-${type}`} onClick={() => onChange && onChange(mockTestOnChangeValue)}>
          Trigger onChange
        </button>
        <p>{minTimeDate ? minTimeDate.toString() : 'No min time date'}</p>
      </div>
    );
  },
}));

jest.mock('./RecurrenceSection', () => ({
  __esModule: true,
  default: () => <div data-testid="recurrence-section" />,
}));

describe('DateTimeSection', () => {
  const onRecurrencePatternChange = jest.fn();

  const renderComponent = (existingEvent?: Event) =>
    render(
      <Formik initialValues={mockedMeetingFormValues} onSubmit={jest.fn()}>
        {(formik) => {
          formikInstance = formik;
          return (
            <DateTimeSection
              formik={formik}
              existingEvent={existingEvent}
              onRecurrencePatternChange={onRecurrencePatternChange}
            />
          );
        }}
      </Formik>
    );

  it('renders start and end date pickers and recurrence section', () => {
    renderComponent();
    expect(screen.getByTestId('datetime-picker-start')).toBeInTheDocument();
    expect(screen.getByTestId('datetime-picker-end')).toBeInTheDocument();
    expect(screen.getByTestId('recurrence-section')).toBeInTheDocument();
  });

  describe('start date picker', () => {
    it('sets empty string if start date is null', async () => {
      mockTestOnChangeValue = null;
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-start'));

      await waitFor(() => {
        expect(formikInstance?.values.startDate).toBe('');
      });

      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('startDate');
      });
      validateFieldSpy.mockRestore();
    });
    it('sets invalid date string if start date is invalid', async () => {
      mockTestOnChangeValue = new Date('invalid');
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-start'));

      await waitFor(() => {
        expect(formikInstance?.values.startDate).toBe('Invalid Date');
      });

      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('startDate');
      });
      validateFieldSpy.mockRestore();
    });
    it('sets correct start date in ISO format and updates end date if start date is valid', async () => {
      mockTestOnChangeValue = new Date('05 October 2025 14:48 UTC');
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-start'));

      await waitFor(() => {
        expect(formikInstance?.values.startDate).toBe('2025-10-05T14:48:00.000Z');
      });
      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('startDate');
      });
      await waitFor(() => {
        expect(formikInstance?.values.endDate).toBe('2025-10-05T15:00:00.000Z');
      });
      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('endDate');
      });
    });
  });
  describe('end date picker', () => {
    it('sets empty string if end date is null', async () => {
      mockTestOnChangeValue = null;
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-end'));

      await waitFor(() => {
        expect(formikInstance?.values.endDate).toBe('');
      });

      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('endDate');
      });
      validateFieldSpy.mockRestore();
    });
    it('sets invalid date string if end date is invalid', async () => {
      mockTestOnChangeValue = new Date('invalid');
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-end'));

      await waitFor(() => {
        expect(formikInstance?.values.endDate).toBe('Invalid Date');
      });

      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('endDate');
      });
      validateFieldSpy.mockRestore();
    });
    it('sets correct start date in ISO format and updates end date if start date is valid', async () => {
      mockTestOnChangeValue = new Date('05 October 2025 14:48 UTC');
      renderComponent();
      const validateFieldSpy = jest.spyOn(formikInstance!, 'validateField');
      fireEvent.click(screen.getByTestId('trigger-onchange-end'));

      await waitFor(() => {
        expect(formikInstance?.values.endDate).toBe('2025-10-05T14:48:00.000Z');
      });
      await waitFor(() => {
        expect(validateFieldSpy).toHaveBeenCalledWith('endDate');
      });
      validateFieldSpy.mockRestore();
    });
  });
  describe('min time date passed to pickers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('sets min time date to current time for a new event', () => {
      const now = new Date();
      renderComponent();
      const startDatePicker = screen.getByTestId('datetime-picker-start');
      expect(within(startDatePicker).getByText(now.toString())).toBeInTheDocument();
      const endDatePicker = screen.getByTestId('datetime-picker-end');
      expect(within(endDatePicker).getByText(now.toString())).toBeInTheDocument();
    });
    it('sets min time date to current time for time independent existing event', () => {
      const now = new Date();
      renderComponent({ ...mockedSingleEvent, isTimeIndependent: true });
      const startDatePicker = screen.getByTestId('datetime-picker-start');
      expect(within(startDatePicker).getByText(now.toString())).toBeInTheDocument();
      const endDatePicker = screen.getByTestId('datetime-picker-end');
      expect(within(endDatePicker).getByText(now.toString())).toBeInTheDocument();
    });
    it('sets min time date to current time for time dependant existing event, which start time is in the future', () => {
      const mockNow = new Date('2025-10-05T14:48:00.000Z');
      jest.setSystemTime(mockNow);
      renderComponent({
        ...mockedSingleEvent,
        isTimeIndependent: true,
        startsAt: {
          datetime: '2025-12-05T14:48:00.000Z',
          timezone: 'Europe/Berlin',
        },
      } as TimedEvent);
      const startDatePicker = screen.getByTestId('datetime-picker-start');
      expect(within(startDatePicker).getByText(mockNow.toString())).toBeInTheDocument();
      const endDatePicker = screen.getByTestId('datetime-picker-end');
      expect(within(endDatePicker).getByText(mockNow.toString())).toBeInTheDocument();
    });
    it('unsets min time date to for time dependant existing event, which start time is in the past', () => {
      const mockNow = new Date('2025-10-05T14:48:00.000Z');
      jest.setSystemTime(mockNow);
      renderComponent({
        ...mockedSingleEvent,
        isTimeIndependent: false,
        startsAt: {
          datetime: '2025-08-05T14:48:00.000Z',
          timezone: 'Europe/Berlin',
        },
      } as TimedEvent);
      const startDatePicker = screen.getByTestId('datetime-picker-start');
      expect(within(startDatePicker).queryByText(mockNow.toString())).not.toBeInTheDocument();
      expect(within(startDatePicker).getByText('No min time date')).toBeInTheDocument();
      const endDatePicker = screen.getByTestId('datetime-picker-end');
      expect(within(endDatePicker).queryByText(mockNow.toString())).not.toBeInTheDocument();
      expect(within(endDatePicker).getByText('No min time date')).toBeInTheDocument();
    });
  });
});
