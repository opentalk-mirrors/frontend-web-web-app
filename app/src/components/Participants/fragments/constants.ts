// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SortItem, SortOption } from '../../../types';

export const items: SortItem[] = [
  {
    type: SortOption.NameASC,
    i18nKey: 'sort-name-asc',
  },
  {
    type: SortOption.NameDESC,
    i18nKey: 'sort-name-dsc',
  },
  {
    type: SortOption.FirstJoin,
    i18nKey: 'sort-first-join',
  },
  {
    type: SortOption.LastJoin,
    i18nKey: 'sort-last-join',
  },
  {
    type: SortOption.LastActive,
    i18nKey: 'sort-last-active',
  },
  {
    type: SortOption.RaisedHandFirst,
    i18nKey: 'sort-raised-hand',
  },
];
