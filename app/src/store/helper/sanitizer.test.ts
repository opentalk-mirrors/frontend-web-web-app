// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';

import { startRoom } from '../commonActions';
import { actionSanitizer } from './sanitizer';

describe('actionSanitizer', () => {
  it('masks the conference context when joining a room', () => {
    const conferenceContext = {};
    const action = startRoom.fulfilled({ conferenceContext } as never, 'request-id', {
      roomId: 'room-id' as never,
      displayName: 'Ada Lovelace',
    });

    expect(actionSanitizer(action, 0)).toEqual({
      ...action,
      payload: { conferenceContext: '<<LONG_BLOB>>' },
    });
  });
});
