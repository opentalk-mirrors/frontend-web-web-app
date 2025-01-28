// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, BoxProps, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { useCountdown } from '../../../hooks';

const DURATION = 120;

interface CountdownProps extends BoxProps {
  started?: number;
  duration?: number;
  onCountdownEnds?: () => void;
}

const Countdown = ({ started = Date.now(), duration, onCountdownEnds, ...rest }: CountdownProps) => {
  const [actionCalled, setActionCalled] = useState(false);
  const countdownDuration = duration ? duration : DURATION;
  const { remainingTime, elapsedTime } = useCountdown({
    isPlaying: true,
    duration: countdownDuration,
    initialTime: started,
  });

  useEffect(() => {
    if (remainingTime === 0 && onCountdownEnds !== undefined && !actionCalled) {
      onCountdownEnds();
      setActionCalled(true);
    }
  }, [remainingTime, onCountdownEnds, actionCalled]);

  const progress = 100 - (elapsedTime / countdownDuration) * 100;

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
