// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { SnackbarContent, CustomContentProps } from 'notistack';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, FeedbackIcon } from '../../../../../assets/icons';
import { IconButton } from '../../../../IconButtons';
import { notifications } from '../../utils';
import AnimationTimerDown from './fragments/AnimationTimerDown';

const BoxContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  minHeight: '60px',
  padding: theme.spacing(1, 0.5, 1, 2),
  borderRadius: theme.borderRadius.medium,
  background: theme.palette.error.main,
}));

const BoxInteractive = styled(Box)({
  flex: '1',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

interface TimeLimitNotificationProps extends CustomContentProps {
  minutes: number;
}

const TimeLimitNotification = forwardRef<HTMLDivElement, TimeLimitNotificationProps>((props, ref) => {
  const { t } = useTranslation();
  const { id, minutes } = props;

  const handleClose = () => {
    notifications.close(id);
  };

  return (
    <SnackbarContent ref={ref} role="alert" aria-live="polite">
      <BoxContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FeedbackIcon />
        </Box>
        <BoxInteractive>
          {minutes > 1 && (
            <>
              <span>{t('time-limit-more-than-one-minute-remained', { minutes })}</span>
              <IconButton aria-label={t('global-close')} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </>
          )}
          {minutes === 1 && (
            <>
              <span>{t('time-limit-less-than-one-minute-remained')}</span>
              <AnimationTimerDown />
            </>
          )}
        </BoxInteractive>
      </BoxContent>
    </SnackbarContent>
  );
});

export default TimeLimitNotification;
