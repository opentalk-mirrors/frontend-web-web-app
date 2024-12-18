// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule } from '@heinlein-video/rrule';
import { Button, Collapse, Grid, MenuItem, SelectChangeEvent, Stack, styled } from '@mui/material';
import {
  CreateEventPayload,
  DateTime,
  Event,
  EventException,
  RecurrencePattern,
  RecurringEvent,
  SingleEvent,
  UpdateEventPayload,
  isRecurringEvent,
  isTimelessEvent,
} from '@opentalk/rest-api-rtk-query';
import { Interval, addMinutes, areIntervalsOverlapping, formatRFC3339 } from 'date-fns';
import { useFormik } from 'formik';
import { FormikValues } from 'formik/dist/types';
import { isEmpty } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import {
  useCreateEventMutation,
  useCreateEventSharedFolderMutation,
  useDeleteEventSharedFolderMutation,
  useGetMeTariffQuery,
  useLazyGetEventsQuery,
  useUpdateEventMutation,
} from '../../api/rest';
import { ForwardIcon } from '../../assets/icons';
import { CommonTextField, notificationAction, notifications } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { selectFeatures, selectWaitingRoomDefault } from '../../store/slices/configSlice';
import { appendRecurringEventInstances } from '../../utils/eventUtils';
import { formikMinimalProps, formikProps } from '../../utils/formikUtils';
import getReferrerRouterState from '../../utils/getReferrerRouterState';
import { isFeatureEnabledPredicate } from '../../utils/moduleUtils';
import roundToUpper30 from '../../utils/roundToUpper30';
import { CommonFrequencies, FrequencyOption, getRRuleText } from '../../utils/rruleUtils';
import { isInvalidDate } from '../../utils/typeGuardUtils';
import yup from '../../utils/yupUtils';
import { RecurringEventDialog } from './fragments/CustomRecurringEventDialog/CustomRecurringEventDialog';
import { CreateOrUpdateMeetingFormikValues, DashboardDateTimePicker } from './fragments/DashboardDateTimePicker';
import EventConflictDialog from './fragments/EventConflictDialog';
import MeetingFormSwitch from './fragments/MeetingFormSwitch';
import StreamingOptions from './fragments/StreamingOptions';

interface CreateOrUpdateMeetingFormProps {
  existingEvent?: Event;
  onForwardButtonClick?: () => void;
}

const Form = styled('form')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const Select = styled(CommonTextField)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiInputBase-input': {
      maxWidth: theme.typography.pxToRem(285),
    },
  },
}));

const DEFAULT_MINUTES_DIFFERENCE = 30;
const MAX_CHARACTERS_TITLE = 255;
const MAX_CHARACTERS_PASSWORD = 255;
const MAX_CHARACTERS_DESCRIPTION = 4096;

const CreateOrUpdateMeetingForm = ({ existingEvent, onForwardButtonClick }: CreateOrUpdateMeetingFormProps) => {
  const { t } = useTranslation();
  const [createEvent, { isLoading: createEventIsLoading }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updateEventIsLoading }] = useUpdateEventMutation();
  const [checkForEvents] = useLazyGetEventsQuery();
  const [createSharedFolder] = useCreateEventSharedFolderMutation();
  const [deleteSharedFolder] = useDeleteEventSharedFolderMutation();
  const isWaitingRoomEnabledByDefault = useAppSelector(selectWaitingRoomDefault);
  const waitingRoomInitialValue = existingEvent?.room.waitingRoom ?? isWaitingRoomEnabledByDefault;

  const { data: tariff } = useGetMeTariffQuery();
  const isStreamingEnabled = tariff && isFeatureEnabledPredicate('stream', tariff.modules);

  const navigate = useNavigate();

  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false);
  const [isRecurrenceSelectOpen, setIsRecurrenceSelectOpen] = useState(false);

  const [overlappingEvent, setOverlappingEvent] = useState<SingleEvent | RecurringEvent>();

  const defaultStartDate = roundToUpper30();
  const defaultEndDate = addMinutes(defaultStartDate, DEFAULT_MINUTES_DIFFERENCE);
  const features = useAppSelector(selectFeatures);
  const [isFirstTryToCreateSharedFolder, setIsFirstTryToCreateSharedFolder] = useState(true);
  const [isFirstTryToDeleteSharedFolder, setIsFirstTryToDeleteSharedFolder] = useState(true);
  const event = useRef<Event | undefined>(undefined);

  const validationSchema = yup.object({
    title: yup
      .string()
      .trim()
      .max(MAX_CHARACTERS_TITLE, t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_TITLE }))
      .required(t('field-error-required', { fieldName: t('dashboard-meeting-textfield-title') })),
    password: yup
      .string()
      .trim()
      .max(MAX_CHARACTERS_PASSWORD, t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_PASSWORD })),
    description: yup
      .string()
      .trim()
      .max(
        MAX_CHARACTERS_DESCRIPTION,
        t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_DESCRIPTION })
      ),
    startDate: yup
      .string()
      .test('is required', t('meeting-required-start-date'), function (startDate) {
        if (!startDate || startDate.trim() === '') {
          return false;
        }
        return true;
      })
      .test('is valid', t('meeting-invalid-start-date'), (startDate) => !isInvalidDate(new Date(startDate as string)))
      .test('is in the future', t('dashboard-meeting-date-field-error-future'), function (startDate) {
        if (this.parent.isTimeDependent && startDate && new Date(startDate) < new Date()) {
          return false;
        }
        return true;
      })
      .test('is before end date', t('dashboard-meeting-date-field-error-duration'), function (startDate) {
        if (this.parent.isTimeDependent && startDate) {
          return startDate < this.parent.endDate;
        }
        return true;
      }),
    endDate: yup
      .string()
      .required(t('dashboard-meeting-date-field-error-invalid-value'))
      .test('is required', t('meeting-required-end-date'), function (endDate) {
        if (!endDate || endDate.trim() === '') {
          return false;
        }
        return true;
      })
      .test('is valid', t('meeting-invalid-end-date'), (endDate) => !isInvalidDate(new Date(endDate as string)))
      .test('if after start date', t('dashboard-meeting-date-field-error-duration'), function (endDate) {
        if (this.parent.isTimeDependent && endDate) {
          return endDate > this.parent.startDate;
        }
        return true;
      }),
    isAdhoc: yup.boolean().optional(),
    sharedFolder: yup.boolean().optional(),
    showMeetingDetails: yup.boolean().optional(),
    streaming: yup.object().shape({
      enabled: yup.boolean().required(),
      platform: yup.object().when('enabled', (value: boolean) => {
        if (!value) {
          return yup.object().optional();
        }
        //Initial implementation supports only 'custom' platform model
        return yup.object().shape({
          kind: yup.string().required(),
          name: yup.string().required(t('dashboard-meeting-livestream-platform-name-required')),
          streamingEndpoint: yup
            .string()
            .validateURL(t('dashboard-meeting-livestream-streaming-endpoint-invalid-url'))
            .required(t('dashboard-meeting-livestream-streaming-endpoint-required')),
          streamingKey: yup.string().required(t('dashboard-meeting-livestream-streaming-key-required')),
          publicUrl: yup
            .string()
            .validateURL(t('dashboard-meeting-livestream-streaming-endpoint-invalid-url'))
            .required(t('dashboard-meeting-livestream-public-url-required')),
        });
      }),
    }),
    e2eEncryption: yup.boolean().optional(),
  });

  const recurrenceFrequencyOptions: Array<FrequencyOption> = [
    {
      label: t('dashboard-meeting-recurrence-none'),
      value: CommonFrequencies.NONE,
    },
    { label: t('dashboard-meeting-recurrence-daily'), value: CommonFrequencies.DAILY },
    { label: t('dashboard-meeting-recurrence-weekly'), value: CommonFrequencies.WEEKLY },
    { label: t('dashboard-meeting-recurrence-bi-weekly'), value: CommonFrequencies.BIWEEKLY },
    { label: t('dashboard-meeting-recurrence-monthly'), value: CommonFrequencies.MONTHLY },
  ];

  const [customRecurrenceOption, setCustomRecurrenceOption] = useState<FrequencyOption>();

  const handleSelectCustomRRule = async ({ label, value }: FrequencyOption) => {
    if (value === customRecurrenceOption?.value) {
      return;
    }
    setCustomRecurrenceOption({ label, value });
    await formik.setFieldValue('recurrencePattern', value);
  };

  const mapRecurrencePattern = (existingEvent?: Event): RecurrencePattern | false => {
    if (!existingEvent || !isRecurringEvent(existingEvent) || isEmpty(existingEvent.recurrencePattern)) {
      return false;
    }
    const recurrencePattern = existingEvent.recurrencePattern[0];

    if (recurrenceFrequencyOptions.some((option) => option.value === recurrencePattern)) {
      return recurrencePattern;
    }

    const rruleOptions = RRule.parseString(recurrencePattern);
    const rrule = new RRule({ ...rruleOptions });
    const rruleLabel = getRRuleText(rrule);
    const rruleValue = rrule.toString() as RecurrencePattern;

    setCustomRecurrenceOption({ label: rruleLabel, value: rruleValue });
    return rruleValue;
  };

  const memoizedRecurrencePattern = useMemo(() => mapRecurrencePattern(existingEvent), [existingEvent]);

  /**
   * In the current version of mui undefined is also set as a value of the select
   * To avoid that we have to explicitly filter out and open the dialog when undefined is "selected"
   */
  const handleRecurrenceChange = (event: SelectChangeEvent) => {
    if (event.target.value !== undefined) {
      formik.setFieldValue('recurrencePattern', event.target.value);
      return;
    }
    setIsRecurrenceDialogOpen(true);
    setIsRecurrenceSelectOpen(false);
  };

  const getStreamingInitialValue = () => {
    return existingEvent?.streamingTargets
      ? {
          enabled: true,
          platform: existingEvent.streamingTargets[0],
        }
      : {
          enabled: false,
        };
  };

  // We need to pass an empty array, if we want to disable streaming while updating an event
  const getStreamingPayload = (values: FormikValues) => {
    return values.streaming.enabled ? [values.streaming.platform] : [];
  };

  const getShowMeetingDetailsInitialValue = () => {
    if (!existingEvent) {
      return true;
    }
    return Boolean(existingEvent?.showMeetingDetails);
  };

  const formik = useFormik<CreateOrUpdateMeetingFormikValues>({
    initialValues: {
      title: existingEvent?.title,
      description: existingEvent?.description || '',
      waitingRoom: waitingRoomInitialValue,
      password: existingEvent?.room.password?.trim() || undefined,
      isTimeDependent: !existingEvent?.isTimeIndependent,
      startDate:
        (existingEvent && !isTimelessEvent(existingEvent) && existingEvent.startsAt?.datetime) ||
        defaultStartDate.toISOString(),
      endDate:
        (existingEvent && !isTimelessEvent(existingEvent) && existingEvent.endsAt?.datetime) ||
        defaultEndDate.toISOString(),
      recurrencePattern: memoizedRecurrencePattern || CommonFrequencies.NONE,
      isAdhoc: existingEvent && Boolean(existingEvent.isAdhoc),
      sharedFolder: (existingEvent?.sharedFolder && Boolean(existingEvent.sharedFolder)) || false,
      showMeetingDetails: getShowMeetingDetailsInitialValue(),
      streaming: getStreamingInitialValue(),
      e2eEncryption: existingEvent?.room.e2EEncryption || false,
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (existingEvent) {
        await handleUpdateEvent(values);
      } else {
        await handleCreateEvent(values);
      }
    },
  });

  const onChangeStartDate = async (date: Date | null) => {
    if (!date) {
      await formik.setFieldValue('startDate', '');
      await formik.validateField('startDate');
      return;
    }

    if (isInvalidDate(date)) {
      await formik.setFieldValue('startDate', String(date));
      await formik.validateField('startDate');
      return;
    }

    await formik.setValues((values) => ({
      ...values,
      startDate: date.toISOString(),
      endDate: roundToUpper30(date).toISOString(),
    }));
    await formik.validateField('startDate');
    await formik.validateField('endDate');
  };

  const onChangeEndDate = async (endDate: Date | null) => {
    if (!endDate) {
      await formik.setFieldValue('endDate', '');
      await formik.validateField('endDate');
      return;
    }

    if (isInvalidDate(endDate)) {
      await formik.setFieldValue('endDate', String(endDate));
      await formik.validateField('endDate');
      return;
    }

    await formik.setFieldValue('endDate', endDate.toISOString());
    await formik.validateField('endDate');
  };

  const createPayload = (values: FormikValues): CreateEventPayload | UpdateEventPayload => {
    let payload: CreateEventPayload | UpdateEventPayload = {
      title: values.title.trim() || '',
      description: values.description.trim() || '',
      waitingRoom: values.waitingRoom,
      showMeetingDetails: values.showMeetingDetails,
      password: values.password?.trim() !== '' ? values.password?.trim() : null,
      isTimeIndependent: !values.isTimeDependent,
      recurrencePattern: [],
      isAdhoc: values.isAdhoc || false,
      hasSharedFolder: values.sharedFolder || false,
      streamingTargets: getStreamingPayload(values),
      e2eEncryption: values.e2eEncryption || false,
    };

    if (values.recurrencePattern) {
      payload = {
        ...payload,
        recurrencePattern: values.recurrencePattern !== CommonFrequencies.NONE ? [values.recurrencePattern] : undefined,
      };
    }

    if (values.isTimeDependent) {
      payload = {
        ...payload,
        startsAt: {
          datetime: formatRFC3339(new Date(values.startDate)),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        endsAt: {
          datetime: formatRFC3339(new Date(values.endDate)),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        isAllDay: false,
      };
    }

    return payload;
  };

  const handleCreateEvent = async (values: FormikValues) => {
    const payload = createPayload(values) as CreateEventPayload;
    try {
      // prevents new events to be saved as a second event
      if (event.current === undefined) {
        event.current = await createEvent(payload).unwrap();
      }
      notifications.success(t('dashboard-meeting-notification-success-create', { event: event.current.title }));
      navigate(`/dashboard/meetings/update/${event.current.id}/1`, {
        state: { ...getReferrerRouterState(window.location) },
      });
    } catch (err) {
      notifications.error(t('dashboard-meeting-notification-error'));
    }
  };

  const handleUpdateEvent = async (values: FormikValues) => {
    const payload = createPayload(values) as UpdateEventPayload;
    try {
      if (existingEvent) {
        const goToNextStep = await handleCreateDeleteSharedFolder(existingEvent, values);
        if (goToNextStep === false) {
          return;
        }
        const event = await updateEvent({
          eventId: existingEvent.id,
          ...payload,
        }).unwrap();

        notifications.success(t('dashboard-meeting-notification-success-edit', { event: event.title }));
      }
    } catch (err) {
      notifications.error(t('dashboard-meeting-notification-error'));
    }
  };

  const handleCreateDeleteSharedFolder = async (event: Event, values: FormikValues) => {
    if (!event.sharedFolder && values.sharedFolder) {
      return handleCreateSharedFolder(event, values);
    }
    if (event.sharedFolder && !values.sharedFolder) {
      return handleDeleteSharedFolder(event, values);
    }
    return true;
  };

  const handleCreateSharedFolder = async (event: Event, values: FormikValues) => {
    if (isFirstTryToCreateSharedFolder) {
      try {
        setIsFirstTryToCreateSharedFolder(false);
        await createSharedFolder({ eventId: event.id }).unwrap();
      } catch (error) {
        notificationAction({
          msg: t('dashboard-meeting-shared-folder-create-error-message'),
          variant: 'error',
          actionBtnText: t('dashboard-meeting-shared-folder-error-retry-button'),
          cancelBtnText: t('dashboard-meeting-shared-folder-error-cancel-button'),
          persist: true,
          onAction: () => {
            formik.handleSubmit();
          },
          onCancel: () => {
            values.sharedFolder = false;
            setIsFirstTryToCreateSharedFolder(true);
          },
        });
        return false;
      }
    } else {
      try {
        await createSharedFolder({ eventId: event.id }).unwrap();
      } catch (error) {
        values.sharedFolder = false;
        notifications.error(t('dashboard-meeting-shared-folder-create-retry-error-message'));
        setIsFirstTryToCreateSharedFolder(true);
        return true;
      }
    }
    return true;
  };

  const handleDeleteSharedFolder = async (event: Event, values: FormikValues) => {
    if (isFirstTryToDeleteSharedFolder) {
      try {
        setIsFirstTryToDeleteSharedFolder(false);
        await deleteSharedFolder({ eventId: event.id, forceDeletion: false }).unwrap();
      } catch (error) {
        notificationAction({
          msg: t('dashboard-meeting-shared-folder-delete-error-message'),
          variant: 'error',
          actionBtnText: t('dashboard-meeting-shared-folder-error-retry-button'),
          cancelBtnText: t('dashboard-meeting-shared-folder-error-cancel-button'),
          persist: true,
          onAction: () => {
            formik.handleSubmit();
          },
          onCancel: () => {
            values.sharedFolder = true;
            setIsFirstTryToDeleteSharedFolder(true);
          },
        });
        return false;
      }
    } else {
      try {
        await deleteSharedFolder({ eventId: event.id, forceDeletion: false }).unwrap();
      } catch (error) {
        values.sharedFolder = true;
        notifications.error(t('dashboard-meeting-shared-folder-delete-retry-error-message'));
        setIsFirstTryToDeleteSharedFolder(true);
        return true;
      }
    }
    return true;
  };

  const handleConfirmSameTimeEvents = () => {
    setOverlappingEvent(undefined);
    formik.handleSubmit();
  };

  const handleSubmit = async () => {
    if (!formik.values.isTimeDependent) {
      formik.handleSubmit();
      return;
    }

    const overlappingEvent = await checkForOverlappingEvents();
    if (overlappingEvent) {
      setOverlappingEvent(overlappingEvent);
    } else {
      formik.handleSubmit();
    }
  };

  const checkForOverlappingEvents = async (): Promise<SingleEvent | RecurringEvent | undefined> => {
    const foundEvents = await checkForEvents({
      timeMin: formik.values.startDate as DateTime,
      timeMax: formik.values.endDate as DateTime,
    });

    if (foundEvents?.data && !isEmpty(foundEvents.data.data)) {
      const potentialOverlappingEvents: Array<SingleEvent | RecurringEvent> = appendRecurringEventInstances(
        foundEvents.data.data as Array<Event | EventException>
      ).filter((event) => !isTimelessEvent(event)) as Array<SingleEvent | RecurringEvent>;

      const currentEventInterval: Interval = {
        start: new Date(formik.values.startDate),
        end: new Date(formik.values.endDate),
      };

      const validOverlappingEventFound = potentialOverlappingEvents.find((event) => {
        const overlappingEventInterval: Interval = {
          start: new Date(event.startsAt.datetime),
          end: new Date(event.endsAt.datetime),
        };

        return (
          areIntervalsOverlapping(currentEventInterval, overlappingEventInterval) &&
          (existingEvent ? event.id !== existingEvent.id : true)
        );
      });

      if (validOverlappingEventFound) {
        return validOverlappingEventFound;
      }
    }

    return undefined;
  };

  return (
    <>
      <Form onSubmit={formik.handleSubmit}>
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
            switchProps={formikMinimalProps('isTimeDependent', formik)}
            switchValueLabel={t('dashboard-meeting-date-and-time-switch')}
          />

          <Collapse orientation="vertical" in={formik.values.isTimeDependent} unmountOnExit mountOnEnter>
            <Grid container columnSpacing={{ xs: 2, sm: 5 }}>
              <Grid item xs={12} sm={6}>
                <DashboardDateTimePicker type="start" formik={formik} onChange={onChangeStartDate} />
              </Grid>
              <Grid item xs={12} sm={6} mt={{ xs: 2, sm: 0 }}>
                <DashboardDateTimePicker type="end" formik={formik} onChange={onChangeEndDate} />
              </Grid>

              <Grid item xs={12} sm={12} mt={2}>
                {/* TODO: Separate in own component and move related logic */}
                <Select
                  {...formikProps('recurrencePattern', formik)}
                  select
                  label={t('dashboard-meeting-recurrence-label')}
                  hideLabel
                  SelectProps={{
                    open: isRecurrenceSelectOpen,
                    onOpen: () => setIsRecurrenceSelectOpen(true),
                    onClose: () => setIsRecurrenceSelectOpen(false),
                    //Type is not getting infered so we have to manually assert
                    onChange: (event) => handleRecurrenceChange(event as SelectChangeEvent),
                    MenuProps: {
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    },
                  }}
                >
                  {recurrenceFrequencyOptions.map((entry) => (
                    <MenuItem key={entry.label} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  ))}
                  {customRecurrenceOption && (
                    <MenuItem key={customRecurrenceOption.label} value={customRecurrenceOption.value}>
                      {customRecurrenceOption.label}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setIsRecurrenceDialogOpen(true);
                      setIsRecurrenceSelectOpen(false);
                    }}
                  >
                    {t('dashboard-meeting-recurrence-custom')}
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Collapse>

          <MeetingFormSwitch
            checked={formik.values.waitingRoom}
            switchProps={formikMinimalProps('waitingRoom', formik)}
            switchValueLabel={t('dashboard-meeting-waiting-room-switch')}
          />
          {features.sharedFolder && (
            <MeetingFormSwitch
              checked={formik.values.sharedFolder}
              switchProps={formikMinimalProps('sharedFolder', formik)}
              switchValueLabel={t('dashboard-meeting-shared-folder-switch')}
            />
          )}
          <MeetingFormSwitch
            checked={formik.values.showMeetingDetails}
            switchProps={formikMinimalProps('showMeetingDetails', formik)}
            switchValueLabel={t('dashboard-meeting-details-switch')}
            tooltipTitle={t('dashboard-meeting-details-tooltip')}
          />

          {isStreamingEnabled && <StreamingOptions formik={formik} />}

          <MeetingFormSwitch
            checked={formik.values.e2eEncryption}
            switchProps={formikMinimalProps('e2eEncryption', formik)}
            switchValueLabel={t('dashboard-meeting-e2ee-switch')}
            tooltipTitle={t('dashboard-meeting-e2ee-tooltip')}
          />
        </Stack>
        <Grid container item justifyContent="space-between" spacing={2}>
          <Grid item xs={12} sm="auto">
            {existingEvent && (
              <Button variant="text" color="secondary" endIcon={<ForwardIcon />} onClick={onForwardButtonClick}>
                {t('dashboard-meeting-to-step', { step: 2 })}
              </Button>
            )}
          </Grid>
          <Grid container item xs={12} sm="auto" spacing={3} flexDirection={{ xs: 'column-reverse', sm: 'row' }}>
            {!existingEvent && (
              <Grid item>
                <Button component={Link} to="/dashboard/" variant="outlined" color="secondary" fullWidth>
                  {t('dashboard-direct-meeting-button-cancel')}
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                onClick={handleSubmit}
                fullWidth
                disabled={formik.isSubmitting || createEventIsLoading || updateEventIsLoading}
              >
                {t(`global-save${existingEvent ? '-changes' : ''}`)}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Form>
      <RecurringEventDialog
        open={isRecurrenceDialogOpen}
        closeDialog={() => setIsRecurrenceDialogOpen(false)}
        selectCustomFrequencyOption={handleSelectCustomRRule}
        recurrenceStartTimestamp={formik.values.startDate}
        initialRRule={customRecurrenceOption?.value}
      />
      {overlappingEvent && (
        <EventConflictDialog
          onConfirm={handleConfirmSameTimeEvents}
          onCancel={() => setOverlappingEvent(undefined)}
          event={overlappingEvent}
          isUpdate={Boolean(existingEvent)}
        />
      )}
    </>
  );
};

export default CreateOrUpdateMeetingForm;
