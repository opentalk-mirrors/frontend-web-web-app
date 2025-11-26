// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule } from '@heinlein-video/rrule';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../utils/testUtils';
import { CustomEndOptions } from './CustomEndDateOptions';

describe('CustomEndOptions', () => {
  const getDateInputs = () => {
    const dayInput = screen.getByRole('spinbutton', { name: 'Day' });
    const monthInput = screen.getByRole('spinbutton', { name: 'Month' });
    const yearInput = screen.getByRole('spinbutton', { name: 'Year' });

    return { dayInput, monthInput, yearInput };
  };

  it('selects "Never" by default when no end date is provided and disables the date picker', () => {
    const updateRRuleObject = vi.fn();
    const minDate = new Date('2025-01-01');

    renderWithProviders(
      <CustomEndOptions rRuleObject={{ freq: RRule.DAILY }} updateRRuleObject={updateRRuleObject} minDate={minDate} />,
      { provider: { mui: true } }
    );

    const neverRadio = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-never' });
    expect(neverRadio).toBeChecked();

    const { dayInput, monthInput, yearInput } = getDateInputs();
    expect(dayInput).toHaveAttribute('aria-disabled', 'true');
    expect(monthInput).toHaveAttribute('aria-disabled', 'true');
    expect(yearInput).toHaveAttribute('aria-disabled', 'true');

    expect(updateRRuleObject).not.toHaveBeenCalled();
  });

  it('sets end date to minDate and enables the picker when selecting "On" without a preset date', async () => {
    const user = userEvent.setup();
    const updateRRuleObject = vi.fn();
    const minDate = new Date('2025-02-01');

    renderWithProviders(
      <CustomEndOptions rRuleObject={{ freq: RRule.DAILY }} updateRRuleObject={updateRRuleObject} minDate={minDate} />,
      { provider: { mui: true } }
    );

    const onRadio = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-on' });

    await user.click(onRadio);

    expect(updateRRuleObject).toHaveBeenCalledWith({ until: minDate });

    const { dayInput, monthInput, yearInput } = getDateInputs();
    expect(dayInput).toHaveAttribute('aria-disabled', 'false');
    expect(monthInput).toHaveAttribute('aria-disabled', 'false');
    expect(yearInput).toHaveAttribute('aria-disabled', 'false');
  });

  it('clears the end date when switching back to "Never"', async () => {
    const user = userEvent.setup();
    const until = new Date('2025-03-10');
    const updateRRuleObject = vi.fn();

    renderWithProviders(
      <CustomEndOptions
        rRuleObject={{ freq: RRule.DAILY, until }}
        updateRRuleObject={updateRRuleObject}
        minDate={new Date('2025-01-01')}
      />,
      { provider: { mui: true } }
    );

    const onRadio = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-on' });
    const neverRadio = screen.getByRole('radio', { name: 'dashboard-recurrence-dialog-end-option-never' });

    expect(onRadio).toBeChecked();

    await user.click(neverRadio);

    expect(updateRRuleObject).toHaveBeenCalledWith({ until: undefined });

    const { dayInput, monthInput, yearInput } = getDateInputs();
    expect(dayInput).toHaveAttribute('aria-disabled', 'true');
    expect(monthInput).toHaveAttribute('aria-disabled', 'true');
    expect(yearInput).toHaveAttribute('aria-disabled', 'true');
  });

  it('updates the end date when minDate moves past the selected date while "On" is active', async () => {
    const updateRRuleObject = vi.fn();
    const until = new Date('2025-05-10');
    const minDate = new Date('2025-05-01');

    const { rerender } = renderWithProviders(
      <CustomEndOptions
        rRuleObject={{ freq: RRule.DAILY, until }}
        updateRRuleObject={updateRRuleObject}
        minDate={minDate}
      />,
      { provider: { mui: true } }
    );

    const newMinDate = new Date('2025-05-20');

    rerender(
      <CustomEndOptions
        rRuleObject={{ freq: RRule.DAILY, until }}
        updateRRuleObject={updateRRuleObject}
        minDate={newMinDate}
      />
    );

    await waitFor(() => expect(updateRRuleObject).toHaveBeenCalledWith({ until: newMinDate }));
    expect(updateRRuleObject).toHaveBeenCalledTimes(1);
  });
});
