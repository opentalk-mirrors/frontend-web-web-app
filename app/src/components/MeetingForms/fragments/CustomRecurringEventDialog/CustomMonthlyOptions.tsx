// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule, Weekday } from '@heinlein-video/rrule';
import { Grid, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getRRuleDayOfWeekIndex, getRRuleText, PartialRRuleOptions } from '../../../../utils/rruleUtils';

interface CustomMonthlyOptionsProps {
  updateRRuleObject: (rule: PartialRRuleOptions) => void;
  recurrenceStartDate: Date;
}

export const CustomMonthlyOptions = ({ recurrenceStartDate, updateRRuleObject }: CustomMonthlyOptionsProps) => {
  const { t } = useTranslation();

  const dayOfMonth = recurrenceStartDate.getDate();
  const monthlyDateText = t('dashboard-recurrence-dialog-frequency-details-monthly-on', { date: dayOfMonth });

  const dayOfWeek = recurrenceStartDate.getDay();
  //Adjust JS day to RRule indexing
  const dayOfWeekRRule = getRRuleDayOfWeekIndex(dayOfWeek);
  const weekday = new Weekday(dayOfWeekRRule);
  /**
   * For which time(n) does the day of the week occur (second Friday of the month, etc.)
   */
  const occurrenceNumber = Math.ceil(dayOfMonth / 7);
  const ruleForOccurenceOption = new RRule({ freq: RRule.MONTHLY, byweekday: weekday.nth(occurrenceNumber) });
  const monthlyOccurenceText = getRRuleText(ruleForOccurenceOption);

  const [monthlyOption, setMonthlyOption] = useState<string>(monthlyDateText);

  const handleClick = ({ text, value }: { text: string; value: PartialRRuleOptions }) => {
    setMonthlyOption(text);
    updateRRuleObject(value);
  };

  return (
    <Grid size={{ xs: 12, sm: 4 }} container>
      <Select value={monthlyOption} autoWidth>
        <MenuItem
          value={monthlyDateText}
          onClick={() =>
            handleClick({ text: monthlyDateText, value: { bymonthday: dayOfMonth, byweekday: undefined } })
          }
        >
          {monthlyDateText}
        </MenuItem>
        <MenuItem
          value={monthlyOccurenceText}
          onClick={() =>
            handleClick({
              text: monthlyOccurenceText,
              value: { byweekday: weekday.nth(occurrenceNumber), bymonthday: undefined },
            })
          }
        >
          {monthlyOccurenceText}
        </MenuItem>
      </Select>
    </Grid>
  );
};
