// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';
import { ReactionEmoji } from '../../../types/reaction';

export type Reacted = {
  message: 'reacted';
  participantId: ParticipantId;
  reaction: ReactionEmoji;
};

export type RestrictionsEnabled = {
  message: 'restrictions_enabled';
  unrestrictedParticipants: ParticipantId[];
};

export type RestrictionsDisabled = {
  message: 'restrictions_disabled';
};

export enum ReactionError {
  InsufficientPermissions = 'insufficient_permissions',
  Restricted = 'restricted',
}

export type Message = Reacted | RestrictionsEnabled | RestrictionsDisabled | ErrorStruct<ReactionError>;

export type Reaction = NamespacedIncoming<Message, 'reaction'>;

export default Reaction;
