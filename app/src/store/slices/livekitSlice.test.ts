// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { switchRoom } from '../../api/types/outgoing/breakout';
import { RoomKind } from '../../types';
import livekitReducer, {
  cleanMediaSettingsState,
  clearMediaSettingsBeforeRoomSwitch,
  initialState,
} from './livekitSlice';

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
