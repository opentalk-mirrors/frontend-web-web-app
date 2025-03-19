// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack } from '@mui/material';
import { CSSProperties, ForwardedRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { WarningIcon } from '../../../../../assets/icons';
import { CustomSnackbarContent } from '../../CustomSnackbarContent';
import { NotificationHeading } from '../../NotificationHeading';

interface ConsentOptionsProps {
  style: CSSProperties;
  onAcceptButton: () => void;
  onDeclineButton: () => void;
}

const ConsentNotification = forwardRef(
  ({ onAcceptButton, onDeclineButton, style }: ConsentOptionsProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();

    return (
      <CustomSnackbarContent
        role="alertdialog"
        aria-describedby="consent-notification-heading"
        ref={ref}
        style={style}
        type="warning"
        aria-live="assertive"
      >
        <Stack spacing={1}>
          <NotificationHeading id="consent-notification-heading" as="h3">
            <WarningIcon aria-hidden="true" />
            {t('consent-message')}
          </NotificationHeading>
          <Box
            sx={{
              justifyContent: 'end',
              display: 'flex',
              gap: 1,
            }}
          >
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
ConsentNotification.displayName = 'ConsentNotification';

export default ConsentNotification;
