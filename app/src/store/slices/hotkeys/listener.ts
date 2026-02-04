// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { debounce, isEmpty, some } from 'lodash';

import browser from '../../../modules/BrowserSupport';
import type { AppDispatch, RootState } from '../../../store';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';
import type { Hotkey } from './types';

const INPUT_TYPES = ['input', 'textarea', 'select'];

const isTargetInputTypeAndContentEditable = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    const tagName = target.tagName.toLowerCase();
    if (INPUT_TYPES.includes(tagName) || target.isContentEditable) {
      return true;
    }
  }
  return false;
};

const pushedKeyIsActive = new Set<Hotkey>();

export const hotkeys: Hotkey[] = [];
let hotkeysDisabled = false;

export const isHotkeysDisabled = () => hotkeysDisabled;

export const resetHotkeys = () => {
  hotkeys.splice(0, hotkeys.length);
  hotkeysDisabled = false;
};

export const registerHotkey = ({
  key,
  modifier,
  onPress,
  onRelease,
  descriptionKey,
  preventActiveMediaAfterPermissionPrompt,
  forcePreventDefault,
}: Hotkey) => {
  const exists = hotkeys.some((hotkey) => hotkey.key === key && hotkey.modifier === modifier);

  if (exists) {
    throw new Error(`Hotkey "${modifier ? modifier + '+' : ''}${key}" is already registered`);
  }

  hotkeys.push({
    key,
    modifier,
    onPress,
    onRelease,
    descriptionKey,
    preventActiveMediaAfterPermissionPrompt,
    forcePreventDefault,
  });
};

export const registerHotkeys = (hotkeysToRegister: Hotkey[]) => {
  hotkeysToRegister.forEach((hotkey) => registerHotkey(hotkey));
};

const findHotkey = (event: KeyboardEvent) =>
  hotkeys.find(
    (hotkey) =>
      hotkey.key.toLowerCase() === event.key.toLowerCase() &&
      !isEmpty(hotkey.modifier) === event.getModifierState(hotkey.modifier || '')
  );

export const startHotkeyListeners = (startListening: ListenerMiddlewareInstance['startListening']) => {
  window.addEventListener('hotkeys:clearPushedKeys', () => {
    pushedKeyIsActive.clear();
  });

  startListening({
    actionCreator: domKeyDown,
    effect: async (action, listenerApi) => {
      const event = action.payload;
      const state = listenerApi.getState() as RootState;
      const hotkey = findHotkey(event);

      // safari and firefox do not emit focusout event when pressing enter in an input or contenteditable element
      if (
        (browser.isSafari() || browser.isFirefox()) &&
        event.key === 'Enter' &&
        !event.shiftKey &&
        isTargetInputTypeAndContentEditable(event.target)
      ) {
        window.dispatchEvent(new CustomEvent('focusout', { detail: { target: event.target } }));
      }

      if (hotkey?.forcePreventDefault) {
        event.preventDefault();
      }

      if (!hotkey || hotkeysDisabled) {
        return;
      }

      event.preventDefault();

      if (state.ui.hotkeysEnabled === false || event.repeat) {
        return;
      }

      const debouncedOnPress = debounce(
        async () => {
          const modifierMatch = hotkey.modifier ? event.getModifierState(hotkey.modifier) : true;
          const isPushedKeyActive = some([...pushedKeyIsActive], { key: event.key });

          if (event.key.toLowerCase() === hotkey.key.toLowerCase() && modifierMatch && !isPushedKeyActive) {
            hotkey.onPress({
              state,
              dispatch: listenerApi.dispatch as AppDispatch,
              preventActiveMediaAfterPermissionPrompt: hotkey.preventActiveMediaAfterPermissionPrompt,
            });
            pushedKeyIsActive.add(hotkey);
          }
        },
        100,
        { leading: true, trailing: false }
      );

      await debouncedOnPress();
    },
  });

  startListening({
    actionCreator: domKeyUp,
    effect: (action, listenerApi) => {
      const event = action.payload;
      const state = listenerApi.getState() as RootState;

      if (state.ui.hotkeysEnabled === false || hotkeysDisabled) {
        return;
      }

      const releasedHotkey = [...pushedKeyIsActive].find((h) => h.key === event.key || h.modifier === event.key);

      if (!releasedHotkey) {
        return;
      }

      event.preventDefault();

      const debouncedPressRelease = debounce(
        () => {
          if (
            releasedHotkey.onRelease &&
            some([...pushedKeyIsActive], (h) => h.key === event.key || h.modifier === event.key)
          ) {
            releasedHotkey.onRelease({
              state,
              dispatch: listenerApi.dispatch as AppDispatch,
            });
          }
          pushedKeyIsActive.delete(releasedHotkey);
        },
        100,
        { leading: true, trailing: false }
      );

      debouncedPressRelease();
    },
  });

  startListening({
    actionCreator: domFocusIn,
    effect: (action) => {
      const event = action.payload;

      if (isTargetInputTypeAndContentEditable(event.target)) {
        hotkeysDisabled = true;
      }
    },
  });

  startListening({
    actionCreator: domFocusOut,
    effect: (action) => {
      const event = action.payload;
      const target = event.detail.target || event.target;

      if (isTargetInputTypeAndContentEditable(target)) {
        hotkeysDisabled = false;
      }
    },
  });
};
