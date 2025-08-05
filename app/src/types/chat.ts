// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GroupId, ParticipantId, TargetId, Timestamp } from './common';

export enum ChatScope {
  Global = 'global',
  Private = 'private',
  Group = 'group',
}

type GlobalChatMessage = {
  scope: ChatScope.Global;
  target?: never;
  group?: never;
};

type PrivateChatMessage = {
  scope: ChatScope.Private;
  target: ParticipantId;
};

type GroupChatMessage = {
  scope: ChatScope.Group;
  target: GroupId;
};

export type ChatMessage = {
  id: string;
  timestamp: string;
  source: ParticipantId;
  content: string;
} & (GlobalChatMessage | PrivateChatMessage | GroupChatMessage);

export interface ChatMessageBase {
  id: string;
  source: ParticipantId;
  content: string;
}

export interface BaseMessageWithTimestamp extends ChatMessageBase {
  timestamp: Timestamp;
}

export interface ChatBase extends ChatMessageBase {
  scope: ChatScope;
  target?: TargetId;
}

export type ChatMessageWithTimestamp = ChatBase & BaseMessageWithTimestamp;

export interface InitialChat {
  enabled: boolean;
  lastSeenTimestampGlobal?: string;
  lastSeenTimestampsGroup?: Record<string, string>;
  lastSeenTimestampsPrivate?: Record<string, string>;
  groups: Array<GroupId>;
  groupsHistory: Array<GroupsHistory>;
  privateHistory: Array<PrivateHistory>;
  roomHistory: ChatHistory;
}

export type GroupsHistory = {
  history: ChatHistory;
  id: string;
  name: GroupId;
};

export interface PrivateHistory {
  correspondent: ParticipantId;
  history: ChatHistory;
}

export interface ChatHistory {
  messages: Array<ChatMessage>;
  nextIndex: number | null;
}
