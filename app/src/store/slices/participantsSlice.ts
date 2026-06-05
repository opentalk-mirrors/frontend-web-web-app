// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import { createAction, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { truncate } from 'lodash';

import { DisconnectReason } from '../../api/types/incoming/core';
import { notifications } from '../../commonComponents';
import {
  ChatMessage,
  ConnectionId,
  ConnectionIdentifier,
  JoinedWaitingRoomParticipant,
  LegalVote,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  Role,
  Timestamp,
  WaitingState,
} from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';
import { joinSuccess } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { selectCurrentBreakoutRoomId } from './breakoutSlice';
import { received } from './chatSlice';
import { connectionClosed } from './roomSlice';
import { removeParticipant } from './subroomAudioSlice';

export const participantAdapter = createEntityAdapter<Participant>({
  sortComparer: (a, b) => a.displayName.localeCompare(b.displayName),
});

type PatchParticipant = Pick<
  Participant,
  | 'displayName'
  | 'handIsUp'
  | 'lastActive'
  | 'joinedAt'
  | 'leftAt'
  | 'handUpdatedAt'
  | 'role'
  | 'meetingNotesAccess'
  | 'breakoutRoomId'
>;

export const participantsSlice = createSlice({
  name: 'participants',
  initialState: participantAdapter.getInitialState(),
  reducers: {
    join: (state, { payload: { participant } }: PayloadAction<{ participant: Participant }>) => {
      const existing = state.entities[participant.id];

      if (existing) {
        // Merge connections without duplicates
        const mergedConnections = Array.from(new Set([...existing.connections, ...participant.connections]));

        participantAdapter.upsertOne(state, {
          ...existing,
          ...participant,
          connections: mergedConnections,
          lastActive: participant.joinedAt, // update lastActive if needed
          waitingState: WaitingState.Joined,
        });
      } else {
        participantAdapter.upsertOne(state, {
          ...participant,
          waitingState: WaitingState.Joined,
          lastActive: participant.joinedAt,
        });
      }
    },

    leave: (
      state,
      {
        payload: { id, connection, timestamp },
      }: PayloadAction<{
        id: ParticipantId;
        connection: ConnectionId;
        timestamp: Timestamp;
        reason?: DisconnectReason;
      }>
    ) => {
      const existing = state.entities[id];
      if (!existing) {
        return;
      }

      const remainingConnections = existing.connections.filter((c) => c !== connection);

      if (remainingConnections.length === 0) {
        // last connection → participant fully leaves
        participantAdapter.updateOne(state, {
          id,
          changes: {
            connections: [],
            leftAt: timestamp,
          },
        });
      } else {
        // still has active connections → just update connections
        participantAdapter.updateOne(state, {
          id,
          changes: {
            connections: remainingConnections,
          },
        });
      }
    },
    waitingRoomJoined: (state, { payload }: PayloadAction<JoinedWaitingRoomParticipant>) => {
      const participant: Participant = {
        id: payload.participantId,
        connections: payload.connectionIds,
        displayName: payload.displayName,
        avatarUrl: payload.avatarUrl,
        handIsUp: false,
        joinedAt: payload.joinedAt,
        leftAt: null,
        participationKind: ParticipationKind.Registered,
        lastActive: payload.joinedAt,
        meetingNotesAccess: MeetingNotesAccess.None,
        waitingState: WaitingState.Waiting,
        isRoomOwner: false,
      };
      participantAdapter.upsertOne(state, participant);
    },
    waitingRoomLeft: (state, { payload }: PayloadAction<ParticipantId>) => {
      participantAdapter.removeOne(state, payload);
    },
    approveToEnter: (state, { payload }: PayloadAction<ParticipantId>) => {
      participantAdapter.updateOne(state, {
        id: payload,
        changes: { waitingState: WaitingState.Approved },
      });
    },
    approvedAll: (state) => {
      const participantSelectors = participantAdapter.getSelectors();
      const participants = participantSelectors.selectAll(state);
      participants.forEach((participant) => {
        if (participant.waitingState === WaitingState.Waiting) {
          participantAdapter.updateOne(state, {
            id: participant.id,
            changes: { waitingState: WaitingState.Approved },
          });
        }
      });
    },
    update: (
      state,
      {
        payload: { id, displayName, handIsUp, lastActive, joinedAt, leftAt, handUpdatedAt, role, meetingNotesAccess },
      }: PayloadAction<Omit<Participant, 'breakoutRoomId'>>
    ) => {
      participantAdapter.updateOne(state, {
        id,
        changes: {
          displayName,
          handIsUp,
          lastActive,
          joinedAt,
          leftAt,
          handUpdatedAt,
          role,
          meetingNotesAccess,
        },
      });
    },
    patch: (state, { payload }: PayloadAction<{ participantId: ParticipantId } & Partial<PatchParticipant>>) => {
      const { participantId, ...changes } = payload;

      // const changes = Object.fromEntries(
      //   Object.entries(optionalChanges).filter(([_, v]) => v !== undefined)
      // ) as Partial<Participant>;

      if (Object.keys(changes).length === 0) {
        return;
      }

      const matchingId = state.ids.find((rawId) => {
        const entity = state.entities[rawId as ParticipantId];
        return entity?.id === participantId && entity.leftAt === null && entity.waitingState === WaitingState.Joined;
      });

      if (matchingId) {
        participantAdapter.updateOne(state, {
          id: matchingId,
          changes,
        });
      }
    },
    rename: (state, { payload }: PayloadAction<Pick<Participant, 'id' | 'displayName'>>) => {
      const { id, displayName } = payload;
      participantAdapter.updateOne(state, {
        id,
        changes: {
          displayName,
        },
      });
    },
  },

  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { participants } }) => {
      participantAdapter.setAll(state, participants);
    });
    builder.addCase(connectionClosed, () => participantAdapter.getInitialState());

    builder.addCase(
      received,
      (state, { payload }: PayloadAction<{ chatMessage: ChatMessage; userId: ParticipantId }>) => {
        const { chatMessage } = payload;
        participantAdapter.updateOne(state, {
          id: chatMessage.source,
          changes: { lastActive: chatMessage.timestamp },
        });
      }
    );
  },
});

export const { join, leave, update, patch, waitingRoomJoined, waitingRoomLeft, approveToEnter, approvedAll, rename } =
  participantsSlice.actions;
export const actions = participantsSlice.actions;

export const participantSelectors = participantAdapter.getSelectors<RootState>((state) => state.participants);

export const selectAllParticipants = (state: RootState) => participantSelectors.selectAll(state);

export const selectAllVisibleParticipants = createSelector([selectAllParticipants], (participants) =>
  participants.filter((participant) => participant.participationKind !== ParticipationKind.Recorder)
);

export const selectParticipantById = (participantId: ParticipantId) => (state: RootState) =>
  participantSelectors.selectById(state, participantId);

export const selectAllParticipantsInWaitingRoom = createSelector([selectAllVisibleParticipants], (participants) =>
  participants.filter((participant) => participant.waitingState !== WaitingState.Joined)
);

export const selectParticipantsWaitingCount = createSelector(
  [selectAllParticipantsInWaitingRoom],
  (participants) => participants.length
);

export const selectNotApprovedParticipants = createSelector([selectAllParticipantsInWaitingRoom], (participants) =>
  participants.filter((participant) => participant.waitingState === WaitingState.Waiting)
);

export const selectAllOnlineParticipantsInConference = createSelector([selectAllVisibleParticipants], (participants) =>
  participants.filter((participant) => participant.leftAt === null && participant.waitingState === WaitingState.Joined)
);

export const selectAllOnlineParticipants = createSelector(
  [selectAllOnlineParticipantsInConference, selectCurrentBreakoutRoomId],
  (participants, currentBreakoutRoomId) =>
    participants.filter((participant) => participant.breakoutRoomId === currentBreakoutRoomId)
);

export const selectParticipants = (state: RootState) => participantSelectors.selectEntities(state);

export const selectParticipantsTotal = createSelector(
  [selectAllOnlineParticipants],
  (participants) => participants.length + 1
);

export const selectParticipantAvatarUrl: (state: RootState, id: ParticipantId) => string | undefined = createSelector(
  [(state: RootState, id: ParticipantId) => selectParticipantById(id)(state)],
  (participant: Participant) => participant?.avatarUrl
);

export const selectParticipantName: (state: RootState, id: ParticipantId) => string | undefined = createSelector(
  [(state: RootState, id: ParticipantId) => selectParticipantById(id)(state)],
  (participant) => participant?.displayName
);

export const selectParticipationKind: (state: RootState, id: ParticipantId) => ParticipationKind | undefined =
  createSelector(
    [(state: RootState, id: ParticipantId) => selectParticipantById(id)(state)],
    (participant) => participant?.participationKind
  );

export const selectRemoteParticipantsDisplayNameRecord = createSelector(
  [(_state: RootState, identities: string[]) => identities, selectAllOnlineParticipants],
  (identities, onlineParticipants) => {
    const participantMap = new Map(onlineParticipants.map((participant) => [participant.id, participant.displayName]));
    const result: Record<string, string | undefined> = {};
    for (const identity of identities) {
      const { participantId } = deconstructConnectionIdentifier(identity as ConnectionIdentifier);
      result[identity] = participantMap.get(participantId);
    }
    return result;
  }
);

export const selectAllModeratorParticipants = createSelector([selectAllOnlineParticipants], (participants) =>
  participants.filter((participant) => participant.role === Role.Moderator)
);

export const selectDisplayNameById = (state: RootState, participantId: ParticipantId) =>
  selectParticipantById(participantId)(state)?.displayName;

export default participantsSlice.reducer;

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

export const shouldShowNotification = (role: Role, participantId: ParticipantId, activeVoteEntry: LegalVote) => {
  if (role !== Role.Moderator) {
    return false;
  }

  const participantWasAllowedToVote = activeVoteEntry?.allowedParticipants.includes(participantId);
  const participantVoted = activeVoteEntry?.votingRecord && Object.hasOwn(activeVoteEntry?.votingRecord, participantId);
  return participantWasAllowedToVote && !participantVoted;
};

export const handleParticipantJoinDuringVoteEffect = (
  action: ReturnType<typeof join>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const state = listenerApi.getOriginalState();
  const { payload } = action;
  const { activeVote, votes } = state.legalVote;

  if (!activeVote) {
    return;
  }

  const activeVoteEntry = votes.entities[activeVote.id];
  const participantId = payload.participant.id;

  if (shouldShowNotification(state.user.role, participantId, activeVoteEntry)) {
    const participantName = truncate(payload.participant.displayName, { length: 100 });
    notifications.warning(i18next.t('legal-vote-participant-joined-the-meeting', { participantName }));
  }
};

export const handleParticipantLeaveEffect = (
  action: ReturnType<typeof leave>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const state = listenerApi.getOriginalState();
  const { payload } = action;
  const { activeVote, votes } = state.legalVote;

  const whisperId = state.subroomAudio.whisperId;
  if (whisperId) {
    listenerApi.dispatch(removeParticipant({ whisperId, participantId: payload.id }));
  }
  if (activeVote) {
    const activeVoteEntry = votes.entities[activeVote.id];
    const participantId = payload.id;

    if (shouldShowNotification(state.user.role, participantId, activeVoteEntry)) {
      const participantName = truncate(participantSelectors.selectById(state, participantId).displayName, {
        length: 100,
      });
      notifications.warning(i18next.t('legal-vote-participant-left-the-meeting', { participantName }));
    }
  }
};

const startParticipantLeaveDuringVoteListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: leave,
    effect: handleParticipantLeaveEffect,
  });
};

const startParticipantJoinDuringVoteListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: join,
    effect: handleParticipantJoinDuringVoteEffect,
  });
};

export const participantJoined = createAction<{ participant: Participant }>('events/participantJoined');
export const participantRejoined = createAction<{ participant: Participant }>('events/participantRejoined');
export const participantOpenedConnection = createAction<{ participant: Participant }>(
  'events/participantOpenedConnection'
);

const startParticipantJoinedAgainListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: join,
    effect: (action, listenerApi) => {
      const { id } = action.payload.participant;
      const state = listenerApi.getOriginalState();
      const ourUuid = state.user.uuid;
      const existingParticipant = participantSelectors.selectById(state, id);
      if (id !== ourUuid) {
        if (existingParticipant?.leftAt) {
          listenerApi.dispatch(participantRejoined(action.payload));
          return;
        } else if (existingParticipant) {
          listenerApi.dispatch(participantOpenedConnection(action.payload));
        } else {
          listenerApi.dispatch(participantJoined(action.payload));
        }
      }
    },
  });
};

export const participantLeft = createAction<{ participant: Participant; reason?: DisconnectReason }>(
  'events/participantLastLeave'
);
export const participantClosedConnection = createAction<{ participant: Participant; reason?: DisconnectReason }>(
  'events/participantClosedConnection'
);

const startParticipantLeftAgainListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: leave,
    effect: (action, listenerApi) => {
      const { id, connection, timestamp, reason } = action.payload;
      const state = listenerApi.getOriginalState();
      const ourUuid = state.user.uuid;
      if (id !== ourUuid) {
        const existingParticipant = participantSelectors.selectById(state, id);
        if (existingParticipant) {
          const remainingConnections = existingParticipant.connections.filter((c) => c !== connection);
          if (remainingConnections.length === 0) {
            listenerApi.dispatch(
              participantLeft({ participant: { ...existingParticipant, leftAt: timestamp }, reason })
            );
          } else {
            listenerApi.dispatch(
              participantClosedConnection({ participant: { ...existingParticipant, leftAt: timestamp }, reason })
            );
          }
        }
      }
    },
  });
};

export const startParticipantsListeners = (startAppListening: StartAppListening) => {
  startParticipantJoinDuringVoteListener(startAppListening);
  startParticipantLeaveDuringVoteListener(startAppListening);
  startParticipantJoinedAgainListener(startAppListening);
  startParticipantLeftAgainListener(startAppListening);
};
