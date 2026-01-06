// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector } from '@reduxjs/toolkit';
import i18next, { t } from 'i18next';
import _, { intersection } from 'lodash';
import { some } from 'lodash';

import type { RootState } from '.';
import {
  ChatMessage as ChatMessageType,
  ChatScope,
  FilterableParticipant,
  ForceMuteType,
  GroupId,
  LegalVoteState,
  MeetingNotesAccess,
  MeetingNotesParticipant,
  Participant,
  ParticipantId,
  ParticipationKind,
  SortOption,
  TargetId,
} from '../types';
import { sortParticipantsWithConfig } from '../utils/sortParticipants';
import { selectAutomoderationParticipantIds } from './slices/automodSlice';
import { selectCurrentBreakoutRoom, selectCurrentBreakoutRoomId } from './slices/breakoutSlice';
import {
  globalMessagesSelectors,
  groupMessagesSelectors,
  privateMessagesSelectors,
  selectAllGroupChats,
  selectAllPrivateChats,
} from './slices/chatSlice';
import { RoomEvent, selectAllEvents } from './slices/eventSlice';
import { selectAllVotes } from './slices/legalVoteSlice';
import { selectForceMute, selectHandUp, selectHandUpdatedAt } from './slices/moderationSlice';
import {
  selectAllOnlineParticipants,
  selectAllOnlineParticipantsInConference,
  selectAllParticipants,
} from './slices/participantsSlice';
import { selectAllPolls } from './slices/pollSlice';
import { selectEventInfo } from './slices/roomSlice';
import { selectParticipantsReady } from './slices/timerSlice';
import { selectParticipantsSearchValue, selectParticipantsSortOption } from './slices/uiSlice';
import { selectGroups, selectOurUuid, selectUserAsPartialParticipant } from './slices/userSlice';

export const selectUserAsParticipant = createSelector(
  [selectUserAsPartialParticipant, selectCurrentBreakoutRoomId, selectHandUp, selectHandUpdatedAt],
  (partialParticipant, breakoutRoomId, handIsUp, handUpdatedAt): Participant | undefined => {
    if (partialParticipant === undefined) {
      return undefined;
    }

    return {
      ...partialParticipant,
      handIsUp,
      handUpdatedAt,
      breakoutRoomId,
    };
  }
);

export const selectCombinedParticipantsAndUserInCoference = createSelector(
  [selectAllOnlineParticipantsInConference, selectUserAsParticipant],
  (participants, user) => (user ? [...participants, user] : participants)
);

export const selectCombinedUserAndParticipants = createSelector(
  [selectAllOnlineParticipants, selectUserAsParticipant],
  (participants, user) => (user ? [user, ...participants] : participants)
);

export const selectCombinedParticipantsAndUser = createSelector(
  [selectAllOnlineParticipants, selectUserAsParticipant],
  (participants, user) => (user ? [...participants, user] : participants)
);

export const selectParticipantsWithourGuestAndSip = createSelector(
  [selectCombinedParticipantsAndUser],
  (participants) =>
    participants.filter(
      (participant) =>
        !(
          participant.participationKind.match(ParticipationKind.Guest) ||
          participant.participationKind.match(ParticipationKind.Sip)
        )
    )
);

export const selectJoinedFirstTimestamp = createSelector(
  [selectAllParticipants, selectUserAsParticipant],
  (participants, user) =>
    (user ? [...participants, user] : participants)
      .map((participant) => participant.joinedAt)
      .sort((a, b) => a.localeCompare(b))[0]
);

export const selectCombinedParticipantsAndUserCount = createSelector(
  [selectCombinedParticipantsAndUser],
  (users) => users.length
);

export const selectAllMeetingNotesParticipants = createSelector(
  [selectCombinedParticipantsAndUser, selectUserAsParticipant],
  (participants, user) => {
    if (user) {
      const allMeetingNotesParticipants = participants.filter(
        (participant) => participant.participationKind !== ParticipationKind.Sip
      );
      const hasSelectedParticipants = some(allMeetingNotesParticipants, [
        'meetingNotesAccess',
        MeetingNotesAccess.Write,
      ]);
      const newParticipants = allMeetingNotesParticipants.map((participant): MeetingNotesParticipant => {
        const isSelected = hasSelectedParticipants
          ? participant.meetingNotesAccess === MeetingNotesAccess.Write
          : participant.id === user.id;
        return {
          id: participant.id,
          displayName: participant.displayName,
          avatarUrl: participant.avatarUrl,
          isSelected,
        };
      });
      return newParticipants;
    }
    return [];
  }
);

export const selectAllGroupParticipants = createSelector(
  [selectCombinedParticipantsAndUser, selectGroups],
  (participants, groups) => {
    const NO_GROUP_ID = t('no-group-participants-label') as GroupId;
    const groupDictionary = new Map<GroupId, Array<Participant>>();

    groupDictionary.set(NO_GROUP_ID, []);
    groups.forEach((group) => {
      groupDictionary.set(group, []);
    });

    participants.forEach((participant) => {
      const groups = participant.groups;
      if (intersection(groups, [...groupDictionary.keys()]).length === 0) {
        groupDictionary.get(NO_GROUP_ID)?.push(participant);
        return;
      }

      groups.forEach((group) => {
        groupDictionary.get(group)?.push(participant);
      });
    });

    return groupDictionary;
  }
);

export const sortParticipants = sortParticipantsWithConfig({ language: i18next.language });

/**
 * @private
 */
const filterParticipants = <T extends FilterableParticipant>(participants: T[], searchValue: string) => {
  return participants.filter((participant) =>
    participant.displayName.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
  );
};

const sortAndFilterParticipants = (participants: Participant[], sortOption: SortOption, searchValue: string) => {
  return filterParticipants(sortParticipants(participants, sortOption), searchValue);
};

export const selectParticipantGroupsSortedAndFiltered = createSelector(
  [selectAllGroupParticipants, selectParticipantsSortOption, selectParticipantsSearchValue],
  (groups, sortOption, searchValue) => {
    const groupDictionary = new Map<GroupId, Array<Participant>>();
    groups.forEach((participants, groupId) => {
      const sortedAndFilteredParticipants = sortAndFilterParticipants(participants, sortOption, searchValue);
      groupDictionary.set(groupId, sortedAndFilteredParticipants);
    });
    return groupDictionary;
  }
);

export const selectAllParticipantsSortedAndFiltered = createSelector(
  [selectCombinedParticipantsAndUser, selectParticipantsSortOption, selectParticipantsSearchValue],
  (participants, sortOption, searchValue) => sortAndFilterParticipants(participants, sortOption, searchValue)
);

export const selectCombinedMessageAndEvents = createSelector(
  [
    (state: RootState) => state,
    (_state: RootState, scope: ChatScope) => scope,
    (_state: RootState, _scope: ChatScope, targetId?: TargetId) => targetId,
  ],
  (state, scope, targetId) => {
    let messages: Array<ChatMessageType | RoomEvent> = [];

    if (scope === ChatScope.Global) {
      messages = globalMessagesSelectors.selectAll(state.chat.scope.global.messages);

      const events = selectAllEvents(state);
      if (events.length > 0) {
        return _.sortBy([...messages, ...events], ['timestamp']);
      }

      return messages.length > 0 ? messages : [];
    }
    if (scope === ChatScope.Private && targetId) {
      const privateChat = state.chat.scope.private[targetId as ParticipantId];
      return privateChat ? privateMessagesSelectors.selectAll(privateChat.messages) : [];
    }
    if (scope === ChatScope.Group && targetId) {
      const groupChat = state.chat.scope.group[targetId as GroupId];
      return groupChat ? groupMessagesSelectors.selectAll(groupChat.messages) : [];
    }

    return [];
  }
);

export const selectParticipantsReadyList = createSelector(
  [selectAllOnlineParticipantsInConference, selectParticipantsReady],
  (selectCombinedParticipantsAndUser, participantsReady) =>
    selectCombinedParticipantsAndUser.map((participant) => ({
      isReady: participantsReady.includes(participant.id),
      ...participant,
    }))
);

export const selectParticipantsWithRaisedHands = createSelector(
  [selectAllOnlineParticipants],
  (participants): Participant[] => {
    return participants.filter((participant) => participant.handIsUp);
  }
);

export const selectVotingUsers = createSelector([selectCombinedParticipantsAndUser], (records) => {
  return records.filter((record) => {
    return record.role === 'user' || record.participationKind === 'user';
  });
});

export const selectTalkingStickParticipants = createSelector(
  [selectCombinedParticipantsAndUserInCoference, selectAutomoderationParticipantIds],
  (onlineParticipants, talkingStickIds): Participant[] => {
    const participantsInTalkingStick: Participant[] = [];

    talkingStickIds.forEach((participantId) => {
      const foundParticipant = onlineParticipants.find((participant) => participant.id === participantId);

      if (foundParticipant) {
        participantsInTalkingStick.push(foundParticipant);
      }
    });

    return participantsInTalkingStick;
  }
);

export const selectPollsAndVotingsCount = createSelector([selectAllVotes, selectAllPolls], (votings, polls) => {
  return votings.length + polls.length;
});

export const selectActivePollsAndVotingsCount = createSelector([selectAllVotes, selectAllPolls], (votings, polls) => {
  return (
    votings.filter((voting) => voting.state === LegalVoteState.Started).length +
    polls.filter((poll) => poll.state === 'active').length
  );
});

export const selectIsUserMicDisabled = createSelector([selectForceMute, selectOurUuid], (forceMute, userId) => {
  return (
    forceMute.type === ForceMuteType.Enabled &&
    (userId === null || !forceMute.unrestrictedParticipants.includes(userId))
  );
});

export const selectAllPersonalChats = createSelector(
  [selectAllGroupChats, selectAllPrivateChats],
  (groupChats, privateChats) =>
    groupChats
      .concat(privateChats)
      .sort((a, b) => Date.parse(b.lastMessage?.timestamp) - Date.parse(a.lastMessage?.timestamp))
);

export const selectRoomTitle = createSelector(
  [selectCurrentBreakoutRoom, selectEventInfo],
  (currentBreakoutRoom, eventInfo) => {
    if (currentBreakoutRoom) {
      return currentBreakoutRoom.name;
    }
    if (eventInfo) {
      return eventInfo.title;
    }
    return i18next.t('fallback-room-title') || '';
  }
);
