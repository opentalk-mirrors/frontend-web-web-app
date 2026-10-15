// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { truncate } from 'es-toolkit/compat';
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import { MAX_CHARS_FOR_NOTIFICATION } from '../../constants';
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
      // our own reports are not echoed as notification; pseudonymous reports carry no participantId
      if (data.participantId === state.user.uuid) {
        break;
      }
      const displayName = data.participantId
        ? state.participants?.entities[data.participantId]?.displayName || i18n.t('global-someone')
        : i18n.t('global-someone');
      if (data.kind) {
        notifications.warning(
          i18n.t('legal-vote-report-issue-kind-notification', {
            displayName: truncate(displayName, { length: MAX_CHARS_FOR_NOTIFICATION }),
            kind: data.kind,
          })
        );
      } else if (data.participantId) {
        notifications.warning(
          i18n.t('legal-vote-report-issue-description-participant-notification', {
            displayName: truncate(displayName, { length: MAX_CHARS_FOR_NOTIFICATION }),
            description: data.description,
          })
        );
      } else {
        notifications.warning(
          i18n.t('legal-vote-report-issue-description-pseudonymous-notification', {
            description: data.description,
          })
        );
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
