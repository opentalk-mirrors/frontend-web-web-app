// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId, ChatScope, MeetingNotesAccess, ParticipantId, ParticipationKind, Role } from '../types';
import { mockedParticipant, mockStore } from '../utils/testUtils';
import type { RootState } from './index';
import {
  selectCombinedMessageAndEvents,
  selectCombinedParticipantsAndUser,
  selectCombinedParticipantsAndUserInConference,
  selectCombinedUserAndParticipants,
  selectVotingUsers,
} from './selectors';

describe('selectCombinedMessageAndEvents', () => {
  it('filters recorder and transcription events from global feed', () => {
    const recorderId = 'recorder-1' as ParticipantId;
    const userId = 'user-1' as ParticipantId;
    const transcriptionId = 'transcription-1' as ParticipantId;

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
          [`${transcriptionId}@event-transcription`]: {
            id: 'event-transcription',
            target: transcriptionId,
            timestamp: '2026-03-10T10:02:00.000Z',
            event: 'joined',
            participationKind: ParticipationKind.Transcription,
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
          scope: ChatScope.Breakout,
          target: breakoutRoomId,
        },
      },
      events: {
        ids: [],
        entities: {},
      },
    } as unknown as RootState;

    const result = selectCombinedMessageAndEvents(state);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'breakout-message',
      scope: ChatScope.Breakout,
      target: breakoutRoomId,
    });
  });
});

describe('participant selectors combining the user', () => {
  const ownId = '00000000-e6b4-4759-000' as ParticipantId;

  const buildState = (
    participants: Array<{ id: ParticipantId; role: Role; participationKind: ParticipationKind }>,
    user: { role: Role; participationKind: ParticipationKind }
  ) => {
    const { store } = mockStore(0, {
      store: {
        initialState: {
          participants: {
            ids: participants.map(({ id }) => id),
            entities: Object.fromEntries(
              participants.map((participant, index) => [
                participant.id,
                { ...mockedParticipant(index), ...participant },
              ])
            ),
          },
          user: {
            uuid: ownId,
            displayName: 'Me',
            joinedAt: '2022-03-23T12:32:30Z',
            lastActive: '2022-03-23T12:32:30Z',
            meetingNotesAccess: MeetingNotesAccess.None,
            isRoomOwner: false,
            joinedAsModerator: false,
            ...user,
          },
        },
      },
    });
    return store.getState() as RootState;
  };

  it('does not list the user twice when the same account is connected from another device', () => {
    const otherId = '00000000-e6b4-4759-001' as ParticipantId;
    const state = buildState(
      [
        { id: ownId, role: Role.Guest, participationKind: ParticipationKind.Registered },
        { id: otherId, role: Role.User, participationKind: ParticipationKind.Registered },
      ],
      { role: Role.Guest, participationKind: ParticipationKind.Registered }
    );

    expect(selectCombinedParticipantsAndUser(state).map(({ id }) => id)).toEqual([otherId, ownId]);
    expect(selectCombinedUserAndParticipants(state).map(({ id }) => id)).toEqual([ownId, otherId]);
    expect(selectCombinedParticipantsAndUserInConference(state).map(({ id }) => id)).toEqual([otherId, ownId]);
  });

  it('lets only invited users with account vote', () => {
    const uninvitedId = '00000000-e6b4-4759-001' as ParticipantId;
    const guestId = '00000000-e6b4-4759-002' as ParticipantId;
    const callInId = '00000000-e6b4-4759-003' as ParticipantId;
    const serviceId = '00000000-e6b4-4759-004' as ParticipantId;
    const state = buildState(
      [
        { id: uninvitedId, role: Role.Guest, participationKind: ParticipationKind.Registered },
        { id: guestId, role: Role.Guest, participationKind: ParticipationKind.Unregistered },
        { id: callInId, role: Role.Guest, participationKind: ParticipationKind.CallIn },
        { id: serviceId, role: Role.Guest, participationKind: ParticipationKind.Recorder },
      ],
      { role: Role.Moderator, participationKind: ParticipationKind.Registered }
    );

    expect(selectVotingUsers(state).map(({ id }) => id)).toEqual([ownId]);
  });
});
