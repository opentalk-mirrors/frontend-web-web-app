// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { de, deAT, enUS, fr } from 'date-fns/locale';

import { DEFAULT_ACCESSIBILITY_URL_DE, DEFAULT_ACCESSIBILITY_URL_EN, getAccessibilityUrl } from './apiUtils';

describe('api utils', () => {
  describe('getAccessibilityUrl', () => {
    it.each([
      [de, DEFAULT_ACCESSIBILITY_URL_DE],
      [deAT, DEFAULT_ACCESSIBILITY_URL_DE],
      [enUS, DEFAULT_ACCESSIBILITY_URL_EN],
      [fr, DEFAULT_ACCESSIBILITY_URL_EN],
      [undefined, DEFAULT_ACCESSIBILITY_URL_EN],
    ])('uses the default for locale %j', (locale, expectedUrl) => {
      expect(getAccessibilityUrl(locale)).toBe(expectedUrl);
      expect(getAccessibilityUrl(locale, { accessibilityUrlEn: '', accessibilityUrlDe: '' })).toBe(expectedUrl);
    });

    it.each([
      [de, 'https://example.com/accessibility/de'],
      [deAT, 'https://example.com/accessibility/de'],
      [enUS, 'https://example.com/accessibility/en'],
      [fr, 'https://example.com/accessibility/en'],
      [undefined, 'https://example.com/accessibility/en'],
    ])('uses the configured URL for locale %j', (locale, expectedUrl) => {
      expect(
        getAccessibilityUrl(locale, {
          accessibilityUrlEn: 'https://example.com/accessibility/en',
          accessibilityUrlDe: 'https://example.com/accessibility/de',
        })
      ).toBe(expectedUrl);
    });

    it('uses an English-only override and keeps the German default', () => {
      const overrides = { accessibilityUrlEn: 'https://example.com/accessibility/en' };

      expect(getAccessibilityUrl(enUS, overrides)).toBe(overrides.accessibilityUrlEn);
      expect(getAccessibilityUrl(de, overrides)).toBe(DEFAULT_ACCESSIBILITY_URL_DE);
    });

    it('uses a German-only override and keeps the English default', () => {
      const overrides = { accessibilityUrlDe: 'https://example.com/accessibility/de' };

      expect(getAccessibilityUrl(de, overrides)).toBe(overrides.accessibilityUrlDe);
      expect(getAccessibilityUrl(enUS, overrides)).toBe(DEFAULT_ACCESSIBILITY_URL_EN);
    });
  });
});
