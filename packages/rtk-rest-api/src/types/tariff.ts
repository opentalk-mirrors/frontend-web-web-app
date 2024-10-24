// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Opaque } from 'type-fest';

/**
 * Modules included in the tariff. Same for Rest API request as well as signaling (join_success) tariff.
 *
 * Incoming keys are transformed to camelCase - values here have to be spelled in camelCase to match.
 */
export enum BackendModules {
  Automod = 'automod',
  Breakout = 'breakout',
  Chat = 'chat',
  Core = 'core',
  Echo = 'echo',
  Integration = 'integration',
  LegalVote = 'legalVote',
  Media = 'media',
  Moderation = 'moderation',
  Polls = 'polls',
  MeetingNotes = 'meetingNotes',
  /**
   * Special case, since currently it is a basically useless module without a feature inside
   */
  Recording = 'recording',
  RecordingService = 'recordingService',
  Timer = 'timer',
  Whiteboard = 'whiteboard',
  SubroomAudio = 'subroomAudio',
}

/**
 * Presence of a module (even with an empty features list) means it is enabled.
 */
export type Modules = {
  [value in BackendModules]?: { features: Array<string> };
};

export type RecordingFeatures = 'stream' | 'record';
/**
 * Union type that contains features from different modules. Has to be manually extended.
 */
export type BackendFeatures = RecordingFeatures;

export type TariffId = Opaque<string, 'tariffId'>;

export interface Tariff {
  id: TariffId;
  name: string;
  quotas: Record<string, number>;
  modules: Modules;
}
