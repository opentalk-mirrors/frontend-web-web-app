// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container as MuiContainer, styled } from '@mui/material';
import { ErrorInfo } from 'react';

import { WarningIcon as DefaultWarningIcon } from '../../assets/icons';
import LobbyTemplate from '../../templates/LobbyTemplate';
import DiagnosticDetails from './fragments/DiagnosticDetails';
import ErrorActionButtons from './fragments/ErrorActionButtons';
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
  /**
   * Changes action buttons to suit logout error page
   */
  logout?: boolean;
}

const Error = ({ title, description, error, errorInfo, isCrashError, logout }: ErrorProps) => {
  return (
    //Explicitly provide theme and css baseline
    //Potentially should be hoisted up to a root level
    <LobbyTemplate blur={isCrashError}>
      <Container>
        {isCrashError && <WarningIcon />}

        <ErrorText title={title} description={description} />

        {error && <DiagnosticDetails error={error} errorInfo={errorInfo} />}

        <ErrorActionButtons logout={logout} />
      </Container>
    </LobbyTemplate>
  );
};

export default Error;
