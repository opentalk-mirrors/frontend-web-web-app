// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming } from '../../../types';

interface PresenceLoggingEnabled {
  message: 'presence_logging_enabled';
}

interface PresenceLoggingDisabled {
  message: 'presence_logging_disabled';
}

enum StartReason {
  //when the participation logging is configured to automatically start as soon as at least the creator and one other participant are present
  Autostart = 'autostart',
  //when the creator enabled presence logging while they were alone in the room, and now the first participant joined
  FirstParticipantJoined = 'first_participant_joined',
  //when the creator started presence logging while other participants were already present
  StartedManually = 'started_manually',
}

interface PresenceLoggingStarted {
  message: 'presence_logging_started';
  /**
   * RFC 3339 timestamp of when the first checkpoint starts. Only present in the message sent to the creator.
   */
  firstCheckpoint?: string;
  reason?: StartReason;
}

enum StopReason {
  LastParticipantLeft = 'last_participant_left',
  CreatorLeft = 'creator_left',
  StoppedManually = 'stopped_manually',
}

interface PresenceLoggingEnded {
  message: 'presence_logging_ended';
  reason: StopReason;
}

interface PresenceConfirmationRequested {
  message: 'presence_confirmation_requested';
}

interface PresenceConfirmationLogged {
  message: 'presence_confirmation_logged';
}

interface PdfAsset {
  message: 'pdf_asset';
  filename: string;
  assetId: AssetId;
}

enum TrainingParticipationReportError {
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
  //Insufficient storage to save participation report.
  Storage = 'storage',
}

export type Message =
  | PresenceLoggingEnabled
  | PresenceLoggingDisabled
  | PresenceLoggingStarted
  | PresenceLoggingEnded
  | PresenceConfirmationRequested
  | PresenceConfirmationLogged
  | PdfAsset
  | ErrorStruct<TrainingParticipationReportError>;
export type TrainingParticipationReport = NamespacedIncoming<Message, 'training_participation_report'>;

export default TrainingParticipationReport;
