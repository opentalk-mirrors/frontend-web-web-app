// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { DateTime, Event, RecurringEvent, RecurrencePattern, SingleEvent } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLazyGetEventsQuery, useGetMeTariffQuery } from '../../../api/rest';
import { CommonTextField } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectConfigFeatures, selectWaitingRoomDefault } from '../../../store/slices/configSlice';
import { findOverlappingEvent } from '../../../utils/eventUtils';
import { formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { isFeatureEnabledPredicate } from '../../../utils/moduleUtils';
import { MAX_CHARACTERS_TITLE, MAX_CHARACTERS_DESCRIPTION, MAX_CHARACTERS_PASSWORD } from '../constants';
import { getInitialValues } from '../utils/initialValues';
import ActionButtons from './ActionButtons';
import { MeetingFormValues } from './DashboardDateTimePicker';
import EventConflictDialog from './EventConflictDialog';
import MeetingFormSwitch from './MeetingFormSwitch';
import RecurrenceSection from './RecurrenceSection';
import StreamingOptions from './StreamingOptions';
import { TrainingParticipationReportSelect } from './TrainingParticipationReportSelect/TrainingParticipationReportSelect';
import { meetingFormValidationSchema } from './meetingFormValidationSchema';

interface MeetingFormProps {
  onSubmit: (values: MeetingFormValues, handleFormSubmit: () => void) => Promise<void>;
  eventIsLoading: boolean;
  existingEvent?: Event;
  onForwardButtonClick?: () => void;
}

const Form = styled('form')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const MeetingForm = ({ onSubmit, eventIsLoading, existingEvent, onForwardButtonClick }: MeetingFormProps) => {
  const { t } = useTranslation();
  const [getEvents] = useLazyGetEventsQuery();
  const isWaitingRoomEnabledByDefault = useAppSelector(selectWaitingRoomDefault);

  const { data: tariff } = useGetMeTariffQuery();
  const isStreamingEnabled = tariff && isFeatureEnabledPredicate('stream', tariff.modules);
  const isTrainingParticipationReportEnabled = tariff?.modules.trainingParticipationReport;

  const [overlappingEvent, setOverlappingEvent] = useState<SingleEvent | RecurringEvent>();

  const features = useAppSelector(selectConfigFeatures);
  const [memoizedRecurrencePattern, setMemoizedRecurrencePattern] = useState<RecurrencePattern | false>(false);

  const formik = useFormik<MeetingFormValues>({
    initialValues: getInitialValues(memoizedRecurrencePattern, isWaitingRoomEnabledByDefault, existingEvent),
    validationSchema: meetingFormValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values: MeetingFormValues) => {
      await onSubmit(values, formik.handleSubmit);
    },
  });

  const handleConfirmOverlappingEvents = () => {
    setOverlappingEvent(undefined);
    formik.handleSubmit();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formik.values.isTimeDependent) {
      formik.handleSubmit();
      return;
    }

    const startDate = formik.values.startDate;
    const endDate = formik.values.endDate;
    const sameTimeEventQueryResponse = await getEvents({
      timeMin: startDate as DateTime,
      timeMax: endDate as DateTime,
    });

    const overlappingEvent = findOverlappingEvent(
      new Date(startDate),
      new Date(endDate),
      sameTimeEventQueryResponse.data.data,
      existingEvent?.id
    );
    if (overlappingEvent) {
      setOverlappingEvent(overlappingEvent);
    } else {
      formik.handleSubmit();
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <CommonTextField
            {...formikProps('title', formik)}
            label={t('dashboard-meeting-textfield-title')}
            placeholder={t('dashboard-meeting-textfield-title-placeholder')}
            fullWidth
            maxCharacters={MAX_CHARACTERS_TITLE}
            required
          />

          <CommonTextField
            {...formikProps('description', formik)}
            label={t('dashboard-meeting-textfield-details')}
            fullWidth
            multiline
            placeholder={t('dashboard-meeting-textfield-details-placeholder')}
            maxCharacters={MAX_CHARACTERS_DESCRIPTION}
          />

          <CommonTextField
            {...formikProps('password', formik)}
            label={t('dashboard-direct-meeting-password-label')}
            fullWidth
            placeholder={t('dashboard-direct-meeting-password-placeholder')}
            maxCharacters={MAX_CHARACTERS_PASSWORD}
          />

          <MeetingFormSwitch
            checked={formik.values.isTimeDependent}
            switchProps={formikSwitchProps('isTimeDependent', formik)}
            switchValueLabel={t('dashboard-meeting-date-and-time-switch')}
          />

          <RecurrenceSection
            formik={formik}
            existingEvent={existingEvent}
            onRecurrencePatternChange={setMemoizedRecurrencePattern}
          />

          <MeetingFormSwitch
            checked={formik.values.waitingRoom}
            switchProps={formikSwitchProps('waitingRoom', formik)}
            switchValueLabel={t('dashboard-meeting-waiting-room-switch')}
          />
          {features.sharedFolder && (
            <MeetingFormSwitch
              checked={formik.values.sharedFolder}
              switchProps={formikSwitchProps('sharedFolder', formik)}
              switchValueLabel={t('dashboard-meeting-shared-folder-switch')}
            />
          )}
          <MeetingFormSwitch
            checked={formik.values.showMeetingDetails}
            switchProps={formikSwitchProps('showMeetingDetails', formik)}
            switchValueLabel={t('dashboard-meeting-details-switch')}
            tooltipTitle={t('dashboard-meeting-details-tooltip')}
          />

          {isStreamingEnabled && <StreamingOptions formik={formik} />}

          {isTrainingParticipationReportEnabled && <TrainingParticipationReportSelect formik={formik} />}

          {features.e2eEncryption && (
            <MeetingFormSwitch
              checked={formik.values.e2eEncryption}
              switchProps={formikSwitchProps('e2eEncryption', formik)}
              switchValueLabel={t('dashboard-meeting-e2ee-switch')}
              tooltipTitle={t('dashboard-meeting-e2ee-tooltip')}
            />
          )}
        </Stack>
        <ActionButtons
          isExistingEvent={Boolean(existingEvent)}
          disableSaveButton={formik.isSubmitting || eventIsLoading}
          onForwardButtonClick={onForwardButtonClick}
        />
      </Form>
      {overlappingEvent && (
        <EventConflictDialog
          onConfirm={handleConfirmOverlappingEvents}
          onCancel={() => setOverlappingEvent(undefined)}
          event={overlappingEvent}
          isUpdate={Boolean(existingEvent)}
        />
      )}
    </>
  );
};

export default MeetingForm;
