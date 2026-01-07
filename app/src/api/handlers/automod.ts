// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { createStackedMessages, notificationAction, notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { changeMedia } from '../../store/commonActions';
import {
  remainingUpdated as automodRemainingUpdated,
  speakerUpdated as automodSpeakerUpdated,
  started as automodStarted,
  stopped as automodStopped,
  setAsActiveSpeaker,
  setAsInactiveSpeaker,
} from '../../store/slices/automodSlice';
import { selectAudioEnabled } from '../../store/slices/livekitSlice';
import { selectParticipantsTotal } from '../../store/slices/participantsSlice';
import { AutomodSelectionStrategy } from '../../types';
import { AutomodEventType } from '../types/incoming/automod';
import { automod } from '../types/outgoing';
import { showErrorNotification } from './helpers';

/**
 * Started talking stick notification ID, reused across different
 * event handlers.
 */
export const startedId = 'handleAutomodMessage-started-id';

/**
 * Handles messages in the automod namespace.
 */
export const handleAutomodMessage = (dispatch: AppDispatch, data: AutomodEventType, state: RootState) => {
  const stoppedId = 'handleAutomodMessage-stopped-id';
  const nextId = 'handleAutomodMessage-next-id';
  const currentId = 'handleAutomodMessage-current-id';
  const unmutedId = 'handleAutomodMessage-unmute-only-id';
  const minRecommendedTalkingStickParticipants = 3;

  switch (data.message) {
    case 'started': {
      notifications.close(stoppedId);
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      dispatch(automodStarted(data));

      const totalParticipants = selectParticipantsTotal(state);
      if (totalParticipants < minRecommendedTalkingStickParticipants) {
        notifications.warning(i18next.t('talking-stick-participant-amount-notification'));
      }

      if (data.selectionStrategy === AutomodSelectionStrategy.Playlist) {
        notificationAction({
          key: startedId,
          msg: createStackedMessages([
            i18next.t('talking-stick-started-first-line'),
            i18next.t('talking-stick-started-second-line'),
          ]),
          variant: 'info',
          ariaLive: 'polite',
        });

        if (data.issuedBy === state.user.uuid) {
          dispatch(automod.selectNext.action());
        }
      }
      dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
      break;
    }
    case 'stopped': {
      notifications.close(startedId);
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      dispatch(automodStopped());
      notificationAction({
        key: stoppedId,
        msg: i18next.t('talking-stick-finished'),
        variant: 'info',
        ariaLive: 'polite',
      });

      dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
      break;
    }
    // case 'start_animation':
    //   dispatch(slotStore.initLottery({ winner: data.result, pool: data.pool }));
    //   break;
    case 'remaining_updated':
      dispatch(automodRemainingUpdated(data));
      break;
    case 'speaker_updated': {
      if (data.speaker !== state.user.uuid) {
        dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
        dispatch(setAsInactiveSpeaker());
      }
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      if (data.remaining?.[0] && data.remaining[0] === state.user.uuid) {
        notificationAction({
          key: nextId,
          msg: i18next.t('talking-stick-next-announcement'),
          variant: 'warning',
          ariaLive: 'polite',
          persist: true,
        });
      }
      if (data.speaker === state.user.uuid && state.automod.speakerState === 'inactive') {
        dispatch(setAsActiveSpeaker());

        const unmutedNotificationOptions = {
          onNext: () => {
            dispatch(automod.pass.action());
            notifications.close(unmutedId);
          },
          isLastSpeaker: Boolean(data.remaining && data.remaining.length === 0),
          key: unmutedId,
        } as const;
        const isMicrophoneEnabled = selectAudioEnabled(state);
        if (isMicrophoneEnabled) {
          notifications.showTalkingStickUnmutedNotification(unmutedNotificationOptions);
        } else {
          notifications.showTalkingStickMutedNotification({
            onUnmute: async () => {
              notifications.close(currentId);
              dispatch(changeMedia({ kind: 'audioinput', enabled: true }));
              notifications.showTalkingStickUnmutedNotification(unmutedNotificationOptions);
            },
            onNext: () => {
              dispatch(automod.pass.action());
              notifications.close(currentId);
            },
            key: currentId,
          });
        }
      }
      dispatch(automodSpeakerUpdated(data));
      break;
    }
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown automod message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
