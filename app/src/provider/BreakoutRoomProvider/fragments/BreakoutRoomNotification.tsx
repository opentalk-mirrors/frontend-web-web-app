// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, Typography, styled } from '@mui/material';
import { SnackbarContent, SnackbarKey, SnackbarMessage } from 'notistack';
import { useId, useRef, type ElementType, type Ref } from 'react';

import { notifications } from '../../../commonComponents';
import Countdown from './Countdown';

export interface Action {
  variant?: 'text' | 'outlined' | 'contained';
  text: string;
  onClick: () => void;
}

interface CountDown {
  duration?: number;
  action: () => void;
  startedAt: number;
}

interface IJoinNotificationProps {
  message: SnackbarMessage;
  iconComponent: ElementType;
  actions: Action[];
  snackbarKey: SnackbarKey;
  countdown?: CountDown;
  ref?: Ref<HTMLDivElement>;
}

const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
  background: theme.palette.info.main,
  color: theme.palette.info.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.borderRadius.medium,
  '& .MuiTypography-root': {
    fontSize: '1rem',
  },
}));

const BreakoutRoomNotification = ({
  message,
  actions,
  iconComponent: Icon,
  countdown,
  snackbarKey,
  ref,
}: IJoinNotificationProps) => {
  const messageId = useId();
  const hasSubmittedRef = useRef(false);
  const hasActionCompletedRef = useRef(false);

  const handleOnClick = (onClick: () => void) => {
    if (hasActionCompletedRef.current) {
      return;
    }

    hasActionCompletedRef.current = true;
    onClick();
    notifications.close(snackbarKey);
  };

  const handleCountdownEnds = () => {
    if (!countdown || hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;
    countdown.action();
    notifications.close(snackbarKey);
  };

  return (
    <StyledSnackbarContent ref={ref} role="alertdialog" aria-describedby={messageId}>
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon width="2rem" height="2rem" />
          <Typography
            variant="h3"
            id={messageId}
            sx={{
              ml: 2,
            }}
          >
            {message}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            pl: 6,
          }}
        >
          {actions.map(({ text, onClick, variant }, index) => (
            <Button
              onClick={() => handleOnClick(onClick)}
              variant={variant}
              key={`${text}-${index}`}
              // Autofocus has been applied to first button of the breakout room notification
              // as we want to lead the user to the alertdialog without trapping him there.
              /* eslint-disable jsx-a11y/no-autofocus */
              autoFocus={index === 0}
              color="secondary"
            >
              {text}
            </Button>
          ))}
          {countdown && (
            <Countdown
              started={countdown.startedAt}
              duration={countdown.duration}
              onCountdownEnds={handleCountdownEnds}
              ml={1.5}
            />
          )}
        </Box>
      </Stack>
    </StyledSnackbarContent>
  );
};
BreakoutRoomNotification.displayName = 'BreakoutRoomNotification';

export default BreakoutRoomNotification;
