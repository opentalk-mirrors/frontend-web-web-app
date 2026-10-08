// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { codeCallback } from '@opentalk/redux-oidc';
import { BackendModules, CoreFeatures } from '@opentalk/rest-api-rtk-query';
import { PayloadAction, Selector, createSelector, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

import type { RootState } from '../';
import { restApi } from '../../api/rest';
import { sendChatMessage } from '../../api/types/outgoing/chat';
import { lowerHand, raiseHand } from '../../api/types/outgoing/raiseHands';
import i18n from '../../i18n';
import { MeetingNotesAccess, Participant, ParticipantId, ParticipationKind, Role, WaitingState } from '../../types';
import { initSentryReportWithUser } from '../../utils/glitchtipUtils';
import { changeMedia, joinSuccess, setScreenShareEnabled, startRoom } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from './meetingNotesSlice';
import { connectionClosed, fetchRoomByInviteId } from './roomSlice';

export type UserState = {
  uuid: ParticipantId | null;
  role: Role;
  participationKind: ParticipationKind;
  displayName: string;
  avatarUrl?: string;
  lastActive?: string;
  joinedAt?: string;
  meetingNotesAccess: MeetingNotesAccess;
  isRoomOwner: boolean;
  joinedAsModerator: boolean;
  isTariffUpgradable?: boolean;
};

const initialState: UserState = {
  uuid: null,
  displayName: '',
  role: Role.User,
  participationKind: ParticipationKind.Registered,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
  joinedAsModerator: false,
};

const userSlice = createSlice({
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
      state.participationKind = ParticipationKind.Guest;
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
        if (state.participationKind === ParticipationKind.Guest) {
          initSentryReportWithUser({ name: state.displayName, lang: i18next.language });
        }
      }
    );
    builder.addCase(
      joinSuccess,
      (state, { payload: { avatarUrl, role, participantId, isRoomOwner, enabledModules } }) => {
        state.role = role;
        state.avatarUrl = avatarUrl;
        state.uuid = participantId;
        state.joinedAt = new Date().toISOString();
        state.lastActive = state.joinedAt;
        state.isRoomOwner = isRoomOwner;
        state.joinedAsModerator = role === Role.Moderator;
        state.isTariffUpgradable = enabledModules[BackendModules.Core]?.includes(CoreFeatures.StorageUpgradable);
        state.participationKind = role === Role.Guest ? ParticipationKind.Guest : ParticipationKind.Registered;
      }
    );
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
    builder.addCase(changeMedia.fulfilled, (state) => {
      state.lastActive = new Date().toISOString();
    });
    builder.addCase(setScreenShareEnabled.fulfilled, (state) => {
      state.lastActive = new Date().toISOString();
    });
  },
});

const actions = userSlice.actions;
export const { updateRole, setDisplayName } = actions;

const userState = (state: RootState) => state.user;

export const selectOurUuid = createSelector([userState], (state) => state.uuid);
export const selectDisplayName = createSelector([userState], (state) => state.displayName);
export const selectAvatarUrl = createSelector([userState], (state) => state.avatarUrl);
export const selectUserMeetingNotesAccess = createSelector([userState], (state) => state.meetingNotesAccess);
export const selectIsModerator = createSelector([userState], (state) => state.role === Role.Moderator);

/**
 * Whether the user is allowed to create/upload room assets (e.g. whiteboard PDFs).
 *
 * The controller authorizes asset uploads against the persistent (database-level) role, so a user
 * promoted to moderator only during the meeting is not permitted to upload. This selector therefore
 * relies on the room owner flag and the join-time moderator role instead of the live role.
 */
export const selectCanManageRoomAssets = createSelector(
  [userState],
  (state) => state.isRoomOwner || state.joinedAsModerator
);

export const selectIsGuest = createSelector(
  [userState],
  (state) => state.role === Role.Guest || state.participationKind === ParticipationKind.Guest
);
const selectRole = createSelector([userState], (state) => state.role);
const selectParticipationKind = createSelector([userState], (state) => state.participationKind);
const selectIsRoomOwner = createSelector([userState], (state) => state.isRoomOwner);
const selectJoinedAt = createSelector([userState], (state) => state.joinedAt);
const selectLastActive = createSelector([userState], (state) => state.lastActive);

export const selectUserAsPartialParticipant: Selector<
  RootState,
  Omit<Participant, 'connections' | 'handIsUp' | 'handUpdatedAt' | 'breakoutRoomId'> | undefined
> = createSelector(
  [
    selectDisplayName,
    selectAvatarUrl,
    selectUserMeetingNotesAccess,
    selectRole,
    selectParticipationKind,
    selectOurUuid,
    selectIsRoomOwner,
    selectJoinedAt,
    selectLastActive,
  ],
  (displayName, avatarUrl, meetingNotesAccess, role, participationKind, uuid, isRoomOwner, joinedAt, lastActive) => {
    if (uuid === null || joinedAt === undefined || lastActive === undefined) {
      return undefined;
    }

    return {
      id: uuid,
      displayName,
      avatarUrl,
      joinedAt,
      lastActive,
      leftAt: null,
      participationKind,
      waitingState: WaitingState.Joined,
      meetingNotesAccess: meetingNotesAccess,
      isRoomOwner,
      role,
    };
  }
);

export default userSlice.reducer;

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

const startAuthListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: codeCallback.fulfilled,
    effect: async (_, { dispatch }) => {
      const result = await dispatch(restApi.endpoints.getMe.initiate());

      if (result.data) {
        const { displayName, email, language } = result.data;
        initSentryReportWithUser({ name: displayName, email, lang: language });
      }
    },
  });

const startLanguageListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: restApi.endpoints.getMe.matchFulfilled,
    effect: (action) => {
      const payload = action.payload as { language?: string };

      if (payload?.language) {
        i18n.changeLanguage(payload.language);
      }
    },
  });

export const startUserListeners = (startAppListening: StartAppListening) => {
  startAuthListener(startAppListening);
  startLanguageListener(startAppListening);
};
