// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';

interface RaiseHandsEnabled {
  message: 'raise_hands_enabled';
  issuedBy: ParticipantId;
}

interface RaiseHandsDisabled {
  message: 'raise_hands_disabled';
  issuedBy: ParticipantId;
}

interface HandRaised {
  message: 'hand_raised';
  participant: ParticipantId;
}

interface HandLowered {
  message: 'hand_lowered';
  participant: ParticipantId;
}

interface RaisedHandResetByModerator {
  message: 'raised_hand_reset_by_moderator';
  issuedBy: ParticipantId;
  participants: ParticipantId[];
}

export enum RaiseHandsError {
  InsufficientPermissions = 'insufficient_permissions',
  UnknownParticipant = 'unknown_participant',
  RaiseHandsDisabled = 'raise_hands_disabled',
}

export type Message =
  | RaiseHandsEnabled
  | RaiseHandsDisabled
  | HandRaised
  | HandLowered
  | RaisedHandResetByModerator
  | ErrorStruct<RaiseHandsError>;

type RaiseHands = NamespacedIncoming<Message, 'raise_hands'>;

export default RaiseHands;
