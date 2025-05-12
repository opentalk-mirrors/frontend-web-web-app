// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { useUpdateEventMutation } from '../../api/rest';
import { notifications } from '../../commonComponents';
import { MeetingFormValues } from './fragments/DashboardDateTimePicker';
import MeetingForm from './fragments/MeetingForm';
import { useSharedFolderUpdate } from './hooks/useSharedFolderUpdate';
import { createPayload } from './utils/payloadUtils';

interface UpdateMeetingFormProps {
  existingEvent: Event;
  onForwardButtonClick: () => void;
}

const UpdateMeetingForm = ({ existingEvent, onForwardButtonClick }: UpdateMeetingFormProps) => {
  const { t } = useTranslation();
  const [updateEvent, { isLoading: updateEventIsLoading }] = useUpdateEventMutation();

  const { handleUpdateSharedFolder } = useSharedFolderUpdate();

  const handleUpdateEvent = async (values: MeetingFormValues, handleFormSubmit: () => void) => {
    const payload = createPayload(values, existingEvent);
    try {
      const goToNextStep = await handleUpdateSharedFolder(existingEvent, values, handleFormSubmit);
      if (goToNextStep === false) {
        return;
      }
      const event = await updateEvent({
        eventId: existingEvent.id,
        ...payload,
      }).unwrap();

      notifications.success(t('dashboard-meeting-notification-success-edit', { event: event.title }));
    } catch (_err) {
      notifications.error(t('dashboard-meeting-notification-error'));
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
