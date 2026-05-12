// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { createLocalAudioTrack } from 'livekit-client';

import { showConsentNotification } from '../../../commonComponents';
import log from '../../../logger';
import { changeLocalMedia, changeMedia } from '../../commonActions';
import { selectIsUserMicDisabled } from '../../selectors';
import { selectEnabledModulesList } from '../configSlice';
import { fullscreenActions, selectFullscreenSupported } from '../fullscreen/slice';
import {
  selectAudioDeviceId,
  selectAudioEnabled,
  selectLivekitRoom,
  selectLivekitWhisperRoom,
  selectLobbyAudioEnabled,
  selectLobbyVideoEnabled,
  selectVideoEnabled,
} from '../livekitSlice';
import { selectNeedRecordingConsent } from '../streamingSlice';
import { selectIsWhisperActive, setIsWhisperActive } from '../subroomAudioSlice';
import type { HotkeyCallbackParams } from './types';

type AbortablePromise<T = unknown> = Promise<T> & {
  abort(reason?: string): void;
};

let audioPromise: AbortablePromise;

const toggleAudio = async (
  { state, dispatch, preventActiveMediaAfterPermissionPrompt }: HotkeyCallbackParams,
  forcedState?: boolean
) => {
  const askConsent = selectNeedRecordingConsent(state);
  const audioEnabled = selectAudioEnabled(state);
  const room = selectLivekitRoom(state);

  if (askConsent && !audioEnabled) {
    const consent = await showConsentNotification(dispatch);
    if (!consent) {
      return;
    }
  }

  const shouldEnable =
    forcedState !== undefined ? forcedState : !(audioEnabled || room?.localParticipant.isMicrophoneEnabled);

  if (audioPromise) {
    audioPromise.abort();
  }
  audioPromise = dispatch(
    changeMedia({ kind: 'audioinput', enabled: shouldEnable, preventActiveMediaAfterPermissionPrompt })
  );
};

export const toggleMicrophone = async (params: HotkeyCallbackParams, forcedState?: boolean) => {
  const { state, dispatch, preventActiveMediaAfterPermissionPrompt } = params;
  const hasMicrophoneDisabledByModerator = selectIsUserMicDisabled(state);
  const lobbyAudioEnabled = selectLobbyAudioEnabled(state);
  const room = selectLivekitRoom(state);

  // prevent toggling microphone outside of a room
  if (!window.location.pathname.includes('/room')) {
    return;
  }

  if (room !== undefined) {
    const audioDevice = room.getActiveDevice('audioinput');
    if (audioDevice !== undefined && !hasMicrophoneDisabledByModerator) {
      await toggleAudio(params, forcedState);
    } else {
      log.warn('No microphone devices available');
    }
    return;
  } else {
    const audioEnabled = forcedState !== undefined ? forcedState : !lobbyAudioEnabled;
    if (audioPromise) {
      audioPromise.abort();
    }
    audioPromise = dispatch(
      changeLocalMedia({ kind: 'audioinput', enabled: audioEnabled, preventActiveMediaAfterPermissionPrompt })
    );
  }
};

let audioStateBeforeWhisperStarts: boolean;

export const setAudioToWhisperGroup = async ({ state, dispatch }: HotkeyCallbackParams, enable: boolean) => {
  const subroomAudioEnabled = selectEnabledModulesList(state).includes(BackendModules.SubroomAudio);
  const whisperRoom = selectLivekitWhisperRoom(state);
  const isWhisperActive = selectIsWhisperActive(state);
  const audioEnabled = selectAudioEnabled(state);
  const deviceId = selectAudioDeviceId(state);

  if (!subroomAudioEnabled || !whisperRoom || enable === isWhisperActive) {
    return;
  }

  // Disable the conference microphone while we whisper and enable it if it was
  // enabled before whispering
  if (enable && audioEnabled) {
    await toggleAudio({ state, dispatch }, false);
  } else if (!enable && audioStateBeforeWhisperStarts) {
    await toggleAudio({ state, dispatch }, true);
  }

  audioStateBeforeWhisperStarts = audioEnabled;

  // pre-acquire mic permission if needed to avoid the dialog stealing the keyup event
  if (enable) {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    const hasMicPermission = permission.state === 'granted';

    if (!hasMicPermission) {
      try {
        const tempTrack = await createLocalAudioTrack({ deviceId });
        tempTrack.stop();
      } catch {
        log.warn('Microphone permission denied. Cannot enable whisper mode.');
      }
      window.dispatchEvent(new CustomEvent('hotkeys:clearPushedKeys'));
      return;
    }
  }

  await whisperRoom.localParticipant.setMicrophoneEnabled(enable, { deviceId });
  dispatch(setIsWhisperActive(enable));
};

export const toggleVideo = async ({ state, dispatch }: HotkeyCallbackParams) => {
  const askConsent = selectNeedRecordingConsent(state);
  const isVideoEnabled = selectVideoEnabled(state);
  const lobbyVideoEnabled = selectLobbyVideoEnabled(state);
  const room = selectLivekitRoom(state);

  // prevent toggling video outside of a room
  if (!window.location.pathname.includes('/room')) {
    return;
  }

  if (askConsent && !isVideoEnabled) {
    const consent = await showConsentNotification(dispatch);
    if (!consent) {
      return;
    }
  }
  if (room !== undefined) {
    dispatch(changeMedia({ kind: 'videoinput', enabled: !isVideoEnabled }));
  } else {
    dispatch(changeLocalMedia({ kind: 'videoinput', enabled: !lobbyVideoEnabled }));
  }
};

export const toggleFullscreen = ({ state, dispatch }: HotkeyCallbackParams) => {
  const isFullscreenSupported = selectFullscreenSupported(state);

  if (!isFullscreenSupported) {
    console.warn('Fullscreen is not supported on this browser.');
  }

  dispatch(fullscreenActions.toggle());
};
