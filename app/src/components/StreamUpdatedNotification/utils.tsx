// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { DEFAULT_AUTO_HIDE_DURATION } from '../../commonComponents/Notistack/fragments/utils';
import { StreamUpdatedNotification, NotificationProps } from './StreamUpdatedNotification';

/**
 * Used for notifications for all different types of streams (currently recording and livestream).
 */
export const createStreamUpdatedNotification = ({ kind, status, publicUrl, eventId }: NotificationProps): void => {
  notifications.toast(
    <StreamUpdatedNotification kind={kind} status={status} publicUrl={publicUrl} eventId={eventId} />,
    {
      variant: 'info',
      ariaLive: 'polite',
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
    }
  );
};
