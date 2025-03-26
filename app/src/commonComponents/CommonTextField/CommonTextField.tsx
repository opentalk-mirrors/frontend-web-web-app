// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InputProps, InputLabelProps, TextField, TextFieldProps, styled } from '@mui/material';
import React, { KeyboardEvent, useState, useEffect, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { generateUniqueId } from '../../utils/stringUtils';
import { KEYS_TO_PROPAGATE } from './constants';

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
  },
}));

const CommonTextField = React.forwardRef<HTMLInputElement, ComposedTextFieldProps>(
  ({ error, helperText, fullWidth, maxCharacters, showLimitAt, InputProps, InputLabelProps, ...props }, ref) => {
    const { value, hideLabel } = props;
    const { t } = useTranslation();
    const [inputLabelProps, setInputLabelProps] = useState<InputLabelProps>(InputLabelProps ?? {});
    const [focused, setFocused] = useState(false);

    const id = props.id || generateUniqueId();

    // By default, labels are always shrunk if text fields have start adornments
    // Therefore we need this workaround, to establish a floating label behaviour for
    // text fields with start adornments
    useEffect(() => {
      setShrinkForStartAdornment(inputLabelProps?.shrink);
    }, [inputLabelProps?.shrink]);

    useEffect(() => {
      // If value is being passed from the parent as props, we should always shrink the label
      // (e.g in case of emoji picker in chat)
      // https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1293#note_110610
      if (value) {
        setShrinkForStartAdornment(true);
      }
      // If value has been reset by the parent and the focus was unset, we explicitly unshrink the label
      // (e.g. in case of sending message in chat)
      // https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1293#note_110762
      if (!value && !focused) {
        setShrinkForStartAdornment(false);
      }
      // If value has been reset by the parent and the focus was set, we explicitly shrink the label
      // (e.g. in case of resetting search in chat)
      // https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1293#note_111312 (2. Note)
      if (!value && focused) {
        setShrinkForStartAdornment(true);
      }
    }, [value, focused]);

    useEffect(() => {
      if (hideLabel) {
        setInputLabelProps((prevInputLabelProps) => {
          return { ...prevInputLabelProps, sx: { ...prevInputLabelProps.sx, display: 'none' } };
        });
      }
    }, [hideLabel]);

    // We introduce additional margin for labels in case they are not shrinked
    // to avoid overlapping with start adornments
    const setShrinkForStartAdornment = (shrink = false) => {
      if (InputProps?.startAdornment) {
        setInputLabelProps((prevInputLabelProps) => {
          return { ...prevInputLabelProps, sx: { ...prevInputLabelProps.sx, ml: shrink ? 0 : 3.5 }, shrink };
        });
      }
    };

    const handlePropagation = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!KEYS_TO_PROPAGATE.includes(event.key)) {
        event.stopPropagation();
      }
    };

    // we shall take care to execute onFocus event passed from the parent component as well (if any)
    const handleFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
      setFocused(true);
      setShrinkForStartAdornment(true);
      if (props.onFocus) {
        props.onFocus(event);
      }
    };

    // we shall take care to execute onBlur event passed from the parent component as well (if any)
    const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
      setFocused(false);
      setShrinkForStartAdornment(!!event.target.value);
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
        inputProps={{
          ...props.inputProps,
          maxLength: maxCharacters,
          onKeyDown: handlePropagation,
          onKeyUp: handlePropagation,
          // we need explicitly set the accessible name of the text field if we hide the label,
          // otherwise browser will use placeholder as the accessible name
          // strangely, we don't need to do it for the combobox
          'aria-label': hideLabel && !props.select ? props.label : undefined,
        }}
        helperText={getHelperText()}
        fullWidth={fullWidth}
        hideLabel={hideLabel}
        InputLabelProps={inputLabelProps}
        InputProps={InputProps}
      />
    );
  }
);
CommonTextField.displayName = 'CommonTextField';

export default CommonTextField;
