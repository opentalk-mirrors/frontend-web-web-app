// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Since v8 `snakecase-keys` is a pure ESM package, this mock is needed to make jest work
export default function snakeCaseKeys(obj) {
  const toSnake = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [toSnake(key), value]));
}
