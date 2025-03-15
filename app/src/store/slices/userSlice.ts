// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

import type { RootState } from '../';
import { Role } from '../../api/types/incoming/control';
import { sendChatMessage } from '../../api/types/outgoing/chat';
import { lowerHand, raiseHand } from '../../api/types/outgoing/control';
import { GroupId, MeetingNotesAccess, Participant, ParticipantId, ParticipationKind, WaitingState } from '../../types';
import { initSentryReportWithUser } from '../../utils/glitchtipUtils';
import { joinSuccess, login, startRoom } from '../commonActions';
import { startMedia } from './mediaSlice';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from './meetingNotesSlice';
import { connectionClosed, fetchRoomByInviteId } from './roomSlice';

interface UserState {
  uuid: ParticipantId | null;
  groups: GroupId[];
  role: Role;
  displayName: string;
  avatarUrl?: string;
  loggedIdToken?: string;
  lastActive?: string;
  joinedAt?: string;
  meetingNotesAccess: MeetingNotesAccess;
  isRoomOwner: boolean;
}

const initialState: UserState = {
  uuid: null,
  groups: [],
  displayName: '',
  role: Role.User,
  meetingNotesAccess: 'none' as MeetingNotesAccess.None, // this will be fixed with the next version of the ts-jest
  isRoomOwner: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
    },
    updateRole: (state, { payload: role }: PayloadAction<Role>) => {
      state.role = role;
    },
    updateLastActive: (state) => {
      state.lastActive = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRoomByInviteId.fulfilled, (state) => {
      state.role = Role.Guest;
    });
    builder.addCase(login.fulfilled, (state, { meta }) => {
      state.loggedIdToken = meta.arg;
    });
    builder.addCase(login.rejected, (state) => {
      state.loggedIdToken = undefined;
    });
    builder.addCase(
      startRoom.pending,
      (
        state,
        {
          meta: {
            arg: { displayName },
          },
        }
      ) => {
        state.displayName = displayName;
        if (state.role === Role.Guest) {
          initSentryReportWithUser({ name: state.displayName, lang: i18next.language });
        }
      }
    );
    builder.addCase(joinSuccess, (state, { payload: { avatarUrl, role, participantId, groups, isRoomOwner } }) => {
      state.role = role;
      state.avatarUrl = avatarUrl;
      state.uuid = participantId;
      state.groups = groups;
      state.joinedAt = new Date().toISOString();
      state.lastActive = state.joinedAt;
      state.isRoomOwner = isRoomOwner;
    });
    builder.addCase(connectionClosed, (state) => {
      state.uuid = null;
      state.joinedAt = undefined;
    });

    builder.addCase(raiseHand.action, (state) => {
      state.lastActive = new Date().toISOString();
    });
    builder.addCase(lowerHand.action, (state) => {
      state.lastActive = new Date().toISOString();
    });
    builder.addCase(sendChatMessage.action, (state) => {
      state.lastActive = new Date().toISOString();
    });
    builder.addCase(setMeetingNotesReadUrl, (state) => {
      state.meetingNotesAccess = MeetingNotesAccess.Read;
    });
    builder.addCase(setMeetingNotesWriteUrl, (state) => {
      state.meetingNotesAccess = MeetingNotesAccess.Write;
    });
    builder.addCase(startMedia.fulfilled, (state) => {
      state.lastActive = new Date().toISOString();
    });
  },
});

export const actions = userSlice.actions;
export const { updateRole, setDisplayName, updateLastActive } = actions;

const userState = (state: RootState) => state.user;

export const selectOurUuid = createSelector([userState], (state) => state.uuid);
export const selectGroups = createSelector([userState], (state) => state.groups);
export const selectDisplayName = createSelector([userState], (state) => state.displayName);
export const selectAvatarUrl = createSelector([userState], (state) => state.avatarUrl);
export const selectUserMeetingNotesAccess = createSelector([userState], (state) => state.meetingNotesAccess);
export const selectIsModerator = createSelector([userState], (state) => state.role === Role.Moderator);
export const selectIsGuest = createSelector([userState], (state) => state.role === Role.Guest);
export const selectRole = createSelector([userState], (state) => state.role);

export const selectUserAsPartialParticipant = createSelector(
  [userState],
  (state): Omit<Participant, 'breakoutRoomId' | 'handIsUp' | 'handUpdatedAt'> | undefined => {
    const { displayName, avatarUrl, groups, joinedAt, lastActive, isRoomOwner, role } = state;

    if (state.uuid === null || joinedAt === undefined || lastActive === undefined) {
      return undefined;
    }

    const participationKind =
      state.role === Role.User || state.role === Role.Moderator ? ParticipationKind.User : ParticipationKind.Guest;

    return {
      id: state.uuid,
      displayName,
      avatarUrl,
      groups,
      joinedAt,
      lastActive,
      leftAt: null,
      participationKind,
      waitingState: WaitingState.Joined,
      meetingNotesAccess: state.meetingNotesAccess,
      isRoomOwner,
      role,
    };
  }
);

export default userSlice.reducer;
