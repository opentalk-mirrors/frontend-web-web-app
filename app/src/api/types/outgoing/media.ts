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

export interface MediaSessionInfo {
  mediaSessionType: MediaSessionType;
  mediaSessionState: MediaSessionState;
}

export interface Publish extends TargetedSdp {
  action: 'publish';
}

export interface PublishComplete extends MediaSessionInfo {
  action: 'publish_complete';
}

export interface Unpublish extends AssociatedMediaSession {
  action: 'unpublish';
}

export interface UpdateMediaSession extends MediaSessionInfo {
  action: 'update_media_session';
}

export interface Subscribe extends Target {
  action: 'subscribe';
}

export interface Resubscribe extends Target {
  action: 'resubscribe';
}

export interface Configure extends Target {
  action: 'configure';
  configuration: Configuration;
}

export interface Configuration {
  video?: boolean;
  substream?: VideoSetting;
}

export interface SdpAnswer extends TargetedSdp {
  action: 'sdp_answer';
}

export interface SdpCandidate extends TargetedCandidate {
  action: 'sdp_candidate';
}

export interface SdpEndOfCandidates extends Target {
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

export type Media = Namespaced<Action, 'media'>;

export default Media;
