// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import { TalkingStickMutedNotification } from './TalkingStickMutedNotification';

describe('TalkingStickMutedNotification', () => {
  it('renders correctly', () => {
    render(<TalkingStickMutedNotification style={{}} onUnmute={jest.fn()} onNext={jest.fn()} />);
    const element = screen.getByRole('alertdialog');
    expect(element).toBeInTheDocument();
    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('talking-stick-speaker-announcement')).toHaveAttribute('id', describedByElement);
  });

  it('calls callback functions on button click', () => {
    const unmuteButtonFn = jest.fn();
    const nextButtonFn = jest.fn();
    render(<TalkingStickMutedNotification style={{}} onUnmute={unmuteButtonFn} onNext={nextButtonFn} />);
    fireEvent.click(screen.getByText('talking-stick-notification-unmute'));
    fireEvent.click(screen.getByText('talking-stick-notification-next-speaker'));

    expect(unmuteButtonFn).toHaveBeenCalled();
    expect(nextButtonFn).toHaveBeenCalled();
  });
});
