// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId, Timestamp } from './common';

export enum ReactionEmoji {
  ThumbsUp = 'thumbs_up',
  ThumbsDown = 'thumbs_down',
  Heart = 'heart',
  Joy = 'joy',
  SmilingFaceWithTear = 'smiling_face_with_tear',
  OpenMouth = 'open_mouth',
  Tada = 'tada',
  Clap = 'clap',
}

export const REACTION_EMOJI_DISPLAY: Record<ReactionEmoji, string> = {
  [ReactionEmoji.ThumbsUp]: '👍',
  [ReactionEmoji.Clap]: '👏',
  [ReactionEmoji.Heart]: '❤️',
  [ReactionEmoji.Tada]: '🎉',
  [ReactionEmoji.OpenMouth]: '😮',
  [ReactionEmoji.Joy]: '😂',
  [ReactionEmoji.SmilingFaceWithTear]: '🥲',
  [ReactionEmoji.ThumbsDown]: '👎',
};

/**
 * JoinSuccess state of the Reaction SingalingModule.
 */
export interface ReactionJoinSuccess {
  restrictions: ReactionRestriction;
}

type ReactionRestrictionEnabled = {
  type: 'enabled';
  unrestrictedParticipants: ParticipantId[];
};

type ReactionRestrictionDisabled = {
  type: 'disabled';
};

export type ReactionRestriction = ReactionRestrictionEnabled | ReactionRestrictionDisabled;

export type ActiveReaction = {
  timestamp: Timestamp;
  reaction: ReactionEmoji;
  participantId: ParticipantId;
};
