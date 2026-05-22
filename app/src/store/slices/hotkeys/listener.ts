// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { debounce, isEqual } from 'lodash';

import browser from '../../../modules/BrowserSupport';
import type { AppDispatch, RootState } from '../../../store';
import { selectAudioEnabled } from '../livekitSlice';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';
import type { Hotkey, HotkeyModifier, ModifierKey } from './types';

const INPUT_TYPES = ['input', 'textarea', 'select'];
const MODIFIER_KEYS: ModifierKey[] = ['Control', 'Shift', 'Alt', 'Meta'];

const isTargetInputTypeAndContentEditable = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    const tagName = target.tagName.toLowerCase();
    if (INPUT_TYPES.includes(tagName) || target.isContentEditable) {
      return true;
    }
  }
  return false;
};

const isTargetMultilineInput = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName.toLowerCase() === 'textarea' || target.isContentEditable);

const pushedKeyIsActive = new Set<Hotkey>();

export const hotkeys: Hotkey[] = [];
let hotkeysDisabled = false;

export const isHotkeysDisabled = () => hotkeysDisabled;

const normalizeModifier = (modifier?: HotkeyModifier) => (modifier ? [modifier].flat().sort() : []);

const formatModifier = (modifier?: HotkeyModifier) => {
  const modifiers = normalizeModifier(modifier);

  return modifiers.length > 0 ? `${modifiers.join(' + ')} + ` : '';
};

const eventModifierActive = (event: KeyboardEvent, modifier: ModifierKey) => {
  switch (modifier) {
    case 'Control':
      return event.ctrlKey;
    case 'Shift':
      return event.shiftKey;
    case 'Alt':
      return event.altKey;
    case 'Meta':
      return event.metaKey;
  }
};

const eventModifiers = (event: KeyboardEvent) =>
  MODIFIER_KEYS.filter((modifier) => eventModifierActive(event, modifier));

const modifiersMatch = (event: KeyboardEvent, modifier?: HotkeyModifier) => {
  const activeModifiers = eventModifiers(event).sort();
  const expectedModifiers = normalizeModifier(modifier);

  return isEqual(activeModifiers, expectedModifiers);
};

const modifierIncludesKey = (modifier: HotkeyModifier | undefined, key: string) =>
  normalizeModifier(modifier).some((modifierKey) => modifierKey.toLowerCase() === key.toLowerCase());

export const resetHotkeys = () => {
  hotkeys.splice(0, hotkeys.length);
  pushedKeyIsActive.clear();
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
  canActivate,
}: Hotkey) => {
  const exists = hotkeys.some(
    (hotkey) => hotkey.key === key && isEqual(normalizeModifier(hotkey.modifier), normalizeModifier(modifier))
  );

  if (exists) {
    throw new Error(`Hotkey "${formatModifier(modifier)}${key}" is already registered`);
  }

  hotkeys.push({
    key,
    modifier,
    onPress,
    onRelease,
    descriptionKey,
    preventActiveMediaAfterPermissionPrompt,
    forcePreventDefault,
    canActivate,
  });
};

export const registerHotkeys = (hotkeysToRegister: Hotkey[]) => {
  hotkeysToRegister.forEach((hotkey) => registerHotkey(hotkey));
};

const findHotkey = (event: KeyboardEvent) =>
  hotkeys.find(
    (hotkey) => hotkey.key.toLowerCase() === event.key.toLowerCase() && modifiersMatch(event, hotkey.modifier)
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
      const isAudioEnabled = selectAudioEnabled(state);
      const hotkey = findHotkey(event);
      let isHotkeyEnabled = true;

      if (hotkey?.canActivate && !hotkey.canActivate(state)) {
        isHotkeyEnabled = !isAudioEnabled;
      }
      // safari and firefox do not emit focusout event when pressing enter in an input element
      // (e.g. when submitting a form closes a dialog). Exclude textarea and contenteditable
      // elements where Enter creates a newline and focus remains in the element.
      if (
        (browser.isSafari() || browser.isFirefox()) &&
        event.key === 'Enter' &&
        !event.shiftKey &&
        isTargetInputTypeAndContentEditable(event.target) &&
        !isTargetMultilineInput(event.target)
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
          if (
            isHotkeyEnabled &&
            event.key.toLowerCase() === hotkey.key.toLowerCase() &&
            modifiersMatch(event, hotkey.modifier)
          ) {
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

      const releasedHotkey = [...pushedKeyIsActive].find(
        (h) => h.key === event.key || modifierIncludesKey(h.modifier, event.key)
      );

      if (!releasedHotkey) {
        return;
      }

      event.preventDefault();
      pushedKeyIsActive.delete(releasedHotkey);

      const debouncedPressRelease = debounce(
        () => {
          if (
            releasedHotkey.onRelease &&
            (releasedHotkey.key === event.key || modifierIncludesKey(releasedHotkey.modifier, event.key))
          ) {
            releasedHotkey.onRelease({
              state,
              dispatch: listenerApi.dispatch as AppDispatch,
            });
          }
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
