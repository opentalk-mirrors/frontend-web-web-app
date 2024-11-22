// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { VisuallyHiddenTitle } from '../../commonComponents';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';

export const SupportPage = () => {
  const { t } = useTranslation();
  const pageHeading = t('dashboard-help-support');

  useUpdateDocumentTitle(pageHeading);

  return <VisuallyHiddenTitle component="h2" label={pageHeading} />;
};
