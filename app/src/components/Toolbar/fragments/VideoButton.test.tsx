// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import VideoButton from './VideoButton';

jest.mock('@livekit/components-react', () => ({
  useLocalParticipantPermissions: jest.fn(),
  useMaybeRoomContext: () => ({ localParticipant: mockedParticipant(0) }),
  useMediaDeviceSelect: () => ({
    devices: [
      { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
      { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
    ],
  }),
}));

describe('Video Button', () => {
  it('Button is disabled if isLivekitUnavailable is true', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          unavailable: true,
        },
      },
    });

    renderWithProviders(<VideoButton />, { store, provider: { snackbar: true } });
    expect(screen.getByTestId('toolbarVideoButton')).toBeDisabled();
  });
});
