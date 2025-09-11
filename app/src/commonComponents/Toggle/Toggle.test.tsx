// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { renderWithProviders } from '../../utils/testUtils';
import Toggle from './Toggle';

const commonProps = {
  label: 'Test Toggle',
  name: 'testToggle',
  onChange: vi.fn(),
  checked: false,
  value: 1,
  options: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
  ],
};

describe('Toggle', () => {
  it('calls onChange when the toggle is clicked', async () => {
    renderWithProviders(<Toggle {...commonProps} />, { provider: { mui: true } });
    const toggleButton = screen.getByRole('button', { name: '2' });
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(commonProps.onChange).toHaveBeenCalled();
    });
  });
});
