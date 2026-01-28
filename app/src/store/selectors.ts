// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector } from '@reduxjs/toolkit';
import i18next, { t } from 'i18next';
import { intersection } from 'lodash';

import {
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
  Role,
  SortOption,
  WaitingState,
} from '../types';
import { moveItemToTopOfArray } from '../utils/arrayUtils';
import { mergeAndSortMessagesEndEvents } from '../utils/eventUtils';
import { sortParticipantsWithConfig } from '../utils/sortParticipants';
import { selectAutomoderationParticipantIds } from './slices/automodSlice';
import { selectCurrentBreakoutRoom, selectCurrentBreakoutRoomId } from './slices/breakoutSlice';
import {
  globalMessagesSelectors,
  groupMessagesSelectors,
  privateMessagesSelectors,
  breakoutMessagesSelectors,
  selectAllGroupChats,
  selectAllPrivateChats,
  selectChatState,
} from './slices/chatSlice';
import { selectAllEvents } from './slices/eventSlice';
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
import {
  selectChatConversationScope,
  selectChatConversationTargetId,
  selectParticipantsSearchValue,
  selectParticipantsSortOption,
} from './slices/uiSlice';
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

export const selectCombinedParticipantsAndUserInConference = createSelector(
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

export const selectParticipantsWithoutGuestAndSip = createSelector(
  [selectCombinedParticipantsAndUser],
  (participants) =>
    participants.filter(
      (participant) =>
        !(
          participant.participationKind.match(ParticipationKind.Guest) ||
          participant.participationKind.match(ParticipationKind.CallIn)
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
        (participant) =>
          participant.participationKind !== ParticipationKind.Guest &&
          participant.participationKind !== ParticipationKind.CallIn
      );
      const newParticipants = allMeetingNotesParticipants.map((participant): MeetingNotesParticipant => {
        const isSelected = participant.meetingNotesAccess === MeetingNotesAccess.Write;

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
  [
    selectCombinedParticipantsAndUser,
    selectParticipantsSortOption,
    selectParticipantsSearchValue,
    selectUserAsParticipant,
  ],
  (participants, sortOption, searchValue, self) => {
    let sortedAndFilteredParticipants = sortAndFilterParticipants(participants, sortOption, searchValue);
    if (self && sortedAndFilteredParticipants.includes(self)) {
      sortedAndFilteredParticipants = moveItemToTopOfArray(
        self,
        sortedAndFilteredParticipants,
        (participant) => participant.id === self.id
      );
    }
    return sortedAndFilteredParticipants;
  }
);

export const selectChatMessagesByScope = createSelector(
  [selectChatState, selectChatConversationScope, selectChatConversationTargetId],
  (chatState, scope, targetId) => {
    if (scope === ChatScope.Global) {
      return globalMessagesSelectors.selectAll(chatState.scope.global.messages);
    }
    if (scope === ChatScope.Private && targetId) {
      const privateChat = chatState.scope.private[targetId as ParticipantId];
      return privateChat ? privateMessagesSelectors.selectAll(privateChat.messages) : [];
    }
    if (scope === ChatScope.Group && targetId) {
      const groupChat = chatState.scope.group[targetId as GroupId];
      return groupChat ? groupMessagesSelectors.selectAll(groupChat.messages) : [];
    }
    if (scope === ChatScope.Breakout && targetId !== undefined) {
      return breakoutMessagesSelectors.selectAll(chatState.scope.breakout.messages);
    }

    return [];
  }
);

const selectScopedEvents = createSelector([selectChatConversationScope, selectAllEvents], (scope, events) =>
  scope === ChatScope.Global ? events : []
);

export const selectCombinedMessageAndEvents = createSelector(
  [selectScopedEvents, selectChatMessagesByScope, selectChatConversationScope],
  (events, messages, scope) => {
    if (scope === ChatScope.Global) {
      return mergeAndSortMessagesEndEvents(messages, events);
    }
    return messages;
  }
);

export const selectNextIndex = createSelector(
  [selectChatState, selectChatConversationScope, selectChatConversationTargetId],
  (chatState, chatScope, conversationTargetId) => {
    if (chatScope === ChatScope.Global) {
      return chatState.scope.global.nextIndex;
    }
    if (chatScope === ChatScope.Private && conversationTargetId) {
      return chatState.scope.private[conversationTargetId as ParticipantId]?.nextIndex;
    }
    if (chatScope === ChatScope.Group && conversationTargetId) {
      return chatState.scope.group[conversationTargetId as GroupId]?.nextIndex;
    }
    return null;
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
    return (
      (record.role === Role.User || record.participationKind === ParticipationKind.Registered) &&
      record.participationKind !== ParticipationKind.Guest
    );
  });
});

export const selectTalkingStickParticipants = createSelector(
  [selectCombinedParticipantsAndUserInConference, selectAutomoderationParticipantIds],
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

export const selectPollsAndVotingCount = createSelector([selectAllVotes, selectAllPolls], (voting, polls) => {
  return voting.length + polls.length;
});

export const selectActivePollsAndVotingCount = createSelector([selectAllVotes, selectAllPolls], (voting, polls) => {
  return (
    voting.filter((voting) => voting.state === LegalVoteState.Started).length +
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

export const selectOtherParticipants = createSelector([selectAllParticipants, selectOurUuid], (participants, ourUuid) =>
  participants.filter((participant) => participant.id !== ourUuid)
);

export const selectOtherOnlineParticipants = createSelector([selectOtherParticipants], (participants) =>
  participants.filter((participant) => participant.leftAt === null && participant.waitingState === WaitingState.Joined)
);

export const selectOtherOnlineParticipantsInBreakoutRoom = createSelector(
  [selectOtherOnlineParticipants, selectCurrentBreakoutRoomId],
  (participants, breakoutRoomId) => participants.filter((participant) => participant.breakoutRoomId === breakoutRoomId)
);

export const selectOtherOnlineParticipantsInBreakoutRoomCount = createSelector(
  [selectOtherOnlineParticipantsInBreakoutRoom],
  (participants) => participants.length
);

export const selectMenuTabPeopleCount = createSelector(
  [selectOtherOnlineParticipantsInBreakoutRoomCount],
  (count) => count + 1 // +1 for the user themselves
);

export const selectPeopleTabParticipants = createSelector(
  [
    selectOtherOnlineParticipantsInBreakoutRoom,
    selectUserAsParticipant,
    selectParticipantsSortOption,
    selectParticipantsSearchValue,
  ],
  (participants, user, sortOption, searchValue) => {
    const allParticipants = user ? [user, ...participants] : participants;
    return sortAndFilterParticipants(allParticipants, sortOption, searchValue);
  }
);
