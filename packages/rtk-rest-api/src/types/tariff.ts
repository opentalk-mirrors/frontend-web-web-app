// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
import { Opaque } from 'type-fest';

// SPDX-License-Identifier: EUPL-1.2
export enum BackendModules {
  Automod = 'automod',
  Breakout = 'breakout',
  Chat = 'chat',
  Core = 'core',
  Echo = 'echo',
  Integration = 'integration',
  LegalVote = 'legal_vote',
  Media = 'media',
  Moderation = 'moderation',
  Polls = 'polls',
  MeetingNotes = 'meeting_notes',
  Recording = 'recording',
  RecordingService = 'recording_service',
  Timer = 'timer',
  Whiteboard = 'whiteboard',
  SubroomAudio = 'subroomAudio',
}

export type Modules = {
  [value in BackendModules]?: { features: Array<string> };
};

/**
 * Union type that contains features from modules. Has to be manually extended for each feature.
 */
export type BackendFeatures = 'stream';

export type TariffId = Opaque<string, 'tariffId'>;

export interface Tariff {
  id: TariffId;
  name: string;
  quotas: Record<string, number>;
  /** @deprecated use modules instead */
  enabledModules: Array<BackendModules>;
  modules: Modules;
}
