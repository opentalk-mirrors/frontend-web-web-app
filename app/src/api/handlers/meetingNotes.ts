// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction, notifications } from '../../commonComponents';
import LayoutOptions from '../../enums/LayoutOptions';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from '../../store/slices/meetingNotesSlice';
import { updatedCinemaLayout } from '../../store/slices/uiSlice';
import { MeetingNotesAccess, Role } from '../../types';
import { meetingNotes } from '../types/incoming';
import { handleStorageExceededError } from './helpers';

/**
 * Handles meetingNotes messages.
 */
export const handleMeetingNotesMessage = (
  dispatch: AppDispatch,
  data: meetingNotes.IncomingMeetingNotes,
  state: RootState
) => {
  switch (data.message) {
case 'pdf_created':
      notifications.info(i18next.t('meeting-notes-upload-pdf-message'));
      break;
    case 'write_access_received':
      if (state.user.meetingNotesAccess === MeetingNotesAccess.None) {
        const message = i18next.t(
          state.user.role === Role.Moderator
            ? 'meeting-notes-created-all-notification'
            : 'meeting-notes-created-notification'
        );
        notificationAction({
          msg: message,
          variant: 'info',
          ariaLive: 'polite',
          actionBtnText: i18next.t('meeting-notes-new-meeting-notes-message-button'),
          onAction: () => dispatch(updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true })),
        });
      }
      dispatch(setMeetingNotesWriteUrl(data.url.toString()));
      break;
    case 'read_access_received':
      if (state.user.meetingNotesAccess === MeetingNotesAccess.None) {
        const message = i18next.t(
          state.user.role === Role.Moderator
            ? 'meeting-notes-created-all-notification'
            : 'meeting-notes-created-notification'
        );
        notificationAction({
          msg: message,
          variant: 'info',
          ariaLive: 'polite',
          actionBtnText: i18next.t('meeting-notes-new-meeting-notes-message-button'),
          onAction: () => dispatch(updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true })),
        });
      }
      dispatch(setMeetingNotesReadUrl(data.url.toString()));
      break;
    case 'access_changed':
      break;
    case 'error':
      handleStorageExceededError(state, data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown meeting notes message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
