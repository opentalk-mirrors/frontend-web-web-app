// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, IconButton as MuiIconButton, styled, Typography } from '@mui/material';
import { getSavedLocation, useAuthContext } from '@opentalk/redux-oidc';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { BackIcon } from '../../../assets/icons';
import useNavigateToHome from '../../../hooks/useNavigateToHome';

interface ErrorActionButtonsProps {
  logout?: boolean;
  retry?: boolean;
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

const SECONDS_UNTIL_RETRY = 3;

const ErrorActionButtons = ({ logout, retry }: ErrorActionButtonsProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();
  const navigate = useNavigate();
  const auth = useAuthContext();
  const [secondsLeft, setSecondsLeft] = useState<number>(SECONDS_UNTIL_RETRY);

  const enableRetry = secondsLeft === 0;

  useEffect(() => {
    if (retry) {
      if (enableRetry) {
        return;
      }
      const timer = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retry, secondsLeft, enableRetry]);

  const handleRetryClick = () => {
    const lastKnownLocation = getSavedLocation();
    if (lastKnownLocation) {
      navigate(lastKnownLocation);
    } else {
      navigateToHome();
    }
  };

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

  if (retry) {
    return (
      <Button onClick={handleRetryClick} disabled={!enableRetry}>
        {enableRetry ? (
          <Typography>{t('global-retry')}</Typography>
        ) : (
          <Typography>{t('retry-available-in', { seconds: secondsLeft })}</Typography>
        )}
      </Button>
    );
  }

  return (
    <IconButton aria-label={t('global-back')} onClick={navigateToHome}>
      <BackIcon />
    </IconButton>
  );
};

export default ErrorActionButtons;
