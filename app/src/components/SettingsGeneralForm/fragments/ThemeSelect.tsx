// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem } from '@mui/material';
import { i18n } from 'i18next';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeMode } from '../../../assets/themes/opentalk/types';
import { CommonTextField } from '../../../commonComponents';

type ThemeSelectProps = {
  dashboardTheme: ThemeMode;
  onDashboardThemeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  conferenceTheme: ThemeMode;
  onConferenceThemeChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const ThemeSelect = (props: ThemeSelectProps) => {
  const { i18n } = useTranslation();

  const getCommonProps = () => ({
    select: true,
    fullWidth: true,
  });

  return (
    <>
      <CommonTextField
        {...getCommonProps()}
        label="Dashboard theme" /* TODO: Localize */
        name="dashboard-theme"
        value={props.dashboardTheme}
        onChange={props.onDashboardThemeChange}
      >
        {getThemeSelectOptions(i18n)}
      </CommonTextField>
      <CommonTextField
        {...getCommonProps()}
        label="Conference theme" /* TODO: Localize */
        name="conference-theme"
        value={props.conferenceTheme}
        onChange={props.onConferenceThemeChange}
      >
        {getThemeSelectOptions(i18n)}
      </CommonTextField>
    </>
  );
};

const getThemeSelectOptions = (i18n: i18n) => {
  return [ThemeMode.Light, ThemeMode.Dark, ThemeMode.System].map((option) => (
    <MenuItem key={option} value={option}>
      {i18n.t(`dashboard-settings-general-theme-${option}`)}
    </MenuItem>
  ));
};
