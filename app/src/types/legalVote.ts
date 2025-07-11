// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from './common';

export type LegalVoteId = string & { readonly __tag: unique symbol };

export enum LegalVoteKind {
  /**
   * It's visible afterwards who voted what
   */
  RollCall = 'roll_call',
  /**
   * You can see in real time who voted what
   */
  LiveRollCall = 'live_roll_call',
  /**
   * You can't see who voted what
   */
  Pseudonymous = 'pseudonymous',
}

export enum LegalVoteState {
  Started = 'started',
  Finished = 'finished',
  Canceled = 'canceled',
  Invalid = 'invalid',
}

enum StopKind {
  ByUser = 'by_user',
  Expired = 'expired',
  Auto = 'auto',
}
export interface LegalVoteFormValues {
  kind: LegalVoteKind;
  name: string;
  subtitle?: string;
  /**
   * The topic that will be voted on
   */
  topic?: string;
  /**
   * Indicates that the `Abstain` vote option is enabled
   */
  enableAbstain: boolean;
  /**
   * The vote will automatically stop when every participant voted
   */
  autoClose: boolean;
  /**
   * The vote will stop when the duration (in second) has passed
   */
  duration: number | null;
  /**
   * Automatically create a protocol PDF when the vote ends.
   */
  createPdf: boolean;
}
/**
 * Shared fields between incoming and outgoing
 */
export interface LegalVoteParameters extends LegalVoteFormValues {
  /**
   * List of participants that are allowed to cast a vote
   */
  allowedParticipants: Array<string>;
  /**
   * Timezone used in the protocol, defaults to UTC, IANA format, e.g."CET" or "Europe/Vienna".
   */
  timezone?: string;
}
export interface IncomingVote extends LegalVoteParameters {
  initiatorId: ParticipantId;
  legalVoteId: LegalVoteId;
  startTime: string;
  maxVotes: number;
  token?: string;
}

interface VoteSummaryBase extends IncomingVote {
  state: LegalVoteState;
  endTime?: string;
}
//Started Vote Types
interface StartedVote extends VoteSummaryBase {
  state: LegalVoteState.Started;
}

//Finished vote types
export type LegalVoteOption = 'yes' | 'no' | 'abstain';

type VotingRecordMap = Record<ParticipantId, LegalVoteOption>;

interface FinishedVoteBase extends VoteSummaryBase {
  state: LegalVoteState.Finished;
  stopKind: StopKind;
  yes: number;
  no: number;
  votingRecord: VotingRecordMap;
}
interface FinishedNoAbstainVoteSummary extends FinishedVoteBase {
  enableAbstain: false;
}
//Abstain count is only returned if enableAbstain is true
interface FinishedAbstainVoteSummary extends FinishedVoteBase {
  enableAbstain: true;
  abstain: number;
}
type FinishedVoteSummary = FinishedAbstainVoteSummary | FinishedNoAbstainVoteSummary;

//We get the ID of whoever ended the vote manually only when it is ByUser
type FinishedByUserVoteSummary = FinishedVoteSummary & {
  stopKind: StopKind.ByUser;
  stoppedBy: ParticipantId;
};
type FinishedNotByUserVoteSummary = FinishedVoteSummary & {
  stopKind: Exclude<StopKind, StopKind.ByUser>;
};
type FinishedVote = FinishedNotByUserVoteSummary | FinishedByUserVoteSummary;

//Canceled vote types
export enum VoteCancelReason {
  InitiatorLeft = 'initiator_left',
  RoomDestroyed = 'room_destroyed',
  Custom = 'custom',
}
interface CanceledVoteBase extends VoteSummaryBase {
  state: LegalVoteState.Canceled;
  issuer: ParticipantId;
  reason: VoteCancelReason;
}
interface NonCustomCanceledVote extends CanceledVoteBase {
  reason: Exclude<VoteCancelReason, VoteCancelReason.Custom>;
}
interface CustomCanceledVote extends CanceledVoteBase {
  reason: VoteCancelReason.Custom;
  custom: string;
}
type CanceledVote = NonCustomCanceledVote | CustomCanceledVote;

//Invalid vote types
export enum VoteInvalidReason {
  AbstainDisabled = 'abstain_disabled',
  VoteCountInconsistent = 'vote_count_inconsistent',
  ProtocolInconsistent = 'protocol_inconsistent',
}
interface InvalidVoteSummary extends VoteSummaryBase {
  state: LegalVoteState.Invalid;
  reason: VoteInvalidReason;
}

//Creates exclusive union type that will require specific fields based on conditions (state, reason, etc.)
export type VoteSummary = StartedVote | FinishedVote | CanceledVote | InvalidVoteSummary;

export interface LegalVoteJoinSuccess {
  votes?: Array<VoteSummary>;
}

export interface SavedLegalVoteForm extends LegalVoteFormValues {
  id?: number;
}

export interface UserVote {
  votedAt: string;
  selectedOption: LegalVoteOption;
}

export type VotesInSlice = Record<LegalVoteOption, number>;
//When using exclusive union types redux toolkit has troubles inferring based on difference (probably due to usage of Partial)
//In such case we need to manually define all the fields we can use
export interface LegalVote extends Omit<VoteSummaryBase, 'legalVoteId'> {
  id: LegalVoteId;
  votingRecord?: VotingRecordMap;
  cancelReason?: VoteCancelReason;
  customCancelReason?: string;
  votes?: VotesInSlice;
  userVote?: UserVote;
}
