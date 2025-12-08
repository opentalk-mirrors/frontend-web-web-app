// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { readyToContinue } from '../../../api/types/outgoing/timer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectParticipantsReady,
  selectReadyCheckEnabled,
  selectTimerId,
  selectTimerTitle,
} from '../../../store/slices/timerSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { TimerStyle } from '../../../types';
import TimerDuration from '../../TimerTab/fragments/TimerDuration';
import { Container } from './Container';

const NormalTimerPopover = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectOurUuid);
  const timerId = useAppSelector(selectTimerId);
  const timerTitle = useAppSelector(selectTimerTitle);
  const hasReadyCheckEnabled = useAppSelector(selectReadyCheckEnabled);
  const participantsAreReady = useAppSelector(selectParticipantsReady);
  const isUserReady = userId && participantsAreReady.includes(userId);

  const handleDone = useCallback(() => {
    if (timerId) {
      dispatch(readyToContinue.action({ timerId, status: !isUserReady }));
    }
  }, [dispatch, isUserReady, timerId]);

  return (
    <Container open={Boolean(timerId)} role="dialog" aria-label={timerTitle || t('timer-popover-title')}>
      <Stack spacing={2}>
        <Typography variant="h1">{t('timer-popover-title')}</Typography>
        {timerTitle && <Typography variant="h2">{timerTitle}</Typography>}
        <TimerDuration style={TimerStyle.Normal} />
        {hasReadyCheckEnabled && (
          /* When timer popover is open we want to focus it so screen reader can tell the content. */
          /* eslint-disable jsx-a11y/no-autofocus */
          <Button onClick={handleDone} color={isUserReady ? 'primary' : 'secondary'} autoFocus fullWidth>
            {t(`timer-popover-button-${isUserReady ? 'not-' : ''}done`)}
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default NormalTimerPopover;
