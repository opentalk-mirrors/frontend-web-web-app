// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack } from '@mui/material';
import type { TextFieldProps, CheckboxProps, SwitchProps } from '@mui/material';
import type { FormikHandlers } from 'formik';
import React from 'react';

import ErrorFormMessage from '../ErrorFormMessage';

interface CommonFormItemProps {
  label: string;
  control: React.ReactElement<TextFieldProps | CheckboxProps | SwitchProps>;
  name: string;
  onChange: FormikHandlers['handleChange'];
  onBlur?: FormikHandlers['handleBlur'];
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  error?: boolean;
  helperText?: string;
  value?: unknown;
  checked?: boolean;
  id?: string;
}

const CommonFormItem = ({
  label,
  error,
  helperText,
  control,
  value,
  onChange,
  onKeyDown,
  onBlur,
  name,
  checked,
  ...props
}: CommonFormItemProps) => {
  const isChecked = checked === undefined ? undefined : checked;
  const id = React.useId();
  const controlInputProps = control.props?.inputProps || {};

  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <label htmlFor={props.id || id}>{label}</label>
        {React.cloneElement(control, {
          onChange,
          onKeyDown,
          onBlur,
          name,
          id: props.id || id,
          checked: isChecked,
          inputProps: { ...controlInputProps },
          value,
        })}
      </Box>
      {error && <ErrorFormMessage helperText={helperText} />}
    </Stack>
  );
};

export default CommonFormItem;
