// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectFullscreenContainer } from './slice';
import { FullscreenState } from './types';

const createState = (fullscreen: Partial<FullscreenState>) => ({
  fullscreen: { supported: true, active: false, error: undefined, element: undefined, ...fullscreen },
});

describe('selectFullscreenContainer', () => {
  it('returns the fullscreen element while fullscreen is active', () => {
    const element = document.createElement('div');
    expect(selectFullscreenContainer(createState({ active: true, element }))).toBe(element);
  });

  it('returns undefined while fullscreen is inactive, even if an element is set', () => {
    const element = document.createElement('div');
    expect(selectFullscreenContainer(createState({ active: false, element }))).toBeUndefined();
  });

  it('returns undefined while fullscreen is active but no element is set', () => {
    expect(selectFullscreenContainer(createState({ active: true }))).toBeUndefined();
  });
});
