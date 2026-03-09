// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, BoxProps, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { BREAKOUT_ROOM_DEFAULT_COUNTDOWN_DURATION } from '../../../constants';

interface CountdownProps extends BoxProps {
  started: number;
  duration?: number;
  onCountdownEnds?: () => void;
}

const calculateRemainingTime = (endTime: number) => {
  return Math.max(0, (endTime - Date.now()) / 1000);
};

const calculateEndTime = (started: number, duration: number) => {
  return started + duration * 1000;
};

const calculateProgress = (remainingTime: number, duration: number) => {
  if (duration <= 0) {
    return 0;
  }

  return Math.min(100, (remainingTime / duration) * 100);
};

const Countdown = ({ started, duration, onCountdownEnds, ...rest }: CountdownProps) => {
  const effectiveDuration = duration ?? BREAKOUT_ROOM_DEFAULT_COUNTDOWN_DURATION;
  const endTime = calculateEndTime(started, effectiveDuration);
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(endTime));
  const progress = calculateProgress(remainingTime, effectiveDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const timeLeft = calculateRemainingTime(endTime);
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        onCountdownEnds?.();
        intervalRef.current && clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [endTime, onCountdownEnds]);

  return (
    <Box
      {...rest}
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignContent: 'center',
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
      <CircularProgress variant="determinate" value={progress} color="secondary" />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2">{`${Math.floor(remainingTime)}s`}</Typography>
      </Box>
    </Box>
  );
};
export default Countdown;
