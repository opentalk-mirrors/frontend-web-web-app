// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { vi } from 'vitest';

import { ReduxDomEvents } from './eventBindings';
import { domKeyDown, domKeyUp, domFocusIn, domFocusOut } from './slice';

vi.mock('./slice', () => ({
  domKeyDown: vi.fn(),
  domKeyUp: vi.fn(),
  domFocusIn: vi.fn(),
  domFocusOut: vi.fn(),
}));

vi.mock('./listener', () => ({
  registerHotkeys: vi.fn(),
}));

describe('ReduxDomEvents', () => {
  let dispatch: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    dispatch = vi.fn();
    ReduxDomEvents.createInstance(dispatch);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches domKeyDown on keydown event', () => {
    const event = new KeyboardEvent('keydown');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domKeyDown(event));
  });

  it('dispatches domKeyUp on keyup event', () => {
    const event = new KeyboardEvent('keyup');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domKeyUp(event));
  });

  it('dispatches domFocusIn on focusin event', () => {
    const event = new FocusEvent('focusin');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domFocusIn(event));
  });

  it('dispatches domFocusOut on focusout event', () => {
    const event = new FocusEvent('focusout');
    window.dispatchEvent(event);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(domFocusOut(event));
  });
});
