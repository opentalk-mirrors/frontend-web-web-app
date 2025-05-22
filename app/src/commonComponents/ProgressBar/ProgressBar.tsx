// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, LinearProgress } from '@mui/material';
import React, { useEffect } from 'react';

interface IProps {
  endTime: number;
  startTime: number;
  isFinished: boolean;
}

const Progress = styled(LinearProgress)({
  height: '1rem',
  background: '#193a47',
});

const ProgressBar = ({ endTime, startTime, isFinished }: IProps) => {
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    if (!isFinished) {
      const timer = setInterval(() => {
        const fullTime = endTime - startTime;
        const currentTime = Date.now() - startTime;
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            return 100;
          }
          return Math.round((currentTime / fullTime) * 100);
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(100);
    }
  }, [endTime, startTime, isFinished]);

  return (
    <div>
      <Progress variant="determinate" value={progress} />
    </div>
  );
};
export default ProgressBar;
