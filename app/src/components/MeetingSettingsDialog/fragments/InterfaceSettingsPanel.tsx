// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// V2-CLEANUP: entire file is part of the v1/v2 transition - delete when v2 is the default
import { FormControlLabel, Stack, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CommonSwitch } from '../../../commonComponents';
import { ConferenceUiVersion } from '../../../config/uiVersion';
import { useConferenceUiVersion } from '../../../hooks';

const Container = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const InterfaceSettingsPanel = () => {
  const { t } = useTranslation();
  const { isV2, setPreferredVersion } = useConferenceUiVersion();

  return (
    <Container>
      <Typography variant="h2">{t('interface-panel-title')}</Typography>
      <FormControlLabel
        control={
          <CommonSwitch
            checked={isV2}
            onChange={(_, checked) => setPreferredVersion(checked ? ConferenceUiVersion.V2 : ConferenceUiVersion.V1)}
          />
        }
        label={t('interface-settings-new-ui-label')}
      />
      <Typography variant="body2">{t('interface-settings-new-ui-description')}</Typography>
    </Container>
  );
};

export default InterfaceSettingsPanel;
