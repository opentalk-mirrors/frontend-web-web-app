// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { vi } from 'vitest';

import { bindDomEventsToRedux } from './eventBindings';
import { registerHotkey } from './listener';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';

vi.mock('./slice', () => ({
  domKeyDown: vi.fn(),
  domKeyUp: vi.fn(),
  domFocusIn: vi.fn(),
  domFocusOut: vi.fn(),
}));

vi.mock('./listener', () => ({
  registerHotkey: vi.fn(),
}));

describe('bindDomEventsToRedux', () => {
  let dispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatch = vi.fn();
    vi.clearAllMocks();
  });

  it('dispatches domKeyDown on keydown event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new KeyboardEvent('keydown');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledWith(domKeyDown(event));
  });

  it('dispatches domKeyUp on keyup event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new KeyboardEvent('keyup');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledWith(domKeyUp(event));
  });

  it('dispatches domFocusIn on focusin event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new FocusEvent('focusin');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledWith(domFocusIn(event));
  });

  it('dispatches domFocusOut on focusout event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new FocusEvent('focusout');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledWith(domFocusOut(event));
  });

  it('registers hotkeys with correct configurations', () => {
    bindDomEventsToRedux(dispatch);
    expect(registerHotkey).toHaveBeenCalledWith({
      key: 'm',
      modifier: 'Control',
      onPress: expect.any(Function),
      onRelease: expect.any(Function),
      descriptionKey: 'hotkey-hold-to-speak',
      preventActiveMediaAfterPermissionPrompt: true,
    });
    expect(registerHotkey).toHaveBeenCalledWith({
      key: 'm',
      onPress: expect.any(Function),
      descriptionKey: 'hotkey-microphone-toggle',
    });
    expect(registerHotkey).toHaveBeenCalledWith({
      key: 'v',
      onPress: expect.any(Function),
      descriptionKey: 'hotkey-video-toggle',
    });
    expect(registerHotkey).toHaveBeenCalledWith({
      key: 'w',
      onPress: expect.any(Function),
      onRelease: expect.any(Function),
      descriptionKey: 'hotkey-whisper-to-whisper-group',
    });
    expect(registerHotkey).toHaveBeenCalledWith({
      key: 'n',
      onPress: expect.any(Function),
      descriptionKey: 'hotkey-pass-talking-stick',
    });
  });
});
