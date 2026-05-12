// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { truncate } from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateEventMutation } from '../../api/rest';
import { notifications } from '../../commonComponents';
import { MeetingFormValues } from './fragments/DashboardDateTimePicker';
import MeetingForm from './fragments/MeetingForm';
import { createPayload } from './utils/payloadUtils';

interface UpdateMeetingFormProps {
  existingEvent: Event;
  onForwardButtonClick: () => void;
}

const UpdateMeetingForm = ({ existingEvent, onForwardButtonClick }: UpdateMeetingFormProps) => {
  const { t } = useTranslation();
  const [updateEvent, { isLoading: updateEventIsLoading }] = useUpdateEventMutation();
  const isUpdating = useRef(false);

  const handleUpdateEvent = async (values: MeetingFormValues) => {
    // prevents updating the event, until previous update has been finished,
    // in case child form submitted multiple times
    if (isUpdating.current) {
      return;
    }
    isUpdating.current = true;
    try {
      const payload = createPayload(values, existingEvent);
      const event = await updateEvent({
        eventId: existingEvent.id,
        ...payload,
      }).unwrap();
      notifications.success(
        t('dashboard-meeting-notification-success-edit', {
          event: truncate(event.title, { length: 50 }),
        })
      );
    } catch (_err) {
      notifications.error(t('dashboard-meeting-notification-error'));
    } finally {
      isUpdating.current = false;
    }
  };

  return (
    <>
      <MeetingForm
        onSubmit={handleUpdateEvent}
        eventIsLoading={updateEventIsLoading}
        existingEvent={existingEvent}
        onForwardButtonClick={onForwardButtonClick}
      />
    </>
  );
};

export default UpdateMeetingForm;
