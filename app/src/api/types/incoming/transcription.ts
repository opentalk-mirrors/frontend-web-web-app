// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { AssetId } from '@opentalk/rest-api-rtk-query';

import type { ErrorStruct, NamespacedIncoming, ParticipantId, Timestamp } from '../../../types';

export enum TranscriptionStatus {
  Inactive = 'inactive',
  Requested = 'requested',
  Running = 'running',
}

interface TranscriptionStateUpdated {
  message: 'state_updated';
  status: TranscriptionStatus;
  language?: TranscriptionLanguageKey;
}

export interface TranscriptionSegment {
  message: 'segment';
  participantId: ParticipantId;
  trackId: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  text: string;
}

export interface AutomaticMeetingProtocolMode {
  pseudonymous: boolean;
  paused: boolean;
}

export interface TranscriptionModes {
  liveTranscription: boolean;
  automaticMeetingProtocol?: AutomaticMeetingProtocolMode;
}

interface TranscriptionModesUpdated extends TranscriptionModes {
  message: 'modes_updated';
}

interface TranscriptionPdfCreated {
  message: 'pdf_created';
  filename: string;
  assetId: AssetId;
  quota: { total?: number; used: number };
}

interface AutomaticMeetingProtocolConsentUpdated {
  message: 'automatic_meeting_protocol_consent_updated';
  participant: ParticipantId;
  consents: boolean;
}

export enum TranscriptionError {
  ServiceRequestFailed = 'service_request_failed',
  FeatureDisabled = 'feature_disabled',
  InsufficientPermissions = 'insufficient_permissions',
  AlreadyActive = 'already_active',
  NotActive = 'not_active',
  ServiceDisconnected = 'service_disconnected',
  GenerateAutomaticMeetingProtocol = 'generate_automatic_meeting_protocol',
}

export type TranscriptionMessage =
  | TranscriptionStateUpdated
  | TranscriptionModesUpdated
  | TranscriptionSegment
  | TranscriptionPdfCreated
  | AutomaticMeetingProtocolConsentUpdated
  | ErrorStruct<TranscriptionError>;

type Transcription = NamespacedIncoming<TranscriptionMessage, 'transcription'>;

export default Transcription;

export enum TranscriptionLanguage {
  de = 'Deutsch',
  en = 'English',
}

export type TranscriptionLanguageKey = keyof typeof TranscriptionLanguage;
