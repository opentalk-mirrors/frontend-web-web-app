// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export const cleanPackageVersion = (version: string) => {
  const regex = /[^\d]*(\d+\.\d+\.\d+)/;
  const match = version.match(regex);
  return match ? match[1] : null;
};
