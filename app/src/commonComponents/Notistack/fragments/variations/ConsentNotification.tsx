// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack } from '@mui/material';
import { CSSProperties, ForwardedRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { sendStreamConsentSignal } from '../../../../api/types/outgoing/streaming';
import { WarningIcon } from '../../../../assets/icons';
import { AppDispatch } from '../../../../store';
import { getLivekitRoom } from '../../../../store/slices/livekitSlice';
import { CustomSnackbarContent } from '../CustomSnackbarContent';
import { NotificationHeading } from '../NotificationHeading';
import { notifications } from '../utils';

interface ConsentOptionsProps {
  style: CSSProperties;
  onAcceptButton: () => void;
  onDeclineButton: () => void;
}

export const ConsentNotification = forwardRef(
  ({ onAcceptButton, onDeclineButton, style }: ConsentOptionsProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();

    return (
      <CustomSnackbarContent
        role="alertdialog"
        aria-describedby="consent-notification-heading"
        ref={ref}
        style={style}
        type="warning"
      >
        <Stack spacing={1}>
          <NotificationHeading id="consent-notification-heading" as="h3">
            <WarningIcon aria-hidden="true" />
            {t('consent-message')}
          </NotificationHeading>
          <Box justifyContent="end" display="flex" gap={1}>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Button variant="contained" color="primary" onClick={onAcceptButton} autoFocus>
              {t('consent-accept')}
            </Button>
            <Button variant="contained" color="secondary" onClick={onDeclineButton}>
              {t('consent-decline')}
            </Button>
          </Box>
        </Stack>
      </CustomSnackbarContent>
    );
  }
);

export const showConsentNotification = (dispatch: AppDispatch) =>
  new Promise((resolve) => {
    const key = 'consent-alert-dialog';

    const setRecordingConsent = (consent: boolean) => {
      dispatch(sendStreamConsentSignal.action({ consent }));
      notifications.close(key);
      if (!consent) {
        const room = getLivekitRoom();
        room.localParticipant.setCameraEnabled(false);
        room.localParticipant.setMicrophoneEnabled(false);
        room.localParticipant.setScreenShareEnabled(false);
      }
      resolve(consent);
    };

    notifications.consent({
      onAcceptButton: () => setRecordingConsent(true),
      onDeclineButton: () => setRecordingConsent(false),
      key,
    });
  });
