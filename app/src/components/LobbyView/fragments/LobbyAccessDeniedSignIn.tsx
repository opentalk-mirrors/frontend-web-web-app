// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LobbyAccessDeniedLayout from './LobbyAccessDeniedLayout';

interface LobbyAccessDeniedSignInProps {
  onSignIn: () => void;
}

const LobbyAccessDeniedSignIn = ({ onSignIn }: LobbyAccessDeniedSignInProps) => {
  const { t } = useTranslation();

  return (
    <LobbyAccessDeniedLayout
      heading={t('lobby-sign-in-required-heading')}
      subtext={t('lobby-sign-in-required-subtext')}
    >
      <Button color="secondary" onClick={onSignIn}>
        {t('dashboard-sign-in')}
      </Button>
    </LobbyAccessDeniedLayout>
  );
};

export default LobbyAccessDeniedSignIn;
