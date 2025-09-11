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

function AnimationTimerDown() {
  const theme = useTheme();
  const [time, setTime] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const radius = 17;
  const initialOffset = 2 * Math.PI * radius;
  const currentOffset = initialOffset - (time * initialOffset) / 60;

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
