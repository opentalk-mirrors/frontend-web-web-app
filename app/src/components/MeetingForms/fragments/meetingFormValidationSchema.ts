// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { t } from 'i18next';

import { isInvalidDate } from '../../../utils/typeGuardUtils';
import yup from '../../../utils/yupUtils';
import { MAX_CHARACTERS_TITLE, MAX_CHARACTERS_DESCRIPTION, MAX_CHARACTERS_PASSWORD } from '../constants';

export const meetingFormValidationSchema = yup.object({
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
    .test('is required', t('meeting-required-start-date'), (startDate) => !!startDate?.trim())
    .test('is valid', t('meeting-invalid-start-date'), (startDate) => !isInvalidDate(new Date(startDate as string)))
    .test('is in the future', t('dashboard-meeting-date-field-error-future'), function (startDate) {
      const isOriginalEventInThePast =
        this.options.context?.existingEvent &&
        !this.options.context?.isTimelessEvent &&
        new Date(this.options.context?.existingEvent.startsAt.datetime) < new Date();
      if (this.parent.isTimeDependent && startDate && new Date(startDate) < new Date() && !isOriginalEventInThePast) {
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
    .test('is required', t('meeting-required-end-date'), (endDate) => !!endDate?.trim())
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
    streamingTarget: yup.object().when('enabled', ([enabled], schema) => {
      if (!enabled) {
        return yup.object().optional();
      }
      return schema.shape({
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
  trainingParticipationReport: yup.object().shape({
    enabled: yup.boolean().required(),
    parameter: yup.object().when('enabled', ([enabled]) => {
      if (!enabled) {
        return yup.object().optional();
      }
      return yup.object({
        initialCheckpointDelay: yup.object().shape({
          after: yup.number().min(0).required(),
          within: yup.number().min(0).required(),
        }),
        checkpointInterval: yup.object().shape({
          after: yup.number().min(60).required(),
          within: yup.number().min(0).required(),
        }),
      });
    }),
  }),
});
