// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControlLabel, Grid, Radio, RadioGroup, styled } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { isValid as isValidDate, isBefore, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PickerLocalizationProvider from '../../../../provider/PickerLocalizationProvider';
import { PartialRRuleOptions, RRuleObject } from '../../../../utils/rruleUtils';

interface CustomEndOptionsProps {
  rRuleObject: RRuleObject;
  updateRRuleObject: (rule: PartialRRuleOptions) => void;
  minDate: Date;
  onValidationChange?: (isValid: boolean) => void;
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

export const CustomEndOptions = ({
  rRuleObject,
  updateRRuleObject,
  minDate,
  onValidationChange,
}: CustomEndOptionsProps) => {
  const { t } = useTranslation();
  const [isTouched, setIsTouched] = useState(false);
  const [endOption, setEndOption] = useState<EndOption>(rRuleObject.until ? EndOption.OnDate : EndOption.Never);

  const validationErrorKey = (() => {
    if (endOption === EndOption.Never) {
      return null;
    }
    if (!rRuleObject.until || !isValidDate(rRuleObject.until)) {
      return 'meeting-invalid-end-date';
    }
    if (isBefore(startOfDay(rRuleObject.until), startOfDay(minDate))) {
      return 'dashboard-meeting-recurrence-date-field-error-duration';
    }
    return null;
  })();

  const isValid = validationErrorKey === null;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const handleClick = (value: EndOption) => {
    setIsTouched(false);
    setEndOption(value);
    if (value === EndOption.Never) {
      updateRRuleObject({ until: undefined });
    } else if (!rRuleObject.until) {
      updateRRuleObject({ until: minDate });
    }
  };

  return (
    <RadioGroup value={endOption} name="radio-buttons-group">
      <Grid>
        <FormControlLabel
          value={EndOption.Never}
          control={<Radio color="primary" />}
          label={t('dashboard-recurrence-dialog-end-option-never')}
          onClick={() => handleClick(EndOption.Never)}
        />
      </Grid>
      <Grid
        container
        sx={{
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
        columnGap={2}
      >
        <Grid>
          <FormControlLabel
            value={EndOption.OnDate}
            control={<Radio color="primary" />}
            label={t('dashboard-recurrence-dialog-end-option-on')}
            onClick={() => handleClick(EndOption.OnDate)}
          />
        </Grid>
        <Grid sx={{ flexShrink: 1 }}>
          <PickerLocalizationProvider>
            <DatePicker
              value={rRuleObject.until ?? null}
              onChange={(newValue) => updateRRuleObject({ until: newValue ?? undefined })}
              disabled={endOption === EndOption.Never}
              slotProps={{
                textField: {
                  error: isTouched && !isValid,
                  helperText: isTouched && validationErrorKey ? t(validationErrorKey) : undefined,
                  onBlur: () => setIsTouched(true),
                  onFocus: () => setIsTouched(false),
                  InputProps: { color: 'primary' },
                },
              }}
            />
          </PickerLocalizationProvider>
        </Grid>
      </Grid>
    </RadioGroup>
  );
};
