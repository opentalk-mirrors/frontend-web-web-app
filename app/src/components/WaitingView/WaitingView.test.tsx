// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import WaitingView from './WaitingView';

vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => vi.fn(),
  useLocalParticipant: () => ({ localParticipant: mockedParticipant(0) }),
  useMediaDeviceSelect: () => [
    { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
    { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
  ],
}));

vi.mock('../SelfTest', () => ({
  default: (props: PropsWithChildren) => <div data-testid="selfTest">{props.children}</div>,
}));

vi.mock('../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

describe('Waiting view', () => {
  it('Enter button is disabled if ConnectionState is Waiting', () => {
    const { store } = configureStore({
      initialState: {
        room: { connectionState: ConnectionState.ReadyToEnter },
      },
    });
    renderWithProviders(<WaitingView />, { store });

    expect(screen.getByTestId('selfTest')).toBeVisible();
  });

  it('does not render enter button if auto join is disabled', () => {
    const { store } = configureStore({
      room: { connectionState: ConnectionState.Waiting },
    });
    renderWithProviders(<WaitingView />, { store });
    const checkbox = screen.getByRole('checkbox', { name: 'waiting-room-auto-join-label' });
    fireEvent.click(checkbox);
    expect(screen.getByText('in-waiting-room')).toBeInTheDocument();
  });
});
