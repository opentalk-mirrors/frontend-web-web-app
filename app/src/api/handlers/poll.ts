// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch } from '../../store';
import * as pollStore from '../../store/slices/pollSlice';
import { Message, PollError } from '../types/incoming/poll';

const handlePollError = (error: PollError) => {
  switch (error) {
    case PollError.InsufficientPermissions:
      notifications.error(i18next.t('poll-error-insufficient-permissions'));
      break;
    case PollError.InvalidChoiceCount:
      notifications.error(i18next.t('poll-error-invalid-choice-count'));
      break;
    case PollError.InvalidPollId:
      notifications.error(i18next.t('poll-error-invalid-poll-id'));
      break;
    case PollError.InvalidChoiceId:
      notifications.error(i18next.t('poll-error-invalid-choice-id'));
      break;
    case PollError.InvalidDuration:
      notifications.error(i18next.t('poll-error-invalid-duration'));
      break;
    case PollError.VotedAlready:
      notifications.error(i18next.t('poll-error-voted-already'));
      break;
    case PollError.StillRunning:
      notifications.error(i18next.t('poll-error-still-running'));
      break;
    default:
      log.error('Poll error message ', error);
      break;
  }
};

/**
 * Handles messages in the poll namespace.
 */
export const handlePollVoteMessage = (dispatch: AppDispatch, data: Message) => {
  switch (data.message) {
    case 'started':
      dispatch(pollStore.started(data));
      break;
    case 'live_update':
      dispatch(pollStore.liveUpdated(data));
      break;
    case 'done':
      dispatch(pollStore.done(data));
      break;
    case 'error':
      handlePollError(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown poll message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
