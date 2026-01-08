// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';
import { kebabCase } from 'lodash';

import { notificationPersistent, notifications } from '../../commonComponents';
import i18n from '../../i18n';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { media } from '../types/incoming';

/**
 * Handles messages in the media namespace.
 */
export const handleMediaMessage = async (_dispatch: AppDispatch, data: media.Message, state: RootState) => {
  switch (data.message) {
    case 'presenter_role_granted':
    case 'presenter_role_revoked': {
      const [participantId] = data.participantIds;
      const { displayName } = state.participants.entities[participantId] || {};
      notifications[data.message === 'presenter_role_granted' ? 'info' : 'warning'](
        i18n.t(kebabCase(data.message), { displayName })
      );
      break;
    }
    case 'error': {
      const error = data.error;
      switch (error) {
        case 'invalid_end_of_candidates':
          notificationPersistent({
            msg: i18next.t('media-ice-connection-not-possible'),
            variant: 'error',
            ariaLive: 'assertive',
          });
          break;
        case 'invalid_request_offer':
        case 'invalid_sdp_offer':
        case 'handle_sdp_answer':
        case 'invalid_candidate':
        case 'invalid_configure_request':
        case 'permission_denied':
          log.error(`Media Error: ${data}`);
          notifications.error(i18next.t('error-general'));
          throw new Error(`Media Error: ${error}`);
        default:
          log.error(`Media Error: ${data}`);
          throw new Error(`Media Error: ${error}`);
      }
    }
  }
};
