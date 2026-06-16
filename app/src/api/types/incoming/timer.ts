// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming, ParticipantId, TimerStarted, TimerStopped } from '../../../types';

/* MODERATOR ONLY */

// Signals to moderator that a participant is ready to continue
export interface ReadyToContinue {
  message: 'updated_ready_status';
  status: boolean;
  participantId: ParticipantId;
}

export type Message = TimerStarted | TimerStopped | ReadyToContinue;

export type Timer = NamespacedIncoming<Message, 'timer'>;

export default Timer;
