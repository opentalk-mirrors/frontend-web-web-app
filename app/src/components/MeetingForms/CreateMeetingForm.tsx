// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useCreateEventMutation } from '../../api/rest';
import { notifications } from '../../commonComponents';
import getReferrerRouterState from '../../utils/getReferrerRouterState';
import { MeetingFormValues } from './fragments/DashboardDateTimePicker';
import MeetingForm from './fragments/MeetingForm';
import { createPayload } from './utils/payloadUtils';

const CreateMeetingForm = () => {
  const { t } = useTranslation();
  const [createEvent, { isLoading: createEventIsLoading }] = useCreateEventMutation();
  const event = useRef<Event | undefined>(undefined);
  const navigate = useNavigate();

  const handleCreateEvent = async (values: MeetingFormValues) => {
    const payload = createPayload(values);
    try {
      // prevents new events to be saved as a second event
      if (event.current === undefined) {
        event.current = await createEvent(payload).unwrap();
      }
      notifications.success(t('dashboard-meeting-notification-success-create', { event: event.current?.title }));
      navigate(`/dashboard/meetings/update/${event.current?.id}/1`, {
        state: { ...getReferrerRouterState(window.location) },
      });
    } catch (_err) {
      notifications.error(t('dashboard-meeting-notification-error'));
    }
  };

  return (
    <>
      <MeetingForm onSubmit={handleCreateEvent} eventIsLoading={createEventIsLoading} />
    </>
  );
};

export default CreateMeetingForm;
