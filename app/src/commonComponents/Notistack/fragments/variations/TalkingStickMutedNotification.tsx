// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack } from '@mui/material';
import { CSSProperties, ForwardedRef, forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { DoneIcon } from '../../../../assets/icons';
import { CustomSnackbarContent } from '../CustomSnackbarContent';
import { NotificationHeading } from '../NotificationHeading';

interface TalkingStickMutedNotificationProps {
  style: CSSProperties;
  onUnmute(): void;
  onNext(): void;
}

export const TalkingStickMutedNotification = forwardRef(
  ({ style, onUnmute, onNext }: TalkingStickMutedNotificationProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();
    const messageId = useId();

    return (
      <CustomSnackbarContent role="alertdialog" aria-live="polite" aria-describedby={messageId} ref={ref} style={style}>
        <Stack spacing={1}>
          <NotificationHeading id={messageId} as="h3">
            <DoneIcon aria-hidden="true" />
            {t('talking-stick-speaker-announcement')}
          </NotificationHeading>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Button onClick={onUnmute} variant="contained" color="secondary" fullWidth autoFocus>
              {t('talking-stick-notification-unmute')}
            </Button>
            <Button onClick={onNext} variant="contained" color="primary" fullWidth>
              {t('talking-stick-notification-next-speaker')}
            </Button>
          </Box>
        </Stack>
      </CustomSnackbarContent>
    );
  }
);
TalkingStickMutedNotification.displayName = 'TalkingStickMutedNotification';
