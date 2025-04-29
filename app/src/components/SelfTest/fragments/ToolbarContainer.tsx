// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled, useMediaQuery, useTheme } from '@mui/material';
import { LocalAudioTrack } from 'livekit-client';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon } from '../../../assets/icons';
import { CircularIconButton as CircularIconButtonDefault } from '../../../commonComponents';
import useNavigateToHome from '../../../hooks/useNavigateToHome';
import { isBackgroundEffectSupported } from '../../../utils/mediaUtils';
import AudioButton from '../../Toolbar/fragments/AudioButton';
import BlurScreenButton from '../../Toolbar/fragments/BlurScreenButton';
import VideoButton from '../../Toolbar/fragments/VideoButton';

const BOTTOM_CONTAINER_Z_INDEX = 1;

const Container = styled('nav')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  bottom: 0,
  left: 0,
  position: 'relative',
  zIndex: BOTTOM_CONTAINER_Z_INDEX,
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    height: theme.typography.pxToRem(112),
  },
}));

const CircularIconButton = styled(CircularIconButtonDefault)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginRight: 'auto !important',
    marginTop: `${theme.typography.pxToRem(10)} !important`,
  },
}));

const ButtonStack = styled(Stack, { shouldForwardProp: (prop) => prop !== 'waitingRoom' })<{ waitingRoom?: boolean }>(
  ({ theme, waitingRoom }) => ({
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      marginTop: `${theme.typography.pxToRem(4)} !important`,
      marginRight: waitingRoom && 'auto !important',
    },
  })
);

interface ToolbarContainerProps {
  children: ReactNode;
  actionButton: ReactNode;
  localAudioTrack?: LocalAudioTrack;
  waitingRoom?: boolean;
}

const ToolbarContainer = ({ children, actionButton, localAudioTrack, waitingRoom }: ToolbarContainerProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
        }}
      >
        {!isMobile && (
          <CircularIconButton aria-label={t('global-back')} onClick={navigateToHome}>
            <BackIcon />
          </CircularIconButton>
        )}
        {children}
        <ButtonStack spacing={2} direction="row" waitingRoom={waitingRoom}>
          <AudioButton isLobby localAudioTrack={localAudioTrack} />
          <VideoButton isLobby />
          {isBackgroundEffectSupported() && <BlurScreenButton isLobby />}
          {waitingRoom && actionButton}
        </ButtonStack>
        {!waitingRoom && actionButton}
      </Stack>
    </Container>
  );
};

export default ToolbarContainer;
