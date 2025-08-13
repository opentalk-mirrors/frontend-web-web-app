// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipantPermissions } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { LIVEKIT_AUDIO_PERMISSION_NUMBER } from '../../../constants';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import AudioButton from './AudioButton';

vi.mock('@livekit/components-react', () => ({
  useLocalParticipantPermissions: vi.fn(),
  useMediaDeviceSelect: () => ({
    devices: [
      { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
      { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
    ],
  }),
}));

describe('Audio Button', () => {
  const { store } = configureStore();

  it('Button is disabled if microphones are disabled', async () => {
    (useLocalParticipantPermissions as Mock).mockReturnValue({
      canPublishSources: [],
    });
    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  it('Button is enabled if microphones are enabled', () => {
    (useLocalParticipantPermissions as Mock).mockReturnValue({
      canPublishSources: [LIVEKIT_AUDIO_PERMISSION_NUMBER],
    });

    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });

  it('Button is disabled if isLivekitUnavailable is true', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          unavailable: true,
        },
      },
    });

    renderWithProviders(<AudioButton />, { store, provider: { snackbar: true } });
    expect(screen.getByTestId('toolbarAudioButton')).toBeDisabled();
  });

  it('button is disabled and shows expected tooltip when audio is disabled by moderator', () => {
    (useLocalParticipantPermissions as Mock).mockReturnValue({
      canPublishSources: [],
    });
    const { store } = configureStore();
    renderWithProviders(<AudioButton />, { store });
    const button = screen.getByRole('button', { name: 'toolbar-button-audio-disabled-tooltip', hidden: true });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
