// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { closeSnackbar, CustomContentProps, SnackbarContent, SnackbarKey } from 'notistack';
import { forwardRef, isValidElement, useCallback, useMemo } from 'react';

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
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },

  '& > span': {
    display: 'block',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
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
  id: string; // Ensure id is explicitly declared
  action?: React.ReactNode | ((key: SnackbarKey) => React.ReactNode);
}

export const CustomNotification = forwardRef<HTMLDivElement, CustomNotificationProps>((props, ref) => {
  const { action } = props;

  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [props.id]);

  const Icon = props.iconVariant[props.variant];

  const actionContent = useMemo(() => {
    if (isValidElement(action)) {
      return action;
    }

    if (typeof action === 'function') {
      return action(props.id);
    }

    return <StyledCloseButton onClick={handleDismiss} />;
  }, [action, handleDismiss, props.id]);

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
      {actionContent}
    </StyledSnackbarContent>
  );
});
CustomNotification.displayName = 'CustomNotification';
