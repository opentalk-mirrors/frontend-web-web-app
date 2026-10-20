// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

const Time = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-53%, -58%)',
  fontSize: '0.75rem',
});

const Circle = styled('circle')({
  transition: 'all 1s linear',
});

const TOTAL_SECONDS = 60;

const getRemainingSeconds = (endsAt: number) =>
  Math.min(TOTAL_SECONDS, Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));

interface AnimationTimerDownProps {
  endsAt: number;
}

function AnimationTimerDown({ endsAt }: AnimationTimerDownProps) {
  const theme = useTheme();
  const [time, setTime] = useState(() => getRemainingSeconds(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingSeconds = getRemainingSeconds(endsAt);
      setTime(remainingSeconds);
      if (remainingSeconds === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endsAt]);

  const radius = 17;
  const initialOffset = 2 * Math.PI * radius;
  const currentOffset = initialOffset - (time * initialOffset) / TOTAL_SECONDS;

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Time>{time}s</Time>
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <Circle
          r={radius}
          cy="20"
          cx="20"
          strokeWidth="3"
          stroke={theme.palette.secondary.main}
          fill="none"
          strokeDasharray={initialOffset}
          strokeDashoffset={currentOffset}
        />
      </svg>
    </Box>
  );
}

export default AnimationTimerDown;
