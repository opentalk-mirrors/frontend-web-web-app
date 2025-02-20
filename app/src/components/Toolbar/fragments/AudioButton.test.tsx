// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { ForceMuteType } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import AudioButton from './AudioButton';

const MOCK_USER_ID = '06ff9aeb-21d6-4016-8e74-486ff78d70af';

jest.mock('@livekit/components-react', () => ({
  useRoomContext: () => jest.fn(),
  useLocalParticipantPermissions: () => jest.fn(),
  useMaybeRoomContext: () => ({ localParticipant: mockedParticipant(0) }),
  useMediaDeviceSelect: () => ({
    devices: [
      { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
      { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
    ],
  }),
}));

jest.mock('');

describe('Audio Button', () => {
  test.skip('Button is disabled if microphones are disabled', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: ForceMuteType.Enabled,
          },
        },
      },
    });
    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  test('Button is enabled if microphones are enabled', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
          },
        },
      },
    });

    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });

  test('Button is enabled if user is in unrestrictedParticipants', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: ForceMuteType.Enabled,
            unrestrictedParticipants: [MOCK_USER_ID],
          },
        },
        user: {
          uuid: MOCK_USER_ID,
        },
      },
    });

    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });
});
