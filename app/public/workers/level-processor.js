// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

// see https://webaudio.github.io/web-audio-api/#vu-meter-mode

const LEVEL_SMOOTHING_FACTOR = 0.7; // max: 1.0
const PEAK_SMOOTHING_FACTOR = 0.95; // max: 1.0
const CLIP_THRESHOLD = 0.708; // above -3dB

const level2dB = (level) => 20 * Math.log10(level);

class LevelProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this._level = 0;
    this._peak = 0;
    this._updateIntervalInMS = options.processorOptions.updateIntervalInMS;  // during this period of time, the worklet processes the signal
    this._nextUpdateFrame = this._updateIntervalInMS;                        // afterwards it updates the main thread (app) with new output        
    this._clip = false;
    this._closed = false;

    this.port.onmessage = (event) => {
      if (event.data.updateIntervalInMS) { 
        this._updateIntervalInMS = event.data.updateIntervalInMS; 
      }
      if (event.data.close) { 
        this._closed = true; 
      }
    };
  }

  get intervalInFrames() {
    // sampleRate from AudioWorkletGlobalScope
    return (this._updateIntervalInMS / 1000) * sampleRate;
  }

  process(inputs, _outputs, _parameters) {
    const input = inputs[0];
    // Note that the input will be down-mixed to mono; however, if no inputs are
    // connected then zero channels will be passed in.
    if (input.length > 0) {
      const samples = input[0];
      let maxLevel = 0;

      for (let i = 0; i < samples.length; ++i) {
        const level = Math.abs(samples[i]);
        if (maxLevel < level) {
          maxLevel = level;
        }
      }

      this._clip = this._clip || maxLevel > CLIP_THRESHOLD;
      this._level = Math.max(maxLevel, this._level);
      this._peak = Math.max(maxLevel, this._peak);

      this._nextUpdateFrame -= samples.length;
      if (this._nextUpdateFrame < 0) {
        this._nextUpdateFrame += this.intervalInFrames;
        const message = {
          level: level2dB(this._level),
          peak: level2dB(this._peak),
          clip: this._clip,
        };
        this.port.postMessage(message);
        this._clip = false;
        this._peak *= PEAK_SMOOTHING_FACTOR;
        this._level *= LEVEL_SMOOTHING_FACTOR;
      }
    }

    // Keep on processing until we get a close signal.
    return !this._closed;
  }
}

registerProcessor('level-processor', LevelProcessor);
