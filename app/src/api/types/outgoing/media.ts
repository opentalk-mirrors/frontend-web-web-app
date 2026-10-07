// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  MediaSessionState,
  MediaSessionType,
  Namespaced,
  ParticipantId,
  TrickleCandidate,
  VideoSetting,
} from '../../../types';

interface Target {
  target: ParticipantId;
  mediaSessionType: MediaSessionType;
}

interface TargetedSdp extends Target {
  sdp: string;
}

interface AssociatedMediaSession {
  mediaSessionType: MediaSessionType;
}

interface TargetedCandidate extends Target {
  candidate: TrickleCandidate;
}

interface MediaSessionInfo {
  mediaSessionType: MediaSessionType;
  mediaSessionState: MediaSessionState;
}

interface Publish extends TargetedSdp {
  action: 'publish';
}

interface PublishComplete extends MediaSessionInfo {
  action: 'publish_complete';
}

interface Unpublish extends AssociatedMediaSession {
  action: 'unpublish';
}

interface UpdateMediaSession extends MediaSessionInfo {
  action: 'update_media_session';
}

interface Subscribe extends Target {
  action: 'subscribe';
}

interface Resubscribe extends Target {
  action: 'resubscribe';
}

interface Configure extends Target {
  action: 'configure';
  configuration: Configuration;
}

interface Configuration {
  video?: boolean;
  substream?: VideoSetting;
}

interface SdpAnswer extends TargetedSdp {
  action: 'sdp_answer';
}

interface SdpCandidate extends TargetedCandidate {
  action: 'sdp_candidate';
}

interface SdpEndOfCandidates extends Target {
  action: 'sdp_end_of_candidates';
}

export type Action =
  | Publish
  | PublishComplete
  | Unpublish
  | UpdateMediaSession
  | SdpAnswer
  | Subscribe
  | Resubscribe
  | Configure
  | SdpCandidate
  | SdpEndOfCandidates;

type Media = Namespaced<Action, 'media'>;

export default Media;
