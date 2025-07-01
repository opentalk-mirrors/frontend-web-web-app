// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Typography, styled } from '@mui/material';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectJoinedFirstTimestamp } from '../../../store/selectors';
import { isDevMode } from '../../../utils/devMode';
import { getIntervalToDurationString } from '../../../utils/timeUtils';

const Container = styled(Stack)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  //For mobile MeetingTimer is used on it is own so the background color and rounding is handled here.
  [theme.breakpoints.down('md')]: {
    background: theme.palette.background.video,
    borderRadius: '0.25rem',
  },
}));

const MEETING_TIMER_UNDER_HOUR_FORMAT_LENGTH = 7; // we have two space characters, one : character and 4 digits, summing up to 7.

const MeetingTimer = () => {
  const meetingStartPoint = useAppSelector(selectJoinedFirstTimestamp);
  const startTime = useMemo(() => (meetingStartPoint ? new Date(meetingStartPoint) : new Date()), [meetingStartPoint]);
  const [meetingTime, setMeetingTime] = useState<string>(
    getIntervalToDurationString({
      start: startTime,
      end: new Date(),
    })
  );

  const updateDuration = useCallback(() => {
    setMeetingTime(
      getIntervalToDurationString({
        start: startTime,
        end: new Date(),
      })
    );
  }, [startTime]);

  useEffect(() => {
    const interval = setInterval(() => updateDuration(), 1000);
    return () => clearInterval(interval);
  }, [updateDuration, meetingTime]);

  let renderedTime = meetingTime;
  if (isDevMode()) {
    // #1702
    renderedTime = meetingTime.length <= MEETING_TIMER_UNDER_HOUR_FORMAT_LENGTH ? '00 : ' + meetingTime : meetingTime;
  }

  return (
    <Container>
      <Typography
        variant="body2"
        sx={{
          minWidth: renderedTime.length > MEETING_TIMER_UNDER_HOUR_FORMAT_LENGTH ? '5.5em' : '3.5em',
        }}
      >
        {renderedTime}
      </Typography>
    </Container>
  );
};

export default MeetingTimer;
