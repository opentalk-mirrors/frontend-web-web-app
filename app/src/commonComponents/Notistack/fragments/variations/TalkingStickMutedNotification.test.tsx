// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '../../../../utils/testUtils';
import { TalkingStickMutedNotification } from './TalkingStickMutedNotification';

describe('TalkingStickMutedNotification', () => {
  test('component DOM structure', async () => {
    await render(<TalkingStickMutedNotification style={{}} onUnmute={jest.fn()} onNext={jest.fn()} />);
    const element = screen.getByRole('alertdialog');
    expect(element).toBeInTheDocument();
    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('talking-stick-speaker-announcement')).toHaveAttribute('id', describedByElement);
  });

  test('button responsiveness', async () => {
    const unmuteButtonFn = jest.fn();
    const nextButtonFn = jest.fn();
    await render(<TalkingStickMutedNotification style={{}} onUnmute={unmuteButtonFn} onNext={nextButtonFn} />);
    fireEvent.click(screen.getByText('talking-stick-notification-unmute'));
    fireEvent.click(screen.getByText('talking-stick-notification-next-speaker'));

    await waitFor(() => {
      expect(unmuteButtonFn).toHaveBeenCalled();
      expect(nextButtonFn).toHaveBeenCalled();
    });
  });
});
