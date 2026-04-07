// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { waitFor } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';

import { ForceMuteType, ParticipantId, RoomMode } from '../../../types';
import { configureStore } from '../../../utils/testUtils';
import * as commonActions from '../../commonActions';
import { SpeakerState } from '../automodSlice';
import { fullscreenActions } from '../fullscreen/slice';
import * as livekitSlice from '../livekitSlice';
import { ReduxDomEvents } from './eventBindings';
import * as events from './events';
import * as listener from './listener';
import { domKeyDown } from './slice';

vi.mock('../../modules/Media/BackgroundBlur', () => ({
  BackgroundBlur: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

describe('hotkeys', () => {
  beforeAll(() => {
    const { store } = configureStore();
    ReduxDomEvents.createInstance(store.dispatch);
  });
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });

    vi.spyOn(window, 'location', 'get').mockReturnValue({
      pathname: '/room/test-room',
    } as Location);
    window.document.body.innerHTML = '';

    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    window.onkeydown = null;
    window.onkeyup = null;
    window.onfocus = null;
    vi.useRealTimers();
  });

  it('should call hotkeys when they are enabled', () => {
    const { dispatchSpy, store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const spyToggleMicrophone = vi.spyOn(events, 'toggleMicrophone');

    const event = new KeyboardEvent('keydown', { key: 'm', ctrlKey: true });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);
    expect(spyToggleMicrophone).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith({ type: domKeyDown.type, payload: event });
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(500);
  });

  it('should not call hotkeys when they are disabled', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          hotkeysEnabled: false,
        },
      },
    });
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const spyToggleMicrophone = vi.spyOn(events, 'toggleMicrophone');
    const spyToggleVideo = vi.spyOn(events, 'toggleVideo');
    const spyToggleAudioToWhisperGroup = vi.spyOn(events, 'toggleAudioToWhisperGroup');
    const spyNextSpeaker = vi.spyOn(events, 'nextSpeaker');
    const spyToggleFullscreen = vi.spyOn(events, 'toggleFullscreen');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ctrl' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleMicrophone).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ctrl' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleMicrophone).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleVideo).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleAudioToWhisperGroup).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    vi.advanceTimersByTime(100);
    expect(spyNextSpeaker).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    vi.advanceTimersByTime(500);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleFullscreen).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'f' }));
    vi.advanceTimersByTime(500);
  });

  it('does not call hotkeys when they are not registered', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const spyToggleMicrophone = vi.spyOn(events, 'toggleMicrophone');
    const spyToggleVideo = vi.spyOn(events, 'toggleVideo');
    const spyToggleAudioToWhisperGroup = vi.spyOn(events, 'toggleAudioToWhisperGroup');
    const spyNextSpeaker = vi.spyOn(events, 'nextSpeaker');
    const spyToggleFullscreen = vi.spyOn(events, 'toggleFullscreen');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    vi.advanceTimersByTime(100);
    expect(spyToggleMicrophone).not.toHaveBeenCalled();
    expect(spyToggleVideo).not.toHaveBeenCalled();
    expect(spyToggleAudioToWhisperGroup).not.toHaveBeenCalled();
    expect(spyNextSpeaker).not.toHaveBeenCalled();
    expect(spyToggleFullscreen).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x' }));
    vi.advanceTimersByTime(500);
  });

  it('toggles on the microphone on press and release control + m', async () => {
    const { store } = configureStore({
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

    ReduxDomEvents.dispatchFunction = store.dispatch;
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: true,
          preventActiveMediaAfterPermissionPrompt: true,
        });
      },
      { timeout: 1000 }
    );

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', ctrlKey: true }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: false,
        });
      },
      { timeout: 1000 }
    );
  });

  it('toggles the microphone on press m key', async () => {
    let microphoneEnabled = false;
    const mockSetMicrophoneEnabled = vi.fn().mockImplementation((enabled: boolean) => {
      microphoneEnabled = enabled;
    });

    const { store } = configureStore({
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
              get isMicrophoneEnabled() {
                return microphoneEnabled;
              },
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

    ReduxDomEvents.dispatchFunction = store.dispatch;
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: true,
        });
      },
      { timeout: 1000 }
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: false,
        });
      },
      { timeout: 1000 }
    );
  });

  it('toggles video on press v key', async () => {
    let cameraEnabled = false;
    const mockSetCameraEnabled = vi.fn().mockImplementation((enabled: boolean) => {
      cameraEnabled = enabled;
    });

    const { store } = configureStore({
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
              get isCameraEnabled() {
                return cameraEnabled;
              },
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

    ReduxDomEvents.dispatchFunction = store.dispatch;
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');
    const selectVideoEnabledSpy = vi.spyOn(livekitSlice, 'selectVideoEnabled').mockImplementation(() => cameraEnabled);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'videoinput',
          enabled: true,
        });
      },
      { timeout: 1000 }
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'v' }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'videoinput',
          enabled: false,
        });
      },
      { timeout: 1000 }
    );
    selectVideoEnabledSpy.mockRestore();
  });

  it('toggles whisper audio on press w key', async () => {
    const mockSetMicrophoneEnabled = vi.fn();
    const { store } = configureStore({
      initialState: {
        config: {
          enabledModules: { [BackendModules.SubroomAudio]: [] },
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
    ReduxDomEvents.dispatchFunction = store.dispatch;

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
    let mainRoomMicrophoneEnabled = true;
    let whisperRoomMicrophoneEnabled = false;
    const mockSetMainRoomMicrophoneEnabled = vi.fn().mockImplementation((enabled: boolean) => {
      mainRoomMicrophoneEnabled = enabled;
    });
    const mockSetWhisperRoomMicrophoneEnabled = vi.fn().mockImplementation((enabled: boolean) => {
      whisperRoomMicrophoneEnabled = enabled;
    });
    const { store } = configureStore({
      initialState: {
        config: {
          enabledModules: { [BackendModules.SubroomAudio]: [] },
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
          room: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetMainRoomMicrophoneEnabled,
              get isMicrophoneEnabled() {
                return mainRoomMicrophoneEnabled;
              },
            },
          },
          whisperRoom: {
            getActiveDevice: vi.fn().mockReturnValue('audioinput'),
            localParticipant: {
              setMicrophoneEnabled: mockSetWhisperRoomMicrophoneEnabled,
              get isMicrophoneEnabled() {
                return whisperRoomMicrophoneEnabled;
              },
            },
          },
          mediaSettings: {
            microphoneEnabled: true,
          },
        },
      },
    });
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(100);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: false,
        });
      },
      { timeout: 1000 }
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    vi.advanceTimersByTime(500);

    await waitFor(
      () => {
        expect(changeMediaSpy).toHaveBeenCalledWith({
          kind: 'audioinput',
          enabled: true,
        });
      },
      { timeout: 1000 }
    );
  });

  it('steps to next speaker when clicking n when active', async () => {
    const { store } = configureStore({
      initialState: {
        automod: {
          speakerState: SpeakerState.Active,
        },
        room: {
          currentMode: RoomMode.TalkingStick,
        },
      },
    });
    ReduxDomEvents.dispatchFunction = store.dispatch;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    vi.advanceTimersByTime(100);

    await waitFor(() => store.getState().automod.speakerState === SpeakerState.Transitioning);

    expect(store.getState().automod.speakerState).toEqual(SpeakerState.Transitioning);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    vi.advanceTimersByTime(500);
  });

  it('diables hotkeys on focus in input', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new FocusEvent('focusin', { bubbles: true });
    input.dispatchEvent(event);

    expect(listener.isHotkeysDisabled()).toBe(true);

    document.body.removeChild(input);
  });

  it('enables hotkeys on focus out input', () => {
    configureStore();

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

  it('toggle fullscreen on when its not active', async () => {
    configureStore({
      initialState: {
        fullscreen: {
          active: false,
          supported: true,
        },
      },
    });
    const spyRequest = vi.spyOn(fullscreenActions, 'request');
    const spyExit = vi.spyOn(fullscreenActions, 'exit');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    vi.advanceTimersByTime(100);

    expect(spyRequest).toHaveBeenCalled();
    expect(spyExit).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'f' }));
    vi.advanceTimersByTime(500);
  });

  it('toggle fullscreen off when its active', async () => {
    const { store } = configureStore({
      initialState: {
        fullscreen: {
          active: true,
          supported: true,
        },
      },
    });
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const spyRequest = vi.spyOn(fullscreenActions, 'request');
    const spyExit = vi.spyOn(fullscreenActions, 'exit');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    vi.advanceTimersByTime(100);

    expect(spyRequest).not.toHaveBeenCalled();
    expect(spyExit).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'f' }));
    vi.advanceTimersByTime(500);
  });
});
