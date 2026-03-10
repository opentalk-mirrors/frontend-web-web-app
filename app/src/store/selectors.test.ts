// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ChatIdentifier, ChatScope, ParticipantId, ParticipationKind } from '../types';
import type { RootState } from './index';
import { selectCombinedMessageAndEvents } from './selectors';

describe('selectCombinedMessageAndEvents', () => {
  it('filters recorder events from global feed', () => {
    const recorderId = 'recorder-1' as ParticipantId;
    const userId = 'user-1' as ParticipantId;

    const state = {
      chat: {
        scope: {
          global: {
            messages: {
              ids: [],
              entities: {},
            },
          },
          private: {},
          breakout: {
            messages: {
              ids: [],
              entities: {},
            },
          },
        },
      },
      events: {
        ids: [`${recorderId}@event-recorder`, `${userId}@event-user`],
        entities: {
          [`${recorderId}@event-recorder`]: {
            id: 'event-recorder',
            target: recorderId,
            timestamp: '2026-03-10T10:00:00.000Z',
            event: 'joined',
            participationKind: ParticipationKind.Recorder,
          },
          [`${userId}@event-user`]: {
            id: 'event-user',
            target: userId,
            timestamp: '2026-03-10T10:01:00.000Z',
            event: 'joined',
            participationKind: ParticipationKind.Registered,
          },
        },
      },
    } as unknown as RootState;

    const chatIdentifier: ChatIdentifier = {
      scope: ChatScope.Global,
    };

    const result = selectCombinedMessageAndEvents(state, chatIdentifier);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'event-user',
      target: userId,
      participationKind: ParticipationKind.Registered,
    });
  });
});
