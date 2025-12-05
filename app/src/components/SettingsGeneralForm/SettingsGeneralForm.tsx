// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, Grid, Divider } from '@mui/material';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateMeMutation } from '../../api/rest';
import { ThemeMode } from '../../assets/themes/opentalk/types';
import { notifications } from '../../commonComponents';
import { DashboardLanguage } from '../../config/dashboardSettings';
import { getBroadcastChannel } from '../../modules/BroadcastChannel';
import { LanguageSelect } from './fragments/LanguageSelect';
import { SaveButton } from './fragments/SaveButton';
import { ThemeSelect } from './fragments/ThemeSelect';

const DEFAULT_DASHBOARD_LANGUAGE: DashboardLanguage = 'de-DE';
const DEFAULT_DASHBOARD_THEME: ThemeMode = ThemeMode.Light;
const DEFAULT_CONFERENCE_THEME: ThemeMode = ThemeMode.Dark;

type SettingsGeneralFormProps = {
  dashboardTheme?: ThemeMode;
  conferenceTheme?: ThemeMode;
};

const getDashboardLanguageFrom = (resolvedLanguage?: string): DashboardLanguage => {
  const resolvedLanguagePrefix = resolvedLanguage?.substring(0, 2) || '';
  const normalizationMap = new Map<string, DashboardLanguage>([
    ['en', 'en-US'],
    ['de', 'de-DE'],
  ]);
  return normalizationMap.get(resolvedLanguagePrefix) || DEFAULT_DASHBOARD_LANGUAGE;
};

export const SettingsGeneralForm = (props: SettingsGeneralFormProps) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState(getDashboardLanguageFrom(i18n.resolvedLanguage));
  const [dashboardTheme, setDashboardTheme] = useState<ThemeMode>(props.dashboardTheme || DEFAULT_DASHBOARD_THEME);
  const [conferenceTheme, setConferenceTheme] = useState<ThemeMode>(props.conferenceTheme || DEFAULT_CONFERENCE_THEME);
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const changeLanguage = (event: ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as DashboardLanguage);
  };

  const changeDashboardTheme = (event: ChangeEvent<HTMLInputElement>) => {
    setDashboardTheme(event.target.value as ThemeMode);
  };

  const changeConferenceTheme = (event: ChangeEvent<HTMLInputElement>) => {
    setConferenceTheme(event.target.value as ThemeMode);
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const me = await updateMe({ language, dashboardTheme, conferenceTheme }).unwrap();
      const channel = getBroadcastChannel('settings_general');
      channel?.postMessage({
        type: 'sync',
        language: me.language,
        dashboardTheme: me.dashboardTheme,
        conferenceTheme: me.conferenceTheme,
      });
      await i18n.changeLanguage(me.language, (_err, t) =>
        notifications.success(t('dashboard-settings-general-notification-save-success'))
      );
    } catch (_err) {
      notifications.error(t('error-general'));
      return;
    }
  };

  useEffect(() => {
    const channel = getBroadcastChannel('settings_general');
    const listener = (event: MessageEvent) => {
      if (event.data.type === 'sync') {
        if (event.data.language) {
          setLanguage(getDashboardLanguageFrom(event.data.language));
        }
        if (event.data.dashboardTheme) {
          setDashboardTheme(event.data.dashboardTheme);
        }
        if (event.data.conferenceTheme) {
          setConferenceTheme(event.data.conferenceTheme);
        }
      }
    };
    if (channel) {
      channel.addEventListener('message', listener);
      return function cleanup() {
        channel.removeEventListener('message', listener);
      };
    }
  }, []);

  return (
    <Grid
      component="form"
      name="settings-general-form"
      container
      spacing={2}
      paddingBottom={0.5}
      paddingLeft={0.5}
      onSubmit={submitForm}
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="h1" component="h3">
          {t('dashboard-settings-general-language')}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <LanguageSelect value={language} onChange={changeLanguage} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h1" component="h3">
          {t('dashboard-settings-general-appearance')}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }} display="flex" gap={1} paddingTop={1}>
        <ThemeSelect
          dashboardTheme={dashboardTheme}
          onDashboardThemeChange={changeDashboardTheme}
          conferenceTheme={conferenceTheme}
          onConferenceThemeChange={changeConferenceTheme}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider />
        <SaveButton loading={isLoading} />
      </Grid>
    </Grid>
  );
};
