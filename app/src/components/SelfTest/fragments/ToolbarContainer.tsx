// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, styled, useMediaQuery, useTheme } from '@mui/material';
import { LocalAudioTrack } from 'livekit-client';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon } from '../../../assets/icons';
import { CircularIconButton } from '../../../commonComponents';
import useNavigateToHome from '../../../hooks/useNavigateToHome';
import browser from '../../../modules/BrowserSupport';
import AudioButton from '../../Toolbar/fragments/AudioButton';
import BlurScreenButton from '../../Toolbar/fragments/BlurScreenButton';
import VideoButton from '../../Toolbar/fragments/VideoButton';

const BOTTOM_CONTAINER_Z_INDEX = 1;

const Container = styled('nav')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(6),
  bottom: 0,
  left: 0,
  position: 'relative',
  zIndex: BOTTOM_CONTAINER_Z_INDEX,
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
  },
}));

const BackButtonContainer = styled(Grid)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    //Removes negative margin that is default added from MUI
    marginTop: theme.spacing(0),
    '& .MuiGrid-root.MuiGrid-item': {
      paddingTop: 0,
    },
  },
}));

interface ToolbarContainerProps {
  children: ReactNode;
  actionButton: ReactNode;
  localAudioTrack?: LocalAudioTrack;
}

const ToolbarContainer = ({ children, actionButton, localAudioTrack }: ToolbarContainerProps) => {
  const { t } = useTranslation();
  const navigateToHome = useNavigateToHome();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
        {!isMobile && (
          <BackButtonContainer item>
            <CircularIconButton aria-label={t('global-back')} onClick={navigateToHome}>
              <BackIcon />
            </CircularIconButton>
          </BackButtonContainer>
        )}
        {children}
        <GridContainer
          container
          item
          direction="row"
          spacing={2}
          sm={12}
          md="auto"
          alignItems="stretch"
          justifyContent="center"
        >
          <Grid container item direction="row" sm={12} md="auto" gap={2} justifyContent="center">
            <AudioButton isLobby localAudioTrack={localAudioTrack} />
            <VideoButton isLobby />
            {!browser.isSafari() && !browser.isFirefox() && <BlurScreenButton isLobby />}
          </Grid>
          <Grid item xs={12} sm="auto" justifyItems="center" flexBasis="auto">
            {actionButton}
          </Grid>
        </GridContainer>
      </Grid>
    </Container>
  );
};

export default ToolbarContainer;
