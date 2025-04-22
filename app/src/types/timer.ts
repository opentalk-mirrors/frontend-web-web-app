// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Timestamp } from './common';

export enum TimerKind {
  Stopwatch = 'stopwatch',
  Countdown = 'countdown',
}

export enum TimerStopKind {
  ByModerator = 'by_moderator',
  Expired = 'expired',
  CreatorLeft = 'creator_left',
}

export enum TimerStyle {
  CoffeeBreak = 'coffee-break',
  Normal = 'normal',
}

export interface TimerState {
  endsAt: Timestamp;
  kind: TimerKind;
  readyCheckEnabled: boolean;
  startedAt: Timestamp;
  readyStatus: boolean;
  style: TimerStyle;
  timerId: string;
  title?: string;
}

export type TimerIsReady = Pick<TimerState, 'readyStatus'>;
