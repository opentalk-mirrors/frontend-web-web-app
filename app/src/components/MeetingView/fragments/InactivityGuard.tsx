// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { changeMedia, hangUp } from '../../../store/commonActions';
import {
  selectMeetingInactivityMediaDisableSeconds,
  selectMeetingInactivityTerminationSeconds,
  selectMeetingInactivityWarningSeconds,
} from '../../../store/slices/configSlice';
import { selectAudioEnabled, selectVideoEnabled } from '../../../store/slices/livekitSlice';
import { selectAllOnlineParticipantsInConference } from '../../../store/slices/participantsSlice';

const INACTIVITY_INTERVAL_DELAY = 1000;

const turnMediaOff = (dispatch: ReturnType<typeof useAppDispatch>) => {
  dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
  dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
};

export default function InactivityGuard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const onlineParticipantsInConference = useAppSelector(selectAllOnlineParticipantsInConference);
  const isUserAloneInConference = onlineParticipantsInConference.length === 0;

  const numberOfMediaActiveSeconds = useRef(0);
  const isAudioEnabled = useAppSelector(selectAudioEnabled);
  const isVideoEnabled = useAppSelector(selectVideoEnabled);
  const mediaActiveInterval = useRef<NodeJS.Timeout | null>(null);

  const numberOfInactiveSeconds = useRef(0);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const inactivityInterval = useRef<NodeJS.Timeout | null>(null);

  const MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS = useAppSelector(selectMeetingInactivityMediaDisableSeconds);
  const MEETING_INACTIVITY_WARNING_SECONDS = useAppSelector(selectMeetingInactivityWarningSeconds);
  const MEETING_INACTIVITY_TERMINATION_SECONDS = useAppSelector(selectMeetingInactivityTerminationSeconds);

  const shouldStartMediaActiveInterval = useCallback(() => {
    return (isAudioEnabled || isVideoEnabled) && isUserAloneInConference && mediaActiveInterval.current === null;
  }, [isAudioEnabled, isVideoEnabled, isUserAloneInConference]);

  const haltActiveMediaActiveInterval = useCallback(() => {
    if (mediaActiveInterval.current) {
      clearInterval(mediaActiveInterval.current);
      mediaActiveInterval.current = null;
      numberOfMediaActiveSeconds.current = 0;
    }
  }, []);

  useEffect(() => {
    if (shouldStartMediaActiveInterval()) {
      mediaActiveInterval.current = setInterval(() => {
        numberOfMediaActiveSeconds.current += 1;
        if (numberOfMediaActiveSeconds.current >= MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS) {
          turnMediaOff(dispatch);
          numberOfMediaActiveSeconds.current = 0;
          notifications.info(
            t('meeting-inactivity-media-disable-notification', {
              minutes: MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS / 60,
            })
          );
        }
      }, INACTIVITY_INTERVAL_DELAY);
    } else {
      haltActiveMediaActiveInterval();
    }
  }, [
    shouldStartMediaActiveInterval,
    haltActiveMediaActiveInterval,
    dispatch,
    MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS,
    t,
  ]);

  const shouldStartInactivityInterval = useCallback((): boolean => {
    return isUserAloneInConference && inactivityInterval.current === null;
  }, [isUserAloneInConference]);

  const haltActiveInactivityInterval = useCallback(() => {
    if (inactivityInterval.current) {
      clearInterval(inactivityInterval.current);
      inactivityInterval.current = null;
      numberOfInactiveSeconds.current = 0;
    }
  }, []);

  useEffect(() => {
    if (shouldStartInactivityInterval()) {
      inactivityInterval.current = setInterval(() => {
        numberOfInactiveSeconds.current += 1;
        if (numberOfInactiveSeconds.current === MEETING_INACTIVITY_WARNING_SECONDS) {
          setIsWarningDialogOpen(true);
        }
        if (numberOfInactiveSeconds.current >= MEETING_INACTIVITY_TERMINATION_SECONDS) {
          dispatch(hangUp());
          notifications.info(
            t('meeting-inactivity-termination-notification', {
              minutes: MEETING_INACTIVITY_TERMINATION_SECONDS / 60,
            })
          );
        }
      }, INACTIVITY_INTERVAL_DELAY);
    }
    return () => {
      haltActiveInactivityInterval();
    };
  }, [
    shouldStartInactivityInterval,
    haltActiveInactivityInterval,
    dispatch,
    isUserAloneInConference,
    MEETING_INACTIVITY_WARNING_SECONDS,
    MEETING_INACTIVITY_TERMINATION_SECONDS,
    t,
  ]);

  const closeWarningDialog = () => {
    setIsWarningDialogOpen(false);
  };

  return (
    <Dialog open={isWarningDialogOpen}>
      <DialogContent>
        <DialogContentText color="textPrimary">{t('meeting-inactivity-warning-dialog-content')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="danger" type="button" onClick={() => dispatch(hangUp())}>
          {t('meeting-inactivity-warning-dialog-leave')}
        </Button>
        <Button color="secondary" type="button" onClick={closeWarningDialog}>
          {t('meeting-inactivity-warning-dialog-continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
