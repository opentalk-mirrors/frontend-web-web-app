// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '.';
import { pass } from '../api/types/outgoing/automod';
import { showConsentNotification } from '../commonComponents';
import {
  HOTKEY_FULLSCREEN,
  HOTKEY_MICROPHONE,
  HOTKEY_NEXT_SPEAKER,
  HOTKEY_PUSH_TO_TALK,
  HOTKEY_VIDEO,
  HOTKEY_WHISPERGROUP,
  HOTKEYS,
} from '../constants';
import { useFullscreenContext } from '../hooks/useFullscreenContext';
import { startMedia } from '../store/commonActions';
import { selectIsUserMicDisabled } from '../store/selectors';
import { selectSpeakerState, setAsTransitioningSpeaker } from '../store/slices/automodSlice';
import { selectEnabledModulesList } from '../store/slices/configSlice';
import { selectAudioEnabled, selectVideoEnabled } from '../store/slices/mediaSlice';
import { selectCurrentRoomMode } from '../store/slices/roomSlice';
import { selectNeedRecordingConsent } from '../store/slices/streamingSlice';
import { selectSubroomAudioState, setIsWhisperActive } from '../store/slices/subroomAudioSlice';
import { selectTimerStyle } from '../store/slices/timerSlice';
import { selectHotkeysEnabled } from '../store/slices/uiSlice';
import { RoomMode, TimerStyle } from '../types';

//To be continued in https://git.opentalk.dev/opentalk/product/feature-requests/-/issues/125
const REMEMBER_MICROPHONE_STATE = false;

enum PushToTalkState {
  Whisper = 'whisper',
  Conference = 'conference',
  Inactive = 'inactive',
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
  const askConsent = useAppSelector(selectNeedRecordingConsent);
  const dispatch = useAppDispatch();

  const startingAudio = useRef<Promise<void> | undefined>(undefined);
  const stoppingAudio = useRef<Promise<void> | undefined>(undefined);
  const microphoneStateCache = useRef<boolean>(false);
  const [pushToTalkState, setPushToTalkState] = useState(PushToTalkState.Inactive);

  const hotkeysEnabled = useAppSelector(selectHotkeysEnabled);
  const timerStyle = useAppSelector(selectTimerStyle);
  const subroomAudioEnabled = useAppSelector(selectEnabledModulesList).subroomAudio;
  const isWhisperingPossible = useAppSelector(selectSubroomAudioState).whisperId;

  const hotkeysActive = hotkeysEnabled && timerStyle !== TimerStyle.CoffeeBreak;

  const { devices: audioDevices } = useMediaDeviceSelect({ kind: 'audioinput', requestPermissions: false });
  const { devices: videoDevices } = useMediaDeviceSelect({ kind: 'videoinput', requestPermissions: false });

  const audioEnabled = useAppSelector(selectAudioEnabled);
  const videoEnabled = useAppSelector(selectVideoEnabled);

  const toggleAudio = useCallback(
    async (forcedState?: boolean) => {
      if (askConsent && !audioEnabled) {
        const consent = await showConsentNotification(dispatch);
        if (!consent) {
          return;
        }
      }

      const shouldEnable =
        forcedState !== undefined ? forcedState : !(audioEnabled || room?.localParticipant.isMicrophoneEnabled);

      dispatch(startMedia({ kind: 'audioinput', enabled: shouldEnable }));
    },
    [askConsent, audioEnabled, dispatch, room, startMedia]
  );

  const pushToWhisper = useCallback(
    async (type: 'keyup' | 'keydown') => {
      if (!isWhisperingPossible) {
        return;
      }
      switch (type) {
        case 'keydown': {
          toggleAudio(false);
          if (pushToTalkState === PushToTalkState.Inactive) {
            if (REMEMBER_MICROPHONE_STATE) {
              microphoneStateCache.current = audioEnabled;
            }
            dispatch(setIsWhisperActive(true));
            await whisperRoom?.localParticipant.setMicrophoneEnabled(true);
            setPushToTalkState(PushToTalkState.Whisper);
          }
          break;
        }
        case 'keyup': {
          if (pushToTalkState === PushToTalkState.Whisper) {
            dispatch(setIsWhisperActive(false));
            await whisperRoom?.localParticipant.setMicrophoneEnabled(false);
            setPushToTalkState(PushToTalkState.Inactive);
            if (REMEMBER_MICROPHONE_STATE) {
              toggleAudio(microphoneStateCache.current);
            }
          }
          break;
        }
      }
    },
    [whisperRoom, isWhisperingPossible, pushToTalkState, dispatch, toggleAudio]
  );

  const toggleVideo = useCallback(async () => {
    if (askConsent && !videoEnabled) {
      const consent = await showConsentNotification(dispatch);
      if (!consent) {
        return;
      }
    }
    dispatch(startMedia({ kind: 'videoinput', enabled: !videoEnabled }));
  }, [videoEnabled, askConsent, dispatch]);

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
    [audioEnabled, hasMicrophoneDisabledByModerator, toggleAudio, pushToTalkState]
  );

  const toggleFullscreenView = useCallback(() => {
    fullscreenContext[fullscreenContext.active ? 'exit' : 'enter']();
  }, [fullscreenContext]);

  const pressedKeys = new Set<string>();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!hotkeysActive || !HOTKEYS.includes(event.key)) {
        return;
      }

      const { type, repeat, key } = event;

      // Track pressed keys to prevent redundant calls
      if (type === 'keydown') {
        if (pressedKeys.has(key)) {
          return;
        }
        pressedKeys.add(key);
      } else if (type === 'keyup') {
        pressedKeys.delete(key);
      }

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
      subroomAudioEnabled,
      pressedKeys,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyPress);
    };
  }, [handleKeyPress]);
};
