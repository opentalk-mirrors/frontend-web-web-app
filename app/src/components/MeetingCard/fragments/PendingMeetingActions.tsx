// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack } from '@mui/material';
import { Event, EventId } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { useAcceptEventInviteMutation, useDeclineEventInviteMutation } from '../../../api/rest';
import { notifications } from '../../../commonComponents';

interface PendingMeetingActionsProps {
  event: Event;
}

export const PendingMeetingActions = ({ event }: PendingMeetingActionsProps) => {
  const { t } = useTranslation();
  const { title } = event;
  const eventId = event.id as EventId;

  const [acceptEventInvitation] = useAcceptEventInviteMutation();
  const [declineEventInvitation] = useDeclineEventInviteMutation();

  const acceptInvite = async () => {
    try {
      await acceptEventInvitation({ eventId }).unwrap();
      notifications.success(
        t('dashboard-event-accept-invitation-notification', {
          meetingTitle: title,
        })
      );
    } catch (_error) {
      notifications.error(
        t('error-general', {
          meetingTitle: title,
        })
      );
    }
  };

  const declineInvite = async () => {
    try {
      await declineEventInvitation({ eventId }).unwrap();
      notifications.success(
        t('dashboard-event-decline-invitation-notification', {
          meetingTitle: title,
        })
      );
    } catch (_error) {
      notifications.error(
        t('error-general', {
          meetingTitle: title,
        })
      );
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" onClick={declineInvite} onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}>
        {t('global-decline')}
      </Button>
      <Button onClick={acceptInvite} onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}>
        {t('global-accept')}
      </Button>
    </Stack>
  );
};
