// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container, Stack, Typography, styled, useTheme } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import Color from 'colorjs.io';
import { truncate } from 'lodash';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetRoomEventInfoQuery } from '../../api/rest';
import { BackIcon, LogoIcon } from '../../assets/icons';
import arrowImage from '../../assets/images/arrow-illustration.png';
import { CircularIconButton, IconButton as MuiIconButton } from '../../commonComponents';
import { CircularIconButtonStyles } from '../../commonComponents/IconButtons/CircularIconButton';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import { useIsMobile } from '../../hooks/useMediaQuery';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { selectConfigFeatures, selectSpeedTestConfig } from '../../store/slices/configSlice';
import { selectLobbyAudioTrack, selectLobbyVideoEnabled } from '../../store/slices/livekitSlice';
import { BreakoutRoomId } from '../../types';
import MyMeetingMenu from '../MeetingHeader/fragments/MyMeetingMenu';
import SpeedTestDialog from '../SpeedTestDialog';
import EchoPlayBack from './fragments/EchoPlayback';
import ToolbarContainer from './fragments/ToolbarContainer';
import VideoElement from './fragments/VideoElement';

const InnerContainer = styled('div')(({ theme }) => {
  const background = new Color(theme.palette.background.customPaper.primary);
  background.alpha = 0.5;

  return {
    position: 'relative',
    padding: 0,
    width: '100%',
    maxWidth: '1200px',

    //The blur should be part of the theme and handled globally
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)',
    backgroundImage: `url(${arrowImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '77% 67%',
    backgroundColor: background.toString({ format: 'rgba' }),
    color: theme.palette.background.customPaper.contrastText,
    backgroundSize: '10rem',
    '& .MuiButtonBase-root.Mui-focusVisible': {
      outline: theme.palette.focus.outline,
    },
  };
});

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

interface SelftestProps {
  children: ReactNode;
  actionButton?: ReactNode;
  waitingRoom?: boolean;
}

const SelfTest = ({ children, actionButton, waitingRoom }: SelftestProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigateToHome = useNavigateToHome();
  const inviteCode = useInviteCode();
  const isMobile = useIsMobile();
  const localAudioTrack = useAppSelector(selectLobbyAudioTrack);
  const { joinWithoutMedia } = useAppSelector(selectConfigFeatures);
  const videoEnabled = useAppSelector(selectLobbyVideoEnabled);
  const config = useAppSelector(selectSpeedTestConfig);

  const { roomId } = useParams<'roomId' | 'breakoutRoomId'>() as {
    roomId: RoomId;
    breakoutRoomId?: BreakoutRoomId;
  };
  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  return (
    <Container data-testid="selfTest">
      <InnerContainer>
        <Header>
          <IconButton onClick={navigateToHome} aria-label={t('conference-go-home')}>
            <LogoIcon />
          </IconButton>
          <UtilitiesContainer>
            {config.ndtServer && <SpeedTestDialog />}
            {!isMobile && <MyMeetingMenu />}
          </UtilitiesContainer>
        </Header>

        <MonitorContainer>
          {videoEnabled ? (
            <VideoElement />
          ) : (
            <>
              {roomData?.title && (
                <Typography variant="h2" textAlign="center" marginBottom={theme.spacing(5)} component="h1">
                  {t('joinform-room-title', { title: truncate(roomData?.title, { length: 50 }) })}
                </Typography>
              )}
              <Typography
                variant="h1"
                textAlign="center"
                fontSize="2.9rem"
                lineHeight="2.9rem"
                mb={2}
                component="h2"
                lang="en"
              >
                {t('selftest-header')}
              </Typography>
              <Typography textAlign="center" fontSize="1.37rem" padding="0 0.5rem">
                {joinWithoutMedia ? t('selftest-body-do-test') : t('selftest-body')}
              </Typography>
            </>
          )}
          {localAudioTrack && <EchoPlayBack localAudioTrack={localAudioTrack} />}
        </MonitorContainer>

        <ToolbarContainer localAudioTrack={localAudioTrack} actionButton={actionButton} waitingRoom={waitingRoom}>
          {children}
        </ToolbarContainer>

        {isMobile && (
          <MobileBackButton aria-label={t('global-back')} onClick={navigateToHome}>
            <BackIcon />
          </MobileBackButton>
        )}
      </InnerContainer>
    </Container>
  );
};

export default SelfTest;
