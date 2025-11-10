// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming, Timestamp } from '../../../types';

interface PresenceLoggingStarted {
  message: 'presence_logging_started';
  /**
   * RFC 3339 timestamp of when the first checkpoint starts. Only present in the message sent to the creator.
   */
  firstCheckpoint?: Timestamp;
  reason?: StartReason;
}

enum StartReason {
  //when the participation logging is configured to automatically start as soon as at least the creator and one other participant are present
  Autostart = 'autostart',
  //when the creator started presence logging while other participants were already present
  StartedManually = 'started_manually',
}

interface PresenceLoggingEnded {
  message: 'presence_logging_ended';
  reason: StopReason;
}

enum StopReason {
  StoppedManually = 'stopped_manually',
}

interface PresenceConfirmationRequested {
  message: 'presence_confirmation_requested';
}

interface PresenceConfirmationLogged {
  message: 'presence_confirmation_logged';
}

interface PdfCreated {
  message: 'pdf_created';
  filename: string;
  assetId: AssetId;
  remainingQuota?: number;
}

export enum TrainingParticipationReportError {
  //The sending client does not have the permission to perform the requested action.
  InsufficientPermissions = 'insufficient_permissions',
  //The creator attempted to enable presence logging when it was already enabled.
  PresenceLoggingAlreadyEnabled = 'presence_logging_already_enabled',
  //A frontend attempted to perform an action that requires enabled presence logging when it wasn't enabled.
  PresenceLoggingNotEnabled = 'presence_logging_not_enabled',
  //The message from fronted contained invalid parameter values or types.
  InvalidParameters = 'invalid_parameters',
  //A participant who shouldn't confirm the presence attempted to do so.
  PresenceLoggingNotAllowedForParticipant = 'presence_logging_not_allowed_for_participant',
  /// Storage exceeded
  StorageExceeded = 'storage_exceeded',
  /// Internal error while generating the report
  Generate = 'generate',
  /// An internal error occurred
  Internal = 'internal',
  //Insufficient storage to save participation report.
  Storage = 'storage',
}

export type Message =
  | PresenceLoggingStarted
  | PresenceLoggingEnded
  | PresenceConfirmationRequested
  | PresenceConfirmationLogged
  | PdfCreated
  | ErrorStruct<TrainingParticipationReportError>;
export type TrainingParticipationReport = NamespacedIncoming<Message, 'training_participation_report'>;

export default TrainingParticipationReport;
