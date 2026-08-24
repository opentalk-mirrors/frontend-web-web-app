// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId, TimerStarted, TimerStopped } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

/* MODERATOR ONLY */

// Signals to moderator that a participant is ready to continue
export interface ReadyToContinue {
  message: 'updated_ready_status';
  status: boolean;
  participantId: ParticipantId;
}

export enum TimerError {
  InvalidDuration = 'invalid_duration',
  InsufficientPermissions = 'insufficient_permissions',
  TimerAlreadyRunning = 'timer_already_running',
  Internal = 'internal',
  TimerNotRunning = 'timer_not_running',
  ReadyCheckNotEnabled = 'ready_check_not_enabled',
}

export const isError = isEnumErrorStruct(TimerError);

export type Message = TimerStarted | TimerStopped | ReadyToContinue | ErrorStruct<TimerError>;

export type Timer = NamespacedIncoming<Message, 'timer'>;

export default Timer;
