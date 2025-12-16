// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setIsRoomDeleted } from '../../../store/slices/roomSlice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MoreButton from './MoreButton';

const mockedMoreMenu = vi.hoisted(() =>
  vi.fn(({ open, onClose, anchorEl }: { open: boolean; onClose: () => void; anchorEl: HTMLElement | null }) => (
    <button data-testid="moreMenu" data-open={open} data-anchor={Boolean(anchorEl)} onClick={onClose} />
  ))
);

vi.mock('./MoreMenu', () => ({
  __esModule: true,
  default: mockedMoreMenu,
}));

describe('MoreButton', () => {
  const renderComponent = () => {
    const { store } = configureStore();

    return renderWithProviders(<MoreButton />, { store, provider: { snackbar: true, mui: true } });
  };

  beforeEach(() => {
    mockedMoreMenu.mockClear();
  });

  it('renders the toolbar button and keeps the menu closed initially', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' })).toBeInTheDocument();
    expect(screen.getByTestId('moreMenu')).toHaveAttribute('data-open', 'false');
  });

  it('opens the menu with the button as anchor when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByTestId('toolbarMenuButton'));

    expect(screen.getByTestId('moreMenu')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('moreMenu')).toHaveAttribute('data-anchor', 'true');
  });

  it('closes the menu when MoreMenu triggers onClose', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByTestId('toolbarMenuButton'));
    await user.click(screen.getByTestId('moreMenu'));

    await waitFor(() => expect(screen.getByTestId('moreMenu')).toHaveAttribute('data-open', 'false'));
  });

  it('disables the toolbar button when the room is deleted', () => {
    const { store } = configureStore();
    store.dispatch(setIsRoomDeleted(true));

    renderWithProviders(<MoreButton />, { store, provider: { snackbar: true, mui: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeDisabled();
    expect(screen.getByTestId('moreMenu')).toHaveAttribute('data-open', 'false');
  });
});
