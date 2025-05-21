// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

// see https://webaudio.github.io/web-audio-api/#vu-meter-mode

// The LevelNode is the underpinning for a Volume unit meter (VU meter) widget
// see https://en.wikipedia.org/wiki/VU_meter

export interface SignalLevel {
  level: number;
  peak: number;
  clip: boolean;
}

// Currently we use the level node only to update the animation of the audio indicator
// Therefore the standard value would be (1 / 60 Hz ) = 16.67 ms
const DEFAULT_UPDATE_INTERVAL = 16.67; //ms

export class LevelNode extends AudioWorkletNode {
  private _updateIntervalInMS;
  private _level: SignalLevel = { level: -Infinity, peak: -Infinity, clip: false };

  static async loadWorklet(context: AudioContext) {
    await context.audioWorklet.addModule('/workers/level-processor.js');
  }

  /**
   * Create a LevelNode
   *
   * @param context The parent AudioContext
   * @param updateIntervalInMS how often the worklet shall update the main thread, in ms
   *
   */
  constructor(context: AudioContext, updateIntervalInMS: number = DEFAULT_UPDATE_INTERVAL) {
    super(context, 'level-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 1,
      processorOptions: {
        updateIntervalInMS,
      },
    });

    if (updateIntervalInMS <= 0) {
      throw new Error('update interval must be a positive number');
    }
    this._updateIntervalInMS = updateIntervalInMS;

    this.port.onmessage = (event) => {
      if (event.data.level) {
        this._level = event.data as SignalLevel;
      }
    };
    this.port.start();
  }

  get updateInterval() {
    return this._updateIntervalInMS;
  }

  set updateInterval(updateIntervalInMS) {
    this._updateIntervalInMS = updateIntervalInMS;
    this.port.postMessage({ updateIntervalInMS: updateIntervalInMS });
  }

  close() {
    this.port.postMessage({ close: true });
  }
  get level() {
    return this._level;
  }
}
