// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ForceMuteType } from '../../../types';
import { configureStore, mockedParticipant, render, screen } from '../../../utils/testUtils';
import AudioButton from './AudioButton';

const MOCK_USER_ID = '06ff9aeb-21d6-4016-8e74-486ff78d70af';

jest.mock('@livekit/components-react', () => ({
  useRoomContext: () => jest.fn(),
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
  xtest('Button is disabled if microphones are disabled', async () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: ForceMuteType.Enabled,
          },
        },
      },
    });
    await render(<AudioButton />, store);

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  test('Button is enabled if microphones are enabled', async () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
          },
        },
      },
    });

    await render(<AudioButton />, store);

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });

  test('Button is enabled if user is in unrestrictedParticipants', async () => {
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

    await render(<AudioButton />, store);

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });
});
