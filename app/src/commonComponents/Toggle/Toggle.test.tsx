// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ThemeProvider } from '@mui/material';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import Toggle from './Toggle';

const commonProps = {
  label: 'Test Toggle',
  name: 'testToggle',
  onChange: jest.fn(),
  checked: false,
  value: 1,
  options: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
  ],
};

const theme = createOpenTalkTheme();

describe('Toggle', () => {
  it('calls onChange when the toggle is clicked', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Toggle {...commonProps} />
      </ThemeProvider>
    );
    const toggleButton = screen.getByRole('button', { name: '2' });
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(commonProps.onChange).toHaveBeenCalled();
    });
  });
});
