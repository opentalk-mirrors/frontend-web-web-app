// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId, ChatScope, ParticipantId } from '../../types';
import { Role } from '../../types';
import { joinSuccess } from '../commonActions';
import reducer, { received } from './chatSlice';

describe('chatSlice breakout handling', () => {
  it('adds breakout messages without resetting previous breakout history', () => {
    const breakoutRoomId = 1 as BreakoutRoomId;

    const firstState = reducer(
      undefined,
      received({
        userId: 'self-user' as ParticipantId,
        chatMessage: {
          id: 'message-1',
          scope: ChatScope.Breakout,
          target: breakoutRoomId,
          source: 'user-a' as ParticipantId,
          timestamp: '2026-03-30T14:00:00.000Z',
          content: 'first',
        },
      })
    );

    const secondState = reducer(
      firstState,
      received({
        userId: 'self-user' as ParticipantId,
        chatMessage: {
          id: 'message-2',
          scope: ChatScope.Breakout,
          target: breakoutRoomId,
          source: 'user-a' as ParticipantId,
          timestamp: '2026-03-30T14:01:00.000Z',
          content: 'second',
        },
      })
    );

    expect(secondState.scope.breakout[breakoutRoomId].messages.ids).toHaveLength(2);
  });

  it('adds breakout history on joinSuccess', () => {
    const breakoutRoomId = 3 as BreakoutRoomId;

    const state = reducer(
      undefined,
      joinSuccess({
        participantId: 'self-user' as ParticipantId,
        role: Role.User,
        chat: {
          enabled: true,
          globalHistory: {
            messages: [],
            nextIndex: null,
          },
          privateHistory: [],
          breakoutRoomHistory: {
            messages: [
              {
                id: 'bo-history-single-1',
                scope: ChatScope.Breakout,
                target: breakoutRoomId,
                source: 'user-b' as ParticipantId,
                timestamp: '2026-03-30T14:11:00.000Z',
                content: 'single chunk payload',
              },
            ],
            nextIndex: null,
          },
          lastSeenTimestampsPrivate: {},
        },
        breakout: {
          room: {
            kind: 'breakout',
            id: breakoutRoomId,
          },
          rooms: [],
        },
        participants: [],
        serverTimeOffset: 0,
        tariff: {
          id: 'test-tariff',
          name: 'test-tariff',
          quotas: {},
          disabledFeatures: [],
        },
        participantsReady: [],
        isRoomOwner: false,
        livekit: {
          room: 'room',
          token: 'token',
          publicUrl: 'https://example.test',
        },
        enabledModules: [],
      } as never)
    );

    expect(state.scope.breakout[breakoutRoomId].messages.ids).toHaveLength(1);
  });
});
