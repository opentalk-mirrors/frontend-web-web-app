// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { WithLinkNotification, NotificationProps } from './WithLinkNotification';

/**
 * Used for notifications with link.
 * Message translation key should contain:
 *  <messageContainer> tag, which wraps the whole message
 *  <messageLink> tag, which wraps the link part
 * refer to meeting-report-pdf-asset-message, as an example
 */
export const showWithLinkNotification = (props: NotificationProps): void => {
  const { translationKey, url } = props;
  notifications.toast(<WithLinkNotification translationKey={translationKey} url={url} />, {
    variant: 'info',
  });
};
