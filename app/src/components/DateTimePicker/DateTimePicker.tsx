// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Theme,
  useMediaQuery,
  Typography,
  styled,
  FilledInputProps,
  OutlinedInputProps,
  InputProps,
} from '@mui/material';
import { DateTimePicker as MuiDateTimePicker, PickersActionBarAction, PickersLocaleText } from '@mui/x-date-pickers';
import { isSameDay } from 'date-fns';
import { isEmpty } from 'lodash';

import { ErrorFormMessage } from '../../commonComponents';
import PickerLocalizationProvider from '../../provider/PickerLocalizationProvider';
import { IFormikDateTimePickerPropsReturnValue } from '../../utils/formikUtils';
import { generateUniqueId } from '../../utils/stringUtils';

type PickerTextFieldProps = {
  placeholder?: string;
  id?: string;
  startAdornment?: string;
  fullWidth?: boolean;
  required?: boolean;
};

export type DateTimePickerProps = {
  value: string | number;
  ampm?: boolean;
  /**
   * Passing null explicitly states that we do not want a minimum date and we can pick dates even in the past.
   * Used for scenarios like recurring meetings.
   */
  minTimeDate?: Date | null;
  clearable?: boolean;
  clearButtonLabel?: string;
  okButtonLabel?: string;
  cancelButtonLabel?: string;
  textField?: PickerTextFieldProps;
  InputProps?: Partial<FilledInputProps> | Partial<OutlinedInputProps> | Partial<InputProps> | undefined;
} & Pick<IFormikDateTimePickerPropsReturnValue, 'onChange' | 'helperText' | 'error'>;

const StartAdornmentTypography = styled(Typography)<{ component?: string; htmlFor?: string }>(({ theme }) => ({
  paddingRight: theme.spacing(2),
  display: 'block',
  whiteSpace: 'nowrap',

  '& .MuiFormLabel-asterisk': {
    color: theme.palette.text.error,
  },
}));

const StyledDateTimePicker = styled(MuiDateTimePicker)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  '& .MuiFormHelperText-root': {
    marginTop: theme.spacing(1),
  },
  '& .Mui-focused .MuiFormLabel-asterisk': {
    color: theme.palette.text.error,
  },
}));

const DateTimePicker = ({
  value,
  onChange,
  helperText,
  minTimeDate = new Date(),
  clearable = false,
  clearButtonLabel = 'Clear',
  okButtonLabel = 'OK',
  ampm = false,
  error,
  textField,
  InputProps,
}: DateTimePickerProps) => {
  const { placeholder, id, startAdornment, fullWidth, required } = textField || {};
  const isScreenHeightTooSmall = useMediaQuery((theme: Theme) => {
    const query = theme.breakpoints.up('sm') + ' and (max-height:900px)';
    return query;
  });

  const inputId = generateUniqueId();

  //If explicitly stated as null we do not give a min date.
  //Still keeps the fallback as current date.
  const minDate = minTimeDate === null ? undefined : minTimeDate;

  // There are cases, when the screen height is too small to fit the popper of the desktop variant
  // Therefore we need an offset for the popper relativ to it's anchor
  const getOffsetModifier = () => {
    let skidding = 0;
    let distance = 0;
    if (isScreenHeightTooSmall) {
      skidding = 50;
      distance = -200;
    }
    return { name: 'offset', options: { offset: [skidding, distance] } };
  };

  // Clearable date pickers can have a null value
  // For not clearable date pickers we set empty values to the current date
  let actualValue;
  if (clearable) {
    actualValue = isEmpty(value) ? null : new Date(value);
  } else {
    actualValue = isEmpty(value) ? new Date() : new Date(value);
  }
  let minTime;
  if (actualValue && minTimeDate && isSameDay(actualValue, minTimeDate)) {
    minTime = minTimeDate;
  } else {
    minTime = undefined;
  }

  const actions: PickersActionBarAction[] = clearable ? ['clear', 'accept', 'cancel'] : ['accept', 'cancel'];

  const actionButtonLabels: Pick<PickersLocaleText, 'okButtonLabel' | 'clearButtonLabel'> = {
    okButtonLabel,
    clearButtonLabel,
  };

  // as adornment for input fields of the picker we want to have just text (no icons or such)
  const getStartAdornment = () => {
    if (startAdornment) {
      return (
        <StartAdornmentTypography variant="body1" component="label" htmlFor={inputId}>
          {startAdornment}
          {required && (
            <span aria-hidden="true" className="MuiFormLabel-asterisk MuiInputLabel-asterisk">
              &nbsp;*
            </span>
          )}
        </StartAdornmentTypography>
      );
    }
    return null;
  };

  return (
    // This provider is needed to customize and translate action button labels
    // Another option would be to introduce custom action components, which will make more work at the moment
    <>
      <PickerLocalizationProvider localeText={actionButtonLabels}>
        <StyledDateTimePicker
          value={actualValue}
          onChange={onChange}
          ampm={ampm}
          minDate={minDate}
          minTime={minTime}
          closeOnSelect={false}
          slotProps={{
            textField: {
              placeholder,
              error,
              id,
              fullWidth,
              InputProps: {
                ...InputProps,
                startAdornment: getStartAdornment(),
                id: inputId,
                'aria-describedby': error ? `${inputId}-error` : undefined,
              },
              required,
              helperText: !error && helperText,
            },
            actionBar: { actions },
            popper: { placement: 'bottom-start', modifiers: [getOffsetModifier()] },
          }}
        />
      </PickerLocalizationProvider>
      {error && <ErrorFormMessage id={`${inputId}-error`} helperText={helperText} />}
    </>
  );
};

export default DateTimePicker;
