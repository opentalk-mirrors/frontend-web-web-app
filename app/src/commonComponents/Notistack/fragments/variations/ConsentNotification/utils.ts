// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sendStreamConsentSignal } from '../../../../../api/types/outgoing/streaming';
import type { AppDispatch } from '../../../../../store';
import { changeMedia, setScreenShareEnabled } from '../../../../../store/commonActions';
import { notifications } from '../../utils';

export const showConsentNotification = (dispatch: AppDispatch) =>
  new Promise((resolve) => {
    const key = 'consent-alert-dialog';

    const setRecordingConsent = async (consent: boolean) => {
      dispatch(sendStreamConsentSignal.action({ consent }));
      notifications.close(key);
      if (!consent) {
        dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
        dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
        dispatch(setScreenShareEnabled({ enabled: false }));
      }
      resolve(consent);
    };

    notifications.consent({
      onAcceptButton: () => setRecordingConsent(true),
      onDeclineButton: () => setRecordingConsent(false),
      key,
    });
  });
