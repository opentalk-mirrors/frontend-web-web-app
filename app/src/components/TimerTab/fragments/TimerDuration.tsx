// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector, useRemainingDurationOfTimer } from '../../../hooks';
import { selectTimerEndsAt } from '../../../store/slices/timerSlice';
import { TimerStyle } from '../../../types';

type AlignItems = 'center' | 'initial';
export interface TimerCounterProps {
  alignItems?: AlignItems;
  style: TimerStyle;
}

const Content = styled(Box)<{ alignItems?: AlignItems }>(({ alignItems = 'initial' }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: alignItems,
  gap: '0.5rem',
}));

const TimerDuration = ({ alignItems, style }: TimerCounterProps) => {
  const { t } = useTranslation();
  const remainingTime = useRemainingDurationOfTimer();
  const endTime = useAppSelector(selectTimerEndsAt);

  const getDisplayText = () => {
    if (style === TimerStyle.Normal) {
      return t(`timer-counter-${endTime ? 'remaining' : 'elapsed'}-time`);
    }

    return t(`coffee-break-title-counter`);
  };

  return (
    <Content alignItems={alignItems} aria-hidden="true">
      <Typography>{getDisplayText()}</Typography>
      <Typography data-testid="timer-display">{remainingTime?.durationString}</Typography>
    </Content>
  );
};

export default TimerDuration;
