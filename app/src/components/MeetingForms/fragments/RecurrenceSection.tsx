// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule } from '@heinlein-video/rrule';
import { Collapse, Grid, MenuItem, SelectChangeEvent, styled } from '@mui/material';
import { Event, RecurrencePattern, isRecurringEvent, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { isEmpty } from 'lodash';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { formikProps } from '../../../utils/formikUtils';
import roundToUpper30 from '../../../utils/roundToUpper30';
import { CommonFrequencies, FrequencyOption, getRRuleText } from '../../../utils/rruleUtils';
import { isInvalidDate } from '../../../utils/typeGuardUtils';
import { RecurringEventDialog } from './CustomRecurringEventDialog/CustomRecurringEventDialog';
import { DashboardDateTimePicker } from './DashboardDateTimePicker';
import { MeetingFormValues } from './DashboardDateTimePicker';

const Select = styled(CommonTextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    minWidth: theme.typography.pxToRem(160),
  },
  '& .MuiFormLabel-root': {
    minWidth: 'max-content',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0, 1),
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiInputBase-input': {
      maxWidth: theme.typography.pxToRem(285),
    },
  },
}));

interface RecurrenceSectionProps {
  formik: FormikProps<MeetingFormValues>;
  existingEvent?: Event;
  onRecurrencePatternChange: (recurrencePattern: RecurrencePattern | false) => void;
}

const RecurrenceSection = ({ formik, existingEvent, onRecurrencePatternChange }: RecurrenceSectionProps) => {
  const { t } = useTranslation();
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false);
  const [isRecurrenceSelectOpen, setIsRecurrenceSelectOpen] = useState(false);

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

  const handleSelectCustomRRule = async ({ label, value }: FrequencyOption) => {
    if (value === customRecurrenceOption?.value) {
      return;
    }
    setCustomRecurrenceOption({ label, value });
    await formik.setFieldValue('recurrencePattern', value);
  };

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

  let minDate: Date | null = new Date();
  if (existingEvent && !isTimelessEvent(existingEvent) && new Date(existingEvent.startsAt.datetime) < new Date()) {
    minDate = null;
  }

  const pastDateHelperText =
    !minDate && new Date(formik.values.startDate) < new Date()
      ? t('meeting-start-date-is-in-the-past')
      : formik.errors.startDate;

  useEffect(() => onRecurrencePatternChange(mapRecurrencePattern(existingEvent)), [existingEvent]);

  return (
    <>
      <Collapse orientation="vertical" in={formik.values.isTimeDependent} unmountOnExit mountOnEnter>
        <Grid container columnSpacing={{ xs: 2, sm: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DashboardDateTimePicker
              type="start"
              formik={formik}
              onChange={onChangeStartDate}
              minTimeDate={minDate}
              helperText={pastDateHelperText}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{
              mt: { xs: 2, sm: 0 },
            }}
          >
            <DashboardDateTimePicker type="end" formik={formik} onChange={onChangeEndDate} minTimeDate={minDate} />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 12 }}
            sx={{
              mt: 2,
            }}
          >
            <Select
              {...formikProps('recurrencePattern', formik)}
              select
              label={t('dashboard-meeting-recurrence-label')}
              hideLabel
              slotProps={{
                inputLabel: {
                  htmlFor: 'recurrence-pattern-select',
                },
                input: {
                  id: 'recurrence-pattern-select',
                },
                select: {
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
      <RecurringEventDialog
        open={isRecurrenceDialogOpen}
        closeDialog={() => setIsRecurrenceDialogOpen(false)}
        selectCustomFrequencyOption={handleSelectCustomRRule}
        recurrenceStartTimestamp={formik.values.startDate}
        initialRRule={customRecurrenceOption?.value}
      />
    </>
  );
};

export default RecurrenceSection;
