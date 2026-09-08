// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Track } from 'livekit-client';

import { switchRoom } from '../../api/types/outgoing/breakout';
import { RoomKind, TimerStyle } from '../../types';
import { configureStore } from '../../utils/testUtils';
import livekitReducer, {
  cleanMediaSettingsState,
  clearMediaSettingsBeforeRoomSwitch,
  initialState,
} from './livekitSlice';
import { timerStarted } from './timerSlice';

vi.mock('../../modules/Media/BackgroundBlur', () => ({
  BackgroundBlur: vi.fn().mockImplementation(() => ({})),
}));

describe('livekit slice - media state across breakout room switches', () => {
  it('snapshots the current media intent when a room switch starts', () => {
    const state = {
      ...initialState,
      mediaSettings: { ...initialState.mediaSettings, cameraEnabled: true, microphoneEnabled: true },
    };

    const nextState = livekitReducer(state, switchRoom.action({ kind: RoomKind.Main }));

    expect(nextState.isSwitchingRooms).toBe(true);
    expect(nextState.mediaSettingsBeforeRoomSwitch).toEqual({ cameraEnabled: true, microphoneEnabled: true });
  });

  it('keeps the snapshot when the local tracks are torn down during the switch', () => {
    const state = {
      ...initialState,
      mediaSettings: { ...initialState.mediaSettings, cameraEnabled: true, microphoneEnabled: true },
      mediaSettingsBeforeRoomSwitch: { cameraEnabled: true, microphoneEnabled: true },
    };

    const nextState = livekitReducer(state, cleanMediaSettingsState());

    expect(nextState.mediaSettings.cameraEnabled).toBe(false);
    expect(nextState.mediaSettings.microphoneEnabled).toBe(false);
    expect(nextState.mediaSettingsBeforeRoomSwitch).toEqual({ cameraEnabled: true, microphoneEnabled: true });
  });

  it('clears the snapshot once it has been restored', () => {
    const state = {
      ...initialState,
      mediaSettingsBeforeRoomSwitch: { cameraEnabled: true, microphoneEnabled: true },
    };

    const nextState = livekitReducer(state, clearMediaSettingsBeforeRoomSwitch());

    expect(nextState.mediaSettingsBeforeRoomSwitch).toBeNull();
  });
});

describe('livekit slice - disable media on coffee break', () => {
  const buildRoomMock = () => {
    const audioTrackStop = vi.fn();
    const setMicrophoneEnabled = vi.fn().mockResolvedValue(undefined);
    const setCameraEnabled = vi.fn().mockResolvedValue(undefined);
    const getTrackPublication = vi.fn((source: Track.Source) =>
      source === Track.Source.Microphone ? { audioTrack: { stop: audioTrackStop } } : undefined
    );
    const room = {
      localParticipant: { setMicrophoneEnabled, setCameraEnabled, getTrackPublication },
    } as unknown as typeof initialState.room;

    return { room, audioTrackStop, setMicrophoneEnabled, setCameraEnabled };
  };

  const startCoffeeBreak = () =>
    timerStarted({ startedAt: '2024-01-01T00:00:00Z', style: TimerStyle.CoffeeBreak, kind: 'countdown' });

  const flushMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeAll(() => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stops the microphone track when a coffee break starts so the capture device is released', async () => {
    const { room, audioTrackStop, setMicrophoneEnabled, setCameraEnabled } = buildRoomMock();
    const { store } = configureStore({
      initialState: {
        livekit: { ...initialState, room, mediaSettings: { ...initialState.mediaSettings, microphoneEnabled: true } },
      },
    });

    store.dispatch(startCoffeeBreak());

    await vi.waitFor(() => expect(audioTrackStop).toHaveBeenCalledTimes(1));
    expect(setMicrophoneEnabled).toHaveBeenCalledWith(false, expect.anything());
    expect(setCameraEnabled).toHaveBeenCalledWith(false, expect.anything());
  });

  it('does not stop the microphone track for a normal timer', async () => {
    const { room, audioTrackStop, setMicrophoneEnabled } = buildRoomMock();
    const { store } = configureStore({
      initialState: {
        livekit: { ...initialState, room, mediaSettings: { ...initialState.mediaSettings, microphoneEnabled: true } },
      },
    });

    store.dispatch(timerStarted({ startedAt: '2024-01-01T00:00:00Z', style: TimerStyle.Normal, kind: 'countdown' }));

    await flushMacrotask();
    expect(audioTrackStop).not.toHaveBeenCalled();
    expect(setMicrophoneEnabled).not.toHaveBeenCalled();
  });

  it('does not touch media when no track is enabled at coffee break start', async () => {
    const { room, audioTrackStop, setMicrophoneEnabled } = buildRoomMock();
    const { store } = configureStore({
      initialState: { livekit: { ...initialState, room } },
    });

    store.dispatch(startCoffeeBreak());

    await flushMacrotask();
    expect(audioTrackStop).not.toHaveBeenCalled();
    expect(setMicrophoneEnabled).not.toHaveBeenCalled();
  });
});
