// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import HotkeyDialog from './HotkeyDialog';

vi.mock('./HotkeyTable', () => ({
  __esModule: true,
  default: () => <div data-testid="HotkeyTable"></div>,
}));

describe('HotkeyDialog', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('renders all elements', async () => {
    const { store } = configureStore({
      initialState: {
        ui: { hotkeysEnabled: true },
      },
    });
    renderWithProviders(<HotkeyDialog open onClose={mockOnClose} />, { store });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { description: 'shortcut-table-summary' })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'my-meeting-menu-keyboard-hotkeys' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'my-meeting-menu-activate-hotkeys' })).toBeInTheDocument();
    expect(screen.getByTestId('HotkeyTable')).toBeInTheDocument();
  });

  it('change to deactivated component on click switch', async () => {
    const { store } = configureStore({
      initialState: {
        ui: { hotkeysEnabled: true },
      },
    });
    renderWithProviders(<HotkeyDialog open onClose={mockOnClose} />, { store });

    const switchButton = screen.getByRole('switch', { name: 'my-meeting-menu-activate-hotkeys' });

    await userEvent.click(switchButton);

    expect(screen.getByText('hotkey-disabled-message')).toBeInTheDocument();
  });

  it('fires onClose callback on close button click', async () => {
    const { store } = configureStore();
    renderWithProviders(<HotkeyDialog open onClose={mockOnClose} />, { store });

    const closeButton = screen.getByRole('button', { name: 'global-close-dialog' });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
