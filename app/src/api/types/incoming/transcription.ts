// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ErrorStruct, NamespacedIncoming, ParticipantId, Timestamp } from '../../../types';

export enum TranscriptionStatus {
  Inactive = 'inactive',
  Requested = 'requested',
  Running = 'running',
}

interface TranscriptionStateUpdated {
  message: 'state_updated';
  status: TranscriptionStatus;
  language: TranscriptionLanguageKey;
}

export interface TranscriptionSegment {
  message: 'segment';
  participantId: ParticipantId;
  trackId: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  text: string;
}

export enum TranscriptionError {
  ServiceRequestFailed = 'service_request_failed',
  FeatureDisabled = 'feature_disabled',
  InsufficientPermissions = 'insufficient_permissions',
  AlreadyActive = 'already_active',
  NotActive = 'not_active',
  ServiceDisconnected = 'service_disconnected',
}

type TranscriptionCommand = { kind: 'stop' };

interface TranscriptionServiceCommand {
  message: 'service_command';
  command: TranscriptionCommand;
}

export type TranscriptionMessage =
  TranscriptionStateUpdated | TranscriptionSegment | TranscriptionServiceCommand | ErrorStruct<TranscriptionError>;

type Transcription = NamespacedIncoming<TranscriptionMessage, 'transcription'>;

export default Transcription;

export enum TranscriptionLanguage {
  de = 'Deutsch',
  en = 'English',
}

export type TranscriptionLanguageKey = keyof typeof TranscriptionLanguage;
