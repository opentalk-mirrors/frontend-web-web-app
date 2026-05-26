// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';
import { truncate } from 'lodash';

import { notifications } from '../../commonComponents';
import i18n from '../../i18n';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  canceled as legalVoteCanceled,
  started as legalVoteStarted,
  stopped as legalVoteStopped,
  updated as legalVoteUpdated,
  voted as legalVoteVoted,
} from '../../store/slices/legalVoteSlice';
import { LegalVoteMessageType, VoteFinalResults } from '../types/incoming/legalVote';
import { showErrorNotification } from './helpers';

/**
 * Handles messages in the legal-vote namespace.
 */
export const handleLegalVoteMessage = (dispatch: AppDispatch, data: LegalVoteMessageType, state: RootState) => {
  switch (data.message) {
    case 'report_generated':
      //TODO implement pdf asset handling
      break;
    case 'started':
      dispatch(legalVoteStarted(data));
      break;
    case 'stopped':
      dispatch(legalVoteStopped(data));
      notifications.info(i18next.t('legal-vote-stopped'));
      if (data.results === VoteFinalResults.Invalid) {
        notifications.warning(i18next.t('legal-vote-stopped-invalid-results-notification'));
      }
      break;
    case 'updated':
      dispatch(legalVoteUpdated(data));
      break;
    case 'canceled':
      dispatch(legalVoteCanceled(data));
      notifications.error(i18next.t('legal-vote-canceled'));
      break;
    case 'voted':
      dispatch(legalVoteVoted(data));
      break;
    case 'reported_issue': {
      // report came from others and not us, our id is not part of participants but user slice.
      if (data.participantId && data.participantId !== state.user.uuid) {
        const displayName = state.participants?.entities[data.participantId]?.displayName || i18n.t('global-someone');
        if (data.kind) {
          notifications.warning(
            i18n.t('legal-vote-report-issue-kind-notification', {
              displayName: truncate(displayName, { length: 50 }),
              kind: data.kind,
            })
          );
        } else {
          notifications.warning(
            i18n.t('legal-vote-report-issue-description-notification', {
              displayName: truncate(displayName, { length: 50 }),
              description: data.description,
            })
          );
        }
      }
      break;
    }
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown legal vote message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
