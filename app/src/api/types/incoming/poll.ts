// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CommonPoll, ErrorStruct, NamespacedIncoming, PollId, Choice, ChoiceResult } from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

export interface Started extends CommonPoll {
  message: 'started';
  id: PollId;
  choices: Array<Choice>;
}

export interface LiveUpdate {
  message: 'live_update';
  id: PollId;
  results: Array<ChoiceResult>;
}

export interface Done {
  message: 'done';
  id: PollId;
  results: Array<ChoiceResult>;
}

export enum PollError {
  InsufficientPermissions = 'insufficient_permissions',
  InvalidChoiceCount = 'invalid_choice_count',
  InvalidPollId = 'invalid_poll_id',
  InvalidChoiceId = 'invalid_choice_id',
  InvalidDuration = 'invalid_duration',
  VotedAlready = 'voted_already',
  StillRunning = 'still_running',
}

isEnumErrorStruct(PollError);

export type Message = Started | LiveUpdate | Done | ErrorStruct<PollError>;
type Poll = NamespacedIncoming<Message, 'polls'>;

export default Poll;
