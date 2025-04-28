// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import getReferrerRouterState from './getReferrerRouterState';

describe('getReferrerRouterState()', () => {
  it('returns all meetings route by default.', () => {
    expect(getReferrerRouterState({ pathname: '/test' })).toEqual({ referrer: '/test' });
  });
});
