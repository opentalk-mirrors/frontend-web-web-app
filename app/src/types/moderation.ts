// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from './common';

export enum KickReason {
  Kicked = 'kicked',
  Debriefed = 'debriefed',
}

type InitialDisplayNameChangeRestrictionsEnabled = {
  type: 'enabled';
  unrestrictedParticipants: ParticipantId[];
};

type InitialDisplayNameChangeRestrictionsDisabled = {
  type: 'disabled';
};

export type InitialDisplayNameChangeRestrictions =
  | InitialDisplayNameChangeRestrictionsEnabled
  | InitialDisplayNameChangeRestrictionsDisabled;
