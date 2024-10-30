// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container, Stack, Tooltip, Typography, styled, useMediaQuery, useTheme } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { LocalAudioTrack } from 'livekit-client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetRoomEventInfoQuery } from '../../api/rest';
import { BackIcon, CloseIcon, HelpIcon, Logo } from '../../assets/icons';
import arrowImage from '../../assets/images/arrow-illustration.png';
import { CircularIconButton } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { useMediaChoices } from '../../provider/MediaChoicesProvider';
import { selectFeatures } from '../../store/slices/configSlice';
import { BreakoutRoomId } from '../../types';
import QuickStartPopover from '../QuickStartPopover';
import SpeedTestDialog from '../SpeedTestDialog';
import EchoPlayBack from './fragments/EchoPlayback';
import ToolbarContainer from './fragments/ToolbarContainer';
import VideoElement from './fragments/VideoElement';

const InnerContainer = styled('div')(() => ({
  position: 'relative',
  padding: 0,
  width: '100%',
  maxWidth: '1200px',

  //The blur should be part of the theme and handled globally
  backdropFilter: 'blur(100px)',
  WebkitBackdropFilter: 'blur(100px)',
  background: `rgba(0, 22, 35, 0.5) url(${arrowImage}) no-repeat 77% 67%`,
  backgroundSize: '10rem',
}));

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
}));

//Upscale and add margin to help icon, since the svg is just smaller than others and is offcenter.
//Should move into icon definition if it is also required elsewhere.
const AdjustedHelpIcon = styled(HelpIcon)(({ theme }) => ({
  transform: 'scale(1.3)',
  marginLeft: theme.typography.pxToRem(2),
}));

const MOBILE_BACK_BUTTON_Z_INDEX = 1;

const MobileBackButton = styled(CircularIconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: MOBILE_BACK_BUTTON_Z_INDEX,
  bottom: theme.spacing(2),
  left: theme.spacing(2),
}));

const MonitorContainer = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '16/9',

  '& h1, p': {
    color: theme.palette.secondary.contrastText,
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
  const mediaChoices = useMediaChoices();
  const navigateToHome = useNavigateToHome();
  const inviteCode = useInviteCode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | undefined>();
  const [mounted, setMounted] = useState(false);
  const { joinWithoutMedia } = useAppSelector(selectFeatures);

  useEffect(() => {
    !mounted && setMounted(true);
  });

  const { roomId } = useParams<'roomId' | 'breakoutRoomId'>() as {
    roomId: RoomId;
    breakoutRoomId?: BreakoutRoomId;
  };
  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  const [isQuickStartPopoverOpen, setIsQuickStartPopoverOpen] = useState(false);
  const anchorElement = useRef<HTMLButtonElement>(null);

  return (
    <Container>
      <InnerContainer>
        <Header>
          <Logo onClick={navigateToHome} />
          <UtilitiesContainer>
            <SpeedTestDialog />
            {!isMobile && (
              <Tooltip title={t('conference-quick-start-open')}>
                <CircularIconButton
                  ref={anchorElement}
                  onClick={() => setIsQuickStartPopoverOpen((value) => !value)}
                  aria-label={
                    isQuickStartPopoverOpen ? t('conference-quick-start-close') : t('conference-quick-start-open')
                  }
                >
                  {isQuickStartPopoverOpen ? <CloseIcon /> : <AdjustedHelpIcon />}
                </CircularIconButton>
              </Tooltip>
            )}
          </UtilitiesContainer>
        </Header>

        <MonitorContainer>
          {mounted && mediaChoices?.userChoices.videoEnabled ? (
            <VideoElement />
          ) : (
            <>
              {roomData?.title && (
                <Typography
                  variant="h2"
                  textAlign="center"
                  color={theme.palette.common.white}
                  marginBottom={theme.spacing(5)}
                  component="h1"
                >
                  {t('joinform-room-title', { title: roomData?.title })}
                </Typography>
              )}
              <Typography
                variant="h1"
                textAlign="center"
                fontSize="2.9rem"
                lineHeight="2.9rem"
                mb={2}
                component="h2"
                color={theme.palette.common.white}
                lang="en"
              >
                {t('selftest-header')}
              </Typography>
              <Typography textAlign="center" fontSize="1.37rem" padding="0 0.5rem">
                {joinWithoutMedia ? t('selftest-body-do-test') : t('selftest-body')}
              </Typography>
            </>
          )}
          {mounted && mediaChoices?.userChoices.audioEnabled && (
            <EchoPlayBack localAudioTrack={localAudioTrack} setLocalAudioTrack={setLocalAudioTrack} />
          )}
        </MonitorContainer>

        <ToolbarContainer localAudioTrack={localAudioTrack} actionButton={actionButton} waitingRoom={waitingRoom}>
          {children}
        </ToolbarContainer>

        {isMobile && (
          <MobileBackButton aria-label={t('global-back')} onClick={navigateToHome}>
            <BackIcon />
          </MobileBackButton>
        )}

        <QuickStartPopover
          open={isQuickStartPopoverOpen}
          anchorEl={anchorElement.current}
          onClose={() => setIsQuickStartPopoverOpen(false)}
          variant="lobby"
        />
      </InnerContainer>
    </Container>
  );
};

export default SelfTest;
