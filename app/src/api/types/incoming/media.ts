// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MediaSessionType, NamespacedIncoming, ParticipantId, SpeakingState, TrickleCandidate } from '../../../types';

export interface Source {
  source: ParticipantId;
  mediaSessionType: MediaSessionType;
}

interface Sdp extends Source {
  sdp: string;
}

export interface SdpAnswer extends Sdp {
  message: 'sdp_answer';
}

export interface SdpOffer extends Sdp {
  message: 'sdp_offer';
}

export interface SdpCandidate extends Source {
  message: 'sdp_candidate';
  candidate: TrickleCandidate;
}

export interface SdpEndOfCandidates extends Source {
  message: 'sdp_end_of_candidates';
}

export interface WebRtcUp extends Source {
  message: 'webrtc_up';
}

export interface WebRtcDown extends Source {
  message: 'webrtc_down';
}

export interface WebRtcSlow extends Source {
  message: 'webrtc_slow';
  direction: 'upstream' | 'downstream';
}

export interface RequestMute {
  message: 'request_mute';
  issuer: ParticipantId;
  force: boolean;
}

export interface MediaStatusChange {
  kind: 'audio' | 'video';
  receiving: boolean;
}

export interface MediaStatus extends Source, MediaStatusChange {
  message: 'media_status';
}

export interface MediaError extends Source {
  message: 'error';
  text: string;
  error: string;
}

export interface SpeakerUpdated extends SpeakingState {
  message: 'speaker_updated';
  participant: ParticipantId;
}

export interface PresenterRoleGranted {
  message: 'presenter_role_granted';
  participantIds: ParticipantId[];
}

export interface PresenterRoleRevoked {
  message: 'presenter_role_revoked';
  participantIds: ParticipantId[];
}

export type Message =
  | SdpAnswer
  | SdpOffer
  | SdpCandidate
  | MediaError
  | WebRtcUp
  | WebRtcDown
  | WebRtcSlow
  | RequestMute
  | SpeakerUpdated
  | PresenterRoleGranted
  | PresenterRoleRevoked;

export type Media = NamespacedIncoming<Message, 'media'>;

export default Media;
