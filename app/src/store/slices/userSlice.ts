// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { codeCallback } from '@opentalk/redux-oidc';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

import type { RootState } from '../';
import { restApi } from '../../api/rest';
import { sendChatMessage } from '../../api/types/outgoing/chat';
import { lowerHand, raiseHand } from '../../api/types/outgoing/raiseHands';
import i18n from '../../i18n';
import { MeetingNotesAccess, Participant, ParticipantId, ParticipationKind, Role, WaitingState } from '../../types';
import { initSentryReportWithUser } from '../../utils/glitchtipUtils';
import { isFeatureEnabledPredicate } from '../../utils/moduleUtils';
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
  isTariffUpgradable?: boolean;
};

const initialState: UserState = {
  uuid: null,
  displayName: '',
  role: Role.User,
  participationKind: ParticipationKind.Registered,
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
    builder.addCase(joinSuccess, (state, { payload: { avatarUrl, role, participantId, isRoomOwner, tariff } }) => {
      state.role = role;
      state.avatarUrl = avatarUrl;
      state.uuid = participantId;
      state.joinedAt = new Date().toISOString();
      state.lastActive = state.joinedAt;
      state.isRoomOwner = isRoomOwner;
      state.isTariffUpgradable = isFeatureEnabledPredicate('storage_upgradable', tariff.modules);
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
    builder.addCase(changeMedia.fulfilled, (state) => {
      state.lastActive = new Date().toISOString();
    });
    builder.addCase(setScreenShareEnabled.fulfilled, (state) => {
      state.lastActive = new Date().toISOString();
    });
  },
});

export const actions = userSlice.actions;
export const { updateRole, setDisplayName, updateLastActive } = actions;

const userState = (state: RootState) => state.user;

export const selectOurUuid = createSelector([userState], (state) => state.uuid);
export const selectDisplayName = createSelector([userState], (state) => state.displayName);
export const selectAvatarUrl = createSelector([userState], (state) => state.avatarUrl);
export const selectUserMeetingNotesAccess = createSelector([userState], (state) => state.meetingNotesAccess);
export const selectIsModerator = createSelector([userState], (state) => state.role === Role.Moderator);
export const selectIsGuest = createSelector(
  [userState],
  (state) => state.participationKind === ParticipationKind.Guest
);
export const selectRole = createSelector([userState], (state) => state.role);

export const selectUserAsPartialParticipant = createSelector(
  [userState],
  (state): Omit<Participant, 'breakoutRoomId' | 'handIsUp' | 'handUpdatedAt'> | undefined => {
    const { displayName, avatarUrl, joinedAt, lastActive, isRoomOwner, role } = state;

    if (state.uuid === null || joinedAt === undefined || lastActive === undefined) {
      return undefined;
    }

    const participationKind =
      state.role === Role.User || state.role === Role.Moderator
        ? ParticipationKind.Registered
        : ParticipationKind.Guest;

    return {
      id: state.uuid,
      connections: [],
      displayName,
      avatarUrl,
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
