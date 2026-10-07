// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId, AutomodStartConfig } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

export interface AutomodStartedEvent extends AutomodStartConfig {
  message: 'started';
}

type AutomodStoppedEvent = ({ message: 'stopped' } & StoppedByModerator) | ({ message: 'stopped' } & SessionFinished);

interface StoppedByModerator {
  reason: 'stopped_by_moderator';
  issuedBy: ParticipantId;
}

interface SessionFinished {
  reason: 'session_finished';
}

interface AutomodStartAnimationEvent {
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

enum AutomodError {
  InvalidSelection = 'invalid_selection',
  InsufficientPermissions = 'insufficient_permissions',
  SessionAlreadyRunning = 'session_already_running',
  SessionNotRunning = 'session_not_running',
  InvalidEdit = 'invalid_edit',
  Internal = 'internal',
}

isEnumErrorStruct(AutomodError);

export type AutomodEventType =
  | AutomodStartedEvent
  | AutomodStoppedEvent
  | AutomodSpeakerUpdatedEvent
  | AutomodRemainingUpdatedEvent
  | AutomodStartAnimationEvent
  | ErrorStruct<AutomodError>;
type AutomodEvent = NamespacedIncoming<AutomodEventType, 'automod'>;

export default AutomodEvent;
