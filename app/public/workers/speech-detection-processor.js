// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

/* 
  Smoothes only on speech signal falling. On signal rising we want to react immediately.
  For us it is important to detect speech presence as fast as possible. Signal falling means: speech disappears.
  But maybe speech will appear again? Therefore we smooth the falling signal.
  The bigger the smoothing factor, the slower we detect speech abscence.
*/
const FALL_SMOOTHING_FACTOR = 0.75 // max: 1.0
/*
   Framing time for speech detection. We need a block of samples (frame) to be able to analyze it.
   For reference search for speech detection signal framing.
   Kind of length of a syllable
*/
const FRAME_LENGTH = 0.1; // s

const dB2level = (db) => Math.pow(10, db / 20)

class SpeechDetectionProcessor extends AudioWorkletProcessor {

  constructor(options) {
    super();
    this.level = 0;
    this.active = false;
    this.accumulator = 0;
    this.samples = 0;
    this.samplesPerTimeUnit = sampleRate * FRAME_LENGTH;
    this.activationLevel = dB2level(options.processorOptions.activation);
    this.releaseLevel = dB2level(options.processorOptions.release);
    this.closed = false;

    this.port.onmessage = (event) => {
      if (event.data.close) { 
        this.closed = true; 
      }
    };
  }

  process(inputs, _outputs, _parameters) {
    if(this.closed) {
      return false;
    }

    const input = inputs[0];
    // Note that the input will be down-mixed to mono; however, if no inputs are
    // connected then zero channels will be passed in.

    if (input.length <= 0) {
      return true;
    }

    const buffer = input[0];

    // RMS helps us to improve signal peaks detection, which are of bigger interest for us
    for (let i = 0; i < buffer.length; ++i) {
      this.accumulator += buffer[i] * buffer[i]
    }
    this.samples += buffer.length;

    if(this.samples < this.samplesPerTimeUnit) {
      return true;
    }
    const rms = Math.sqrt(this.accumulator / this.samples);
    this.level = Math.max(FALL_SMOOTHING_FACTOR * this.level,  rms);

    this.accumulator = 0;
    this.samples = 0;

    // Hysteresis to avoid bouncing
    if (!this.active && this.level > this.activationLevel) {
      this.active = true
      this.port.postMessage(true);
    } else if (this.active && this.level < this.releaseLevel) {
      this.active = false
      this.port.postMessage(false);
    }

    // Keep on processing until we get a close signal.
    return true;
  }
}

registerProcessor('speech-detection-processor', SpeechDetectionProcessor);
