// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMaybeRoomContext } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { LIVEKIT_AUDIO_PERMISSION_NUMBER } from '../../../constants';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import AudioButton from './AudioButton';

vi.mock('@livekit/components-react', () => ({
  useMaybeRoomContext: vi.fn(),
  useObservableState: vi.fn().mockImplementation((_observable, startWith) => startWith),
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
    (useMaybeRoomContext as Mock).mockReturnValue({
      localParticipant: {
        permissions: { canPublishSources: [] },
        on: vi.fn(),
        off: vi.fn(),
      },
    });
    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  it('Button is enabled if microphones are enabled', () => {
    (useMaybeRoomContext as Mock).mockReturnValue({
      localParticipant: {
        permissions: { canPublishSources: [LIVEKIT_AUDIO_PERMISSION_NUMBER] },
        on: vi.fn(),
        off: vi.fn(),
      },
    });

    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });

  it('Button is disabled if isLivekitUnavailable is true', async () => {
    (useMaybeRoomContext as Mock).mockReturnValue(undefined);
    const { store } = configureStore({
      initialState: {
        livekit: {
          unavailable: true,
        },
      },
    });

    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });
    expect(screen.getByTestId('toolbarAudioButton')).toBeDisabled();
  });

  it('button is disabled and shows expected tooltip when audio is disabled by moderator', () => {
    (useMaybeRoomContext as Mock).mockReturnValue({
      localParticipant: {
        permissions: { canPublishSources: [] },
        on: vi.fn(),
        off: vi.fn(),
      },
    });
    const { store } = configureStore();
    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });
    const button = screen.getByRole('button', { name: 'toolbar-button-audio-disabled-tooltip', hidden: true });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
