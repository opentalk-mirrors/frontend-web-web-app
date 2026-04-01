// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MilliSeconds } from '../utils/tsUtils';
import { ParticipantId } from './common';

export enum AutomodSelectionStrategy {
  None = 'none',
  Playlist = 'playlist',
  Random = 'random',
  Nomination = 'nomination',
}
export interface AutomodStartBase {
  /// The strategy used to determine the next speaker
  selectionStrategy: AutomodSelectionStrategy;
  /// Is `list` visible to the frontend
  showRemaining: boolean;
  /// Time limit in milliseconds each speaker has before its speaking status gets revoked
  timeLimit?: MilliSeconds;
  // Depending on the `selection_strategy` this will prevent participants to become
  // speaker twice in a single automod session
  allowDoubleSelection: boolean;
  /// Append the `allow_list` or `playlist` with joining participants, depending on the
  /// `selection_strategy`
  autoAppendOnJoin: boolean;
}
export interface AutomodStartConfig extends AutomodStartBase {
  history: Array<ParticipantId>;
  remaining: Array<ParticipantId>;
  // Id of the moderator that started the automod
  issuedBy: ParticipantId;
}
export interface InitialAutomod {
  config: AutomodStartConfig;
  speaker: ParticipantId | null;
}
