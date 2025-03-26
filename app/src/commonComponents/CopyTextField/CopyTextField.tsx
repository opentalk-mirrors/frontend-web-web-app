// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InputAdornment, CircularProgress, styled, Button } from '@mui/material';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import CommonTextField from '../CommonTextField';
import { notifications } from '../Notistack';

export interface LinkFieldProps {
  label: string;
  checked?: boolean;
  value?: string | URL;
  onClick?: () => void;
  notificationText: string;
  isLoading?: boolean;
  ariaLabel?: string;
}

const SpinnerAdornment = styled(InputAdornment)(({ theme }) => ({
  right: theme.typography.pxToRem(2),
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  padding: theme.spacing(1),
  justifySelf: 'center',
  right: 5,
}));

const StyledCommonTextField = styled(CommonTextField)({
  '.MuiInputAdornment-root': {
    position: 'relative',
    left: 0,
    right: 0,
  },
  '.MuiInputBase-input.MuiOutlinedInput-input': {
    paddingRight: 0,
    textOverflow: 'ellipsis',
  },
});

const CopyTextField = forwardRef<HTMLInputElement, LinkFieldProps>(
  ({ label, checked, value, onClick, ariaLabel, isLoading, notificationText, ...remainingProps }, ref) => {
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
            color={checked ? 'primary' : 'secondary'}
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
        disabled
        InputProps={{ endAdornment: renderEndAdornment() }}
      />
    );
  }
);
CopyTextField.displayName = 'CopyTextField';

export default CopyTextField;
