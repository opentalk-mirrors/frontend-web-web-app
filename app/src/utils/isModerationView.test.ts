// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuTab } from '../components/MenuTabs/fragments/constants';
import { MODERATION_MENU_VIEW, ModerationTabKey } from '../config/constants';
import { isModerationView } from './isModerationView';

describe('isModerationView', () => {
  it('matches the moderation overview', () => {
    expect(isModerationView(MODERATION_MENU_VIEW)).toBe(true);
  });

  it.each(Object.values(ModerationTabKey))('matches the moderation tool %s', (key) => {
    expect(isModerationView(key)).toBe(true);
  });

  it.each(Object.values(MenuTab))('does not match the top level view %s', (tab) => {
    expect(isModerationView(tab)).toBe(false);
  });

  it('does not match a closed panel', () => {
    expect(isModerationView(null)).toBe(false);
  });
});
