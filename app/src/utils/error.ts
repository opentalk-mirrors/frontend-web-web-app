// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  try {
    return String(err);
  } catch {
    return 'Unknown error';
  }
}
