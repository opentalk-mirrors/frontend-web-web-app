// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export function sortByDisplayName<T extends { displayName?: string }>(array: Array<T>): Array<T> {
  return [...array].sort((a, b) => {
    const nameA = (a.displayName || '').toString().toLowerCase();
    const nameB = (b.displayName || '').toString().toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}
