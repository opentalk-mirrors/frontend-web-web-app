// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import { BaseEventEmitter } from '../EventListener';

/*
 * This echo test sets up a call with itself.
 * It is use as quirk to test echo canceling,
 * because Chrome v100 and before only take into account remote media streams.
 */

export type EchoTestState = 'connected' | 'streamUpdate' | 'closed';
export type EchoTestEvent = {
  stateChanged: EchoTestState;
};

export class EchoTest extends BaseEventEmitter<EchoTestEvent> {
  private readonly connectionOut: RTCPeerConnection;
  private readonly connectionIn: RTCPeerConnection;

  readonly offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  };

  private _outStream?: MediaStream;

  public get outStream() {
    return this._outStream;
  }

  // This is the signaling part.
  // It exchanges the IceCandidates between both PeerConnections
  private static onIceCandidate = (otherPeerConnection: RTCPeerConnection) => (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate === null) {
      return;
    }
    const task = otherPeerConnection.addIceCandidate(event.candidate);
    task.catch((e) => {
      log.error(`Failed to add ICE Candidate: ${e.toString()}`);
    });
    return task;
  };

  private static async onNewTrack(owner: EchoTest, e: RTCTrackEvent) {
    if (owner._outStream !== e.streams[0]) {
      owner._outStream = e.streams[0];
      owner.eventEmitter.emit('stateChanged', 'streamUpdate');
    }
  }

  constructor(config?: RTCConfiguration) {
    super();
    this.connectionOut = new RTCPeerConnection(config);
    this.connectionIn = new RTCPeerConnection(config);

    this.connectionOut.addEventListener('icecandidate', EchoTest.onIceCandidate(this.connectionIn));
    this.connectionIn.addEventListener('icecandidate', EchoTest.onIceCandidate(this.connectionOut));
    this.connectionIn.addEventListener('track', (e) => EchoTest.onNewTrack(this, e));
  }

  public async connect(stream: MediaStream) {
    stream.getTracks().forEach((track) => this.connectionOut.addTrack(track, stream));

    const offerTask = this.connectionOut.createOffer(this.offerOptions);
    offerTask.catch((e) => log.error('createOffer Failed', e));

    const offer = await offerTask;
    const setDescriptionTask = this.setDescription(offer);
    setDescriptionTask.catch((e) => log.error('setDescription Failed', offer, e));
    const answer = await setDescriptionTask;
    await this.onCreateAnswerSuccess(answer);
    this.eventEmitter.emit('stateChanged', 'connected');
  }

  private async setDescription(desc: RTCSessionDescriptionInit) {
    await this.connectionOut.setLocalDescription(desc);
    await this.connectionIn.setRemoteDescription(desc);

    return this.connectionIn.createAnswer();
  }

  private async onCreateAnswerSuccess(desc: RTCSessionDescriptionInit) {
    await this.connectionIn.setLocalDescription(desc);
    await this.connectionOut.setRemoteDescription(desc);
  }

  public close() {
    this.connectionOut.close();
    this.connectionIn.close();
    this.eventEmitter.emit('stateChanged', 'closed');
  }
}
