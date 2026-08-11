// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack } from '@mui/material';
import { CSSProperties, ForwardedRef, forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomSnackbarContent } from '../CustomSnackbarContent';
import { NotificationHeading } from '../NotificationHeading';
import { notifications } from '../utils';

interface TranscriptionEnabledNotificationProps {
  style: CSSProperties;
  onActivated: () => void;
}

export const TranscriptionEnabledNotification = forwardRef(
  ({ style, onActivated }: TranscriptionEnabledNotificationProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();
    const messageId = useId();

    const onClick = () => {
      onActivated();
      onClose();
    };

    const onClose = () => {
      notifications.close('transcription-enabled');
    };

    return (
      <CustomSnackbarContent role="alertdialog" aria-live="polite" aria-describedby={messageId} ref={ref} style={style}>
        <Stack spacing={1}>
          <NotificationHeading id={messageId} as="h3">
            {t('subtitle-notification-enabled')}
          </NotificationHeading>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
            }}
          >
            <Button onClick={onClick} variant="contained" color="secondary" fullWidth style={{ whiteSpace: 'nowrap' }}>
              {t('subtitle-notification-show')}
            </Button>
            <Button onClick={onClose} variant="contained" color="primary" fullWidth style={{ whiteSpace: 'nowrap' }}>
              {t('subtitle-notification-hide')}
            </Button>
          </Box>
        </Stack>
      </CustomSnackbarContent>
    );
  }
);
TranscriptionEnabledNotification.displayName = 'TranscriptionEnabledNotification';
