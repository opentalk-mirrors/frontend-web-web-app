// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { type UserMe } from '@opentalk/rest-api-rtk-query';

export function useDisplayName(data: UserMe | undefined) {
  if (!data) {
    return undefined;
  }

  const localEmailPart = data.email?.split('@')[0] || '';
  const fullName = `${data.firstname || ''} ${data.lastname || ''}`.trim();
  return data.displayName || fullName || localEmailPart;
}
