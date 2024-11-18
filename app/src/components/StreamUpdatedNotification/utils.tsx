// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { StreamUpdatedNotification, NotificationProps } from './StreamUpdatedNotification';

/**
 * Used for notifications for all different types of streams (currently recording and livestream).
 */
export const createStreamUpdatedNotification = ({ kind, status, publicUrl, eventId }: NotificationProps): void => {
  notifications.toast(
    <StreamUpdatedNotification kind={kind} status={status} publicUrl={publicUrl} eventId={eventId} />,
    {
      variant: 'info',
    }
  );
};
