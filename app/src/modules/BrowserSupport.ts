// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Browser support helpers partially taken from @jitsi/js-utils
//! Mostly removed support for Electron and NW.js and limited to our current feature target
import Bowser from 'bowser';

const MIN_REQUIRED_CHROME_VERSION = 127;
const MIN_REQUIRED_FIREFOX_VERSION = 128;
const MIN_REQUIRED_SAFARI_VERSION = 17;

enum Browsers {
  Firefox = 'firefox',
  Chrome = 'chrome',
  Safari = 'safari',
  Opera = 'opera',
  MicrosoftEdge = 'microsoft edge',
}

export class BrowserSupport {
  private readonly bowser: Bowser.Parser.Parser;
  readonly name: string;
  readonly version: string | undefined;
  readonly majorVersion?: number;
  readonly signature: string;

  constructor() {
    this.bowser = Bowser.getParser(navigator.userAgent);
    this.name = this.bowser.getBrowserName().toLowerCase();
    this.version = this.bowser.getBrowserVersion();

    if (this.version && this.version?.length > 1) {
      const majorVersionPart = this.version.split('.', 1)[0];
      this.majorVersion = Number.parseInt(majorVersionPart, 10);
    } else {
      this.majorVersion = undefined;
    }

    this.signature = this.name + (this.majorVersion || '');
  }

  isSupported() {
    if (!this.majorVersion) {
      return false;
    }

    switch (this.name) {
      case Browsers.Firefox:
        return this.majorVersion >= MIN_REQUIRED_FIREFOX_VERSION;

      case Browsers.Safari:
        return this.majorVersion >= MIN_REQUIRED_SAFARI_VERSION;

      case Browsers.Opera:
      case Browsers.Chrome:
      case Browsers.MicrosoftEdge:
        return this.majorVersion >= MIN_REQUIRED_CHROME_VERSION;
    }
  }

  isSafari() {
    return this.name === Browsers.Safari;
  }

  isFirefox() {
    return this.name === Browsers.Firefox;
  }

  browserData() {
    return `name: ${this.bowser.getBrowserName()}, version: ${this.bowser.getBrowserVersion()}, os: ${this.bowser.getOSName()}-${this.bowser.getOSVersion()}`;
  }

  isBrowserConfirmed = () => {
    return this.isSupported() || localStorage.getItem('browser-confirmed') == this.signature || false;
  };

  isScreenShareSupported() {
    return navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;
  }
}
export default new BrowserSupport();
