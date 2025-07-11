// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId, Timestamp } from '../common';
import { TimerKind, TimerStopKind, TimerStyle } from '../timer';

export interface TimerStarted {
  message: 'started';
  readyCheckEnabled: boolean;
  endsAt?: Timestamp;
  title?: string;
  startedAt: Timestamp;
  kind?: TimerKind;
  style?: TimerStyle;
}

export interface TimerStopped {
  message: 'stopped';
  kind: TimerStopKind;
  /**
   * When kind === by_moderator
   * The participant id of the moderator that stopped the timer
   */
  participantId?: ParticipantId;
  /**
   * When kind === by_moderator
   * Optional reason. Set by the moderator
   */
  reason?: string;
}
