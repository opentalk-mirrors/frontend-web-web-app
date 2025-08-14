// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export function insertItem<T>(array: T[] | undefined, action: T): T[] {
  const newArray = array ? array.slice() : [];
  newArray.splice(0, 0, action);
  return newArray;
}

export function removeItem<T>(array: T[] | undefined, action: T): T[] {
  const newArray = array ? array.filter((value) => value !== action) : [];
  return newArray;
}
