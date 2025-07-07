// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../utils/testUtils';
import { CustomRecurringEventDialog, CustomRecurringEventDialogProps } from './CustomRecurringEventDialog';

const mockDialogProps: CustomRecurringEventDialogProps = {
  open: true,
  closeDialog: jest.fn(),
  selectCustomFrequencyOption: jest.fn(),
  recurrenceStartTimestamp: new Date().toISOString(),
};

describe('Custom Recurrence Dialog', () => {
  it('renders correctly', () => {
    render(<CustomRecurringEventDialog {...mockDialogProps} />);

    expect(screen.getByTestId('recurrence-dialog')).toBeInTheDocument();
  });

  it('does not render if not open', () => {
    render(<CustomRecurringEventDialog {...mockDialogProps} open={false} />);

    expect(screen.queryByTestId('recurrence-dialog')).not.toBeInTheDocument();
  });

  it('renders correctly month content', () => {
    render(<CustomRecurringEventDialog {...mockDialogProps} />);

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

    const select = screen.getByTestId('frequency-select');
    expect(select.textContent).toBe('dashboard-recurrence-dialog-frequency-month​');

    const selectButtonsAfterMonthSelection = screen.getAllByRole('combobox');
    const monthSelectButton = selectButtonsAfterMonthSelection.find((button) =>
      button.textContent?.includes('dashboard-recurrence-dialog-frequency-details-monthly-on')
    );
    expect(monthSelectButton).toBeInTheDocument();
  });

  it('renders correctly week content', () => {
    renderWithProviders(<CustomRecurringEventDialog {...mockDialogProps} />, { provider: { mui: true } });

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

    //There is an unidentified char (Unicode 8203) added at the end of the value, so we use the regex to remove it
    const select = screen.getByTestId('frequency-select').textContent?.replace(/\u200B/g, '');
    expect(select).toBe('dashboard-recurrence-dialog-frequency-week');
    expect(screen.getByTestId('weekly-options')).toBeInTheDocument();
  });

  it('enables date selection after selecting option "On"', () => {
    render(<CustomRecurringEventDialog {...mockDialogProps} />);

    const datePickerInput = screen.getByRole('textbox');
    expect(datePickerInput).toBeDisabled();

    const optionOn = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-on' });

    fireEvent.click(optionOn);

    expect(datePickerInput).not.toBeDisabled();
  });
});
