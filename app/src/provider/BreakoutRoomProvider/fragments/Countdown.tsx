// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, BoxProps, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const DURATION = 120;

interface CountdownProps extends BoxProps {
  started: number;
  duration?: number;
  onCountdownEnds?: () => void;
}

const calculateRemainingTime = (endTime: number) => {
  return Math.max(0, (endTime - Date.now()) / 1000);
};

const Countdown = ({ started, duration, onCountdownEnds, ...rest }: CountdownProps) => {
  const endTime = started + (duration ? duration : DURATION) * 1000;
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(endTime));
  const progress = Math.min(100, (remainingTime / (duration ? duration : DURATION)) * 100);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const timeLeft = calculateRemainingTime(endTime);
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        onCountdownEnds && onCountdownEnds();
        intervalRef.current && clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [endTime]);

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
      <CircularProgress variant="determinate" value={progress} />
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
