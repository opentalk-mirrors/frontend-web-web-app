// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React, { ErrorInfo, ReactNode } from 'react';

import log from '../logger';
import AppErrorPage from './fragments';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class AppErrorBoundary extends React.Component<Props, State> {
  errorInfo?: ErrorInfo = undefined;

  public override state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorInfo = errorInfo;
    log.error('AppErrorBoundary:', error, errorInfo);
    this.setState(() => {
      return { error: error, errorInfo: errorInfo };
    });
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      return <AppErrorPage error={this.state.error} errorInfo={this.errorInfo} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
