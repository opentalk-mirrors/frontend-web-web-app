// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { selectParticipantById } from '../../store/slices/participantsSlice';
import {
  inviteParticipants,
  removeParticipant,
  resetSubroomAudioData,
  selectSubroomAudioState,
  setSubroomAudioData,
  updateParticipantInviteState,
} from '../../store/slices/subroomAudioSlice';
import { selectOurUuid } from '../../store/slices/userSlice';
import { WhisperParticipantState } from '../../types';
import { subroomAudio } from '../types/incoming';
import { acceptWhisperInvite, declineWhisperInvite } from '../types/outgoing/subroomAudio';

/**
 * Handles messages in the subroom audio namespace.
 */
export const handleSubroomAudioMessage = (dispatch: AppDispatch, data: subroomAudio.Message, state: RootState) => {
  switch (data.message) {
    case 'whisper_group_created':
      dispatch(setSubroomAudioData({ whisperId: data.whisperId, token: data.token, participants: data.participants }));
      break;
    case 'whisper_invite': {
      const isAlreadyInWhisperGroup = selectSubroomAudioState(state).whisperId;
      if (isAlreadyInWhisperGroup) {
        dispatch(declineWhisperInvite.action({ whisperId: data.whisperId }));
        break;
      }

      dispatch(setSubroomAudioData({ whisperId: data.whisperId, participants: data.participants }));

      const displayName = selectParticipantById(data.issuer)(state)?.displayName;
      notificationAction({
        msg: i18next.t('whisper-invite-notification', { displayName }),
        variant: 'info',
        ariaLive: 'polite',
        actionBtnText: i18next.t('global-accept'),
        cancelBtnText: i18next.t('global-decline'),
        persist: true,
        onAction: () => {
          dispatch(acceptWhisperInvite.action({ whisperId: data.whisperId }));
        },
        onCancel: () => {
          dispatch(declineWhisperInvite.action({ whisperId: data.whisperId }));
          dispatch(resetSubroomAudioData());
        },
      });
      break;
    }
    case 'whisper_token': {
      const subroomAudioState = selectSubroomAudioState(state);
      const myOwnParticipantId = selectOurUuid(state);
      const updatedParticipants = subroomAudioState.participants.map((p) =>
        p.participantId === myOwnParticipantId ? { ...p, state: WhisperParticipantState.Accepted } : p
      );
      dispatch(
        setSubroomAudioData({ whisperId: data.whisperId, token: data.token, participants: updatedParticipants })
      );
      break;
    }
    case 'participants_invited':
      dispatch(inviteParticipants({ participants: data.participantIds }));
      break;
    case 'whisper_invite_accepted': {
      const displayName = selectParticipantById(data.participantId)(state)?.displayName;
      notificationAction({
        msg: i18next.t('whisper-invite-accept-notification', { displayName }),
        variant: 'info',
        ariaLive: 'polite',
      });
      dispatch(
        updateParticipantInviteState({
          participantId: data.participantId,
          participantState: WhisperParticipantState.Accepted,
        })
      );
      break;
    }
    case 'whisper_invite_declined': {
      const displayName = selectParticipantById(data.participantId)(state)?.displayName;
      dispatch(removeParticipant({ participantId: data.participantId }));
      notificationAction({
        msg: i18next.t('whisper-invite-decline-notification', { displayName }),
        variant: 'error',
        ariaLive: 'assertive',
      });
      break;
    }
    case 'left_whisper_group':
      dispatch(removeParticipant({ participantId: data.participantId }));
      break;
    case 'error': {
      const error = data.error;
      switch (error) {
        default:
          log.error(`Livekit Error: ${data}`);
          throw new Error(`Livekit Error: ${error}`);
      }
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown subroom audio message type: ${dataString}`);
    }
  }
};
