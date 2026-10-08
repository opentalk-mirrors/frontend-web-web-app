// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { TranscriptionLanguageKey } from '../incoming/transcription';
import { sendMessage } from './common';

export interface StartTranscription {
  action: 'start';
  language?: string;
}

export interface StopTranscription {
  action: 'stop';
}

export interface ChangeTranscriptionLanguage {
  action: 'change_language';
  language: TranscriptionLanguageKey;
}

interface TranscriptionStarted {
  kind: 'started';
}

interface TranscriptionStopped {
  kind: 'stopped';
}

interface TranscriptionSegment {
  kind: 'segment';
  participantId: string;
  trackId: string;
  startsAt: string;
  endsAt: string;
  text: string;
}

type TranscriptionEvent = TranscriptionStarted | TranscriptionStopped | TranscriptionSegment;

export interface SendTranscriptionEvent {
  action: 'transcription_service_event';
  event: TranscriptionEvent;
}

export type Action = StartTranscription | StopTranscription | SendTranscriptionEvent | ChangeTranscriptionLanguage;

type Transcription = Namespaced<Action, 'transcription'>;

export const sendStartTranscriptionSignal = createSignalingApiCall<StartTranscription>('transcription', 'start');
export const sendStopTranscriptionSignal = createSignalingApiCall<StopTranscription>('transcription', 'stop');
const sendTranscriptionEventSignal = createSignalingApiCall<SendTranscriptionEvent>(
  'transcription',
  'transcription_service_event'
);
export const changeTranscriptionLanguageSignal = createSignalingApiCall<ChangeTranscriptionLanguage>(
  'transcription',
  'change_language'
);

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(sendStartTranscriptionSignal.action, (_state, action) => {
      sendMessage(sendStartTranscriptionSignal(action.payload));
    })
    .addCase(sendStopTranscriptionSignal.action, (_state, action) => {
      sendMessage(sendStopTranscriptionSignal(action.payload));
    })
    .addCase(sendTranscriptionEventSignal.action, (_state, action) => {
      sendMessage(sendTranscriptionEventSignal(action.payload));
    })
    .addCase(changeTranscriptionLanguageSignal.action, (_state, action) => {
      sendMessage(changeTranscriptionLanguageSignal(action.payload));
    });
});

export default Transcription;
