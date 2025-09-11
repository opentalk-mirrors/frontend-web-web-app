// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Weekday, ByWeekday } from '@heinlein-video/rrule';
import { ALL_WEEKDAYS } from '@heinlein-video/rrule/dist/esm/weekday';
import { Chip, Grid, styled } from '@mui/material';

import { getRRuleLanguage, PartialRRuleOptions, RRuleObject } from '../../../../utils/rruleUtils';

interface CustomWeeklyOptionsProps {
  rRuleObject: RRuleObject;
  updateRRuleObject: (rule: PartialRRuleOptions) => void;
}

const DayChip = styled(Chip)(({ theme, variant }) => ({
  borderRadius: theme.borderRadius.large,
  width: '2rem',
  height: '2rem',
  paddingRight: 0,
  overflow: 'clip',
  ...(variant === 'filled' && {
    background: theme.palette.secondary.main,
    ':hover': {
      background: theme.palette.secondary.main,
    },
  }),
  '& .MuiChip-label': {
    paddingRight: 0,
    paddingLeft: 0,
  },
}));

export const CustomWeeklyOptions = ({ rRuleObject, updateRRuleObject }: CustomWeeklyOptionsProps) => {
  /**
   * @param value number from 0 to 6 (0 === Sunday)
   * @returns first letter of the day in the current language
   */
  const getDayStartLetter = (value: number) => {
    const language = getRRuleLanguage();

    return language.dayNames[value].charAt(0);
  };
  const days = ALL_WEEKDAYS.map((_, index) => {
    const { weekday } = new Weekday(index);

    //Adjust index, since Weekday/ALL_WEEKDAYS 0 === Monday, but in Language 0 === Sunday
    const indexForDayNames = index === 6 ? 0 : index + 1;

    return { value: weekday, label: getDayStartLetter(indexForDayNames) };
  });

  const isByWeekdayArray = rRuleObject.byweekday && rRuleObject.byweekday.constructor === Array;

  const handleWeekdayToggle = (option: number) => {
    //Type assertion since we only format as array
    const weekdayList = rRuleObject.byweekday as Array<ByWeekday>;
    const isWeekdayAlreadyIncluded = weekdayList.includes(option);

    //Prevent removal if we only have 1 weekday selected
    if (isWeekdayAlreadyIncluded && weekdayList.length === 1) {
      return;
    }
    //If it is already added we remove it, otherwise we add it
    const updatedWeekdayList = isWeekdayAlreadyIncluded
      ? weekdayList.filter((day) => day !== option)
      : [...weekdayList, option];

    updatedWeekdayList.sort();

    updateRRuleObject({ byweekday: updatedWeekdayList });
    return;
  };

  return (
    <Grid
      size={{ sm: 8 }}
      container
      data-testid="weekly-options"
      sx={{
        gap: 1,
      }}
    >
      {days.map((day, index) => (
        <DayChip
          key={index}
          onClick={() => handleWeekdayToggle(day.value)}
          label={day.label}
          variant={
            isByWeekdayArray && (rRuleObject.byweekday as Array<ByWeekday>).includes(day.value) ? 'filled' : 'outlined'
          }
        />
      ))}
    </Grid>
  );
};
