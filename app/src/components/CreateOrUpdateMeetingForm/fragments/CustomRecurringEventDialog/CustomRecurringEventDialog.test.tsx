// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '../../../../utils/testUtils';
import { RecurringEventDialog, RecurringEventDialogProps } from './CustomRecurringEventDialog';

const mockDialogProps: RecurringEventDialogProps = {
  open: true,
  closeDialog: jest.fn(),
  selectCustomFrequencyOption: jest.fn(),
  recurrenceStartTimestamp: new Date().toISOString(),
};

describe('Custom Recurrence Dialog', () => {
  test('Dialog renders correctly', async () => {
    await render(<RecurringEventDialog {...mockDialogProps} />);

    expect(screen.getByTestId('recurrence-dialog')).toBeInTheDocument();
  });

  test('Dialog does not render if not open', async () => {
    await render(<RecurringEventDialog {...mockDialogProps} open={false} />);

    expect(screen.queryByTestId('recurrence-dialog')).not.toBeInTheDocument();
  });

  test('Month content renders correctly', async () => {
    await render(<RecurringEventDialog {...mockDialogProps} />);

    //For some reason after updating MUI version and <Select> swapping to role="combobox" getting it by role and name is not possible
    //The workaround we have is to get all comboboxes and then find the one we need
    //We do that twice in this case, since the MonthlyOptions render a second <Select>, which is not initially caught
    const selectButtons = screen.getAllByRole('combobox');
    const freqSelectButton = selectButtons.find((button) =>
      button.textContent?.includes('dashboard-recurrence-dialog-frequency-day')
    );
    expect(freqSelectButton).toBeInTheDocument();

    freqSelectButton && fireEvent.mouseDown(freqSelectButton);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const monthOption = screen.getByRole('option', { name: 'dashboard-recurrence-dialog-frequency-month' });

    fireEvent.click(monthOption);

    await waitFor(() => {
      const select = screen.getByTestId('frequency-select');
      expect(select.textContent).toBe('dashboard-recurrence-dialog-frequency-month​');
    });

    const selectButtonsAfterMonthSelection = screen.getAllByRole('combobox');
    const monthSelectButton = selectButtonsAfterMonthSelection.find((button) =>
      button.textContent?.includes('dashboard-recurrence-dialog-frequency-details-monthly-on')
    );
    expect(monthSelectButton).toBeInTheDocument();
  });

  test('Week content renders correctly', async () => {
    await render(<RecurringEventDialog {...mockDialogProps} />);

    const selectButtons = screen.getAllByRole('combobox');
    const freqSelectButton = selectButtons.find((button) =>
      button.textContent?.includes('dashboard-recurrence-dialog-frequency-day')
    );
    expect(freqSelectButton).toBeInTheDocument();

    freqSelectButton && fireEvent.mouseDown(freqSelectButton);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const weekOption = screen.getByRole('option', { name: 'dashboard-recurrence-dialog-frequency-week' });

    fireEvent.click(weekOption);

    await waitFor(() => {
      //There is an unidentified char (Unicode 8203) added at the end of the value, so we use the regex to remove it
      const select = screen.getByTestId('frequency-select').textContent?.replace(/\u200B/g, '');
      expect(select).toBe('dashboard-recurrence-dialog-frequency-week');
      expect(screen.getByTestId('weekly-options')).toBeInTheDocument();
    });
  });

  test('Date selection is enabled after selecting option "On"', async () => {
    await render(<RecurringEventDialog {...mockDialogProps} />);

    const datePickerInput = screen.getByRole('textbox');
    expect(datePickerInput).toBeDisabled();

    const optionOn = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-on' });

    fireEvent.click(optionOn);

    await waitFor(() => {
      expect(datePickerInput).not.toBeDisabled();
    });
  });
});
