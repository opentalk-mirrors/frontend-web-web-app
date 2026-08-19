// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { slugifyRoomName } from './slugifyRoomName';

describe('slugifyRoomName', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifyRoomName('Weekly Sync')).toBe('weekly-sync');
  });

  it('transliterates German umlauts and sharp s', () => {
    expect(slugifyRoomName('Wöchentliches Meeting')).toBe('woechentliches-meeting');
    expect(slugifyRoomName('Straße')).toBe('strasse');
    expect(slugifyRoomName('Über Größe')).toBe('ueber-groesse');
  });

  it('strips unsupported characters', () => {
    expect(slugifyRoomName('Q3 Review! @Team #1')).toBe('q3-review-team-1');
  });

  it('collapses repeated separators and trims leading and trailing hyphens', () => {
    expect(slugifyRoomName('  ...Hello---World...  ')).toBe('hello-world');
  });

  it('caps the result to the maximum length without a trailing hyphen', () => {
    const result = slugifyRoomName('a'.repeat(39) + ' b', 40);
    expect(result).toBe('a'.repeat(39));
    expect(result.endsWith('-')).toBe(false);
  });

  it('returns an empty string when nothing usable remains', () => {
    expect(slugifyRoomName('!!!')).toBe('');
    expect(slugifyRoomName('')).toBe('');
  });
});
