// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
/* eslint-disable jsx-a11y/no-autofocus */
import { Button, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Color from 'colorjs.io';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { readyToContinue } from '../../api/types/outgoing/timer';
import { CoffeeBreakIcon as CoffeeBreakIconDefault, LogoIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectCoffeeBreakTimerId, selectTimerActive } from '../../store/slices/timerSlice';
import { setCoffeeBreakCurtainOpenFlag } from '../../store/slices/uiSlice';
import CoffeeBreakTimer from './fragments/CoffeeBreakTimer';

const BackgroundCover = styled(Box)<{ roundBorders?: boolean }>(({ theme, roundBorders }) => ({
  background: `url('/assets/background.svg') no-repeat`,
  backgroundSize: 'cover',
  borderRadius: roundBorders ? theme.borderRadius.medium : undefined,
}));

const InnerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'roundBorders',
})<{ roundBorders?: boolean }>(({ theme, roundBorders }) => {
  const background = new Color(theme.palette.background.customPaper.primary);
  background.alpha = 0.5;

  return {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '0fr 2fr',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)',
    backgroundColor: background.toString({ format: 'rgba' }),
    color: theme.palette.text.primary,
    overflow: 'auto',
    padding: 50,
    borderRadius: roundBorders ? theme.borderRadius.medium : undefined,
  };
});

const Logo = styled(LogoIcon)(({ theme }) => ({
  height: '2rem',
  width: 'auto',
  fill: theme.palette.secondary.main,
}));

const CoffeeBreakIcon = styled(CoffeeBreakIconDefault)(({ theme }) => ({
  height: '6rem',
  width: 'auto',
  fill: theme.palette.secondary.light,
  position: 'relative',
  left: '1rem',
}));

const Content = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
});

interface CoffeeBreakViewProps {
  roundBorders?: boolean;
}

export const CoffeeBreakView = memo(({ roundBorders }: CoffeeBreakViewProps) => {
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
    <BackgroundCover role="alertdialog" aria-label={t('coffee-break-layer-aria-title')} roundBorders={roundBorders}>
      <InnerContainer roundBorders={roundBorders}>
        <Logo />

        <Content>
          <CoffeeBreakIcon />

          <Typography component="h2" variant="h3">
            {isTimerActive ? t('coffee-break-layer-title') : t('coffee-break-stopped-title')}
          </Typography>

          <CoffeeBreakTimer />

          <Button autoFocus={true} onClick={handleClose} color="secondary">
            {t('coffee-break-layer-button')}
          </Button>
        </Content>
      </InnerContainer>
    </BackgroundCover>
  );
});
CoffeeBreakView.displayName = 'CoffeeBreakView';
