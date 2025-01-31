// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { i18n } from 'i18next';

import { ConfigState } from './store/slices/configSlice';

export {};

declare global {
  interface Window {
    config: ConfigState;
    showReportDialog: (options?: Sentry.ReportDialogOptions | undefined, hub?: Sentry.Hub | undefined) => void;
    webkitAudioContext: typeof AudioContext;
    i18n: i18n;
    debugKillSignaling: () => void;
    setLogLevel: (level: LogLevel, name?: LoggerNames) => void;
  }
  // still marked as experimental but already implemented in most browsers
  interface HTMLAudioElement {
    setSinkId(sinkId: string): Promise<undefined>;
  }

  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }

  interface MediaTrackConstraintSet {
    autoGainControl?: ConstrainBoolean;
    noiseSuppression?: ConstrainBoolean;
    resizeMode?: ConstrainDOMString;
    aspectRatio?: ConstrainDouble;
    channelCount?: ConstrainULong;
    deviceId?: ConstrainDOMString;
    echoCancellation?: ConstrainBoolean;
    facingMode?: ConstrainDOMString;
    frameRate?: ConstrainDouble;
    groupId?: ConstrainDOMString;
    height?: ConstrainULong;
    latency?: ConstrainDouble;
    sampleRate?: ConstrainULong;
    sampleSize?: ConstrainULong;
    suppressLocalAudioPlayback?: ConstrainBoolean;
    width?: ConstrainULong;
  }

  // should actually be enabled upstream, but this a long way.
  // The types are auto generated form outdated Mozilla API Docs
  // And they are not changed until someone has figured out the exact Chrome/Safari/Edge version when fields came in.
  // To be added more than one Browser must be marked to support a field.
  //
  // Types: https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts
  // see for reference: https://w3c.github.io/webrtc-stats/#rtctatstype-*

  interface RTCInboundRtpStreamStats extends RTCReceivedRtpStreamStats {
    type: 'inbound-rtp';

    bytesReceived?: number;
    lastPacketReceivedTimestamp?: number;
    headerBytesReceived?: number;

    // audio
    audioLevel?: number;
    /*
    totalSamplesReceived?: number;
    concealedSamples?: number;
    silentConcealedSamples?: number;
    concealmentEvents?: number;
    insertedSamplesForDeceleration?: number;
    removedSamplesForAcceleration?: number;
    audioLevel?: number;
    totalAudioEnergy?: number;
    */

    //video
    totalDecodeTime?: number;
    frameWidth?: number;
    frameHeight?: number;
  }

  interface RTCOutboundRtpStreamStats extends RTCSentRtpStreamStats {
    type: 'outbound-rtp';

    frameWidth?: number;
    frameHeight?: number;
    rid?: string;
    totalEncodeTime?: number;
    headerBytesSent?: number;
    retransmittedPacketsSent?: number;
  }

  interface RTCRemoteInboundRtpStreamStats extends RTCReceivedRtpStreamStats {
    type: 'remote-inbound-rtp';
    localId?: string;
    roundTripTime?: number;
    totalRoundTripTime?: number;
  }

  interface RTCRemoteOutboundRtpStreamStats extends RTCSentRtpStreamStats {
    type: 'remote-outbound-rtp';
    localId?: string;
    remoteTimestamp?: number;
  }

  interface RTCIceCandidatePairStats extends RTCStats {
    bytesDiscardedOnSend?: number;
    packetsDiscardedOnSend?: number;
    packetsSent?: number;
  }

  interface RTCIceCandidate {
    networkType?: string;
  }

  type RTCStatsCollection =
    | RTCTransportStats
    | RTCOutboundRtpStreamStats
    | RTCInboundRtpStreamStats
    | RTCRemoteInboundRtpStreamStats
    | RTCRemoteOutboundRtpStreamStats
    | RTCIceCandidatePairStats
    | RTCCodecStats
    | RTCSctpTransportStats
    | RTCCertificateStats
    | RTCIceServerStats
    | RTCRtpTransceiverStats
    | RTCAudioSenderStats
    | RTCVideoSenderStats
    | RTCAudioReceiverStats
    | RTCVideoReceiverStats
    | RTCVideoSourceStats
    | RTCAudioSourceStats
    | RTCRtpContributingSourceStats
    | RTCIceCandidateStats
    | RTCPeerConnectionStats
    | RTCDataChannelStats;

  // this just behaves similar to a Record (but has no index operator)
  interface RTCStatsReport /*extends Record<string, RTCStatsCollection>*/ {
    forEach(
      callbackfn: (value: RTCStatsCollection, key: string, parent: RTCStatsReport) => void,
      thisArg?: RTCStatsCollection
    ): void;
    get(key: string): RTCStatsCollection | undefined;
  }
}

declare module '*.png' {
  const content: string;
  export default content;
}
