// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, Typography, styled } from '@mui/material';
import { isEmpty } from 'lodash';
import { SnackbarContent, SnackbarKey, SnackbarMessage } from 'notistack';
import React, { useRef, useState } from 'react';

import { notifications } from '../../../commonComponents';
import Countdown from './Countdown';

export interface Action {
  variant?: 'text' | 'outlined' | 'contained';
  text: string;
  onClick: () => void;
}

interface CountDown {
  duration: number;
  action: () => void;
}

interface IJoinNotificationProps {
  message: SnackbarMessage;
  iconComponent: React.JSX.ElementType;
  actions: Action[];
  snackbarKey: SnackbarKey;
  countdown?: CountDown;
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

const BreakoutRoomNotification = React.forwardRef<HTMLDivElement, IJoinNotificationProps>(
  ({ message, actions, iconComponent: Icon, countdown, snackbarKey }, ref) => {
    const messageId = 'breakout-room-notification-message';
    const [alreadyClicked, setAlreadyClicked] = useState(false);
    const hasSubmittedRef = useRef(false);

    const handleOnClick = (onClick: () => void) => {
      !alreadyClicked && onClick();
      setAlreadyClicked(true);
      notifications.close(snackbarKey);
    };

    const handleCountdownEnds = () => {
      if (countdown !== undefined && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        countdown.action();
        notifications.close(snackbarKey);
      }
    };

    const renderActions = () =>
      actions.map(({ text, onClick, variant }, index) => (
        <Button
          onClick={() => handleOnClick(onClick)}
          variant={variant}
          key={index}
          // Autofocus has been applied to first button of the breakout room notification
          // as we want to lead the user to the alertdialog without trapping him there.
          /* eslint-disable jsx-a11y/no-autofocus */
          autoFocus={index === 0}
          color="secondary"
        >
          {text}
        </Button>
      ));

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
            {renderActions()}
            {!isEmpty(countdown) && (
              <Countdown
                started={Date.now()}
                duration={countdown?.duration}
                onCountdownEnds={handleCountdownEnds}
                ml={1.5}
              />
            )}
          </Box>
        </Stack>
      </StyledSnackbarContent>
    );
  }
);
BreakoutRoomNotification.displayName = 'BreakoutRoomNotification';

export default BreakoutRoomNotification;
