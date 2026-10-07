// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Seconds } from '../utils/tsUtils';

export type PollId = string & { readonly __tag: unique symbol };
export type ChoiceId = number & { readonly __tag: unique symbol };

interface ChoiceCommon {
  id: ChoiceId;
}

export interface Choice extends ChoiceCommon {
  content: string;
}

export interface ChoiceResult extends ChoiceCommon {
  count: number;
}

export interface CommonPoll {
  topic: string;
  live: boolean;
  multipleChoice: boolean;
  duration: Seconds;
}

export interface InitialPoll extends CommonPoll {
  id: PollId;
  started: string;
  choices: Array<Choice>;
  results?: Array<ChoiceResult>;
}
