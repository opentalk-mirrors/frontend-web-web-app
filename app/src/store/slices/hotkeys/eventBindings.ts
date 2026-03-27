// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { AppDispatch } from '../../../store';
import { bindFullscreenEventsToRedux } from '../fullscreen/listener';
import { nextSpeaker, toggleAudioToWhisperGroup, toggleFullscreen, toggleMicrophone, toggleVideo } from './events';
import { registerHotkeys, resetHotkeys } from './listener';
import { domFocusIn, domFocusOut, domKeyDown, domKeyUp } from './slice';

export class ReduxDomEvents {
  static #instance: ReduxDomEvents;
  static #dispatch: AppDispatch;

  private constructor(dispatch: AppDispatch) {
    ReduxDomEvents.dispatchFunction = dispatch;
    ReduxDomEvents.bindDomEventsToRedux();

    // If you register keys with another modifier key, make sure to add the relevant translation key.
    registerHotkeys([
      {
        key: 'm',
        modifier: 'Control',
        onPress: async (params) => await toggleMicrophone(params, true),
        onRelease: async (params) => await toggleMicrophone(params, false),
        descriptionKey: 'hotkey-hold-to-speak',
        preventActiveMediaAfterPermissionPrompt: true,
        forcePreventDefault: true,
      },
      {
        key: 'm',
        onPress: toggleMicrophone,
        descriptionKey: 'hotkey-microphone-toggle',
      },
      {
        key: 'v',
        onPress: toggleVideo,
        descriptionKey: 'hotkey-video-toggle',
      },
      {
        key: 'w',
        onPress: toggleAudioToWhisperGroup,
        onRelease: toggleAudioToWhisperGroup,
        descriptionKey: 'hotkey-whisper-to-whisper-group',
      },
      {
        key: 'n',
        onPress: nextSpeaker,
        descriptionKey: 'hotkey-pass-talking-stick',
      },
      {
        key: 'f',
        onPress: toggleFullscreen,
        descriptionKey: 'hotkey-fullscreen-toggle',
      },
    ]);
  }

  public static get instance(): ReduxDomEvents {
    if (!ReduxDomEvents.#instance) {
      console.warn('ReduxDomEvents not initialized. Call ReduxDomEvents.createInstance(dispatch) first.');
    }

    return ReduxDomEvents.#instance;
  }

  public static createInstance(dispatch: AppDispatch): ReduxDomEvents {
    if (!ReduxDomEvents.#instance) {
      ReduxDomEvents.#instance = new ReduxDomEvents(dispatch);
    }
    return ReduxDomEvents.#instance;
  }

  public static set dispatchFunction(dispatch: AppDispatch) {
    this.#dispatch = dispatch;
  }

  private static bindDomEventsToRedux = () => {
    const keyDown = (e: KeyboardEvent) => this.#dispatch(domKeyDown(e));
    const keyUp = (e: KeyboardEvent) => this.#dispatch(domKeyUp(e));
    const focusIn = (e: FocusEvent) => this.#dispatch(domFocusIn(e));
    const focusOut = (e: FocusEvent) => this.#dispatch(domFocusOut(e));

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('focusin', focusIn);
    window.addEventListener('focusout', focusOut);
    const removeFullscreenEventsFromRedux = bindFullscreenEventsToRedux(this.#dispatch);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('focusin', focusIn);
      window.removeEventListener('focusout', focusOut);
      removeFullscreenEventsFromRedux && removeFullscreenEventsFromRedux();
      resetHotkeys();
    };
  };
}
