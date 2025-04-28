// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanup, screen } from '@testing-library/react';

import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import WaitingView from './WaitingView';

jest.mock('@livekit/components-react', () => ({
  useRoomContext: () => jest.fn(),
  useLocalParticipant: () => ({ localParticipant: mockedParticipant(0) }),
  useMediaDeviceSelect: () => [
    { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
    { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
  ],
}));

jest.mock('../SelfTest', () => ({
  ...jest.requireActual('../SelfTest'),
  __esModule: true,
  default: () => <div data-testid="selfTest"></div>,
}));

describe('Waiting view', () => {
  afterEach(() => cleanup());

  it('Enter button is disabled if ConnectionState is Waiting', () => {
    const { store } = configureStore({
      initialState: {
        room: { connectionState: ConnectionState.ReadyToEnter },
      },
    });
    renderWithProviders(<WaitingView />, { store });

    expect(screen.getByTestId('selfTest')).toBeVisible();
  });
});
