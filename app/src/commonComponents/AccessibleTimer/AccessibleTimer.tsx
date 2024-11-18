// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { LAST_SECONDS_OF_A_MINUTE, LAST_SECONDS_OF_TOTAL_TIME } from './constants';

interface AccessibleTimerProps {
  remainingTime: Duration;
  feature?: string;
}

const AccessibleTimer = ({ remainingTime, feature = '' }: AccessibleTimerProps) => {
  const { t } = useTranslation();
  const [firstAnnouncedMinute, setFirstAnnouncedMinute] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!remainingTime.minutes) {
      return;
    }

    if (!firstAnnouncedMinute) {
      setFirstAnnouncedMinute(remainingTime.minutes);
    }
  }, [remainingTime]);

  const getAriaTitle = () => {
    const minutes = remainingTime?.minutes;
    const seconds = remainingTime?.seconds;
    const prefix = feature ? feature + '. ' : '';

    if (minutes === undefined || seconds === undefined) {
      return '';
    }

    if (minutes < 1) {
      if (seconds < LAST_SECONDS_OF_TOTAL_TIME) {
        return prefix + t('timer-last-seconds-message', { number: LAST_SECONDS_OF_TOTAL_TIME });
      } else {
        return (
          prefix +
          t('timer-less-than-message', { number: minutes + 1, unit: t('global-minute', { count: minutes + 1 }) })
        );
      }
    }

    // If user joins in the middle of a timer, screenreader shall announce, that more than ${minutes} left
    // But if it's the last seconds of the minute (e.g. 02:03), we don't announce anything at all to prevent
    // verbosity. On the next minute update the new time will be announced anyway
    if (minutes === firstAnnouncedMinute) {
      if (seconds < LAST_SECONDS_OF_A_MINUTE) {
        return '';
      }
      return prefix + t('timer-more-than-message', { number: minutes, unit: t('global-minute', { count: minutes }) });
    }

    return (
      prefix + t('timer-update-message', { number: minutes + 1, unit: t('global-minute', { count: minutes + 1 }) })
    );
  };

  return (
    <Typography sx={visuallyHidden} aria-live="assertive">
      {getAriaTitle()}
    </Typography>
  );
};

export default AccessibleTimer;
