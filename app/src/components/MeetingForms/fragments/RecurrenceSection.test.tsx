// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, EventType, RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Formik, FormikProps } from 'formik';

import { CommonFrequencies, FrequencyOption } from '../../../utils/rruleUtils';
import { mockedMeetingFormValues, mockedSingleEvent } from '../../../utils/testUtils';
import { CustomRecurringEventDialogProps } from './CustomRecurringEventDialog/CustomRecurringEventDialog';
import { MeetingFormValues } from './DashboardDateTimePicker';
import RecurrenceSection from './RecurrenceSection';

const mockCustomRecurrency: FrequencyOption = { label: 'New custom recurrency', value: CommonFrequencies.WEEKLY };
let formikInstance: FormikProps<MeetingFormValues> | null = null;

jest.mock('./CustomRecurringEventDialog/CustomRecurringEventDialog', () => ({
  CustomRecurringEventDialog: ({ open, selectCustomFrequencyOption }: CustomRecurringEventDialogProps) => {
    return (
      <div data-testid="custom-recurring-event-dialog">
        {open ? <button onClick={() => selectCustomFrequencyOption(mockCustomRecurrency)}>Submit</button> : null}
      </div>
    );
  },
}));

describe('RecurrenceSection', () => {
  const onRecurrencePatternChange = jest.fn();

  const renderComponent = (existingEvent: Event) =>
    render(
      <Formik initialValues={mockedMeetingFormValues} onSubmit={jest.fn()}>
        {(formik) => {
          formikInstance = formik;
          return (
            <RecurrenceSection
              formik={formik}
              existingEvent={existingEvent}
              onRecurrencePatternChange={onRecurrencePatternChange}
            />
          );
        }}
      </Formik>
    );

  it('renders recurrence selection with no repetition option by default', () => {
    renderComponent(mockedSingleEvent);

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    expect(select).toBeInTheDocument();
    expect(within(select).getByText('dashboard-meeting-recurrence-none')).toBeInTheDocument();
  });

  it('renders all recurrect selection options on select click', () => {
    renderComponent(mockedSingleEvent);

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('dashboard-meeting-recurrence-none');
    expect(options[1]).toHaveTextContent('dashboard-meeting-recurrence-daily');
    expect(options[2]).toHaveTextContent('dashboard-meeting-recurrence-weekly');
    expect(options[3]).toHaveTextContent('dashboard-meeting-recurrence-bi-weekly');
    expect(options[4]).toHaveTextContent('dashboard-meeting-recurrence-monthly');
    expect(options[5]).toHaveTextContent('dashboard-meeting-recurrence-custom');
  });

  it('sets corresponding form field on recurrence pattern select', async () => {
    renderComponent(mockedSingleEvent);

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const dailyRecurrence = screen.getByRole('option', { name: 'dashboard-meeting-recurrence-daily' });
    fireEvent.click(dailyRecurrence);

    await waitFor(() => {
      expect(formikInstance?.values.recurrencePattern).toBe(CommonFrequencies.DAILY);
    });
  });

  it('renders custom recurrence dialog which is closed by default', () => {
    renderComponent(mockedSingleEvent);

    const customRecurrenceDialog = screen.getByTestId('custom-recurring-event-dialog');
    expect(customRecurrenceDialog).toBeInTheDocument();
    const submitButton = within(customRecurrenceDialog).queryByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeInTheDocument();
  });

  it('opens custom recurrence dialog on custom recurrency option click', async () => {
    renderComponent(mockedSingleEvent);

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const customRecurrence = screen.getByRole('option', { name: 'dashboard-meeting-recurrence-custom' });
    fireEvent.click(customRecurrence);

    const submitButton = await screen.findByRole('button', { name: 'Submit' });
    expect(submitButton).toBeInTheDocument();
  });

  it('adds new recurrency option to the recurrency menu and sets form value on user choice via dialog', async () => {
    renderComponent(mockedSingleEvent);

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    const customRecurrence = options[5];
    expect(customRecurrence).toHaveTextContent('dashboard-meeting-recurrence-custom');

    fireEvent.click(customRecurrence);

    const submitButton = await screen.findByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(formikInstance?.values.recurrencePattern).toBe(mockCustomRecurrency.value);
    });

    fireEvent.mouseDown(select);

    const newOptions = await screen.findAllByRole('option');
    expect(newOptions).toHaveLength(7);
    expect(newOptions[5]).toHaveTextContent(mockCustomRecurrency.label);
    expect(newOptions[6]).toHaveTextContent('dashboard-meeting-recurrence-custom');
  });

  it('renders custom recurrency option if exisiting event has one', () => {
    const exisitingRecurrencyPattern = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR' as RecurrencePattern;

    renderComponent({
      ...mockedSingleEvent,
      type: EventType.Recurring,
      isTimeIndependent: false,
      recurrencePattern: [exisitingRecurrencyPattern],
    });

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(7);

    expect(options[5]).toHaveTextContent('Every 2 weeks on Monday, Wednesday, Friday');
    expect(options[6]).toHaveTextContent('dashboard-meeting-recurrence-custom');
  });

  it('replaces custom recurrency option if user has changed it', async () => {
    const oldRecurrencyPattern = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR' as RecurrencePattern;

    renderComponent({
      ...mockedSingleEvent,
      type: EventType.Recurring,
      isTimeIndependent: false,
      recurrencePattern: [oldRecurrencyPattern],
    });

    const select = screen.getByRole('combobox', { name: 'dashboard-meeting-recurrence-label' });
    fireEvent.mouseDown(select);

    const oldOptions = screen.getAllByRole('option');
    const oldCustomRecurrence = oldOptions[5];
    expect(oldCustomRecurrence).toHaveTextContent('Every 2 weeks on Monday, Wednesday, Friday');

    const customRecurrence = oldOptions[6];
    fireEvent.click(customRecurrence);

    const submitButton = await screen.findByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    fireEvent.mouseDown(select);

    const newOptions = await screen.findAllByRole('option');
    const newCustomRecurrence = newOptions[5];
    expect(newCustomRecurrence).toHaveTextContent(mockCustomRecurrency.label);
  });
});
