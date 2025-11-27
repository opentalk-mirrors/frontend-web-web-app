// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '../../../api/rest';
import { ThemeMode } from '../../../assets/themes/opentalk/types';
import { VisuallyHiddenTitle } from '../../../commonComponents';
import SettingsGeneralForm from '../../../components/SettingsGeneralForm';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';

const SettingsGeneralPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetMeQuery();

  const pageHeading = t('dashboard-settings-general-title');

  useUpdateDocumentTitle(pageHeading);

  return (
    <>
      <VisuallyHiddenTitle label={pageHeading} component="h2" />
      {data && !isLoading && (
        <SettingsGeneralForm
          dashboardTheme={data.dashboardTheme as ThemeMode}
          conferenceTheme={data.conferenceTheme as ThemeMode}
        />
      )}
    </>
  );
};

export default SettingsGeneralPage;
