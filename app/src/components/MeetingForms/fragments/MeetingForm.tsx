// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Divider, Stack, Typography, styled } from '@mui/material';
import {
  DateTime,
  Event,
  RecurringEvent,
  RecurrencePattern,
  SingleEvent,
  RecordingFeatures,
  GuestAccess,
  CoreFeatures,
} from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import { debounce } from 'lodash';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLazyGetEventsWithInstancesQuery, useGetMeTariffQuery, useVerifyRoomNameMutation } from '../../../api/rest';
import { CommonTextField } from '../../../commonComponents';
import CustomHelperText from '../../../commonComponents/CommonTextField/CustomHelperText';
import { useAppSelector } from '../../../hooks';
import { selectConfigFeatures, selectWaitingRoomDefault } from '../../../store/slices/configSlice';
import { findOverlappingEvent } from '../../../utils/eventUtils';
import { formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { isFeatureEnabledPredicate } from '../../../utils/moduleUtils';
import {
  MAX_CHARACTERS_TITLE,
  MAX_CHARACTERS_DESCRIPTION,
  MAX_CHARACTERS_PASSWORD,
  MAX_CHARACTERS_ALIAS,
  MIN_CHARACTERS_ALIAS,
  VALID_ALIAS_INPUT_PATTERN,
  ALIAS_CHECK_DEBOUNCE_MS,
} from '../constants';
import { getInitialValues } from '../utils/initialValues';
import { slugifyRoomName } from '../utils/slugifyRoomName';
import ActionButtons from './ActionButtons';
import { MeetingFormValues } from './DashboardDateTimePicker';
import DateTimeSection from './DateTimeSection';
import EventConflictDialog from './EventConflictDialog';
import { GuestAccessSelect } from './GuestAccessSelect/GuestAccessSelect';
import MeetingFormSwitch from './MeetingFormSwitch';
import StreamingOptions from './StreamingOptions';
import { TrainingParticipationReportSelect } from './TrainingParticipationReportSelect/TrainingParticipationReportSelect';
import { meetingFormValidationSchema } from './meetingFormValidationSchema';

interface MeetingFormProps {
  onSubmit: (values: MeetingFormValues, handleFormSubmit: () => void) => Promise<void>;
  eventIsLoading: boolean;
  existingEvent?: Event;
  onForwardButtonClick?: () => void;
}

const Form = styled('form')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
}));

const MAX_INSTANCES_PER_RECURRING_EVENT = 100;

const MeetingForm = ({ onSubmit, eventIsLoading, existingEvent, onForwardButtonClick }: MeetingFormProps) => {
  const { t } = useTranslation();
  const [getEventsWithInstances] = useLazyGetEventsWithInstancesQuery();
  const [checkAliasExists, aliasExistsResult] = useVerifyRoomNameMutation();
  const isWaitingRoomEnabledByDefault = useAppSelector(selectWaitingRoomDefault);

  const { data: tariff } = useGetMeTariffQuery();
  const isStreamingEnabled = tariff && isFeatureEnabledPredicate(RecordingFeatures.Stream, tariff.modules);
  const isSharedFolderEnabled = tariff?.modules.sharedFolder;
  const isTrainingParticipationReportEnabled = tariff?.modules.trainingParticipationReport;
  const isGuestAccessAllowedByTariff = Boolean(
    tariff && isFeatureEnabledPredicate(CoreFeatures.GuestsAllowed, tariff.modules)
  );

  const [overlappingEvent, setOverlappingEvent] = useState<SingleEvent | RecurringEvent>();

  const features = useAppSelector(selectConfigFeatures);
  const [memoizedRecurrencePattern, setMemoizedRecurrencePattern] = useState<RecurrencePattern | false>(false);
  const [previousGuestAccess, setPreviousGuestAccess] = useState<GuestAccess>();
  const [pendingCheckName, setPendingCheckName] = useState<string>();

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
  const { setFieldValue } = formik;

  const [isPersonalRoomNameManuallyEdited, setIsPersonalRoomNameManuallyEdited] = useState(() =>
    Boolean(formik.initialValues.personalRoomName)
  );

  const handleConfirmOverlappingEvents = () => {
    setOverlappingEvent(undefined);
    formik.handleSubmit();
  };

  const handleE2EEChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue('e2eEncryption', checked);
    if (checked) {
      setPreviousGuestAccess(formik.values.guestAccess);
      setFieldValue('streaming', { enabled: false });
      setFieldValue('guestAccess', GuestAccess.Disabled);
    } else if (previousGuestAccess !== undefined) {
      setFieldValue('guestAccess', previousGuestAccess);
    }
  };

  const personalRoomName = formik.values.personalRoomName ?? '';
  const hasValidAliasChars = VALID_ALIAS_INPUT_PATTERN.test(personalRoomName);
  const isPersonalRoomNameValid = hasValidAliasChars && personalRoomName.length >= MIN_CHARACTERS_ALIAS;
  const isPersonalRoomNameTaken =
    aliasExistsResult.originalArgs?.name === personalRoomName && aliasExistsResult.data?.available === false;
  const personalRoomNameHasError = personalRoomName.length > 0 && (!hasValidAliasChars || isPersonalRoomNameTaken);
  const findFirstInvalidChar = (value: string) => value.split('').find((char) => !VALID_ALIAS_INPUT_PATTERN.test(char));

  const debouncedCheckAliasExists = useMemo(
    () => debounce((name: string) => checkAliasExists({ name }), ALIAS_CHECK_DEBOUNCE_MS),
    [checkAliasExists]
  );

  useEffect(() => () => debouncedCheckAliasExists.cancel(), [debouncedCheckAliasExists]);

  // auto-suggest the personal room name from the meeting title until the organizer edits it manually
  useEffect(() => {
    if (isPersonalRoomNameManuallyEdited || !formik.values.personalRoom) {
      return;
    }
    const suggestion = slugifyRoomName(formik.values.title ?? '');
    setFieldValue('personalRoomName', suggestion);
    if (suggestion.length >= MIN_CHARACTERS_ALIAS) {
      debouncedCheckAliasExists(suggestion);
    } else {
      debouncedCheckAliasExists.cancel();
    }
  }, [
    formik.values.title,
    formik.values.personalRoom,
    isPersonalRoomNameManuallyEdited,
    debouncedCheckAliasExists,
    setFieldValue,
  ]);

  const handlePersonalRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIsPersonalRoomNameManuallyEdited(true);
    setFieldValue('personalRoomName', value);
    if (value.length >= MIN_CHARACTERS_ALIAS) {
      setPendingCheckName(value);
      debouncedCheckAliasExists(value);
    } else {
      setPendingCheckName(undefined);
      debouncedCheckAliasExists.cancel();
    }
  };

  const renderPersonalRoomNameFeedback = () => {
    const value = formik.values.personalRoomName ?? '';

    if (!hasValidAliasChars) {
      return (
        <Typography variant="caption" color="textError">
          {t('dashboard-meeting-personal-room-name-invalid-chars', {
            char: findFirstInvalidChar(value),
          })}
        </Typography>
      );
    }

    if (value.length < MIN_CHARACTERS_ALIAS) {
      return null;
    }

    const resultMatchesInput = aliasExistsResult.originalArgs?.name === value;
    const isCheckPendingForValue = pendingCheckName === value && !resultMatchesInput;
    if (aliasExistsResult.isLoading || isCheckPendingForValue) {
      return (
        <Typography variant="caption" color="text.secondary">
          {t('dashboard-meeting-personal-room-name-checking')}
        </Typography>
      );
    }
    if (aliasExistsResult.isSuccess) {
      return (
        <Typography variant="caption" color={aliasExistsResult.data.available ? 'success.main' : 'textError'}>
          {aliasExistsResult.data.available
            ? t('dashboard-meeting-personal-room-name-available')
            : t('dashboard-meeting-personal-room-name-taken')}
        </Typography>
      );
    }
    if (aliasExistsResult.isError) {
      return (
        <Typography variant="caption" color="textError">
          {t('dashboard-meeting-personal-room-name-check-error')}
        </Typography>
      );
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formik.values.isTimeDependent) {
      formik.handleSubmit();
      return;
    }

    const startDate = formik.values.startDate;
    const endDate = formik.values.endDate;
    const sameTimeEventQueryResponse = await getEventsWithInstances({
      timeMin: startDate as DateTime,
      timeMax: endDate as DateTime,
      timeIndependent: false,
      instancesMax: MAX_INSTANCES_PER_RECURRING_EVENT,
    });

    const overlappingEvent =
      sameTimeEventQueryResponse.data &&
      findOverlappingEvent(
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
      <Form
        onSubmit={handleSubmit}
        aria-label={existingEvent ? t('dashboard-meeting-update-form-title') : t('dashboard-meeting-create-form-title')}
      >
        <Stack spacing={2} pb={2}>
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

          <DateTimeSection
            formik={formik}
            existingEvent={existingEvent}
            onRecurrencePatternChange={setMemoizedRecurrencePattern}
          />

          <Divider textAlign="left">{t('dashboard-meeting-access-and-security')}</Divider>

          <MeetingFormSwitch
            checked={formik.values.personalRoom}
            switchProps={formikSwitchProps('personalRoom', formik)}
            switchValueLabel={t('dashboard-meeting-personal-room-switch')}
          />

          {formik.values.personalRoom && (
            <Stack spacing={0.5}>
              <CommonTextField
                {...formikProps('personalRoomName', formik)}
                label={t('dashboard-meeting-personal-room-name-label')}
                placeholder={t('dashboard-meeting-personal-room-name-placeholder')}
                fullWidth
                maxCharacters={MAX_CHARACTERS_ALIAS}
                error={personalRoomNameHasError}
                onChange={handlePersonalRoomNameChange}
                helperText={
                  <CustomHelperText
                    helperText={t('dashboard-meeting-personal-room-name-helper-text')}
                    characterCount={formik.values.personalRoomName?.length ?? 0}
                    maxCharacters={MAX_CHARACTERS_ALIAS}
                  />
                }
                required
              />
              {(formik.values.personalRoomName?.length ?? 0) > 0 && renderPersonalRoomNameFeedback()}
            </Stack>
          )}

          {features.e2eEncryption && (
            <MeetingFormSwitch
              checked={formik.values.e2eEncryption}
              switchProps={{
                ...formikSwitchProps('e2eEncryption', formik),
                onChange: handleE2EEChange,
              }}
              switchValueLabel={t('dashboard-meeting-e2ee-switch')}
              tooltipTitle={t('dashboard-meeting-e2ee-tooltip')}
            />
          )}

          <GuestAccessSelect
            formik={formik}
            guestAccessAllowed={!formik.values.e2eEncryption && isGuestAccessAllowedByTariff}
          />

          <Divider textAlign="left">{t('dashboard-meeting-extras')}</Divider>

          <MeetingFormSwitch
            checked={formik.values.showMeetingDetails}
            switchProps={formikSwitchProps('showMeetingDetails', formik)}
            switchValueLabel={t('dashboard-meeting-details-switch')}
            tooltipTitle={t('dashboard-meeting-details-tooltip')}
          />

          {isSharedFolderEnabled && (
            <MeetingFormSwitch
              checked={formik.values.sharedFolder}
              switchProps={formikSwitchProps('sharedFolder', formik)}
              switchValueLabel={t('dashboard-meeting-shared-folder-switch')}
            />
          )}

          {isTrainingParticipationReportEnabled && <TrainingParticipationReportSelect formik={formik} />}

          {isStreamingEnabled && !formik.values.e2eEncryption && <StreamingOptions formik={formik} />}
        </Stack>
        <ActionButtons
          isExistingEvent={Boolean(existingEvent)}
          disableSaveButton={
            formik.isSubmitting ||
            eventIsLoading ||
            formik.dirty === false ||
            (formik.values.personalRoom && (!isPersonalRoomNameValid || isPersonalRoomNameTaken))
          }
          disableCancelButton={formik.isSubmitting || eventIsLoading}
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
