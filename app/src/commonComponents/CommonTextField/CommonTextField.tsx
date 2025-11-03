// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InputProps, InputLabelProps, TextField, TextFieldProps, styled } from '@mui/material';
import { useState, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { generateUniqueId } from '../../utils/stringUtils';

type ComposedTextFieldProps = TextFieldProps & {
  maxCharacters?: number;
  showLimitAt?: number;
  value?: string;
  label?: string; // label MUST be provided to ensure the accessibility (https://mui.com/material-ui/react-text-field/#accessibility)
  hideLabel?: boolean;
};

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ select?: boolean; hideLabel?: boolean; InputProps?: InputProps }>(({ select, hideLabel, InputProps, theme }) => ({
  // in case text field is used as select component, we want to have a bigger arrow
  '& .MuiSvgIcon-root': {
    fontSize: select && '2rem',
  },
  // if we want to hide the label, we also need to hide the legend
  '& .MuiOutlinedInput-root > fieldset > legend > span': {
    display: hideLabel && 'none',
  },

  '& .MuiFormLabel-asterisk': {
    color: theme.palette.error.main,
  },

  // for some reason label position must be fine-tuned in text fields with start adornments
  '& .MuiInputLabel-root': {
    paddingTop: InputProps?.startAdornment && '1px',
    display: hideLabel ? 'none' : undefined,
  },
}));

const CommonTextField = ({
  error,
  helperText,
  fullWidth,
  maxCharacters,
  showLimitAt,
  slotProps,
  ref,
  ...props
}: ComposedTextFieldProps) => {
  const { value, hideLabel } = props;
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const initialInputLabelProps = (slotProps?.inputLabel || {}) as InputLabelProps;
  const InputProps = (slotProps?.input || {}) as InputProps;

  const id = props.id || generateUniqueId();

  const computedInputLabelProps = {
    ...initialInputLabelProps,
    ...(hideLabel ? { sx: { ...initialInputLabelProps?.sx, display: 'none' } } : {}),
    ...(InputProps?.startAdornment
      ? {
          shrink: !!(value || focused),
          sx: {
            ...initialInputLabelProps?.sx,
            ...(hideLabel ? { display: 'none' } : {}),
            ml: value || focused ? 0 : 3.5,
          },
        }
      : {}),
  };

  // we shall take care to execute onFocus event passed from the parent component as well (if any)
  const handleFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
    setFocused(true);
    if (props.onFocus) {
      props.onFocus(event);
    }
  };

  // we shall take care to execute onBlur event passed from the parent component as well (if any)
  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
    setFocused(false);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  const getHelperText = () => {
    // helper text MUST be provided to ensure the accessibility (https://mui.com/material-ui/react-text-field/#accessibility)
    // so, if parent component doesn't specify it, we set at least to blank
    let prefix = '';
    if (error) {
      prefix = `${t('global-error')}: `;
    }

    // if helper text is specified by the parent component it will overwrite the remaining characters text
    if (helperText) {
      return prefix + helperText;
    }

    if (maxCharacters) {
      const currentLength = new TextEncoder().encode(value).length;
      if (currentLength > 0) {
        const showRemainingLength = showLimitAt ? currentLength > showLimitAt : true;
        if (showRemainingLength) {
          const remainingCharacters = maxCharacters - currentLength;
          return (
            prefix +
            t('global-textfield-max-characters', {
              remainingCharacters: Math.abs(remainingCharacters),
            })
          );
        }
      }
    }

    return prefix;
  };

  return (
    <StyledTextField
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={ref}
      error={error}
      id={id}
      helperText={getHelperText()}
      fullWidth={fullWidth}
      hideLabel={hideLabel}
      slotProps={{
        input: InputProps,
        inputLabel: computedInputLabelProps,
        htmlInput: {
          ...slotProps?.htmlInput,
          maxLength: maxCharacters,
          // we need explicitly set the accessible name of the text field if we hide the label,
          // otherwise browser will use placeholder as the accessible name
          // strangely, we don't need to do it for the combobox
          'aria-label': hideLabel && !props.select ? props.label : undefined,
        },
      }}
    />
  );
};

CommonTextField.displayName = 'CommonTextField';

export default CommonTextField;
