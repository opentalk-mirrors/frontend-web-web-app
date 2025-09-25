// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { pass } from '../../../api/types/outgoing/automod';
import { showConsentNotification } from '../../../commonComponents';
import log from '../../../logger';
import { RoomMode } from '../../../types';
import { changeLocalMedia, changeMedia } from '../../commonActions';
import { selectIsUserMicDisabled } from '../../selectors';
import { selectSpeakerState, setAsTransitioningSpeaker, SpeakerState } from '../automodSlice';
import { selectEnabledModulesList } from '../configSlice';
import {
  selectAudioEnabled,
  selectLivekitRoom,
  selectLivekitWhisperRoom,
  selectLobbyAudioEnabled,
  selectLobbyVideoEnabled,
  selectVideoEnabled,
} from '../livekitSlice';
import { selectCurrentRoomMode } from '../roomSlice';
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

export const toggleAudioToWhisperGroup = async ({ state, dispatch }: HotkeyCallbackParams) => {
  const subroomAudioEnabled = selectEnabledModulesList(state).subroomAudio;
  const whisperRoom = selectLivekitWhisperRoom(state);
  const isWhisperActive = selectIsWhisperActive(state);
  const audioEnabled = selectAudioEnabled(state);

  if (subroomAudioEnabled) {
    if (!isWhisperActive) {
      await toggleAudio({ state, dispatch }, false);
      audioStateBeforeWhisperStarts = audioEnabled;
    } else if (audioStateBeforeWhisperStarts) {
      await toggleAudio({ state, dispatch }, true);
    }
    await whisperRoom?.localParticipant.setMicrophoneEnabled(!isWhisperActive);
    dispatch(setIsWhisperActive(!isWhisperActive));
  }
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

export const nextSpeaker = ({ state, dispatch }: HotkeyCallbackParams) => {
  const speakerState = selectSpeakerState(state);
  const roomMode = selectCurrentRoomMode(state);

  if (roomMode === RoomMode.TalkingStick && speakerState === SpeakerState.Active) {
    dispatch(setAsTransitioningSpeaker());
    dispatch(pass.action());
  }
};
