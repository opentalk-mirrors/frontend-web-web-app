// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { vi } from 'vitest';

import { bindDomEventsToRedux } from './eventBindings';
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
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domKeyDown(event));
  });

  it('dispatches domKeyUp on keyup event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new KeyboardEvent('keyup');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domKeyUp(event));
  });

  it('dispatches domFocusIn on focusin event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new FocusEvent('focusin');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domFocusIn(event));
  });

  it('dispatches domFocusOut on focusout event', () => {
    bindDomEventsToRedux(dispatch);
    const event = new FocusEvent('focusout');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domFocusOut(event));
  });
});
