// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import { BaseEventEmitter } from '../EventListener';

export type EchoTestState = 'connected' | 'streamUpdate' | 'closed' | 'error';
export type EchoTestEvent = {
  stateChanged: EchoTestState;
};

export class EchoTest extends BaseEventEmitter<EchoTestEvent> {
  private audioContext?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private destination?: MediaStreamAudioDestinationNode;
  private delay?: DelayNode;
  private _outStream?: MediaStream;

  public get outStream() {
    return this._outStream;
  }

  public connect(stream: MediaStream) {
    try {
      this.audioContext = new AudioContext();
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.destination = this.audioContext.createMediaStreamDestination();

      this.delay = this.audioContext.createDelay(0.5);
      this.delay.delayTime.value = 0.2;

      this.source.connect(this.delay);
      this.delay.connect(this.destination);

      this._outStream = this.destination.stream;
      this.eventEmitter.emit('stateChanged', 'streamUpdate');
      this.eventEmitter.emit('stateChanged', 'connected');
    } catch (e) {
      log.error('WebAudio EchoTest failed', e);
      this.eventEmitter.emit('stateChanged', 'error');
      throw e;
    }
  }

  public close() {
    try {
      this.source?.disconnect();
      this.delay?.disconnect();
      this.audioContext?.close();
    } catch (e) {
      log.error('Error closing WebAudio EchoTest', e);
    }
    this._outStream = undefined;
    this.eventEmitter.emit('stateChanged', 'closed');
  }
}
