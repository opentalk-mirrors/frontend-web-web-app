// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import SnackbarProvider from './SnackbarProvider';

export { notificationAction, notificationPersistent, notifications } from './utils';
export type { ISnackActionsProps, ISnackbarPersistentProps } from './utils';
export { createStackedMessages } from './StackedMessages';
export {
  getNotistackComponents,
  startTimeLimitNotification,
  stopTimeLimitNotification,
  showConsentNotification,
} from './variations';
export { SnackbarProvider };
