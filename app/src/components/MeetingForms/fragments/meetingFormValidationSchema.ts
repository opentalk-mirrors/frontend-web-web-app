// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PlatformKind } from '@opentalk/rest-api-rtk-query';
import { t } from 'i18next';

import { isInvalidDate } from '../../../utils/typeGuardUtils';
import yup from '../../../utils/yupUtils';
import { MAX_CHARACTERS_TITLE, MAX_CHARACTERS_DESCRIPTION, MAX_CHARACTERS_PASSWORD } from '../constants';
import { MeetingFormValues, Streaming } from './DashboardDateTimePicker';

// Yup has some limitations regarding TypeScript:
//
// - it has problems with discriminated unions, therefore we need to assert `streaming`
// - it is possible to add a field to the schema that is not present in the type
// - not all fields are typechecked recursively (e.g. streaming)
//
// If we want to have more strict typeschecking, we can consider using [zod](https://www.npmjs.com/package/zod)
export const meetingFormValidationSchema: yup.ObjectSchema<MeetingFormValues> = yup.object({
  title: yup
    .string()
    .trim()
    .max(MAX_CHARACTERS_TITLE, () => t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_TITLE }))
    .required(() => t('field-error-required', { fieldName: t('dashboard-meeting-textfield-title') })),
  password: yup
    .string()
    .trim()
    .max(MAX_CHARACTERS_PASSWORD, () =>
      t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_PASSWORD })
    ),
  description: yup
    .string()
    .trim()
    .max(MAX_CHARACTERS_DESCRIPTION, () =>
      t('form-validation-max-characters', { maxCharacters: MAX_CHARACTERS_DESCRIPTION })
    ),
  startDate: yup
    .string()
    .required(() => t('dashboard-meeting-date-field-error-invalid-value'))
    .test(
      'is required',
      () => t('meeting-required-start-date'),
      (startDate) => !!startDate?.trim()
    )
    .test(
      'is valid',
      () => t('meeting-invalid-start-date'),
      (startDate) => !isInvalidDate(new Date(startDate as string))
    )
    .test(
      'is in the future',
      () => t('dashboard-meeting-date-field-error-future'),
      function (startDate) {
        const isOriginalEventInThePast =
          this.options.context?.existingEvent &&
          !this.options.context?.isTimelessEvent &&
          new Date(this.options.context?.existingEvent.startsAt.datetime) < new Date();
        if (this.parent.isTimeDependent && startDate && new Date(startDate) < new Date() && !isOriginalEventInThePast) {
          return false;
        }
        return true;
      }
    )
    .test(
      'is before end date',
      () => t('dashboard-meeting-date-field-error-duration'),
      function (startDate) {
        if (this.parent.isTimeDependent && startDate) {
          return startDate < this.parent.endDate;
        }
        return true;
      }
    ),
  endDate: yup
    .string()
    .required(() => t('dashboard-meeting-date-field-error-invalid-value'))
    .test(
      'is required',
      () => t('meeting-required-end-date'),
      (endDate) => !!endDate?.trim()
    )
    .test(
      'is valid',
      () => t('meeting-invalid-end-date'),
      (endDate) => !isInvalidDate(new Date(endDate as string))
    )
    .test(
      'if after start date',
      () => t('dashboard-meeting-date-field-error-duration'),
      function (endDate) {
        if (this.parent.isTimeDependent && endDate) {
          return endDate > this.parent.startDate;
        }
        return true;
      }
    ),
  isAdhoc: yup.boolean().required(),
  sharedFolder: yup.boolean().required(),
  showMeetingDetails: yup.boolean().required(),
  streaming: yup
    .object({
      enabled: yup.boolean().required(),
      streamingTarget: yup
        .object({
          kind: yup
            .mixed<PlatformKind>()
            .oneOf([PlatformKind.Provider, PlatformKind.BuiltIn, PlatformKind.Custom])
            .required(() => t('global-required-field')),
          name: yup.string().when('kind', {
            is: PlatformKind.Custom,
            then: (s) => s.required(() => t('global-required-field')),
            otherwise: (s) => s.optional(),
          }),
          provider: yup.string().when('kind', {
            is: PlatformKind.Provider,
            then: (s) => s.required(),
            otherwise: (s) => s.optional(),
          }),
          streamingKey: yup.string().when('kind', ([kind], schema) => {
            if (kind === PlatformKind.Provider || kind === PlatformKind.Custom) {
              return schema.required(() => t('global-required-field'));
            }
            return schema.optional();
          }),
          publicUrl: yup.string().when('kind', ([kind], schema) => {
            if (kind === PlatformKind.Provider || kind === PlatformKind.Custom) {
              return schema
                .required(() => t('global-required-field'))
                .validateURL(t('dashboard-meeting-livestream-streaming-endpoint-invalid-url'));
            }
            return schema.optional();
          }),
          streamingEndpoint: yup.string().when('kind', {
            is: PlatformKind.Custom,
            then: (schema) =>
              schema
                .required(() => t('global-required-field'))
                .validateURL(t('dashboard-meeting-livestream-streaming-endpoint-invalid-url')),
            otherwise: (schema) => schema.optional(),
          }),
        })
        .when('enabled', {
          is: true,
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.optional().default(undefined).nullable(),
        }),
    })
    // Yup has problems with typechecking the discriminated unions
    // therefore we need to assert type here
    .required() as yup.ObjectSchema<Streaming>,
  e2eEncryption: yup.boolean().required(),
  trainingParticipationReport: yup
    .object({
      enabled: yup.boolean().required(),
      parameter: yup
        .object({
          initialCheckpointDelay: yup
            .object({
              after: yup.number().min(0).required(),
              within: yup.number().min(0).required(),
            })
            .required(),
          checkpointInterval: yup
            .object({
              after: yup.number().min(60).required(),
              within: yup.number().min(0).required(),
            })
            .required(),
        })
        .when('enabled', {
          is: true,
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.optional().default(undefined).nullable(),
        }),
    })
    .required(),
  waitingRoom: yup.boolean().required(),
  isTimeDependent: yup.boolean().required(),
  recurrencePattern: yup.mixed<MeetingFormValues['recurrencePattern']>().required(),
  guestAccess: yup.mixed<MeetingFormValues['guestAccess']>().required(),
});
