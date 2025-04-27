// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import ConsentNotification from './ConsentNotification';

jest.mock('../../utils', () => ({
  notifications: { consent: () => jest.fn(), close: () => jest.fn() },
}));

const acceptButtonFn = jest.fn();
const declineButtonFn = jest.fn();

describe('ConsentNotification', () => {
  it('renders correctly', () => {
    render(<ConsentNotification style={{}} onAcceptButton={acceptButtonFn} onDeclineButton={declineButtonFn} />);
    const element = screen.getByRole('alertdialog');
    expect(element).toBeInTheDocument();
    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('consent-message')).toHaveAttribute('id', describedByElement);
  });

  it('calls callback functions on button click', () => {
    render(<ConsentNotification style={{}} onAcceptButton={acceptButtonFn} onDeclineButton={declineButtonFn} />);
    fireEvent.click(screen.getByText('consent-accept'));
    fireEvent.click(screen.getByText('consent-decline'));
    expect(acceptButtonFn).toHaveBeenCalled();
    expect(declineButtonFn).toHaveBeenCalled();
  });
});
