// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { configureStore } from '../../../utils/testUtils';
import { ReduxDomEvents } from './eventBindings';
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

vi.mock('livekit-client', async (importOriginal) => ({
  ...(await importOriginal()),
  createLocalAudioTrack: vi.fn().mockResolvedValue({ stop: vi.fn() }),
}));

describe('hotkeys', () => {
  beforeAll(() => {
    const { store } = configureStore();
    ReduxDomEvents.createInstance(store.dispatch);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });

    listener.resetHotkeys();
    window.document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    listener.resetHotkeys();
  });

  it('calls a registered hotkey when hotkeys are enabled', () => {
    const { dispatchSpy, store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'k',
      onPress,
      descriptionKey: 'hotkey-test',
    });

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);
    vi.advanceTimersByTime(100);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith({ type: domKeyDown.type, payload: event });
  });

  it('does not call a registered hotkey when hotkeys are disabled in state', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          hotkeysEnabled: false,
        },
      },
    });
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'k',
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    vi.advanceTimersByTime(100);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call hotkeys when they are not registered', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'k',
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    vi.advanceTimersByTime(100);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('calls hotkeys registered with multiple modifiers', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'k',
      modifier: ['Control', 'Shift'],
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls a multi-modifier hotkey again when only the hotkey key is released and pressed again', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'm',
      modifier: ['Meta', 'Shift'],
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('calls a multi-modifier hotkey again when the browser misses the hotkey keyup while modifiers are held', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'm',
      modifier: ['Meta', 'Shift'],
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('does not call a hotkey for repeated keydown events while the hotkey key is held', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'm',
      modifier: ['Meta', 'Shift'],
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, repeat: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls hotkeys registered with Control + Meta (macOS toggle modifier)', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'm',
      modifier: ['Control', 'Meta'],
      onPress,
      descriptionKey: 'hotkey-test',
    });

    // Cmd + Shift + M alone (the previous macOS combo) must no longer fire
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);
    expect(onPress).not.toHaveBeenCalled();

    // Ctrl + Cmd + M fires
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true, metaKey: true }));
    vi.advanceTimersByTime(100);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call single-modifier hotkeys when additional modifiers are active', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onPress = vi.fn();

    listener.registerHotkey({
      key: 'k',
      modifier: 'Control',
      onPress,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('calls onRelease when the active hotkey key is released', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onRelease = vi.fn();

    listener.registerHotkey({
      key: 'k',
      modifier: ['Control', 'Shift'],
      onPress: vi.fn(),
      onRelease,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'k', ctrlKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('calls onRelease when one of the active hotkey modifiers is released', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;
    const onRelease = vi.fn();

    listener.registerHotkey({
      key: 'k',
      modifier: ['Control', 'Shift'],
      onPress: vi.fn(),
      onRelease,
      descriptionKey: 'hotkey-test',
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }));
    vi.advanceTimersByTime(100);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', ctrlKey: true }));
    vi.advanceTimersByTime(100);

    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('disables hotkeys on focus in input', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new FocusEvent('focusin', { bubbles: true });
    input.dispatchEvent(event);

    expect(listener.isHotkeysDisabled()).toBe(true);
  });

  it('enables hotkeys on focus out input', () => {
    const { store } = configureStore();
    ReduxDomEvents.dispatchFunction = store.dispatch;

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    let event = new FocusEvent('focusin', { bubbles: true });
    input.dispatchEvent(event);

    event = new FocusEvent('focusout', { bubbles: true });
    input.dispatchEvent(event);

    expect(listener.isHotkeysDisabled()).toBe(false);
  });
});
