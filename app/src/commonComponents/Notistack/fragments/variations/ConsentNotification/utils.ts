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

    const setRecordingConsent = async (consent: boolean) => {
      dispatch(sendStreamConsentSignal.action({ consent }));
      notifications.close(key);
      if (!consent) {
        const room = getLivekitRoom();
        await room.localParticipant.setCameraEnabled(false);
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setScreenShareEnabled(false);
      }
      resolve(consent);
    };

    notifications.consent({
      onAcceptButton: () => setRecordingConsent(true),
      onDeclineButton: () => setRecordingConsent(false),
      key,
    });
  });
