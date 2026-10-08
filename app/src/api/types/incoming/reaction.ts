// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';
import { ReactionEmoji } from '../../../types/reaction';

type Reacted = {
  message: 'reacted';
  participantId: ParticipantId;
  reaction: ReactionEmoji;
};

type RestrictionsEnabled = {
  message: 'restrictions_enabled';
  unrestrictedParticipants: ParticipantId[];
};

type RestrictionsDisabled = {
  message: 'restrictions_disabled';
};

enum ReactionError {
  InsufficientPermissions = 'insufficient_permissions',
  Restricted = 'restricted',
}

export type Message = Reacted | RestrictionsEnabled | RestrictionsDisabled | ErrorStruct<ReactionError>;

type Reaction = NamespacedIncoming<Message, 'reaction'>;

export default Reaction;
