// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '.';
import { pass } from '../api/types/outgoing/automod';
import { useFullscreenContext } from '../hooks/useFullscreenContext';
import { useMediaChoices } from '../provider/MediaChoicesProvider';
import { selectIsUserMicDisabled } from '../store/selectors';
import { selectSpeakerState, setAsTransitioningSpeaker } from '../store/slices/automodSlice';
import { selectEnabledModulesList } from '../store/slices/configSlice';
import { selectCurrentRoomMode } from '../store/slices/roomSlice';
import { selectSubroomAudioState, setIsWhisperActive } from '../store/slices/subroomAudioSlice';
import { selectTimerStyle } from '../store/slices/timerSlice';
import { selectHotkeysEnabled } from '../store/slices/uiSlice';
import { RoomMode, TimerStyle } from '../types';
import useMediaDevice from './useMediaDevice';

export const HOTKEY_MICROPHONE = 'm';
export const HOTKEY_WHISPERGROUP = 'w';
export const HOTKEY_VIDEO = 'v';
export const HOTKEY_FULLSCREEN = 'f';
export const HOTKEY_PUSH_TO_TALK = ' ';
export const HOTKEY_NEXT_SPEAKER = 'n';
const HOTKEYS = [
  HOTKEY_VIDEO,
  HOTKEY_MICROPHONE,
  HOTKEY_FULLSCREEN,
  HOTKEY_PUSH_TO_TALK,
  HOTKEY_NEXT_SPEAKER,
  HOTKEY_WHISPERGROUP,
];
const HOTKEY_DEBOUNCE_TIME = 100; //ms

enum PushToTalkState {
  Whisper = 'whisper',
  Conference = 'conference',
  Inactive = 'inactve',
}

export const useHotkeysActive = (): boolean => {
  const hotkeysEnabled = useAppSelector(selectHotkeysEnabled);
  const timerStyle = useAppSelector(selectTimerStyle);

  return hotkeysEnabled && timerStyle !== TimerStyle.CoffeeBreak;
};

export const useHotkeys = (room?: Room, whisperRoom?: Room) => {
  const fullscreenContext = useFullscreenContext();
  const roomMode = useAppSelector(selectCurrentRoomMode);
  const speakerState = useAppSelector(selectSpeakerState);
  const hasMicrophoneDisabledByModerator = useAppSelector(selectIsUserMicDisabled);
  const dispatch = useDispatch();

  const startingAudio = useRef<Promise<void> | undefined>();
  const stoppingAudio = useRef<Promise<void> | undefined>();
  const [pushToTalkState, setPushToTalkState] = useState(PushToTalkState.Inactive);

  const hotkeysEnabled = useAppSelector(selectHotkeysEnabled);
  const timerStyle = useAppSelector(selectTimerStyle);
  const subroomAudioEnabled = useAppSelector(selectEnabledModulesList).subroomAudio;
  const isWhisperingPossible = useAppSelector(selectSubroomAudioState);

  const hotkeysActive = hotkeysEnabled && timerStyle !== TimerStyle.CoffeeBreak;

  const { devices: audioDevices } = useMediaDeviceSelect({ kind: 'audioinput', requestPermissions: false });
  const { devices: videoDevices } = useMediaDeviceSelect({ kind: 'videoinput', requestPermissions: false });

  const mediaChoices = useMediaChoices();
  const audioEnabled = mediaChoices?.userChoices.audioEnabled || false;

  const { startMedia } = useMediaDevice({
    kind: 'audioinput',
  });

  const toggleAudio = useCallback(
    async (forcedState?: boolean) => {
      const shouldEnable =
        forcedState !== undefined ? forcedState : !(audioEnabled || room?.localParticipant.isMicrophoneEnabled);

      await startMedia(shouldEnable);
      mediaChoices?.saveAudioInputEnabled(shouldEnable);
      room?.localParticipant.setMicrophoneEnabled(shouldEnable);
    },
    [room, audioEnabled, startMedia, mediaChoices?.saveAudioInputEnabled]
  );

  const pushToWhisper = useCallback(
    (type: 'keyup' | 'keydown') => {
      if (!isWhisperingPossible.whisperId) {
        return;
      }
      switch (type) {
        case 'keydown': {
          if (pushToTalkState === PushToTalkState.Inactive) {
            dispatch(setIsWhisperActive(true));
            whisperRoom?.localParticipant.setMicrophoneEnabled(true);
            setPushToTalkState(PushToTalkState.Whisper);
          }
          break;
        }
        case 'keyup': {
          if (pushToTalkState === PushToTalkState.Whisper) {
            dispatch(setIsWhisperActive(false));
            whisperRoom?.localParticipant.setMicrophoneEnabled(false);
            setPushToTalkState(PushToTalkState.Inactive);
          }
          break;
        }
      }
    },
    [whisperRoom, isWhisperingPossible, pushToTalkState, dispatch]
  );

  const toggleVideo = useCallback(
    () => mediaChoices?.saveVideoInputEnabled(!mediaChoices?.userChoices.videoEnabled),
    [mediaChoices?.saveVideoInputEnabled, mediaChoices?.userChoices.videoEnabled]
  );

  // Push-to-talk function shall work ONLY if the user is muted (audio is disabled)
  // On keydown we start the push-to-talk mode and unmute the user,
  // On keyup - stop the push-to-talk mode and mute the user again
  // We use `startingAudio` and `stoppingAudio` promises to prevent race condition
  // between audio en-/disabling actions in mediaContext
  const pushToTalk = useCallback(
    (type: 'keyup' | 'keydown') => {
      const startAudio = async () => {
        if (hasMicrophoneDisabledByModerator) {
          return;
        }
        toggleAudio(true);
        startingAudio.current = undefined;
      };

      const stopAudio = async () => {
        toggleAudio(false);
        startingAudio.current = undefined;
        stoppingAudio.current = undefined;
      };

      switch (type) {
        case 'keydown':
          if (!audioEnabled && pushToTalkState === PushToTalkState.Inactive) {
            setPushToTalkState(PushToTalkState.Conference);
            if (startingAudio.current === undefined) {
              if (stoppingAudio.current === undefined) {
                startingAudio.current = startAudio();
              } else {
                startingAudio.current = stoppingAudio.current.then(() => startAudio());
              }
            }
          }
          break;
        case 'keyup':
          if (pushToTalkState === PushToTalkState.Conference) {
            setPushToTalkState(PushToTalkState.Inactive);
            if (stoppingAudio.current === undefined) {
              if (startingAudio.current === undefined) {
                stoppingAudio.current = stopAudio();
              } else {
                stoppingAudio.current = startingAudio.current.then(() => stopAudio());
              }
            }
          }
          break;
      }
    },
    [audioEnabled, hasMicrophoneDisabledByModerator, toggleAudio, pushToTalkState, stoppingAudio]
  );

  const toggleFullscreenView = useCallback(() => {
    fullscreenContext[fullscreenContext.active ? 'exit' : 'enter']();
  }, [fullscreenContext]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!hotkeysActive) {
        return;
      }

      const { type, repeat, key } = event;

      if (HOTKEYS.includes(key) && (type === 'keyup' || type === 'keydown')) {
        event.preventDefault();

        switch (key) {
          case HOTKEY_MICROPHONE:
            if (type === 'keyup' && audioDevices.length > 0 && !hasMicrophoneDisabledByModerator) {
              toggleAudio();
            }
            break;
          case HOTKEY_WHISPERGROUP:
            subroomAudioEnabled && pushToWhisper(type);

            break;
          case HOTKEY_VIDEO:
            if (type === 'keyup' && videoDevices.length > 0) {
              toggleVideo();
            }
            break;
          case HOTKEY_FULLSCREEN:
            if (type === 'keyup') {
              toggleFullscreenView();
            }
            break;
          case HOTKEY_PUSH_TO_TALK:
            // if (!repeat) {
            pushToTalk(type);
            //}
            break;
          case HOTKEY_NEXT_SPEAKER:
            if (!repeat && roomMode === RoomMode.TalkingStick && speakerState === 'active') {
              // Attempted to achieve `setAsTransitioningSpeaker` in a middleware, but we are unable
              // to define `pass.action` case twice as it is already defined in the ee-components.
              // We would need to extract case definition from ee-components to the middleware,
              // which then brings same sequential updates like in here, just in the different place.
              dispatch(setAsTransitioningSpeaker());
              dispatch(pass.action());
            }
            break;
          default:
            break;
        }
      }
    },
    [
      pushToTalk,
      hotkeysActive,
      toggleAudio,
      pushToWhisper,
      toggleVideo,
      toggleFullscreenView,
      roomMode,
      speakerState,
      dispatch,
      audioDevices,
      videoDevices,
      hasMicrophoneDisabledByModerator,
    ]
  );

  useEffect(() => {
    const debouncedHandleKeypress = debounce(handleKeyPress, HOTKEY_DEBOUNCE_TIME);

    window.addEventListener('keydown', debouncedHandleKeypress);
    window.addEventListener('keyup', debouncedHandleKeypress);

    return () => {
      window.removeEventListener('keydown', debouncedHandleKeypress);
      window.removeEventListener('keyup', debouncedHandleKeypress);
    };
  }, [handleKeyPress]);
};
