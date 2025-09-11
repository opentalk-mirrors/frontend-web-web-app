// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container as MuiContainer, styled, IconButton as MuiIconButton } from '@mui/material';
import { ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, WarningIcon as DefaultWarningIcon } from '../../assets/icons';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import LobbyTemplate from '../../templates/LobbyTemplate';
import DiagnosticDetails from './fragments/DiagnosticDetails';
import ErrorText from './fragments/ErrorText';

const Container = styled(MuiContainer)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  color: theme.palette.common.white,
}));

const WarningIcon = styled(DefaultWarningIcon)(({ theme }) => ({
  fill: theme.palette.common.white,
  width: '6rem',
  height: '6rem',
}));

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

interface ErrorProps {
  title: string;
  description?: string;
  /**
   * Pass to add diagnostics
   */
  error?: Error;
  errorInfo?: ErrorInfo;
  /**
   * Set true for blurred background and warning icon
   */
  isCrashError?: boolean;
}

const Error = ({ title, description, error, errorInfo, isCrashError }: ErrorProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();

  return (
    //Explicitly provide theme and css baseline
    //Potentially should be hoisted up to a root level
    <LobbyTemplate blur={isCrashError}>
      <Container>
        {isCrashError && <WarningIcon />}

        <ErrorText title={title} description={description} />

        {error && <DiagnosticDetails error={error} errorInfo={errorInfo} />}

        <IconButton aria-label={t('global-back')} onClick={navigateToHome}>
          <BackIcon />
        </IconButton>
      </Container>
    </LobbyTemplate>
  );
};

export default Error;
