// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, styled, Typography } from '@mui/material';
import Color from 'colorjs.io';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { readyToContinue } from '../../api/types/outgoing/timer';
import { CoffeeBreakIcon, LogoIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectCoffeeBreakTimerId, selectTimerActive } from '../../store/slices/timerSlice';
import { setCoffeeBreakCurtainOpenFlag } from '../../store/slices/uiSlice';
import CoffeeBreakTimer from './fragments/CoffeeBreakTimer';

const BackgroundCover = styled(Box)<{ roundBorders?: boolean }>(({ theme, roundBorders }) => ({
  background: `url('/assets/background.svg') no-repeat`,
  backgroundSize: 'cover',
  borderRadius: roundBorders ? theme.borderRadius.medium : undefined,
  height: '100%',
}));

const InnerContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'roundBorders',
})<{ roundBorders?: boolean }>(({ theme, roundBorders }) => {
  const background = new Color(theme.palette.background.customPaper.primary);
  background.alpha = 0.5;

  return {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)',
    backgroundColor: background.toString({ format: 'rgba' }),
    color: theme.palette.text.primary,
    overflow: 'auto',
    borderRadius: roundBorders ? theme.borderRadius.medium : undefined,
    padding: theme.spacing(4, 1),
  };
});

const Logo = styled(LogoIcon)(({ theme }) => ({
  height: '2rem',
  width: 'auto',
  fill: theme.palette.secondary.main,
}));

const CustomCoffeeBreakIcon = styled(CoffeeBreakIcon)(({ theme }) => ({
  height: '6rem',
  width: 'auto',
  fill: theme.palette.secondary.light,
  position: 'relative',
  left: '1rem',
}));

export const CoffeeBreakMobileView = memo(function CoffeeBreakMobileViewComponent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isTimerActive = useAppSelector(selectTimerActive);
  const coffeeBreakTimerId = useAppSelector(selectCoffeeBreakTimerId);

  const handleClose = () => {
    dispatch(setCoffeeBreakCurtainOpenFlag(false));
    if (coffeeBreakTimerId) {
      dispatch(readyToContinue.action({ timerId: coffeeBreakTimerId, status: true }));
    }
  };

  return (
    <BackgroundCover role="alertdialog" aria-label={t('coffee-break-layer-aria-title')}>
      <InnerContainer gap={4}>
        <Logo />
        <CustomCoffeeBreakIcon />
        <Typography component="h2" variant="h3" textAlign="center">
          {isTimerActive ? t('coffee-break-layer-title') : t('coffee-break-stopped-title')}
        </Typography>
        <CoffeeBreakTimer />
        <Button onClick={handleClose} color="secondary" size="large">
          {t('coffee-break-layer-button')}
        </Button>
      </InnerContainer>
    </BackgroundCover>
  );
});
