// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  LegalVoteOption,
  IncomingVote,
  VoteCancelReason,
  ErrorStruct,
  LegalVoteId,
  NamespacedIncoming,
  ParticipantId,
  VoteInvalidReason,
  Timestamp,
} from '../../../types';
import { ReportIssueKind } from '../outgoing/legalVote';

export interface VoteStarted extends IncomingVote {
  message: 'started';
}

export interface VoteResponse {
  message: 'voted';
  legalVoteId: LegalVoteId;
  voteOption: LegalVoteOption;
  issuer: ParticipantId;
  consumedToken: string;
}

export interface VoteResultsType {
  yes: number;
  no: number;
  abstain?: number;
  votingRecord: UserVotingRecord | TokenVotingRecord;
}

export type UserVotingRecord = Record<ParticipantId, LegalVoteOption>;
export type TokenVotingRecord = Record<string, LegalVoteOption>;

export interface VoteUpdated extends VoteResultsType {
  message: 'updated';
  legalVoteId: LegalVoteId;
}

export enum StopKind {
  ByParticipant = 'by_participant',
  Expired = 'expired',
  Auto = 'auto',
}

export enum VoteFinalResults {
  Valid = 'valid',
  Invalid = 'invalid',
}

interface BaseStopped extends VoteResultsType {
  message: 'stopped';
  legalVoteId: LegalVoteId;
  kind: StopKind;
  endTime: Timestamp;
}

export interface VoteStoppedAuto extends BaseStopped {
  kind: StopKind.Auto;
}

export interface VoteStoppedExpired extends BaseStopped {
  kind: StopKind.Expired;
}

export interface VoteStoppedByParticipant extends BaseStopped {
  kind: StopKind.ByParticipant;
  issuer: ParticipantId;
}

export interface VoteStoppedValid extends BaseStopped, VoteResultsType {
  results: VoteFinalResults.Valid;
}

export interface VoteStoppedInvalid extends BaseStopped {
  results: VoteFinalResults.Invalid;
  reason: VoteInvalidReason;
}

type VoteStoppedKind = VoteStoppedAuto | VoteStoppedExpired | VoteStoppedByParticipant;
type VoteStoppedFinalResults = VoteStoppedInvalid | VoteStoppedValid;
export type VoteStopped = VoteStoppedKind & VoteStoppedFinalResults;

export interface VoteCancelBase {
  message: 'canceled';
  legalVoteId: LegalVoteId;
  reason: VoteCancelReason;
  endTime: Timestamp;
}
export interface VoteCanceledInitiatorLeft extends VoteCancelBase {
  reason: VoteCancelReason.InitiatorLeft;
}

export interface CanceledRoomDestroyed extends VoteCancelBase {
  reason: VoteCancelReason.RoomDestroyed;
}

export interface VoteCanceledCustom extends VoteCancelBase {
  reason: VoteCancelReason.Custom;
  custom: string;
}

export type VoteCanceled = VoteCanceledInitiatorLeft | CanceledRoomDestroyed | VoteCanceledCustom;

export enum LegalVoteError {
  /// A vote is already active.
  VoteAlreadyActive = 'vote_already_active',
  /// No vote is currently taking place.
  NoVoteActive = 'no_vote_active',
  /// The provided vote id is invalid in the requested context.
  InvalidVoteId = 'invalid_vote_id',
  /// The user used a token that was either already used or not valid.
  InvalidToken = 'invalid_token',
  /// The selected vote option is not allowed.
  InvalidOption = 'invalid_option',
  /// The provided parameters are invalid.
  InvalidParameters = 'invalid_parameters',
  /// The provided allow list contains ineligible participants.
  /// Only registered users are allowed to vote.
  IneligibleParticipants = 'ineligible_participants',
  /// The requesting user has insufficient permissions.
  InsufficientPermissions = 'insufficient_permissions',
  /// The requesting user has exceeded their storage.
  StorageExceeded = 'storage_exceeded',
  /// An internal error occurred while saving the whiteboard pdf.
  InternalStorage = 'internal_storage',
  /// A internal server error occurred.
  Internal = 'internal_server_error',
}

export interface ReportGenerated {
  message: 'report_generated';
  filename: string;
  legalVoteId: LegalVoteId;
  assetId: string;
}

export interface VoteReportedIssue {
  message: 'reported_issue';
  legalVoteId: LegalVoteId;
  participantId?: ParticipantId;
  kind?: ReportIssueKind;
  description?: string;
}

export type LegalVoteMessageType =
  | VoteStarted
  | VoteResponse
  | VoteStopped
  | VoteUpdated
  | VoteCanceled
  | ReportGenerated
  | VoteReportedIssue
  | ErrorStruct<LegalVoteError>;
type LegalVoteMessage = NamespacedIncoming<LegalVoteMessageType, 'legal_vote'>;

export default LegalVoteMessage;
