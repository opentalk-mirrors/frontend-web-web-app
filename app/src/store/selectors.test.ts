// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId, ChatScope, ParticipantId, ParticipationKind } from '../types';
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
      ui: {
        chatConversationState: {
          scope: ChatScope.Global,
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

    const result = selectCombinedMessageAndEvents(state);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'event-user',
      target: userId,
      participationKind: ParticipationKind.Registered,
    });
  });

  it('prefers explicit chat identifier over ui chat conversation state', () => {
    const breakoutRoomId = 7 as BreakoutRoomId;
    const userId = 'user-1' as ParticipantId;
    const breakoutMessageTimestamp = '2026-03-10T10:02:00.000Z';
    const breakoutMessageId = `${userId}@${breakoutMessageTimestamp}`;

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
            [breakoutRoomId]: {
              messages: {
                ids: [breakoutMessageId],
                entities: {
                  [breakoutMessageId]: {
                    id: 'breakout-message',
                    scope: ChatScope.Breakout,
                    target: breakoutRoomId,
                    source: userId,
                    timestamp: breakoutMessageTimestamp,
                    content: 'Hello breakout',
                  },
                },
              },
            },
          },
        },
      },
      ui: {
        chatConversationState: {
          scope: ChatScope.Global,
        },
      },
      events: {
        ids: [],
        entities: {},
      },
    } as unknown as RootState;

    const result = selectCombinedMessageAndEvents(state, { scope: ChatScope.Breakout, target: breakoutRoomId });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'breakout-message',
      scope: ChatScope.Breakout,
      target: breakoutRoomId,
    });
  });
});
