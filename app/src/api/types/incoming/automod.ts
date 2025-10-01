// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId, AutomodStartConfig } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

export interface AutomodStartedEvent extends AutomodStartConfig {
  message: 'started';
}

export type AutomodStoppedEvent =
  | ({ message: 'stopped' } & StoppedByModerator)
  | ({ message: 'stopped' } & SessionFinished);

export interface StoppedByModerator {
  reason: 'stopped_by_moderator';
  issuedBy: ParticipantId;
}

export interface SessionFinished {
  reason: 'session_finished';
}

export interface AutomodStartAnimationEvent {
  message: 'start_animation';
  pool: Array<ParticipantId>;
  result: ParticipantId;
}

export interface AutomodSpeakerUpdatedEvent {
  message: 'speaker_updated';
  speaker?: ParticipantId;
  history?: Array<ParticipantId>;
  remaining?: Array<ParticipantId>;
}

export interface AutomodRemainingUpdatedEvent {
  message: 'remaining_updated';
  remaining: Array<ParticipantId>;
}

export enum AutomodError {
  InvalidSelection = 'invalid_selection',
  InsufficientPermissions = 'insufficient_permissions',
  SessionAlreadyRunning = 'session_already_running',
  SessionNotRunning = 'session_not_running',
  InvalidEdit = 'invalid_edit',
  Internal = 'internal',
}

export const isError = isEnumErrorStruct(AutomodError);

export type AutomodEventType =
  | AutomodStartedEvent
  | AutomodStoppedEvent
  | AutomodSpeakerUpdatedEvent
  | AutomodRemainingUpdatedEvent
  | AutomodStartAnimationEvent
  | ErrorStruct<AutomodError>;
export type AutomodEvent = NamespacedIncoming<AutomodEventType, 'automod'>;

export default AutomodEvent;
