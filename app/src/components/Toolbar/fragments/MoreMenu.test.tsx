// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import MenuButton from './MoreButton';
import MoreMenu from './MoreMenu';

describe('<MoreButton />', () => {
  const { store } = configureStore();

  test('render MoreMenuButton component', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.queryByTestId('moreMenu')).not.toBeInTheDocument();
  });

  test('render moreMenu after clicking on MoreMenuButton', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true } });
    const button = screen.getByTestId('toolbarMenuButton');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByTestId('moreMenu')).toBeInTheDocument();
  });

  describe('additional development options', () => {
    beforeEach(() => {
      window.localStorage.setItem('devMode', 'true');
    });

    test('shows success notification when show test info option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={jest.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });

      fireEvent.click(screen.getByText('Show Test Info'));

      const notificationMessage = screen.getByText('You just triggered this notification. Success!');

      expect(notificationMessage).toBeInTheDocument();
      expect(notificationMessage.parentElement).toHaveAttribute('role', 'alert');
      expect(notificationMessage.parentElement).toHaveClass('notistack-MuiContent-success');
    });

    test('shows error notification when show test error option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={jest.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });

      fireEvent.click(screen.getByText('Show Test Error'));

      const notificationMessage = screen.getByText('Test error context: Error: Test Error');

      expect(notificationMessage).toBeInTheDocument();
      expect(notificationMessage.parentElement).toHaveAttribute('role', 'alert');
      expect(notificationMessage.parentElement).toHaveClass('notistack-MuiContent-error');
    });
  });
});
