// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Container, styled, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LockedIcon, LogoIcon } from '../../../assets/icons';
import { IconButton as MuiIconButton } from '../../../commonComponents';
import useNavigateToHome from '../../../hooks/useNavigateToHome';
import { LobbyCard } from '../../LobbyLayout';

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2, 2, 0),
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    zIndex: 1,
  },
}));

const LogoButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
  '& > .MuiSvgIcon-root': {
    height: theme.typography.pxToRem(32),
    width: 'auto',
    color: theme.palette.text.primary,
  },
}));

const Content = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  aspectRatio: '16/9',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 2),
    gap: theme.spacing(3),
  },
}));

const LockIcon = styled(LockedIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(40),
}));

const Heading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(46),
  lineHeight: theme.typography.pxToRem(46),
}));

const Subtext = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(22),
  maxWidth: theme.typography.pxToRem(640),
}));

interface LobbyAccessDeniedLayoutProps {
  heading: string;
  subtext: string;
  children: ReactNode;
}

const LobbyAccessDeniedLayout = ({ heading, subtext, children }: LobbyAccessDeniedLayoutProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();

  return (
    <Container>
      <LobbyCard>
        <Header>
          <LogoButton onClick={navigateToHome} aria-label={t('conference-go-home')}>
            <LogoIcon />
          </LogoButton>
        </Header>
        <Content>
          <LockIcon />
          <Heading variant="h1">{heading}</Heading>
          <Subtext>{subtext}</Subtext>
          {children}
        </Content>
      </LobbyCard>
    </Container>
  );
};

export default LobbyAccessDeniedLayout;
