// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Stack, styled, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, CloseIcon, HelpIcon, Logo } from '../../assets/icons';
import arrowImage from '../../assets/images/arrow-illustration.png';
import { CircularIconButton } from '../../commonComponents';
import LocalVideo from '../../components/LocalVideo';
import { useAppSelector } from '../../hooks';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { selectFeatures } from '../../store/slices/configSlice';
import { selectVideoEnabled } from '../../store/slices/mediaSlice';
import QuickStartPopover from '../QuickStartPopover';
import SpeedTestDialog from '../SpeedTestDialog';
import { EchoPlayBack } from './fragments/EchoPlayback';
import { SelfTestToolbar } from './fragments/SelfTestToolbar';

const SelfTestContainer = styled('div')(() => ({
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
}));

const UtilitiesContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

const BOTTOM_CONTAINER_Z_INDEX = 1;

const BottomContainer = styled('nav')(({ theme }) => ({
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

const MobileBackButton = styled(CircularIconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: BOTTOM_CONTAINER_Z_INDEX,
  bottom: theme.spacing(2),
  left: theme.spacing(2),
}));

//Upscale and add margin to help icon, since the svg is just smaller than others and is offcenter.
//Should move into icon definition if it is also required elsewhere.
const AdjustedHelpIcon = styled(HelpIcon)(({ theme }) => ({
  transform: 'scale(1.3)',
  marginLeft: theme.typography.pxToRem(2),
}));

const BackButtonContainer = styled(Grid)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
}));

interface SelftestProps {
  children: ReactNode;
  actionButton?: ReactNode;
  title?: string;
}

const SelfTest = ({ children, actionButton, title }: SelftestProps) => {
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const { joinWithoutMedia } = useAppSelector(selectFeatures);
  const { t } = useTranslation();
  const theme = useTheme();
  const [isQuickStartPopoverOpen, setIsQuickStartPopoverOpen] = useState(false);
  const anchorElement = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigateToHome = useNavigateToHome();

  return (
    <SelfTestContainer>
      <Header>
        <Logo onClick={navigateToHome} />
        <UtilitiesContainer>
          <SpeedTestDialog />
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
        </UtilitiesContainer>
      </Header>
      <MonitorContainer>
        {videoEnabled ? (
          <LocalVideo noRoundedCorners hideUserName />
        ) : (
          <>
            {title && (
              <Typography
                variant="h2"
                textAlign="center"
                color={theme.palette.common.white}
                marginBottom={theme.spacing(5)}
                component="h1"
              >
                {t('joinform-room-title', { title })}
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
            >
              {t('selftest-header')}
            </Typography>
            <Typography textAlign="center" fontSize="1.37rem">
              {joinWithoutMedia ? t('selftest-body-do-test') : t('selftest-body')}
            </Typography>
          </>
        )}
        <EchoPlayBack />
      </MonitorContainer>
      <BottomContainer>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
          {!isMobile && (
            <BackButtonContainer item>
              <Tooltip title={t('global-back')}>
                <CircularIconButton aria-label={t('global-back')} onClick={navigateToHome}>
                  <BackIcon />
                </CircularIconButton>
              </Tooltip>
            </BackButtonContainer>
          )}
          {children}
          <SelfTestToolbar actionButton={actionButton} />
        </Grid>
      </BottomContainer>

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
    </SelfTestContainer>
  );
};

export default SelfTest;
