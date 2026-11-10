// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LobbyAccessDeniedLayout from './LobbyAccessDeniedLayout';

interface LobbyAccessDeniedNotInvitedProps {
  displayName?: string;
  onSwitchAccount: () => void;
}

const LobbyAccessDeniedNotInvited = ({ displayName, onSwitchAccount }: LobbyAccessDeniedNotInvitedProps) => {
  const { t } = useTranslation();

  return (
    <LobbyAccessDeniedLayout heading={t('lobby-no-access-heading')} subtext={t('lobby-no-access-subtext')}>
      {displayName && <Typography variant="body2">{t('lobby-signed-in-as', { name: displayName })}</Typography>}
      <Button variant="outlined" color="secondary" onClick={onSwitchAccount}>
        {t('lobby-switch-account')}
      </Button>
    </LobbyAccessDeniedLayout>
  );
};

export default LobbyAccessDeniedNotInvited;
