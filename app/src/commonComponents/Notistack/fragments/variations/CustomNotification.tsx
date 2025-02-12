// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { closeSnackbar, CustomContentProps, SnackbarContent } from 'notistack';
import { forwardRef, isValidElement, useCallback } from 'react';

import { CloseButton } from '../CloseButton';

// Styles are directly copied from the notistack that is why values are hardcoded
const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
  padding: '6px 16px',
  fontSize: '0.875rem',
  lineHeight: 1.43,
  alignItems: 'center',
  paddingLeft: 20,
  borderRadius: 4,
  boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  letterSpacing: '0.01071em',
  flexWrap: 'nowrap',

  '&.notistack-MuiContent-success': {
    backgroundColor: theme.palette.notistack.success.backgroundColor,
    color: theme.palette.notistack.success.color,
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: theme.palette.notistack.error.backgroundColor,
    color: theme.palette.notistack.error.color,
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: theme.palette.notistack.warning.backgroundColor,
    color: theme.palette.notistack.warning.color,
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: theme.palette.notistack.info.backgroundColor,
    color: theme.palette.notistack.info.color,
  },

  '& > span': {
    flex: 1,
  },

  '& > button': {
    color: 'currentColor',
  },
}));

const StyledCloseButton = styled(CloseButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

interface CustomNotificationProps extends CustomContentProps {
  ariaLive?: 'assertive' | 'off' | 'polite';
}

export const CustomNotification = forwardRef<HTMLDivElement, CustomNotificationProps>((props, ref) => {
  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [props.id, closeSnackbar]);

  const Icon = props.iconVariant[props.variant];

  const ActionButtons = () => {
    if (isValidElement(props.action)) {
      return props.action;
    }

    if (typeof props.action === 'function') {
      return props.action(props.id);
    }

    return <StyledCloseButton onClick={handleDismiss} />;
  };

  return (
    <StyledSnackbarContent
      ref={ref}
      style={props.style}
      className={[props.className, `notistack-MuiContent-${props.variant}`].join(' ')}
      role="alert"
      aria-live={props.ariaLive}
    >
      {Icon}
      <span>{props.message}</span>
      <ActionButtons />
    </StyledSnackbarContent>
  );
});
