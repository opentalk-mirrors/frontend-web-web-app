// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { Participant as RemoteParticipant } from 'livekit-client';

import { LeftReason } from '../../api/types/incoming/control';
import { notifications } from '../../commonComponents';
import {
  BackendParticipant,
  ChatMessage,
  LegalVote,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipantInOtherRoom,
  ParticipationKind,
  Role,
  WaitingState,
} from '../../types';
import { joinSuccess } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { getLivekitRoom } from '../livekitRoom';
import { selectCurrentBreakoutRoomId } from './breakoutSlice';
import { received } from './chatSlice';
import { GridViewOrder } from './common';
import { connectionClosed } from './roomSlice';

export const participantAdapter = createEntityAdapter<Participant>({
  sortComparer: (a, b) => a.displayName.localeCompare(b.displayName),
});

export const participantsSlice = createSlice({
  name: 'participants',
  initialState: participantAdapter.getInitialState(),
  reducers: {
    join: (
      state,
      {
        payload: {
          participant: {
            id,
            displayName,
            avatarUrl,
            handIsUp,
            joinedAt,
            leftAt,
            handUpdatedAt,
            groups,
            breakoutRoomId,
            participationKind,
            role,
            meetingNotesAccess,
            isRoomOwner,
          },
        },
      }: PayloadAction<{ participant: Participant }>
    ) => {
      participantAdapter.upsertOne(state, {
        id,
        groups,
        displayName,
        avatarUrl,
        handIsUp,
        joinedAt,
        leftAt,
        handUpdatedAt,
        breakoutRoomId,
        participationKind,
        lastActive: joinedAt,
        role,
        waitingState: WaitingState.Joined,
        meetingNotesAccess,
        isRoomOwner,
      });
    },
    leave: (
      state,
      { payload: { id, timestamp } }: PayloadAction<{ id: ParticipantId; timestamp: string; reason: LeftReason }>
    ) => {
      participantAdapter.updateOne(state, {
        id,
        changes: {
          leftAt: timestamp,
        },
      });
    },
    breakoutJoined: (
      state,
      {
        payload: { data, timestamp },
      }: PayloadAction<{
        data: ParticipantInOtherRoom;
        timestamp: string;
      }>
    ) => {
      const participant: Participant = {
        id: data.id,
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
    waitingRoomJoined: (state, { payload }: PayloadAction<BackendParticipant>) => {
      const participant: Participant = {
        id: payload.id,
        displayName: payload.control.displayName,
        avatarUrl: payload.control.avatarUrl,
        groups: [],
        handIsUp: false,
        joinedAt: payload.control.joinedAt,
        leftAt: null,
        handUpdatedAt: payload.control.handUpdatedAt,
        breakoutRoomId: null,
        participationKind: payload.control.participationKind,
        lastActive: payload.control.joinedAt,
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

    builder.addCase(received, (state, { payload }: PayloadAction<ChatMessage>) => {
      participantAdapter.updateOne(state, {
        id: payload.source,
        changes: { lastActive: payload.timestamp },
      });
    });
  },
});

export const {
  join,
  leave,
  update,
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
export const selectParticipantById = (id: ParticipantId) => (state: RootState) =>
  participantSelectors.selectById(state, id);

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
    (_state: RootState, gridViewOrder: GridViewOrder) => gridViewOrder,
    selectAllOnlineParticipantsInConference,
    selectCurrentBreakoutRoomId,
  ],
  (gridViewOrder, participants, currentBreakoutRoomId) => {
    let filteredParticipants = participants
      .filter((participant) => participant.breakoutRoomId === currentBreakoutRoomId)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)); // always sort by firstJoined;

    if (gridViewOrder === GridViewOrder.ModeratorsFirst) {
      filteredParticipants = filteredParticipants.sort((participant) => (participant.role === Role.Moderator ? -1 : 1));
    }
    if (gridViewOrder === GridViewOrder.VideoFirst) {
      const room = getLivekitRoom();
      const videoSubscribers = Array.from(room.remoteParticipants.values() || []).filter(
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
    (state: RootState, gridViewOrder: GridViewOrder) => selectSortedParticipants(state, gridViewOrder),
    (_state: RootState, _gridViewOrder: GridViewOrder, page: number) => page,
    (_state: RootState, _gridViewOrder: GridViewOrder, _page: number, maxParticipants: number) => maxParticipants,
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
  (participant) => participant?.avatarUrl
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

export const selectMapRemotePaticipanstDisplayName = createSelector(
  [(_state: RootState, remoteParticipants: RemoteParticipant[]) => remoteParticipants, selectAllOnlineParticipants],
  (remoteParticipants, onlineParticipants) => {
    return remoteParticipants.reduce(
      (acc, remoteParticipant) => {
        acc[remoteParticipant.identity] = onlineParticipants.find(
          (participant) => participant.id === remoteParticipant.identity
        )?.displayName;
        return acc;
      },
      {} as Record<string, string | undefined>
    );
  }
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

export const handleParticipantLeaveDuringVoteEffect = (
  action: ReturnType<typeof leave>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const state = listenerApi.getOriginalState();
  const { payload } = action;
  const { activeVote, votes } = state.legalVote;

  if (!activeVote) {
    return;
  }

  const activeVoteEntry = votes.entities[activeVote.id];
  const participantId = payload.id;

  if (shouldShowNotification(state.user.role, participantId, activeVoteEntry)) {
    const participantName = participantSelectors.selectById(state, participantId).displayName;
    notifications.warning(i18next.t('legal-vote-participant-left-the-meeting', { participantName }));
  }
};

const startParticipantLeaveDuringVoteListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: leave,
    effect: handleParticipantLeaveDuringVoteEffect,
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
