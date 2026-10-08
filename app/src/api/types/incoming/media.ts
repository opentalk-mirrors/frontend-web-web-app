// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MediaSessionType, NamespacedIncoming, ParticipantId, TrickleCandidate } from '../../../types';

interface Source {
  source: ParticipantId;
  mediaSessionType: MediaSessionType;
}

interface Sdp extends Source {
  sdp: string;
}

interface SdpAnswer extends Sdp {
  message: 'sdp_answer';
}

interface SdpOffer extends Sdp {
  message: 'sdp_offer';
}

interface SdpCandidate extends Source {
  message: 'sdp_candidate';
  candidate: TrickleCandidate;
}

interface WebRtcUp extends Source {
  message: 'webrtc_up';
}

interface WebRtcDown extends Source {
  message: 'webrtc_down';
}

interface WebRtcSlow extends Source {
  message: 'webrtc_slow';
  direction: 'upstream' | 'downstream';
}

interface RequestMute {
  message: 'request_mute';
  issuer: ParticipantId;
  force: boolean;
}

interface MediaError extends Source {
  message: 'error';
  text: string;
  error: string;
}

interface SpeakerUpdated {
  message: 'speaker_updated';
  participant: ParticipantId;
}

interface PresenterRoleGranted {
  message: 'presenter_role_granted';
  participantIds: ParticipantId[];
}

interface PresenterRoleRevoked {
  message: 'presenter_role_revoked';
  participantIds: ParticipantId[];
}

type Message =
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

type Media = NamespacedIncoming<Message, 'media'>;

export default Media;
