// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControlLabel, Grid, Radio, RadioGroup, styled } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PickerLocalizationProvider from '../../../../provider/PickerLocalizationProvider';
import { PartialRRuleOptions, RRuleObject } from '../../../../utils/rruleUtils';

interface CustomEndOptionsProps {
  rRuleObject: RRuleObject;
  updateRRuleObject: (rule: PartialRRuleOptions) => void;
  minDate: Date;
}

enum EndOption {
  Never = 'never',
  OnDate = 'onDate',
}

const DatePicker = styled(MuiDatePicker)(({ theme }) => ({
  '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
    color: theme.palette.text.disabled,
    WebkitTextFillColor: theme.palette.text.disabled,
  },
  '& .MuiButtonBase-root.MuiIconButton-root.Mui-disabled .MuiSvgIcon-root': {
    fill: theme.palette.text.disabled,
  },
})) as typeof MuiDatePicker;

export const CustomEndOptions = ({ rRuleObject, updateRRuleObject, minDate }: CustomEndOptionsProps) => {
  const { t } = useTranslation();
  const [endOption, setEndOption] = useState<EndOption>(rRuleObject.until ? EndOption.OnDate : EndOption.Never);

  const handleClick = (value: EndOption) => {
    setEndOption(value);
    if (value === EndOption.Never) {
      updateRRuleObject({ until: undefined });
      return;
    }
    //If no date is already set we use minDate
    !rRuleObject.until && updateRRuleObject({ until: minDate });
  };

  useEffect(() => {
    const isMinDateAfterSelected = rRuleObject.until ? minDate.valueOf() > rRuleObject.until.valueOf() : false;

    if (endOption === EndOption.OnDate && isMinDateAfterSelected) {
      updateRRuleObject({ until: minDate });
    }
  }, [minDate]);

  return (
    <RadioGroup value={endOption} name="radio-buttons-group">
      <Grid item>
        <FormControlLabel
          value={EndOption.Never}
          control={<Radio />}
          label={t('dashboard-recurrence-dialog-end-option-never')}
          onClick={() => handleClick(EndOption.Never)}
        />
      </Grid>
      <Grid
        container
        item
        sx={{
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <Grid item>
          <FormControlLabel
            value={EndOption.OnDate}
            control={<Radio />}
            label={t('dashboard-recurrence-dialog-end-option-on')}
            onClick={() => handleClick(EndOption.OnDate)}
          />
        </Grid>
        <Grid
          item
          sx={{
            flexShrink: 1,
          }}
        >
          <PickerLocalizationProvider>
            <DatePicker
              value={rRuleObject.until ?? minDate}
              onChange={(value) => updateRRuleObject({ until: value })}
              disabled={endOption === EndOption.Never}
              minDate={minDate}
            />
          </PickerLocalizationProvider>
        </Grid>
      </Grid>
    </RadioGroup>
  );
};
