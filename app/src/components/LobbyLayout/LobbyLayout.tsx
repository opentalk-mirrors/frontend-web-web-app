// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container, Stack, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, LogoIcon } from '../../assets/icons';
import { CircularIconButton, IconButton as MuiIconButton } from '../../commonComponents';
import { CircularIconButtonStyles } from '../../commonComponents/IconButtons/CircularIconButton';
import { useAppSelector } from '../../hooks';
import { useIsMobile } from '../../hooks/useMediaQuery';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { selectSpeedTestConfig } from '../../store/slices/configSlice';
import MyMeetingMenu from '../MeetingHeader/fragments/MyMeetingMenu';
import SpeedTestDialog from '../SpeedTestDialog';
import LobbyCard from './LobbyCard';

const Header = styled('header')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2, 0),

  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
}));

const UtilitiesContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1),
  '& div:has(#my-meeting-menu-button)': {
    backgroundColor: 'transparent',
    alignSelf: 'start',
  },
  '& #my-meeting-menu-button': {
    ...CircularIconButtonStyles(theme),
    '& .MuiSvgIcon-root': {
      fontSize: '1em',
      transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
    '&:hover, &:focus, &[aria-expanded="true"]': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const MOBILE_BACK_BUTTON_Z_INDEX = 1;

const MobileBackButton = styled(CircularIconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: MOBILE_BACK_BUTTON_Z_INDEX,
  bottom: theme.spacing(2),
  left: theme.spacing(2),
}));

const MonitorContainer = styled('main')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '16/9',
}));

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
  '& > .MuiSvgIcon-root': {
    height: '2rem',
    width: 'auto',
    color: theme.palette.text.primary,
  },
}));

interface LobbyLayoutProps {
  center: ReactNode;
  bottom: ReactNode;
}

const LobbyLayout = ({ center, bottom }: LobbyLayoutProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();
  const isMobile = useIsMobile();
  const config = useAppSelector(selectSpeedTestConfig);

  return (
    <Container>
      <LobbyCard>
        <Header>
          <IconButton onClick={navigateToHome} aria-label={t('conference-go-home')}>
            <LogoIcon />
          </IconButton>
          <UtilitiesContainer>
            {config.ndtServer && <SpeedTestDialog />}
            {!isMobile && <MyMeetingMenu />}
          </UtilitiesContainer>
        </Header>

        <MonitorContainer>{center}</MonitorContainer>

        {bottom}

        {isMobile && (
          <MobileBackButton aria-label={t('global-back')} onClick={navigateToHome}>
            <BackIcon />
          </MobileBackButton>
        )}
      </LobbyCard>
    </Container>
  );
};

export default LobbyLayout;
