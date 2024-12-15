// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TFunctionResult } from 'i18next';
import { OptionsObject, SnackbarKey, enqueueSnackbar, closeSnackbar, SnackbarMessage } from 'notistack';
import React from 'react';

import SnackbarActionButtons from '../SnackbarActionButtons';

export interface AdditionalButtonAttributes {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export interface ISnackbarActionButtonProps {
  msg: (string | React.ReactNode) & TFunctionResult;
  onCancel?: () => void;
  onAction?: () => void;
  actionBtnText?: string;
  actionBtnAttributes?: AdditionalButtonAttributes;
  cancelBtnAttributes?: AdditionalButtonAttributes;
  cancelBtnText?: string;
  hideCloseButton?: boolean;
}

export interface ISnackActionsProps extends OptionsObject, ISnackbarActionButtonProps {}

export interface ISnackbarPersistentProps extends Omit<OptionsObject, 'persist' | 'action' | 'autoHideDuration'> {
  msg: string;
}

export const notificationAction = ({
  msg,
  variant,
  actionBtnText,
  cancelBtnText,
  onAction,
  onCancel,
  hideCloseButton,
  actionBtnAttributes = {},
  cancelBtnAttributes = {},
  ...options
}: ISnackActionsProps) => {
  const handleClick = (key: SnackbarKey, action: typeof onAction | typeof onCancel) => {
    closeSnackbar(key);

    if (action) {
      action();
    }
  };

  enqueueSnackbar(msg, {
    variant,
    autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
    ...options,
    action: (key: SnackbarKey) => (
      <SnackbarActionButtons
        actionBtnText={actionBtnText}
        cancelBtnText={cancelBtnText}
        onAction={() => handleClick(key, onAction)}
        onCancel={() => handleClick(key, onCancel)}
        hideCloseButton={hideCloseButton}
        actionBtnAttributes={actionBtnAttributes}
        cancelBtnAttributes={cancelBtnAttributes}
      />
    ),
  });
};

export const notificationPersistent = ({ msg, variant, ...options }: ISnackbarPersistentProps) => {
  enqueueSnackbar(msg, {
    variant,
    ...options,
    action: null,
    persist: true,
  });
};

export const DEFAULT_AUTO_HIDE_DURATION = 7000; // 7 seconds

export const notifications = {
  success(msg: string, options: OptionsObject = {}): void {
    this.toast(msg, {
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      ...options,
      variant: 'success',
      ariaLive: 'polite',
    });
  },
  warning(msg: string, options: OptionsObject = {}): void {
    this.toast(msg, {
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      ...options,
      variant: 'warning',
      ariaLive: 'polite',
    });
  },
  info(msg: string, options: OptionsObject = {}): void {
    this.toast(msg, { autoHideDuration: DEFAULT_AUTO_HIDE_DURATION, ...options, variant: 'info', ariaLive: 'polite' });
  },
  error(msg: string, options: OptionsObject = {}): void {
    this.toast(msg, {
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      ...options,
      variant: 'error',
      ariaLive: 'assertive',
    });
  },
  toast(msg: SnackbarMessage, options: OptionsObject = {}): SnackbarKey {
    return enqueueSnackbar(msg, options);
  },
  binaryAction: (
    message: string,
    options: OptionsObject<'binaryAction'> & {
      type?: 'info' | 'warning' | 'error' | 'success';
      primaryBtnText?: string;
      secondaryBtnText?: string;
      onPrimary?: (props: { id: SnackbarKey }) => void;
      onSecondary?: (props: { id: SnackbarKey }) => void;
      primaryBtnProps?: AdditionalButtonAttributes;
      secondaryBtnProps?: AdditionalButtonAttributes;
      closable?: boolean;
    } = {}
  ) => {
    return enqueueSnackbar({
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      ...options,
      message,
      variant: 'binaryAction',
    });
  },
  close(key: SnackbarKey): void {
    closeSnackbar(key);
  },
  closeAll(): void {
    closeSnackbar();
  },
  consent: (options: { onAcceptButton: () => void; onDeclineButton: () => void; key?: SnackbarKey }) => {
    return enqueueSnackbar({
      variant: 'consent',
      onAcceptButton: options.onAcceptButton,
      onDeclineButton: options.onDeclineButton,
      persist: true,
      key: options.key,
    });
  },
  showTalkingStickMutedNotification: (options: { onUnmute: () => void; onNext: () => void; key?: SnackbarKey }) => {
    return enqueueSnackbar({
      variant: 'talkingStickMuted',
      key: options.key,
      persist: true,
      onUnmute: options.onUnmute,
      onNext: options.onNext,
    });
  },
  showTalkingStickUnmutedNotification: (options: { onNext: () => void; isLastSpeaker: boolean; key?: SnackbarKey }) => {
    return enqueueSnackbar({
      variant: 'talkingStickUnmuted',
      persist: true,
      key: options.key,
      isLastSpeaker: options.isLastSpeaker,
      onNext: options.onNext,
    });
  },
};
