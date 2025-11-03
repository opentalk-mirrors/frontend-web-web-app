// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InputAdornment, CircularProgress, styled, Button } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CommonTextField from '../CommonTextField';
import { notifications } from '../Notistack';

export type LinkFieldProps = {
  label: string;
  checked?: boolean;
  value?: string | URL;
  onClick?: () => void;
  notificationText: string;
  isLoading?: boolean;
  ariaLabel?: string;
} & TextFieldProps;

const SpinnerAdornment = styled(InputAdornment)(({ theme }) => ({
  right: theme.typography.pxToRem(2),
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  padding: theme.spacing(1),
  justifySelf: 'center',
  right: 5,
}));

const StyledCommonTextField = styled(CommonTextField)(() => ({
  '.MuiInputAdornment-root': {
    position: 'relative',
    left: 0,
    right: 0,
  },
  '.MuiInputBase-input.MuiOutlinedInput-input': {
    paddingRight: 0,
    textOverflow: 'ellipsis',
  },
}));

const CopyTextField: React.FC<LinkFieldProps> = ({
  label,
  checked,
  value,
  onClick,
  ariaLabel,
  isLoading,
  notificationText,
  ref,
  ...remainingProps
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString()).then(() => {
        notifications.success(notificationText);
        if (onClick) {
          onClick();
        }
      });
    }
  };

  const renderEndAdornment = () => {
    if (isLoading) {
      return (
        <SpinnerAdornment position="end">
          <LoadingSpinner />
        </SpinnerAdornment>
      );
    }

    return (
      <InputAdornment position="end">
        <Button
          aria-label={ariaLabel}
          onClick={handleClick}
          variant="contained"
          disabled={!value}
          color={checked ? 'secondary' : 'primary'}
          size="small"
        >
          {t(checked ? 'global-copied' : 'global-copy')}
        </Button>
      </InputAdornment>
    );
  };

  return (
    <StyledCommonTextField
      ref={ref}
      {...remainingProps}
      label={label}
      fullWidth
      value={value ? value.toString() : '-'}
      slotProps={{
        input: { endAdornment: renderEndAdornment(), readOnly: true },
      }}
    />
  );
};

CopyTextField.displayName = 'CopyTextField';

export default CopyTextField;
