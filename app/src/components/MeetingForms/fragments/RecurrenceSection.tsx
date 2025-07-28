// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule } from '@heinlein-video/rrule';
import { Grid, MenuItem, SelectChangeEvent, styled } from '@mui/material';
import { Event, RecurrencePattern, isRecurringEvent } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { isEmpty } from 'lodash';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { formikProps } from '../../../utils/formikUtils';
import { CommonFrequencies, FrequencyOption, getRRuleText } from '../../../utils/rruleUtils';
import { CustomRecurringEventDialog } from './CustomRecurringEventDialog/CustomRecurringEventDialog';
import { MeetingFormValues } from './DashboardDateTimePicker';

const Select = styled(CommonTextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    minWidth: theme.typography.pxToRem(160),
  },
  '& .MuiFormLabel-root': {
    minWidth: 'max-content',
    backgroundColor: theme.palette.background.customPaper.primary,
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
  const [customRecurrenceOption, setCustomRecurrenceOption] = useState<FrequencyOption>();

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

  useEffect(() => onRecurrencePatternChange(mapRecurrencePattern(existingEvent)), [existingEvent]);

  return (
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
      <CustomRecurringEventDialog
        open={isRecurrenceDialogOpen}
        closeDialog={() => setIsRecurrenceDialogOpen(false)}
        selectCustomFrequencyOption={handleSelectCustomRRule}
        recurrenceStartTimestamp={formik.values.startDate}
        initialRRule={customRecurrenceOption?.value}
      />
    </Grid>
  );
};

export default RecurrenceSection;
