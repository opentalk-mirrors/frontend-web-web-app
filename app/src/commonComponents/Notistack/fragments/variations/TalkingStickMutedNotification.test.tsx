// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import { TalkingStickMutedNotification } from './TalkingStickMutedNotification';

describe('TalkingStickMutedNotification', () => {
  it('renders correctly', async () => {
    render(<TalkingStickMutedNotification style={{}} onUnmute={vi.fn()} onNext={vi.fn()} />);
    const element = await screen.findByRole('alertdialog');
    expect(element).toBeInTheDocument();
    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('talking-stick-speaker-announcement')).toHaveAttribute('id', describedByElement);
  });

  it('calls callback functions on button click', async () => {
    const unmuteButtonFn = vi.fn();
    const nextButtonFn = vi.fn();
    render(<TalkingStickMutedNotification style={{}} onUnmute={unmuteButtonFn} onNext={nextButtonFn} />);
    fireEvent.click(await screen.findByText('talking-stick-notification-unmute'));
    fireEvent.click(screen.getByText('talking-stick-notification-next-speaker'));

    expect(unmuteButtonFn).toHaveBeenCalled();
    expect(nextButtonFn).toHaveBeenCalled();
  });
});
