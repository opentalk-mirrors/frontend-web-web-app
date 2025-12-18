// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectionModeRow } from '../SelectionModeRow';
import { DropdownOptions } from '../constants';

describe('SelectionModeRow', () => {
  it('renders dropdown options', () => {
    const onChangeMock = vi.fn();
    render(<SelectionModeRow value={DropdownOptions.Rooms} onChange={onChangeMock} />);
    const select = screen.getByLabelText('breakout-room-form-field-based-on');
    expect(select).toBeInTheDocument();
  });

  it('can change value', async () => {
    const onChangeMock = vi.fn();
    render(<SelectionModeRow value={DropdownOptions.Rooms} onChange={onChangeMock} />);
    const select = screen.getByLabelText('breakout-room-form-field-based-on');
    await userEvent.click(select);
    const participantsOption = screen.getByRole('option', { name: 'global-participants' });
    await userEvent.click(participantsOption);
    expect(onChangeMock).toHaveBeenCalled();
  });
});
