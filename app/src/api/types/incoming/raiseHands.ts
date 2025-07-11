// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';

export interface RaiseHandsEnabled {
  message: 'raise_hands_enabled';
  issuedBy: ParticipantId;
}

export interface RaiseHandsDisabled {
  message: 'raise_hands_disabled';
  issuedBy: ParticipantId;
}

export interface HandRaised {
  message: 'hand_raised';
  participant: ParticipantId;
}

export interface HandLowered {
  message: 'hand_lowered';
  participant: ParticipantId;
}

export interface RaisedHandResetByModerator {
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

export type RaiseHands = NamespacedIncoming<Message, 'raise_hands'>;

export default RaiseHands;
