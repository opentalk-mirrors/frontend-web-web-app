// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, styled } from '@mui/material';
import { isNumber } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AccessibleTimer from '../../../commonComponents/AccessibleTimer';
import { useAppSelector, useRemainingDurationOfTimer } from '../../../hooks';
import { selectTotalDuration } from '../../../store/slices/timerSlice';

const TimerTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isRed',
})<{ isRed: string; component: 'div' }>(({ theme, isRed }) => ({
  fontSize: '5rem',
  color: isRed ? theme.palette.error.main : theme.palette.common.white,

  [`${theme.breakpoints.down('lg')}`]: {
    fontSize: '5rem',
  },
}));

const CoffeeBreakTimer = () => {
  const { t } = useTranslation();
  const remainingTime = useRemainingDurationOfTimer();
  const totalDuration = useAppSelector(selectTotalDuration);
  const [isTimerRed, setIsTimerRed] = useState(false);

  useEffect(() => {
    if (!totalDuration || !remainingTime) {
      return;
    }

    if (!isNumber(totalDuration.minutes) || !isNumber(remainingTime.duration.minutes)) {
      return;
    }

    const initialMinuteValue = totalDuration.minutes;
    let timerTurnsRedOnMinute: number;
    //Based on the initial duration selected we turn the timer red to signal approaching end at different points. Numbers are a product decision.
    if (initialMinuteValue <= 5) {
      timerTurnsRedOnMinute = 0;
    } else if (initialMinuteValue <= 15) {
      timerTurnsRedOnMinute = 2;
    } else {
      timerTurnsRedOnMinute = 4;
    }

    if (remainingTime.duration.minutes <= timerTurnsRedOnMinute) {
      setIsTimerRed(true);
    }

    return () => {
      setIsTimerRed(false);
    };
  }, [totalDuration, remainingTime]);

  return (
    <>
      <TimerTypography isRed={isTimerRed ? 'active' : ''} component="div" aria-hidden={true}>
        {remainingTime?.durationString}
      </TimerTypography>
      {remainingTime && (
        <AccessibleTimer remainingTime={remainingTime.duration} feature={t('coffee-break-tab-title')} />
      )}
    </>
  );
};

export default CoffeeBreakTimer;
