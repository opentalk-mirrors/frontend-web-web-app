// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createAction } from '@reduxjs/toolkit';
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import type { NotificationType } from '../../commonComponents/Notistack/fragments/utils';
import { STORAGE_SECTION_PATH } from '../../pages/Dashboard/Home/fragments/constants';
import type { RootState } from '../../store';
import { selectAccountManagementUrl } from '../../store/slices/configSlice';
import { MeetingNotesAccess } from '../../types';
import type { MeetingNotesState, ParticipantId } from '../../types';
import { isStringEnum } from '../../utils/tsUtils';
import { LegalVoteError } from '../types/incoming/legalVote';

export const mapMeetingNotesToMeetingNotesAccess = (meetingNotes?: MeetingNotesState) => {
  if (!meetingNotes) {
    return MeetingNotesAccess.None;
  }
  if (meetingNotes.readonly) {
    return MeetingNotesAccess.Read;
  }
  return MeetingNotesAccess.Write;
};

//TODO: improve to a more general solution with proper typing as part of #2251(https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2251)
export const showErrorNotification = (message: string) => {
  const errorMessage = message.replaceAll('_', '-');

  const isLegalVoteError = isStringEnum(LegalVoteError)(message);
  if (isLegalVoteError) {
    notifications.error(i18next.t(`${errorMessage}-error`));
    return;
  }

  notifications.error(i18next.t('internal-error'));
};

export const showStorageNotification = (state: RootState, type: NotificationType) => {
  const accountManagementUrl = selectAccountManagementUrl(state);
  const isTariffUpgradable = Boolean(state.user.isTariffUpgradable);
  const keyByType: Partial<Record<NotificationType, string>> = isTariffUpgradable
    ? { warning: 'conference-storage-almost-full-plan-upgrade', error: 'conference-storage-full-plan-upgrade' }
    : { warning: 'conference-storage-almost-full-no-plan-upgrade', error: 'conference-storage-full-no-plan-upgrade' };

  const openAccountManagement = () => {
    window.open(accountManagementUrl, '_blank');
  };
  const openStorageSettings = () => {
    window.open(STORAGE_SECTION_PATH, '_blank');
  };
  const errorMessageKey = keyByType[type] || '';
  if (isTariffUpgradable) {
    notifications.binaryAction(i18next.t(errorMessageKey), {
      type,
      persist: true,
      primaryBtnText: i18next.t('global-upgrade'),
      secondaryBtnText: i18next.t('dashboard-settings-storage'),
      onPrimary: openAccountManagement,
      onSecondary: openStorageSettings,
      secondaryBtnProps: { color: 'primary' },
    });
  } else {
    notifications.binaryAction(i18next.t(errorMessageKey), {
      type,
      persist: true,
      primaryBtnText: i18next.t('dashboard-settings-storage'),
      onPrimary: openStorageSettings,
    });
  }
};

export const handleStorageExceededError = (state: RootState, error: string) => {
  if (error === 'storage_exceeded') {
    showStorageNotification(state, 'error');
  }
};

export const participantRename = createAction<{ id: ParticipantId; newName: string }>('participants/rename');
