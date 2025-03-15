// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced, ChoiceId, CommonPoll, PollId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface Start extends CommonPoll {
  action: 'start';
  choices: Array<string>;
}

export interface UserChoice {
  choiceId?: ChoiceId;
  choiceIds?: Array<ChoiceId>;
}

export interface Vote extends UserChoice {
  action: 'vote';
  pollId: PollId;
}

export interface Finish {
  action: 'finish';
  id: PollId;
}

export type Action = Start | Finish | Vote;
export type Poll = Namespaced<Action, 'polls'>;

export const start = createSignalingApiCall<Start>('polls', 'start');
export const finish = createSignalingApiCall<Finish>('polls', 'finish');
export const vote = createSignalingApiCall<Vote>('polls', 'vote');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(start.action, (_state, action) => {
      sendMessage(start(action.payload));
    })
    .addCase(finish.action, (_state, action) => {
      sendMessage(finish(action.payload));
    })
    .addCase(vote.action, (_state, action) => {
      sendMessage(vote(action.payload));
    });
});

export default Poll;
