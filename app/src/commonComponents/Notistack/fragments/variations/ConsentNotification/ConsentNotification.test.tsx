// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import ConsentNotification from './ConsentNotification';

vi.mock('../../utils', () => ({
  notifications: { consent: () => vi.fn(), close: () => vi.fn() },
}));

const acceptButtonFn = vi.fn();
const declineButtonFn = vi.fn();

describe('ConsentNotification', () => {
  it('renders correctly', async () => {
    render(<ConsentNotification style={{}} onAcceptButton={acceptButtonFn} onDeclineButton={declineButtonFn} />);
    const element = await screen.findByRole('alertdialog');
    expect(element).toBeInTheDocument();
    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('consent-message')).toHaveAttribute('id', describedByElement);
  });

  it('calls callback functions on button click', async () => {
    render(<ConsentNotification style={{}} onAcceptButton={acceptButtonFn} onDeclineButton={declineButtonFn} />);
    fireEvent.click(await screen.findByText('consent-accept'));
    fireEvent.click(await screen.findByText('consent-decline'));
    expect(acceptButtonFn).toHaveBeenCalled();
    expect(declineButtonFn).toHaveBeenCalled();
  });
});
