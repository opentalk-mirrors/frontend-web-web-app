// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem } from '@mui/material';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { DashboardLanguage, dashboardLanguages } from '../../../config/dashboardSettings';

type LanguageSelectProps = {
  value: DashboardLanguage;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const LanguageSelect = (props: LanguageSelectProps) => {
  const { t } = useTranslation();

  return (
    <CommonTextField
      select
      fullWidth
      hideLabel
      label={t('dashboard-settings-general-language')}
      name="language"
      onChange={props.onChange}
      value={props.value}
    >
      {Object.entries(dashboardLanguages).map(([key, label]) => (
        <MenuItem key={key} value={key}>
          {label}
        </MenuItem>
      ))}
    </CommonTextField>
  );
};
