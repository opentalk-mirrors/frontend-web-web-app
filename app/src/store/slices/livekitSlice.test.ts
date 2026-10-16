// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import { Track } from 'livekit-client';

import { switchRoom } from '../../api/types/outgoing/breakout';
import { notifications } from '../../commonComponents';
import { RoomKind, TimerStyle, ForceMuteType } from '../../types';
import { configureStore } from '../../utils/testUtils';
import { changeMedia, setScreenShareEnabled } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import livekitReducer, {
  cleanMediaSettingsState,
  clearMediaSettingsBeforeRoomSwitch,
  initialState,
  selectAudioChangeInProgress,
  selectMediaChange,
  selectScreenshareChangeInProgress,
  selectVideoChangeInProgress,
  setMediaSettingVideoEnabled,
  handleCameraOnReminder,
  handleRoomConnected,
} from './livekitSlice';
import { timerStarted } from './timerSlice';
import { toggledSelfViewMinimized } from './uiSlice';

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
  },
}));

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

describe('livekit slice - adopting lobby tracks on connect', () => {
  const buildLobbyTrack = () => ({ stop: vi.fn() });

  const buildConnectedRoom = () => {
    const publishTrack = vi.fn().mockResolvedValue(undefined);
    const room = { name: 'main', localParticipant: { publishTrack } } as unknown as typeof initialState.room;
    return { room, publishTrack };
  };

  const buildStore = (lobby: { audioTrackPublication?: unknown; videoTrackPublication?: unknown }) =>
    configureStore({
      initialState: {
        user: { uuid: 'user-id' },
        livekit: { ...initialState, lobby: { ...initialState.lobby, ...lobby } },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes the existing lobby tracks instead of re-acquiring the devices', async () => {
    const audioTrack = buildLobbyTrack();
    const videoTrack = buildLobbyTrack();
    const { room, publishTrack } = buildConnectedRoom();
    const { store, dispatchSpy } = buildStore({
      audioTrackPublication: audioTrack,
      videoTrackPublication: videoTrack,
    });

    await handleRoomConnected(store.dispatch, store.getState, room!);

    expect(publishTrack).toHaveBeenCalledWith(videoTrack);
    expect(publishTrack).toHaveBeenCalledWith(audioTrack);
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: changeMedia.pending.type }));
    expect(audioTrack.stop).not.toHaveBeenCalled();
    expect(videoTrack.stop).not.toHaveBeenCalled();
    expect(store.getState().livekit.lobby.audioTrackPublication).toBeUndefined();
    expect(store.getState().livekit.lobby.videoTrackPublication).toBeUndefined();
  });

  it('stops the lobby microphone track when the moderator force-muted the room', async () => {
    const audioTrack = buildLobbyTrack();
    const videoTrack = buildLobbyTrack();
    const { room, publishTrack } = buildConnectedRoom();
    const { store } = configureStore({
      initialState: {
        user: { uuid: 'user-id' },
        moderation: { forceMute: { type: ForceMuteType.Enabled, unrestrictedParticipants: [] } },
        livekit: {
          ...initialState,
          lobby: { ...initialState.lobby, audioTrackPublication: audioTrack, videoTrackPublication: videoTrack },
        },
      },
    });

    await handleRoomConnected(store.dispatch, store.getState, room!);

    expect(publishTrack).toHaveBeenCalledTimes(1);
    expect(publishTrack).toHaveBeenCalledWith(videoTrack);
    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
    expect(videoTrack.stop).not.toHaveBeenCalled();
  });

  it('falls back to acquiring a new device when publishing the lobby track fails', async () => {
    const videoTrack = buildLobbyTrack();
    const { room, publishTrack } = buildConnectedRoom();
    publishTrack.mockRejectedValue(new Error('publish failed'));
    const { store } = buildStore({ videoTrackPublication: videoTrack });

    await handleRoomConnected(store.dispatch, store.getState, room!);

    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
    expect(store.getState().livekit.mediaChangeInProgress['videoinput']).toEqual({ enabled: true });
  });
});

describe('livekit slice - media change in progress', () => {
  const changeMediaCases = [{ kind: 'audioinput' }, { kind: 'videoinput' }] as const;

  describe.each(changeMediaCases)('$kind', ({ kind }) => {
    const turnOn = { kind, enabled: true };
    const turnOff = { kind, enabled: false };

    it('stores the requested state while being turned on', () => {
      const { store } = configureStore();
      store.dispatch(changeMedia.pending('on', turnOn));
      expect(selectMediaChange(store.getState(), kind)).toEqual({ enabled: true });
    });

    it('stores the requested state while being turned off', () => {
      const { store } = configureStore();
      store.dispatch(changeMedia.pending('off', turnOff));
      expect(selectMediaChange(store.getState(), kind)).toEqual({ enabled: false });
    });

    it('is cleared once the change succeeded', () => {
      const { store } = configureStore();
      store.dispatch(changeMedia.pending('on', turnOn));
      store.dispatch(changeMedia.fulfilled(undefined, 'on', turnOn));
      expect(selectMediaChange(store.getState(), kind)).toBeUndefined();
    });

    it('is cleared once the change failed', () => {
      const { store } = configureStore();
      store.dispatch(changeMedia.pending('on', turnOn));
      store.dispatch(changeMedia.rejected(null, 'on', turnOn));
      expect(selectMediaChange(store.getState(), kind)).toBeUndefined();
    });

    it('keeps the latest requested state', () => {
      const { store } = configureStore();
      store.dispatch(changeMedia.pending('on', turnOn));
      store.dispatch(changeMedia.pending('off', turnOff));
      expect(selectMediaChange(store.getState(), kind)).toEqual({ enabled: false });
    });
  });

  describe('screenshare', () => {
    it('stores the requested state while being turned on', () => {
      const { store } = configureStore();
      store.dispatch(setScreenShareEnabled.pending('on', { enabled: true }));
      expect(selectMediaChange(store.getState(), 'screenshare')).toEqual({ enabled: true });
    });

    it('stores the requested state while being turned off', () => {
      const { store } = configureStore();
      store.dispatch(setScreenShareEnabled.pending('off', { enabled: false }));
      expect(selectMediaChange(store.getState(), 'screenshare')).toEqual({ enabled: false });
    });

    it('is cleared once the change succeeded', () => {
      const { store } = configureStore();
      store.dispatch(setScreenShareEnabled.pending('on', { enabled: true }));
      store.dispatch(setScreenShareEnabled.fulfilled(undefined, 'on', { enabled: true }));
      expect(selectMediaChange(store.getState(), 'screenshare')).toBeUndefined();
    });

    it('is cleared once the change failed', () => {
      const { store } = configureStore();
      store.dispatch(setScreenShareEnabled.pending('on', { enabled: true }));
      store.dispatch(setScreenShareEnabled.rejected(null, 'on', { enabled: true }));
      expect(selectMediaChange(store.getState(), 'screenshare')).toBeUndefined();
    });
  });

  it('tracks each kind separately', () => {
    const { store } = configureStore();
    store.dispatch(changeMedia.pending('on', { kind: 'videoinput', enabled: true }));
    expect(selectVideoChangeInProgress(store.getState())).toBe(true);
    expect(selectAudioChangeInProgress(store.getState())).toBe(false);
    expect(selectScreenshareChangeInProgress(store.getState())).toBe(false);
  });
});

const getMockListenerApi = (isSelfViewMinimized: boolean, cameraEnabled = true) =>
  ({
    getState: vi.fn(() => ({
      ui: { isSelfViewMinimized },
      livekit: { mediaSettings: { cameraEnabled } },
    })),
  }) as unknown as ListenerEffectAPI<RootState, AppDispatch>;

describe('livekit listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('camera on reminder', () => {
    it('notifies user that their camera is on, when enabling camera with minimized selfview', () => {
      const isSelfViewMinimized = true;
      const cameraEnabled = true;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(setMediaSettingVideoEnabled(true), listenerApi);
      expect(notifications.info).toHaveBeenCalledTimes(1);
    });

    it('notifies user that their camera is on, when minimizing the selfview and the camera is enabled', () => {
      const isSelfViewMinimized = true;
      const cameraEnabled = true;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(toggledSelfViewMinimized(), listenerApi);
      expect(notifications.info).toHaveBeenCalledTimes(1);
    });

    it('does not notify user, when enabling camera with expanded selfview', () => {
      const isSelfViewMinimized = false;
      const cameraEnabled = true;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(setMediaSettingVideoEnabled(true), listenerApi);
      expect(notifications.info).not.toHaveBeenCalled();
    });

    it('does not notify user, when expanding the selfview', () => {
      const isSelfViewMinimized = false;
      const cameraEnabled = true;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(toggledSelfViewMinimized(), listenerApi);
      expect(notifications.info).not.toHaveBeenCalled();
    });

    it('does not notify user, when disabling camera with minimized selfview', () => {
      const isSelfViewMinimized = true;
      const cameraEnabled = false;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(setMediaSettingVideoEnabled(false), listenerApi);
      expect(notifications.info).not.toHaveBeenCalled();
    });

    it('does not notify user, when minimizing the selfview and the camera is disabled', () => {
      const isSelfViewMinimized = true;
      const cameraEnabled = false;
      const listenerApi = getMockListenerApi(isSelfViewMinimized, cameraEnabled);
      handleCameraOnReminder(toggledSelfViewMinimized(), listenerApi);
      expect(notifications.info).not.toHaveBeenCalled();
    });
  });
});
