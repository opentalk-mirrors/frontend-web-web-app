// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from './common';

export type WhisperId = string & { readonly __tag: unique symbol };

export interface WhisperParticipant {
  participantId: ParticipantId;
  state: WhisperParticipantState;
}

export enum WhisperParticipantState {
  Creator = 'creator',
  Invited = 'invited',
  Accepted = 'accepted',
}
