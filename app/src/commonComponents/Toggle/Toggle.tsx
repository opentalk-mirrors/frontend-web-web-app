// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Paper as MuiPaper,
  styled,
  ToggleButton as MuiToggleButton,
  ToggleButtonGroup as MuiToggleButtonGroup,
} from '@mui/material';
import React from 'react';

export type ToggleOptions<Value> = {
  label: string;
  value: Value;
};

type ToggleProps<Value> = {
  options: Array<ToggleOptions<Value>>;
  onChange: (newValue: Value) => void;
};

const Paper = styled(MuiPaper)(({ theme }) => ({
  display: 'inline-block',
  padding: 4,
  [theme.breakpoints.down('md')]: {
    padding: 2,
  },
  borderRadius: theme.borderRadius.large,
  background: theme.palette.background.highlight.primary,
  color: theme.palette.background.highlight.contrastText,
}));

const ToggleButtonGroup = styled(MuiToggleButtonGroup)(({ theme }) => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: '1fr',
  gap: theme.spacing(0.5),
  '& .MuiToggleButton-root': {
    '&.Mui-selected': {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },
  '& .MuiToggleButtonGroup-grouped': {
    '&:not(:first-of-type)': {
      borderRadius: theme.borderRadius.large,
    },
    '&:first-of-type': {
      borderRadius: theme.borderRadius.large,
    },
    borderWidth: 0,
  },
}));

const ToggleButton = styled(MuiToggleButton)(({ theme }) => ({
  padding: '0.625rem 1.5rem',
  color: theme.palette.primary.main,
}));

const Toggle = <Value extends string | number>({ options, onChange }: ToggleProps<Value>) => {
  const [value, setValue] = React.useState<Value>(options[0].value);

  const handleOnChange = (event: React.MouseEvent<HTMLElement>, newValue: Value) => {
    if (newValue !== null) {
      setValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <Paper elevation={0}>
      <ToggleButtonGroup value={value} exclusive onChange={handleOnChange} color="primary">
        {options.map((option) => (
          <ToggleButton key={option.label} value={option.value} aria-label={option.label}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default Toggle;
