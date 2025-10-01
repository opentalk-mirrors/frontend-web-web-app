// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { Participant as RemoteParticipant } from 'livekit-client';

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
  ParticipantInOtherRoom,
  ParticipationKind,
  Role,
  Timestamp,
  WaitingState,
} from '../../types';
import { deconstructIdentity } from '../../utils/deconstructIdentity';
import { joinSuccess } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { selectCurrentBreakoutRoomId } from './breakoutSlice';
import { received } from './chatSlice';
import { CinemaViewSortOrder } from './common';
import { connectionClosed } from './roomSlice';
import { removeParticipant } from './subroomAudioSlice';

export const participantAdapter = createEntityAdapter<Participant>({
  sortComparer: (a, b) => a.displayName.localeCompare(b.displayName),
});

type PatchParticipant = Pick<
  Participant,
  'displayName' | 'handIsUp' | 'lastActive' | 'joinedAt' | 'leftAt' | 'handUpdatedAt' | 'role' | 'meetingNotesAccess'
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

    breakoutJoined: (
      state,
      {
        payload: { data, timestamp },
      }: PayloadAction<{
        data: ParticipantInOtherRoom;
        timestamp: Timestamp;
      }>
    ) => {
      const participant: Participant = {
        id: data.id as ParticipantId,
        connections: data.connections,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        groups: [],
        handIsUp: false,
        joinedAt: timestamp,
        leftAt: null,
        handUpdatedAt: timestamp,
        breakoutRoomId: data.breakoutRoom,
        participationKind: data.participationKind,
        lastActive: timestamp,
        waitingState: WaitingState.Joined,
        meetingNotesAccess: MeetingNotesAccess.None,
        isRoomOwner: false,
      };
      participantAdapter.upsertOne(state, participant);
    },
    breakoutLeft: (state, { payload: { id, timestamp } }: PayloadAction<{ id: ParticipantId; timestamp: string }>) => {
      participantAdapter.updateOne(state, {
        id,
        changes: { breakoutRoomId: null, leftAt: timestamp },
      });
    },
    waitingRoomJoined: (state, { payload }: PayloadAction<JoinedWaitingRoomParticipant>) => {
      const participant: Participant = {
        id: payload.participantId,
        connections: payload.connectionIds,
        displayName: payload.displayName,
        avatarUrl: payload.avatarUrl,
        groups: [],
        handIsUp: false,
        joinedAt: payload.joinedAt,
        leftAt: null,
        // TODO - remove
        handUpdatedAt: undefined,
        breakoutRoomId: null,
        // TODO - missing from backend?
        participationKind: ParticipationKind.User,
        // participationKind: payload.control.participationKind,
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
      }: PayloadAction<Omit<Participant, 'breakoutRoomId' | 'groups'>>
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
      const { participantId, ...optionalChanges } = payload;

      const changes = Object.fromEntries(
        Object.entries(optionalChanges).filter(([_, v]) => v !== undefined)
      ) as Partial<PatchParticipant>;

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

export const {
  join,
  leave,
  update,
  patch,
  breakoutJoined,
  breakoutLeft,
  waitingRoomJoined,
  waitingRoomLeft,
  approveToEnter,
  approvedAll,
  rename,
} = participantsSlice.actions;
export const actions = participantsSlice.actions;

export const participantSelectors = participantAdapter.getSelectors<RootState>((state) => state.participants);

export const selectAllParticipants = (state: RootState) => participantSelectors.selectAll(state);

export const selectParticipantById = (participantId: ParticipantId) => (state: RootState) =>
  participantSelectors.selectById(state, participantId);

export const selectAllParticipantsInWaitingRoom = createSelector([selectAllParticipants], (participants) =>
  participants.filter((participant) => participant.waitingState !== WaitingState.Joined)
);

export const selectParticipantsWaitingCount = createSelector(
  [selectAllParticipantsInWaitingRoom],
  (participants) => participants.length
);

export const selectNotApprovedParticipants = createSelector([selectAllParticipantsInWaitingRoom], (participants) =>
  participants.filter((participant) => participant.waitingState === WaitingState.Waiting)
);

export const selectAllOnlineParticipantsInConference = createSelector([selectAllParticipants], (participants) =>
  participants.filter((participant) => participant.leftAt === null && participant.waitingState === WaitingState.Joined)
);

export const selectAllOnlineParticipants = createSelector(
  [selectAllOnlineParticipantsInConference, selectCurrentBreakoutRoomId],
  (participants, currentBreakoutRoomId) =>
    participants.filter((participant) => participant.breakoutRoomId === currentBreakoutRoomId)
);

export const selectSortedParticipants = createSelector(
  [
    (_state: RootState, cinemaViewOrder: CinemaViewSortOrder) => cinemaViewOrder,
    selectAllOnlineParticipantsInConference,
    selectCurrentBreakoutRoomId,
    (state: RootState) => state.livekit.room,
  ],
  (cinemaViewOrder, participants, currentBreakoutRoomId, room) => {
    let filteredParticipants = participants
      .filter((participant) => participant.breakoutRoomId === currentBreakoutRoomId)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)); // always sort by firstJoined;

    if (cinemaViewOrder === CinemaViewSortOrder.ModeratorsFirst) {
      filteredParticipants = filteredParticipants.sort((participant) => (participant.role === Role.Moderator ? -1 : 1));
    }
    if (cinemaViewOrder === CinemaViewSortOrder.VideoFirst) {
      const videoSubscribers = Array.from(room?.remoteParticipants.values() || []).filter(
        (participant) => participant.isCameraEnabled
      );

      filteredParticipants = filteredParticipants
        .sort((a, b) => Date.parse(b.lastActive) - Date.parse(a.lastActive))
        .sort((participant) =>
          videoSubscribers.find((subscriber) => participant.id === subscriber.identity) ? -1 : 1
        );
    }
    return filteredParticipants;
  }
);

export const selectSlicedParticipants = createSelector(
  [
    (state: RootState, cinemaViewOrder: CinemaViewSortOrder) => selectSortedParticipants(state, cinemaViewOrder),
    (_state: RootState, _cinemaViewOrder: CinemaViewSortOrder, page: number) => page,
    (_state: RootState, _cinemaViewOrder: CinemaViewSortOrder, _page: number, maxParticipants: number) =>
      maxParticipants,
  ],
  (participants, page, maxParticipants) => {
    const maxPage = Math.ceil(participants.length / maxParticipants);
    if (maxPage === page) {
      return participants.slice(-maxParticipants);
    }
    return participants.slice((page - 1) * maxParticipants, maxParticipants * page);
  }
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
  [(_state: RootState, remoteParticipants: RemoteParticipant[]) => remoteParticipants, selectAllOnlineParticipants],
  (remoteParticipants, onlineParticipants) => {
    return remoteParticipants.reduce(
      (acc, remoteParticipant) => {
        const { participantId } = deconstructIdentity(remoteParticipant.identity as ConnectionIdentifier);
        acc[remoteParticipant.identity] = onlineParticipants.find(
          (participant) => participant.id === participantId
        )?.displayName;
        return acc;
      },
      {} as Record<string, string | undefined>
    );
  }
);

export const selectAllModeratorParticipants = createSelector([selectAllOnlineParticipants], (participants) =>
  participants.filter((participant) => participant.role === Role.Moderator)
);

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
    const participantName = payload.participant.displayName;
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
      const participantName = participantSelectors.selectById(state, participantId).displayName;
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

export const startParticipantsListeners = (startAppListening: StartAppListening) => {
  startParticipantJoinDuringVoteListener(startAppListening);
  startParticipantLeaveDuringVoteListener(startAppListening);
};
