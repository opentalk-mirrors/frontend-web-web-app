// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMaybeRoomContext } from '@livekit/components-react';
import { act, screen } from '@testing-library/react';
import { RoomEvent } from 'livekit-client';
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

const createMockRoom = (canPublishSources: number[]) => {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const localParticipant = {
    permissions: { canPublishSources: [...canPublishSources] },
  };
  const room = {
    localParticipant,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      const set = handlers.get(event) ?? new Set();
      set.add(handler);
      handlers.set(event, set);
      return room;
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers.get(event)?.delete(handler);
      return room;
    }),
    emit: (event: string, ...args: unknown[]) => {
      handlers.get(event)?.forEach((handler) => handler(...args));
    },
    setAudioPermission: (nextSources: number[]) => {
      localParticipant.permissions = { canPublishSources: [...nextSources] };
    },
  };
  return room;
};

describe('Audio Button', () => {
  const { store } = configureStore();

  afterEach(() => {
    (useMaybeRoomContext as Mock).mockReset();
  });

  it('Button is disabled if microphones are disabled', async () => {
    (useMaybeRoomContext as Mock).mockReturnValue(createMockRoom([]));
    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  it('Button is enabled if microphones are enabled', () => {
    (useMaybeRoomContext as Mock).mockReturnValue(createMockRoom([LIVEKIT_AUDIO_PERMISSION_NUMBER]));

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
    (useMaybeRoomContext as Mock).mockReturnValue(createMockRoom([]));
    const { store } = configureStore();
    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });
    const button = screen.getByRole('button', { name: 'toolbar-button-audio-disabled-tooltip', hidden: true });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('disables button when users audio is restricted', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: 'enabled',
            unrestrictedParticipants: [],
          },
        },
        user: {
          uuid: 'local-participant-id',
        },
      },
    });

    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).toBeDisabled();
  });

  it('enables button when users audio is not restricted', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          forceMute: {
            type: 'enabled',
            unrestrictedParticipants: ['local-participant-id'],
          },
        },
        user: {
          uuid: 'local-participant-id',
        },
      },
    });

    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');

    expect(audioButton).not.toBeDisabled();
  });

  it('re-enables the button when LiveKit restores audio publish permission at runtime', () => {
    const room = createMockRoom([]);
    (useMaybeRoomContext as Mock).mockReturnValue(room);

    renderWithProviders(<AudioButton audioEnabled={false} onAudioButtonToggle={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const audioButton = screen.getByTestId('toolbarAudioButton');
    expect(audioButton).toBeDisabled();

    // Simulate LiveKit granting audio publish permission in place after the moderator re-enables microphones
    act(() => {
      room.setAudioPermission([LIVEKIT_AUDIO_PERMISSION_NUMBER]);
      room.emit(RoomEvent.ParticipantPermissionsChanged, undefined, room.localParticipant);
    });

    expect(audioButton).not.toBeDisabled();
  });
});
