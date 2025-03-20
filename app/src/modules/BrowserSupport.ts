// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Browser support helpers partially taken from @jitsi/js-utils
//! Mostly removed support for Electron and NW.js and limited to our current feature target
import Bowser from 'bowser';

const MIN_REQUIRED_CHROME_VERSION = 90;
const MIN_REQUIRED_FIREFOX_VERSION = 91;
const MIN_REQUIRED_SAFARI_VERSION = 14;
enum Browsers {
  Firefox = 'firefox',
  Chrome = 'chrome',
  Safari = 'safari',
  Opera = 'opera',
  MicrosoftEdge = 'Microsoft Edge',
}

export class BrowserSupport {
  private _bowser: Bowser.Parser.Parser;

  private _name: string;
  private _version: string;

  constructor() {
    this._bowser = Bowser.getParser(navigator.userAgent);

    this._name = this._bowser.getBrowserName();
    this._version = this._bowser.getBrowserVersion();
  }

  getBrowserSignature() {
    return this._name.toLowerCase() + this._version.toLowerCase();
  }

  isSupported() {
    return (
      (this.isChromiumBased() && this._getChromiumBasedVersion() >= MIN_REQUIRED_CHROME_VERSION) ||
      (this.isFirefox() && this._getFirefoxBasedVersion() >= MIN_REQUIRED_FIREFOX_VERSION) ||
      (this.isSafari() && this._getSafariVersion() >= MIN_REQUIRED_SAFARI_VERSION)
    );
  }

  isFirefox() {
    return this._name.toLowerCase() === Browsers.Firefox.toLowerCase();
  }

  isSafari() {
    return this._name.toLowerCase() === Browsers.Safari.toLowerCase();
  }

  isChrome() {
    return this._name.toLowerCase() === Browsers.Chrome.toLowerCase();
  }

  isOpera() {
    return this._name.toLowerCase() === Browsers.Opera.toLowerCase();
  }

  isMicrosoftEdge() {
    return this._name.toLowerCase() === Browsers.MicrosoftEdge.toLowerCase();
  }

  isChromiumBased() {
    return this.isChrome() || this.isOpera() || this.isMicrosoftEdge();
  }

  browserData() {
    return `name: ${this._name}, version: ${this._version}`;
  }

  isBrowserConfirmed = () => {
    const signature = this.getBrowserSignature();
    return this.isSupported() || localStorage.getItem('browser-confirmed') == signature || false;
  };

  isWebKitBased() {
    // https://trac.webkit.org/changeset/236144/webkit/trunk/LayoutTests/webrtc/video-addLegacyTransceiver.html
    return (
      this._bowser.getEngineName() === 'webkit' &&
      Object.keys(RTCRtpTransceiver.prototype).indexOf('currentDirection') > -1
    );
  }

  isScreenShareSupported() {
    return navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;
  }

  _getSafariVersion() {
    if (this.isSafari()) {
      const ua = navigator.userAgent;
      const match = ua.match(/Version\/([\d.]+)/);
      if (match && match[1]) {
        const version = Number.parseInt(match[1], 10);

        return version;
      }
    }

    return -1;
  }

  _getFirefoxBasedVersion() {
    if (this.isFirefox()) {
      const ua = navigator.userAgent;
      const match = ua.match(/(Firefox)\/([\d.]+)/);
      if (match && match[1]) {
        const version = Number.parseInt(match[2], 10);

        return version;
      }
    }

    return -1;
  }

  _getChromiumBasedVersion() {
    if (this.isChromiumBased()) {
      // Here we process all browsers which use the Chrome engine but
      // don't necessarily identify as Chrome. We cannot use the version
      // comparing functions because the Opera versions are inconsequential here, as we need to know the actual
      // Chrome engine version.
      const ua = navigator.userAgent;
      const match = ua.match(/(Chrome|CriOS)\/([\d.]+)/);
      if (match && match[1]) {
        const version = Number.parseInt(match[2], 10);

        return version;
      }
    }

    return -1;
  }
}

export default new BrowserSupport();
