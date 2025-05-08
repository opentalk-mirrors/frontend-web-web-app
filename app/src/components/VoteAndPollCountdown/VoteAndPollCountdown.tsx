// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, BoxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { DurationIcon } from '../../assets/icons';

interface VoteCountdownProps extends BoxProps {
  duration: number;
  startTime: string;
  active: boolean;
}

function formatSeconds(seconds: number): string {
  const _hours = Math.floor(seconds / 3600);
  const _minutes = Math.floor((seconds - _hours * 3600) / 60);
  const _seconds = seconds - _hours * 3600 - _minutes * 60;

  const output = [
    _hours > 0 ? String(_hours).padStart(2, '0') + ':' : '',
    _minutes > 0 ? String(_minutes).padStart(2, '0') + ':' : '00:',
    _seconds > 0 ? String(_seconds).padStart(2, '0') : '00',
  ];

  return output.join('');
}

export default function VoteAndPollCountdown({ active, duration, startTime, ...boxProps }: VoteCountdownProps) {
  const [counter, setCounter] = useState<string>('');

  useEffect(() => {
    if (!active) {
      setCounter('00:00');
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startDate);
    endDate.setSeconds(startDate.getSeconds() + duration);

    const interval = setInterval(() => {
      updateCounter();
    }, 1000);

    function updateCounter() {
      const delta = Number(endDate) - Date.now();

      if (delta < 0) {
        // stop the timer.
        setCounter('00:00');
        clearInterval(interval);
        return;
      }

      const remainingSeconds = Math.floor(delta / 1000);
      setCounter(formatSeconds(remainingSeconds));
    }

    updateCounter();

    return () => {
      clearInterval(interval);
    };
  }, [duration, startTime, active]);

  return (
    <Box
      {...boxProps}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
        },
        ...(Array.isArray(boxProps.sx) ? boxProps.sx : [boxProps.sx]),
      ]}
    >
      <DurationIcon />
      <Typography
        sx={{
          ml: 0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {counter}
      </Typography>
    </Box>
  );
}
