// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import LegalContainer from '../components/LegalContainer';
import BrowserCompatibilityInfo from './fragments/BrowserCompatibilityInfo';

const Container = styled('div', { shouldForwardProp: (prop) => prop !== 'withBlur' })<{ withBlur?: boolean }>(
  ({ withBlur }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backdropFilter: withBlur ? 'blur(100px)' : '',
    WebkitBackdropFilter: withBlur ? 'blur(100px)' : '',
    backgroundColor: withBlur ? `rgba(0, 22, 35, 0.5)` : '',
    overflow: 'auto',
  })
);

interface TemplateProps {
  children?: ReactNode;
  blur?: boolean;
  legal?: boolean;
}

const LobbyTemplate = ({ children, blur, legal }: TemplateProps) => {
  return (
    <BrowserCompatibilityInfo>
      <Container withBlur={blur}>
        {children ? children : <Outlet />}
        {legal && <LegalContainer />}
      </Container>
    </BrowserCompatibilityInfo>
  );
};

export default LobbyTemplate;
