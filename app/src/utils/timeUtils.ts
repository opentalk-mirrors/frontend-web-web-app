// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { add, Duration, Interval, intervalToDuration } from 'date-fns';

import { getRandomInteger } from './numberUtils';

export const getISOStringWithoutMilliseconds = (date: Date) => date.toISOString().split('.')[0] + 'Z';

export const getIntervalToDurationString = (interval: Interval) => {
  const duration = intervalToDuration(interval);

  const durationString = [duration.hours || 0, duration.minutes || 0, duration.seconds || 0]
    .map((segment) => String(segment).padStart(2, '0'))
    .join(' : ');

  if (!duration.hours) {
    // "00 : 00 : 00" -> "00 : 00"
    return durationString.slice(5);
  }

  return durationString;
};

export const getRemainingTimeForInterval = (interval: Interval) => ({
  duration: intervalToDuration(interval),
  durationString: getIntervalToDurationString(interval),
});

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatCurrentTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `${time}.${milliseconds}`;
};

export const getRandomTimeInThePast = (fixedTime: Date, range: Duration) => {
  const timeDifference = {
    hours: getRandomInteger(range.hours || 0) * -1,
    minutes: getRandomInteger(range.minutes || 0) * -1,
    seconds: getRandomInteger(range.seconds || 0) * -1,
  } as Duration;
  return add(fixedTime, timeDifference);
};
