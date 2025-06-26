// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import { TalkingStickUnmutedNotification } from './TalkingStickUnmutedNotification';

describe('TalkingStickUnmutedNotification', () => {
  it('renders correctly', async () => {
    render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={false} onNext={jest.fn()} />);

    const element = await screen.findByRole('alertdialog');
    expect(element).toBeInTheDocument();

    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('talking-stick-unmuted-notification')).toHaveAttribute('id', describedByElement);
  });

  it('shows different text on last speaker', async () => {
    render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={true} onNext={jest.fn()} />);
    expect(await screen.findByText('talking-stick-unmuted-notification-last-participant')).toBeInTheDocument();
  });

  it('calls callback functions on button click', async () => {
    const nextButtonFn = jest.fn();
    render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={false} onNext={nextButtonFn} />);

    fireEvent.click(await screen.findByText('talking-stick-notification-next-speaker'));

    expect(nextButtonFn).toHaveBeenCalled();
  });
});
