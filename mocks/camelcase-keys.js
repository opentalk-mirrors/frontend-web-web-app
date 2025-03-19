// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Since v8 `camelcase-keys` is a pure ESM package, this mock is needed to make jest work
export default function camelcaseKeys(obj) {
  return obj;
}
