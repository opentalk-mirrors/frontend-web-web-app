// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '../../../../utils/testUtils';
import { TalkingStickUnmutedNotification } from './TalkingStickUnmutedNotification';

describe('TalkingStickUnmutedNotification', () => {
  test('component DOM structure', async () => {
    await render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={false} onNext={jest.fn()} />);

    const element = screen.getByRole('alertdialog');
    expect(element).toBeInTheDocument();

    const describedByElement = element.getAttribute('aria-describedby');
    expect(screen.getByText('talking-stick-unmuted-notification')).toHaveAttribute('id', describedByElement);
  });

  it('shows different text on last speaker', async () => {
    await render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={true} onNext={jest.fn()} />);
    expect(screen.getByText('talking-stick-unmuted-notification-last-participant')).toBeInTheDocument();
  });

  test('button responsiveness', async () => {
    const nextButtonFn = jest.fn();
    await render(<TalkingStickUnmutedNotification style={{}} isLastSpeaker={false} onNext={nextButtonFn} />);

    fireEvent.click(screen.getByText('talking-stick-notification-next-speaker'));

    await waitFor(() => {
      expect(nextButtonFn).toHaveBeenCalled();
    });
  });
});
