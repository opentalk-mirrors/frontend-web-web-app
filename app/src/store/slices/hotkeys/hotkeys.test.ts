// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { waitFor } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';

import { ForceMuteType, ParticipantId, RoomMode } from '../../../types';
import { configureStore } from '../../../utils/testUtils';
import { SpeakerState } from '../automodSlice';
import * as listener from './listener';
import { domKeyDown } from './slice';

describe('hotkeys', () => {
  let unbind: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });

    vi.spyOn(window, 'location', 'get').mockReturnValue({
      pathname: '/room/test-room',
    } as Location);
  });

  afterEach(() => {
    unbind?.();
    vi.restoreAllMocks();
  });

  it('should call hotkeys when they are enabled', () => {
    const mockedOnPress = vi.fn();
    vi.spyOn(listener, 'registerHotkey').mockImplementation((args) => {
      listener.hotkeys.push({
        ...args,
        onPress: mockedOnPress,
      });
    });

    const { unbindDomEvents, dispatchSpy } = configureStore();

    unbind = unbindDomEvents;

    let event = new KeyboardEvent('keydown', { key: 'm', ctrlKey: true });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(500);

    event = new KeyboardEvent('keydown', { key: 'm' });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);

    event = new KeyboardEvent('keydown', { key: 'v' });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).toHaveBeenCalledTimes(3);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(500);

    event = new KeyboardEvent('keydown', { key: 'w' });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).toHaveBeenCalledTimes(4);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    event = new KeyboardEvent('keydown', { key: 'n' });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).toHaveBeenCalledTimes(5);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    vi.advanceTimersByTime(500);
  });

  it('should not call hotkeys when they are disabled', () => {
    const mockedOnPress = vi.fn();
    vi.spyOn(listener, 'registerHotkey').mockImplementation((args) => {
      listener.hotkeys.push({
        ...args,
        onPress: mockedOnPress,
      });
    });

    const { unbindDomEvents } = configureStore({
      initialState: {
        ui: {
          hotkeysEnabled: false,
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ctrl' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ctrl' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    vi.advanceTimersByTime(500);
  });

  it('does not call hotkeys when they are not registered', () => {
    const mockedOnPress = vi.fn();
    vi.spyOn(listener, 'registerHotkey').mockImplementation((args) => {
      listener.hotkeys.push({
        ...args,
        onPress: mockedOnPress,
      });
    });

    const { unbindDomEvents } = configureStore();

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    vi.advanceTimersByTime(100);
    expect(mockedOnPress).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x' }));
    vi.advanceTimersByTime(500);
  });

  it('toggles on the microphone on press and release control + m', async () => {
    const mockSetMicrophoneEnabled = vi.fn();
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        user: {
          uuid: uuidv4() as ParticipantId,
        },
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
            unrestrictedParticipants: [],
          },
        },
        livekit: {
          room: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetMicrophoneEnabled,
            },
          },
          lobby: {
            audioTrackPublication: false,
          },
          mediaSettings: {
            microphoneEnabled: false,
          },
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().livekit.mediaSettings.microphoneEnabled);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(500);

    await waitFor(() => store.getState().livekit.mediaSettings.microphoneEnabled);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(false);
  });

  it('toggles the microphone on press m key', async () => {
    const mockSetMicrophoneEnabled = vi.fn();
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        user: {
          uuid: uuidv4() as ParticipantId,
        },
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
            unrestrictedParticipants: [],
          },
        },
        livekit: {
          room: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetMicrophoneEnabled,
            },
          },
          lobby: {
            audioTrackPublication: false,
          },
          mediaSettings: {
            microphoneEnabled: false,
          },
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().livekit.mediaSettings.microphoneEnabled);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().livekit.mediaSettings.microphoneEnabled);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(false);
  });

  it('toggles video on press v key', async () => {
    const mockSetCameraEnabled = vi.fn();
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        user: {
          uuid: uuidv4() as ParticipantId,
        },
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
            unrestrictedParticipants: [],
          },
        },
        livekit: {
          room: {
            getActiveDevice: vi.fn().mockReturnValue('videoinput'),
            localParticipant: {
              setCameraEnabled: mockSetCameraEnabled,
            },
          },
          lobby: {
            videoTrackPublication: false,
          },
          mediaSettings: {
            cameraEnabled: false,
          },
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().livekit.mediaSettings.cameraEnabled);

    expect(store.getState().livekit.mediaSettings.cameraEnabled).toEqual(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(500);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().livekit.mediaSettings.cameraEnabled);

    expect(store.getState().livekit.mediaSettings.cameraEnabled).toEqual(false);
  });

  it('toggles whisper audio on press w key', async () => {
    const mockSetMicrophoneEnabled = vi.fn();
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        config: {
          tariff: {
            modules: {
              subroomAudio: true,
            },
          },
        },
        subroomAudio: {
          isWhisperActive: false,
        },
        user: {
          uuid: uuidv4() as ParticipantId,
        },
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
            unrestrictedParticipants: [],
          },
        },
        livekit: {
          whisperRoom: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetMicrophoneEnabled,
            },
          },
          mediaSettings: {
            microphoneEnabled: false,
          },
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().subroomAudio.isWhisperActive);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(false);
    expect(store.getState().subroomAudio.isWhisperActive).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    await waitFor(() => store.getState().subroomAudio.isWhisperActive);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(false);
    expect(store.getState().subroomAudio.isWhisperActive).toEqual(false);
  });

  it('toggles whisper audio on press w key and restore conference audio', async () => {
    const mockSetMicrophoneEnabled = vi.fn();
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        config: {
          tariff: {
            modules: {
              subroomAudio: true,
            },
          },
        },
        subroomAudio: {
          isWhisperActive: false,
        },
        user: {
          uuid: uuidv4() as ParticipantId,
        },
        moderation: {
          forceMute: {
            type: ForceMuteType.Disabled,
            unrestrictedParticipants: [],
          },
        },
        livekit: {
          whisperRoom: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetMicrophoneEnabled,
            },
          },
          mediaSettings: {
            microphoneEnabled: true,
          },
        },
      },
    });

    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().subroomAudio.isWhisperActive);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(false);
    expect(store.getState().subroomAudio.isWhisperActive).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    await waitFor(() => store.getState().subroomAudio.isWhisperActive);

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toEqual(true);
    expect(store.getState().subroomAudio.isWhisperActive).toEqual(false);
  });

  it('steps to next speaker when clicking n when active', async () => {
    const { store, unbindDomEvents } = configureStore({
      initialState: {
        automod: {
          speakerState: SpeakerState.Active,
        },
        room: {
          currentMode: RoomMode.TalkingStick,
        },
      },
    });
    unbind = unbindDomEvents;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().automod.speakerState === SpeakerState.Transitioning);

    expect(store.getState().automod.speakerState).toEqual(SpeakerState.Transitioning);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    vi.advanceTimersByTime(500);
  });

  it('diables hotkeys on focus in input', () => {
    const { unbindDomEvents } = configureStore();
    unbind = unbindDomEvents;

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new FocusEvent('focusin', { bubbles: true });
    input.dispatchEvent(event);

    expect(listener.isHotkeysDisabled()).toBe(true);

    document.body.removeChild(input);
  });

  it('enables hotkeys on focus out input', () => {
    const { unbindDomEvents } = configureStore();
    unbind = unbindDomEvents;

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    let event = new FocusEvent('focusin', { bubbles: true });
    input.dispatchEvent(event);

    event = new FocusEvent('focusout', { bubbles: true });
    input.dispatchEvent(event);

    expect(listener.isHotkeysDisabled()).toBe(false);

    document.body.removeChild(input);
  });
});
