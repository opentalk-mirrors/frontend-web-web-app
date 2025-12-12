// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { closeSnackbar, SnackbarKey } from 'notistack';

import { CustomNotification } from './CustomNotification';

vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();

  return {
    ...actual,
    closeSnackbar: vi.fn(),
  };
});

describe('CustomNotification', () => {
  const iconVariant = {
    success: <span data-testid="success-icon" />,
  };

  const baseProps = {
    id: 'notification-id',
    message: 'Notification text',
    variant: 'success' as const,
    iconVariant,
    style: {},
    persist: false,
    anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
    hideIconVariant: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the provided icon, message and classes', () => {
    render(<CustomNotification {...baseProps} className="extra-class" ariaLive="polite" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('extra-class');
    expect(alert).toHaveClass('notistack-MuiContent-success');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    expect(screen.getByText('Notification text')).toBeInTheDocument();
  });

  it('uses the close button fallback to dismiss the notification', async () => {
    const user = userEvent.setup();
    render(<CustomNotification {...baseProps} />);

    await user.click(screen.getByTestId('close-button'));

    expect(vi.mocked(closeSnackbar)).toHaveBeenCalledWith(baseProps.id);
  });

  it('renders a provided action element instead of the close button', () => {
    render(<CustomNotification {...baseProps} action={<button data-testid="provided-action">Custom action</button>} />);

    expect(screen.getByTestId('provided-action')).toBeInTheDocument();
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  });

  it('passes the snackbar id to an action render function', async () => {
    const user = userEvent.setup();
    const actionHandler = vi.fn();
    const actionRenderer = vi.fn((snackbarKey: SnackbarKey) => (
      <button type="button" data-testid="rendered-action" onClick={() => actionHandler(snackbarKey)}>
        Rendered action
      </button>
    ));

    render(<CustomNotification {...baseProps} action={actionRenderer} />);

    expect(actionRenderer).toHaveBeenCalledWith(baseProps.id);
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('rendered-action'));

    expect(actionHandler).toHaveBeenCalledWith(baseProps.id);
    expect(vi.mocked(closeSnackbar)).not.toHaveBeenCalled();
  });
});
