// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AnyAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../store';
import {
  LegalVoteOption,
  LegalVoteId,
  Namespaced,
  MiddlewareMapBuilder,
  createModule,
  createSignalingApiCall,
  LegalVoteParameters,
} from '../../../types';
import { sendMessage } from '../../index';

/**
 * Prevent sending empty strings for optional fields, since those are rejected by backend.
 */
export interface VoteStart extends LegalVoteParameters {
  action: 'start';
}

export interface VoteStop {
  action: 'stop';
  legalVoteId: LegalVoteId;
  timezone: string;
}

export interface VoteCancel {
  action: 'cancel';
  legalVoteId: LegalVoteId;
  reason: string;
  timezone: string;
}

export interface VoteOutgoing {
  action: 'vote';
  legalVoteId: LegalVoteId;
  option: LegalVoteOption;
  token: string;
  timezone: string;
}

export enum ReportIssueKind {
  Screenshare = 'screenshare',
  Audio = 'audio',
  Video = 'video',
  Other = 'other',
}

export interface VoteReportIssue {
  action: 'report_issue';
  legal_vote_id: LegalVoteId;
  kind?: ReportIssueKind;
  description?: string;
}

export type Action = VoteStart | VoteStop | VoteCancel | VoteOutgoing | VoteReportIssue;
export type LegalVote = Namespaced<Action, 'legal_vote'>;

export const start = createSignalingApiCall<VoteStart>('legal_vote', 'start');
export const stop = createSignalingApiCall<VoteStop>('legal_vote', 'stop');
export const cancel = createSignalingApiCall<VoteCancel>('legal_vote', 'cancel');
export const vote = createSignalingApiCall<VoteOutgoing>('legal_vote', 'vote');
export const reportIssue = createSignalingApiCall<VoteReportIssue>('legal_vote', 'report_issue');

export const handler = createModule((builder: MiddlewareMapBuilder<RootState>) => {
  builder.addCase(start.action, (_state, action: AnyAction) => {
    sendMessage(start(action.payload));
  });
  builder.addCase(stop.action, (_state, action: AnyAction) => {
    sendMessage(stop(action.payload));
  });
  builder.addCase(cancel.action, (_state, action: AnyAction) => {
    sendMessage(cancel(action.payload));
  });
  builder.addCase(vote.action, (_state, action: AnyAction) => {
    sendMessage(vote(action.payload));
  });
  builder.addCase(reportIssue.action, (_state, action: AnyAction) => {
    sendMessage(reportIssue(action.payload));
  });
});

export default LegalVote;
