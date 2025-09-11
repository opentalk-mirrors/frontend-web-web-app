// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { stopTimer } from '../../../api/types/outgoing/timer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectTimerId } from '../../../store/slices/timerSlice';
import { TimerStyle } from '../../../types';
import TimerDuration from './TimerDuration';
import UserList from './UserList';

const TimerContainer = styled(Stack)({
  flex: 1,
  overflow: 'hidden',
});

const ActiveTimerOverview = ({ timerStyle }: { timerStyle: TimerStyle }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const timerId = useAppSelector(selectTimerId);

  const handleStop = () => {
    if (timerId) {
      dispatch(stopTimer.action({ timerId }));
    }
  };

  return (
    <Stack
      spacing={1}
      sx={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <TimerContainer flex={1} spacing={1}>
        <TimerDuration style={timerStyle} />

        {timerStyle === TimerStyle.Normal && <UserList />}
      </TimerContainer>
      <Button onClick={handleStop}>
        {timerStyle === TimerStyle.Normal ? t('timer-overview-button-stop') : t('coffee-break-overview-button-stop')}
      </Button>
    </Stack>
  );
};

export default ActiveTimerOverview;
