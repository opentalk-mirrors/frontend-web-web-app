// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RootState } from '../../../store';
import { createModule, Namespaced } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from '../../index';

export enum ParticipationLoggingState {
  /**
   * No participation logging is active.
   */
  Disabled = 'disabled',
  /**
   * Participation logging is enabled, either waiting for the initial timeout or the participant already confirmed the last checkpoint.
   */
  Enabled = 'enabled',
  /**
   * Participation logging is enabled, a checkpoint has already been passed and the newly joined participant can immediately confirm their presence.
   */
  WaitingForConfirmation = 'waiting_for_confirmation',
}

export interface ParticipationLogging {
  state: ParticipationLoggingState;
}

export interface TimeRange {
  /**
   * The earliest number of seconds after which the checkpoint can be created. Must be a strictly positive number.
   */
  after: number;
  /**
   * The number of seconds within which the checkpoint can be created after the after value. Must be 0 or greater.
   */
  within: number;
}

export interface EnablePresenceLogging {
  action: 'enable_presence_logging';
  /**
   * default: { "after": 600, "within": 1200 }
   */
  initialCheckpointDelay?: TimeRange;
  /**
   * default: { "after": 6300, "within": 1800 }
   */
  checkpointInterval?: TimeRange;
}

export interface DisablePresenceLogging {
  action: 'disable_presence_logging';
}

export interface ConfirmPresence {
  action: 'confirm_presence';
}

export type Action = EnablePresenceLogging | DisablePresenceLogging | ConfirmPresence;

export type TrainingParticipationReport = Namespaced<Action, 'training_participantion_report'>;

export const enablePresenceLogging = createSignalingApiCall<EnablePresenceLogging>(
  'training_participation_report',
  'enable_presence_logging'
);
export const disablePresenceLogging = createSignalingApiCall<DisablePresenceLogging>(
  'training_participation_report',
  'disable_presence_logging'
);
export const confirmPresence = createSignalingApiCall<ConfirmPresence>(
  'training_participation_report',
  'confirm_presence'
);

export const handler = createModule<RootState>((builder) => {
  builder.addCase(enablePresenceLogging.action, (_state, { payload }) => {
    sendMessage(enablePresenceLogging(payload));
  });
  builder.addCase(disablePresenceLogging.action, (_state, { payload }) => {
    sendMessage(disablePresenceLogging(payload));
  });
  builder.addCase(confirmPresence.action, (_state, { payload }) => {
    sendMessage(confirmPresence(payload));
  });
});

export default TrainingParticipationReport;
