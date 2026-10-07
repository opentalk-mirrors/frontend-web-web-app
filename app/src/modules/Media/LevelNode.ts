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
