// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, styled } from '@mui/material';
import { isNumber } from 'lodash';
import { useTranslation } from 'react-i18next';

import AccessibleTimer from '../../../commonComponents/AccessibleTimer';
import { useAppSelector, useRemainingDurationOfTimer } from '../../../hooks';
import { selectTotalDuration } from '../../../store/slices/timerSlice';

const TimerTypography = styled(Typography)<{ component: 'div' }>({
  fontSize: '5rem',
});

const CoffeeBreakTimer = () => {
  const { t } = useTranslation();
  const remainingTime = useRemainingDurationOfTimer();
  const totalDuration = useAppSelector(selectTotalDuration);

  const isTimeNearEnd = (() => {
    if (!totalDuration || !remainingTime) {
      return false;
    }

    if (!isNumber(totalDuration.minutes) || !isNumber(remainingTime.duration.minutes)) {
      return false;
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

    return remainingTime.duration.minutes <= timerTurnsRedOnMinute;
  })();

  return (
    <>
      <TimerTypography
        data-testid="timer-typography"
        color={isTimeNearEnd ? 'error' : undefined}
        component="div"
        aria-hidden={true}
      >
        {remainingTime?.durationString}
      </TimerTypography>
      {remainingTime && (
        <AccessibleTimer remainingTime={remainingTime.duration} feature={t('coffee-break-tab-title')} />
      )}
    </>
  );
};

export default CoffeeBreakTimer;
