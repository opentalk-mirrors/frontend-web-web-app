// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

interface IncomingMeetingNotesSuccess {
  message: 'write_url' | 'read_url';
  url: URL;
}

interface IncomingPdfAsset {
  message: 'pdf_asset';
  filename: string;
  assetId: string;
}

export enum MeetingNotesError {
  InsufficientPermissions = 'insufficient_permissions',
  CurrentlyInitializing = 'currently_initializing',
  FailedInitialization = 'failed_initialization',
  NotInitialized = 'not_initialized',
  StorageExceeded = 'storage_exceeded',
}

export const isError = isEnumErrorStruct(MeetingNotesError);

export type IncomingMeetingNotes = IncomingMeetingNotesSuccess | IncomingPdfAsset | ErrorStruct<MeetingNotesError>;
export type MeetingNotes = NamespacedIncoming<IncomingMeetingNotes, 'meeting_notes'>;

export default MeetingNotes;
