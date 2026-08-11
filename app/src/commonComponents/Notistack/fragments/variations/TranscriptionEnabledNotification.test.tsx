// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { notifications } from '../utils';
import { TranscriptionEnabledNotification } from './TranscriptionEnabledNotification';

vi.mock('../utils', () => ({
  notifications: { close: vi.fn() },
}));

describe('TranscriptionEnabledNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', () => {
    render(<TranscriptionEnabledNotification style={{}} onActivated={vi.fn()} />);

    const element = screen.getByRole('alertdialog');
    expect(element).toBeInTheDocument();

    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('subtitle-notification-enabled')).toHaveAttribute('id', describedByElement);
  });

  it('calls onActivated when the confirm button is clicked', async () => {
    const onActivated = vi.fn();
    const user = userEvent.setup();

    render(<TranscriptionEnabledNotification style={{}} onActivated={onActivated} />);

    await user.click(screen.getByRole('button', { name: 'subtitle-notification-show' }));
    expect(onActivated).toHaveBeenCalled();
  });
  it('closes the notification when the close button is clicked', async () => {
    const user = userEvent.setup();

    render(<TranscriptionEnabledNotification style={{}} onActivated={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'subtitle-notification-hide' }));
    expect(notifications.close).toHaveBeenCalledWith('transcription-enabled');
  });
});
