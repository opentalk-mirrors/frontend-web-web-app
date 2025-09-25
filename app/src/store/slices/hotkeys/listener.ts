// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { debounce, isEmpty, some } from 'lodash';

import type { AppDispatch, RootState } from '../../../store';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';
import type { Hotkey } from './types';

const INPUT_TYPES = ['input', 'textarea', 'select'];

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
  });
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

      if (!hotkey) {
        return;
      }

      event.preventDefault();

      if (state.ui.hotkeysEnabled === false || hotkeysDisabled || event.repeat) {
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
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (INPUT_TYPES.includes(tagName) || event.target.isContentEditable) {
          hotkeysDisabled = true;
        }
      }
    },
  });

  startListening({
    actionCreator: domFocusOut,
    effect: (action) => {
      const event = action.payload;
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (INPUT_TYPES.includes(tagName) || event.target.isContentEditable) {
          hotkeysDisabled = false;
        }
      }
    },
  });
};
