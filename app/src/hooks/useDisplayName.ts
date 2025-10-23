// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserMe } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

export function useDisplayName(data: UserMe | undefined) {
  const { t } = useTranslation();

  if (!data) {
    return t('global-unknown');
  }

  const localEmailPart = data.email?.split('@')[0] || '';
  const fullName = `${data.firstname || ''} ${data.lastname || ''}`.trim();
  return data.displayName || fullName || localEmailPart || t('global-unknown');
}
