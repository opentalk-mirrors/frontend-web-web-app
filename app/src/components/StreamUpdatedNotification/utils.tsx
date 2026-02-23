// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { DEFAULT_AUTO_HIDE_DURATION } from '../../commonComponents/Notistack/fragments/utils';
import {
  NotificationProps,
  RecordingNotificationProps,
  RecordingUpdatedNotification,
  StreamUpdatedNotification,
} from './StreamUpdatedNotification';

/**
 * Used for notifications for all different types of streams (currently recording and livestream).
 */
export const createStreamUpdatedNotification = ({ status, publicUrl }: NotificationProps): void => {
  notifications.toast(<StreamUpdatedNotification status={status} publicUrl={publicUrl} />, {
    variant: 'info',
    ariaLive: 'polite',
    autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
  });
};

export const createRecordingUpdatedNotification = ({ status, eventId }: RecordingNotificationProps): void => {
  notifications.toast(<RecordingUpdatedNotification status={status} eventId={eventId} />, {
    variant: 'info',
    ariaLive: 'polite',
    autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
  });
};
