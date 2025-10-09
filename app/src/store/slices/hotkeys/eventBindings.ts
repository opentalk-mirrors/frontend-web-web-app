// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { AppDispatch } from '../../../store';
import { bindFullscreenEventsToRedux } from '../fullscreen/listener';
import { nextSpeaker, toggleMicrophone, toggleVideo, toggleAudioToWhisperGroup, toggleFullscreen } from './events';
import { registerHotkey, resetHotkeys } from './listener';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';

export const bindDomEventsToRedux = (dispatch: AppDispatch) => {
  const keyDown = (e: KeyboardEvent) => dispatch(domKeyDown(e));
  const keyUp = (e: KeyboardEvent) => dispatch(domKeyUp(e));
  const focusIn = (e: FocusEvent) => dispatch(domFocusIn(e));
  const focusOut = (e: FocusEvent) => dispatch(domFocusOut(e));

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  window.addEventListener('focusin', focusIn);
  window.addEventListener('focusout', focusOut);
  const removeFullscreenEventsFromRedux = bindFullscreenEventsToRedux(dispatch);

  registerHotkey({
    key: 'm',
    modifier: 'Control',
    onPress: async (params) => await toggleMicrophone(params, true),
    onRelease: async (params) => await toggleMicrophone(params, false),
    descriptionKey: 'hotkey-hold-to-speak',
    preventActiveMediaAfterPermissionPrompt: true,
    forcePreventDefault: true,
  });
  registerHotkey({
    key: 'm',
    onPress: toggleMicrophone,
    descriptionKey: 'hotkey-microphone-toggle',
  });
  registerHotkey({
    key: 'v',
    onPress: toggleVideo,
    descriptionKey: 'hotkey-video-toggle',
  });
  registerHotkey({
    key: 'w',
    onPress: toggleAudioToWhisperGroup,
    onRelease: toggleAudioToWhisperGroup,
    descriptionKey: 'hotkey-whisper-to-whisper-group',
  });
  registerHotkey({
    key: 'n',
    onPress: nextSpeaker,
    descriptionKey: 'hotkey-pass-talking-stick',
  });
  registerHotkey({
    key: 'f',
    onPress: toggleFullscreen,
    descriptionKey: 'hotkey-fullscreen-toggle',
  });

  return () => {
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
    window.removeEventListener('focusin', focusIn);
    window.removeEventListener('focusout', focusOut);
    removeFullscreenEventsFromRedux && removeFullscreenEventsFromRedux();
    resetHotkeys();
  };
};
