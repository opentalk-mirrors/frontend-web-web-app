// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack } from '@mui/material';
import React from 'react';

import { generateUniqueId } from '../../utils/stringUtils';
import ErrorFormMessage from '../ErrorFormMessage';

interface CommonFormItemProps {
  label: string;
  control: React.ReactElement;
  name: string;
  onChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T_1 = string | React.ChangeEvent<unknown>>(
      field: T_1
    ): T_1 extends React.ChangeEvent<unknown> ? void : (e: string | React.ChangeEvent<unknown>) => void;
  };
  onBlur: {
    (e: React.FocusEvent<unknown>): void;
    <T = unknown>(fieldOrEvent: T): T extends string ? (e: unknown) => void : void;
  };
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
  const id = props.id || generateUniqueId();
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
        <label htmlFor={id}>{label}</label>
        {React.cloneElement(control, {
          onChange,
          onKeyDown,
          onBlur,
          name,
          checked: isChecked,
          inputProps: { ...controlInputProps, id },
          value,
        })}
      </Box>
      {error && <ErrorFormMessage helperText={helperText} />}
    </Stack>
  );
};

export default CommonFormItem;
