// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MAX_CHARACTERS_ALIAS } from '../constants';

const TRANSLITERATIONS: Array<[RegExp, string]> = [
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ß/g, 'ss'],
];

export const slugifyRoomName = (title: string, maxLength: number = MAX_CHARACTERS_ALIAS): string => {
  const transliterated = TRANSLITERATIONS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    title.toLowerCase()
  );

  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
};
