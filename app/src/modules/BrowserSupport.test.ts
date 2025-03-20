// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserSupport } from './BrowserSupport';

describe('BrowserSupport', () => {
  test('should return correct browser signature', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91 Safari/537.36',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.getBrowserSignature()).toBe('chrome91');
  });

  test('should detect supported Chrome version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(true);
  });

  test('should detect unsupported Chrome version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4472.124 Safari/537.36',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(false);
  });

  test('should detect supported Firefox version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/91.0.1',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(true);
  });

  test('should detect unsupported Firefox version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/90.0.1',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(false);
  });

  test('should detect supported Safari version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/14.0.2 Safari/601.3.9',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(true);
  });

  test('should detect unsupported Safari version', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/13.0.2 Safari/601.3.9',
      configurable: true,
    });

    const browserSupport = new BrowserSupport();
    expect(browserSupport.isSupported()).toBe(false);
  });
});
