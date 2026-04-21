// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack } from '@mui/material';
import type { RecurrencePattern, StreamingTarget } from '@opentalk/rest-api-rtk-query';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { FormikProps } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formikDateTimePickerProps } from '../../../utils/formikUtils';
import DateTimePicker from '../../DateTimePicker';
import { DateTimePickerProps } from '../../DateTimePicker/DateTimePicker';

export interface Streaming {
  enabled: boolean;
  streamingTarget?: StreamingTarget;
}
export interface TrainingParticipationReport {
  enabled: boolean;
  parameter?: TrainingParticipationReportParameterSet;
}
export interface MeetingFormValues {
  title?: string;
  description?: string;
  waitingRoom: boolean;
  password?: string;
  isTimeDependent: boolean;
  startDate: string;
  endDate: string;
  recurrencePattern: RecurrencePattern;
  isAdhoc?: boolean;
  sharedFolder: boolean;
  streaming: Streaming;
  trainingParticipationReport: TrainingParticipationReport;
  showMeetingDetails: boolean;
  e2eEncryption: boolean;
}

export type DashboardDateTimePickerProps = {
  id?: string;
  onChange(date: Date | null): void;
  formik: FormikProps<MeetingFormValues>;
  InputProps?: Partial<DateTimePickerProps['InputProps']>;
  type: 'start' | 'end';
  //Extend min date so we can pass it down.
  //If more props needed we could add more to the Pick or define the whole props of type DateTimePickerProps.
} & Pick<DateTimePickerProps, 'minTimeDate' | 'helperText'>;

export const DashboardDateTimePicker = (props: DashboardDateTimePickerProps) => {
  const id = React.useId();
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <DateTimePicker
        {...formikDateTimePickerProps(`${props.type}Date`, {
          ...props.formik,
          handleChange: props.onChange as never,
        })}
        minTimeDate={props.minTimeDate}
        textField={{
          id: props.id || id,
          startAdornment: t(`dashboard-meeting-date-${props.type}`),
          required: true,
        }}
        helperText={props.formik.errors[`${props.type}Date`] || props.helperText}
        InputProps={{
          color: 'primary',
        }}
      />
    </Stack>
  );
};
