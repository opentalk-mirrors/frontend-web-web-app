// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionId, ErrorStruct, NamespacedIncoming } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

interface WriteAccessReceived {
  message: 'write_access_received';
  url: URL;
}

interface ReadAccessReceived {
  message: 'read_access_received';
  url: URL;
}

interface PdfCreated {
  message: 'pdf_created';
  filename: string;
  assetId: string;
}

/// Event sent to moderators when the readers or writers of the notes changed
interface AccessChanged {
  message: 'access_changed';
  readers: ConnectionId[];
  writers: ConnectionId[];
}

export enum MeetingNotesError {
  /// The requesting user has insufficient permissions for the operation
  InsufficientPermissions = 'insufficient_permissions',
  /// The request contains invalid participant ids
  InvalidParticipantSelection = 'invalid_participant_selection',
  /// Is send when another instance just started initializing and etherpad is not available yet
  CurrentlyInitializing = 'currently_initializing',
  /// The etherpad initialization failed
  FailedInitialization = 'failed_initialization',
  /// The etherpad is not yet initialized
  NotInitialized = 'not_initialized',
  /// The requesting user has exceeded their storage
  StorageExceeded = 'storage_exceeded',
  /// Internal error while saving the notes
  InternalStorage = 'internal_storage',
  /// Generating the etherpad URL failed
  FailedToGenerateUrl = 'failed_to_generate_url',
}

export const isError = isEnumErrorStruct(MeetingNotesError);

export type IncomingMeetingNotes =
  | WriteAccessReceived
  | ReadAccessReceived
  | PdfCreated
  | AccessChanged
  | ErrorStruct<MeetingNotesError>;
export type MeetingNotes = NamespacedIncoming<IncomingMeetingNotes, 'meeting_notes'>;

export default MeetingNotes;
