// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, IconButton as MuiIconButton, styled, Typography } from '@mui/material';
import { useAuthContext } from '@opentalk/redux-oidc';
import { useTranslation } from 'react-i18next';

import { BackIcon } from '../../../assets/icons';
import useNavigateToHome from '../../../hooks/useNavigateToHome';

interface ErrorActionButtonsProps {
  logout?: boolean;
}

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  border: 'solid',
  borderWidth: theme.typography.pxToRem(1),
  borderRadius: '100%',
  width: '2rem',
  height: '2rem',

  '& .MuiSvgIcon-root': {
    width: '1.5em',
    height: '1.5em',
  },
  '&&:hover, &&:focus': {
    background: theme.palette.secondary.light,
  },
}));

const ErrorActionButtons = ({ logout }: ErrorActionButtonsProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();
  const auth = useAuthContext();

  if (logout) {
    if (auth) {
      return (
        <Button onClick={() => auth.signOut()}>
          <Typography>{t('global-logout')}</Typography>
        </Button>
      );
    }

    return null;
  }

  return (
    <IconButton aria-label={t('global-back')} onClick={navigateToHome}>
      <BackIcon />
    </IconButton>
  );
};

export default ErrorActionButtons;
