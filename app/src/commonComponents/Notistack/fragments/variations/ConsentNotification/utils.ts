// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sendStreamConsentSignal } from '../../../../../api/types/outgoing/streaming';
import { AppDispatch } from '../../../../../store';
import { getLivekitRoom } from '../../../../../store/slices/livekitSlice';
import { notifications } from '../../utils';

export const showConsentNotification = (dispatch: AppDispatch) =>
  new Promise((resolve) => {
    const key = 'consent-alert-dialog';

    const setRecordingConsent = (consent: boolean) => {
      dispatch(sendStreamConsentSignal.action({ consent }));
      notifications.close(key);
      if (!consent) {
        const room = getLivekitRoom();
        room.localParticipant.setCameraEnabled(false);
        room.localParticipant.setMicrophoneEnabled(false);
        room.localParticipant.setScreenShareEnabled(false);
      }
      resolve(consent);
    };

    notifications.consent({
      onAcceptButton: () => setRecordingConsent(true),
      onDeclineButton: () => setRecordingConsent(false),
      key,
    });
  });
