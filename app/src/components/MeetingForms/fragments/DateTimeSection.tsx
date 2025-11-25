// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, Grid } from '@mui/material';
import { Event, RecurrencePattern, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { useCallback, useEffect, useMemo } from 'react';

import roundToUpper30 from '../../../utils/roundToUpper30';
import { CommonFrequencies } from '../../../utils/rruleUtils';
import { isInvalidDate } from '../../../utils/typeGuardUtils';
import { DashboardDateTimePicker } from './DashboardDateTimePicker';
import { MeetingFormValues } from './DashboardDateTimePicker';
import RecurrenceSection from './RecurrenceSection';

interface RecurrenceSectionProps {
  formik: FormikProps<MeetingFormValues>;
  existingEvent?: Event;
  onRecurrencePatternChange: (recurrencePattern: RecurrencePattern | false) => void;
}

const DateTimeSection = ({ formik, existingEvent, onRecurrencePatternChange }: RecurrenceSectionProps) => {
  const onChangeStartDate = useCallback(
    async (date: Date | null) => {
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

      await formik.setFieldValue('startDate', date.toISOString());
      await formik.setFieldValue('endDate', roundToUpper30(date).toISOString());
      await formik.validateField('startDate');
      await formik.validateField('endDate');
    },
    [formik]
  );

  const onChangeEndDate = useCallback(
    async (endDate: Date | null) => {
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
    },
    [formik]
  );

  // We limit min start and end date to the current date, with one exception:
  // we don't want to limit the min date for exisiting events, which were created in the past
  const minDate = useMemo(() => {
    if (existingEvent && !isTimelessEvent(existingEvent) && new Date(existingEvent.startsAt.datetime) < new Date()) {
      return null;
    }

    return new Date();
  }, [existingEvent]);

  // Use case: user set a recurrency pattern and than made the meeting time independent
  const { isTimeDependent } = formik.values;
  const { setFieldValue } = formik;
  useEffect(() => {
    if (!isTimeDependent) {
      void setFieldValue('recurrencePattern', CommonFrequencies.NONE);
    }
  }, [isTimeDependent, setFieldValue]);

  return (
    <>
      <Collapse orientation="vertical" in={isTimeDependent} unmountOnExit mountOnEnter>
        <Grid container columnSpacing={{ xs: 2, sm: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DashboardDateTimePicker type="start" formik={formik} onChange={onChangeStartDate} minTimeDate={minDate} />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{
              mt: { xs: 2, sm: 0 },
            }}
          >
            <DashboardDateTimePicker type="end" formik={formik} onChange={onChangeEndDate} minTimeDate={minDate} />
          </Grid>
          <RecurrenceSection
            formik={formik}
            existingEvent={existingEvent}
            onRecurrencePatternChange={onRecurrencePatternChange}
          />
        </Grid>
      </Collapse>
    </>
  );
};

export default DateTimeSection;
