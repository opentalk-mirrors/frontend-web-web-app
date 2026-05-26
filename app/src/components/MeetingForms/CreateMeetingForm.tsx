// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CreateEventPayload } from '@opentalk/rest-api-rtk-query';
import { truncate } from 'lodash';
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
  const isCreating = useRef(false);
  const navigate = useNavigate();

  const handleCreateEvent = async (values: MeetingFormValues) => {
    // prevents creating several same events, in case a form submitted multiple times
    if (isCreating.current) {
      return;
    }
    isCreating.current = true;
    try {
      const payload = createPayload(values) as CreateEventPayload;
      const event = await createEvent(payload).unwrap();
      notifications.success(
        t('dashboard-meeting-notification-success-create', {
          event: truncate(event.title, { length: 50 }),
        })
      );
      navigate(`/dashboard/meetings/update/${event.id}/1`, {
        state: { ...getReferrerRouterState(window.location) },
      });
    } catch (_err) {
      notifications.error(t('dashboard-meeting-notification-error'));
    } finally {
      isCreating.current = false;
    }
  };

  return (
    <>
      <MeetingForm onSubmit={handleCreateEvent} eventIsLoading={createEventIsLoading} />
    </>
  );
};

export default CreateMeetingForm;
