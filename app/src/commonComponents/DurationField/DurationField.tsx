// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, ButtonProps, Chip as MuiChip, Popover, Stack, styled, Typography } from '@mui/material';
import { isNumber } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClockIcon } from '../../assets/icons';
import { IFormikCustomFieldPropsReturnDurationValue } from '../../utils/formikUtils';
import CommonTextField from '../CommonTextField';
import ErrorFormMessage from '../ErrorFormMessage';
import { MenuTitle } from '../ToolbarMenuUtils/ToolbarMenuUtils';
import { DURATION_OPTIONS, DurationValueOptions } from './fragments/constants';

interface DurationFieldProps extends IFormikCustomFieldPropsReturnDurationValue {
  name: string;
  /**
   * Options:
   * - null for unlimited time
   * - number (in minutes)
   * - 'custom'
   *
   * Default:
   * - [null, 5, 10, 15, 30, 'custom']
   */
  durationOptions?: Array<DurationValueOptions>;
  ButtonProps?: ButtonProps;
  min?: number;
  max?: number;
  allowEmpty?: boolean;
}

const MIN_DURATION_DEFAULT = 1;
const MAX_DURATION_DEFAULT = 999;

const NumberInput = styled(CommonTextField)({
  maxWidth: '4rem',
  '& input': {
    paddingRight: 0,
    textAlign: 'center',
  },
});

const Chip = styled(MuiChip)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  color: theme.palette.text.primary,
  '& .MuiChip-label': {
    padding: theme.spacing(0.5, 1),
  },
}));

const StyledClockIcon = styled(ClockIcon)(({ theme }) => ({
  fill: theme.palette.text.secondary,
}));

const Container = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: '17.875rem',
}));

const TimerButton = styled(Button)({
  padding: 0,
});

export const DurationField = ({
  name,
  value,
  setFieldValue,
  durationOptions = DURATION_OPTIONS,
  ButtonProps,
  error,
  helperText,
  min = MIN_DURATION_DEFAULT,
  max = MAX_DURATION_DEFAULT,
}: DurationFieldProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [customDurationFieldValue, setCustomDurationFieldValue] = React.useState<number | null>(
    value && durationOptions.includes(value) ? value : min
  );

  const [selectedChip, setSelectedChip] = useState<DurationValueOptions>(isNumber(value) ? value : null);
  const { t } = useTranslation();

  const showCustomDurationField = selectedChip === 'custom';

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleChipSelect = (duration: DurationValueOptions) => {
    setSelectedChip(duration);
    if (duration === 'custom' && !customDurationFieldValue) {
      setCustomDurationFieldValue(min);
    }
    setErrorMessage('');
  };

  const renderButtonText = () => (value ? `${value} min` : t('field-duration-unlimited-time'));
  const getButtonAriaLabel = () =>
    `${t('global-duration')} ${value ? value + ' ' + t('global-minute', { count: value }) : t('field-duration-unlimited-time')}`;

  const getChipLabel = (duration: DurationValueOptions) => {
    switch (duration) {
      case 'custom':
        return t('field-duration-custom');
      case null:
        return t('field-duration-unlimited-time');
      default:
        return `${duration} min`;
    }
  };

  const getChipAriaLabel = (duration: DurationValueOptions) => {
    switch (duration) {
      case 'custom':
        return t('field-duration-custom-label');
      case null:
        return t('field-duration-unlimited-time-label');
      default:
        return duration + ' ' + t('global-minute', { count: duration });
    }
  };

  const renderDurationOptions = () => (
    <Stack
      spacing={1}
      sx={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      {durationOptions.map((duration, index) => {
        return (
          <Chip
            label={getChipLabel(duration)}
            onClick={() => handleChipSelect(duration)}
            variant={selectedChip === duration ? 'filled' : 'outlined'}
            aria-selected={selectedChip === duration}
            aria-label={getChipAriaLabel(duration)}
            key={index}
          />
        );
      })}
    </Stack>
  );

  const handleSave = (event: React.MouseEvent<HTMLElement>) => {
    handlePopoverClose(event);

    const durationMinutes = showCustomDurationField ? customDurationFieldValue : selectedChip;
    const duration = isNumber(durationMinutes) ? durationMinutes : null;

    setFieldValue(name, duration);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseInt(event.target.value);

    setCustomDurationFieldValue(Math.min(max, Math.max(min, nextValue)));

    if (nextValue > max) {
      setErrorMessage(t('field-duration-max-error', { minutes: max + 1 }));
      return;
    }
    if ((Number.isNaN(nextValue) && min) || nextValue < min) {
      setErrorMessage(t('field-duration-min-error', { minutes: min - 1 }));
      return;
    }
    setErrorMessage('');
    return;
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <TimerButton
        variant="text"
        onClick={handlePopoverOpen}
        {...ButtonProps}
        startIcon={<StyledClockIcon />}
        aria-label={getButtonAriaLabel()}
      >
        <Typography component="span" variant="body2" color="text.secondary">
          {renderButtonText()}
        </Typography>
      </TimerButton>
      <Popover
        open={open}
        onClose={handlePopoverClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 118,
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-labelledby': 'duration-field-popover-title',
          },
        }}
      >
        <Container spacing={2}>
          <MenuTitle id="duration-field-popover-title">{t('field-duration-button-text')}</MenuTitle>
          {renderDurationOptions()}
          {showCustomDurationField && (
            <Stack spacing={1}>
              <NumberInput
                type="number"
                inputProps={{ min, max, 'aria-describedby': 'duration-field-error' }}
                onChange={handleInputChange}
                value={customDurationFieldValue?.toString()}
              />
              <Typography variant="caption">{t('field-duration-input-label')}</Typography>
            </Stack>
          )}
          <Box>{errorMessage && <ErrorFormMessage id="duration-field-error" helperText={errorMessage} />}</Box>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Button variant="text" size="small" onClick={handlePopoverClose} color="primary">
              {t('field-duration-button-close')}
            </Button>
            <Button
              size="small"
              onClick={handleSave}
              /* When session duration popover is open we want to focus it so screen reader can tell the content. */
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={errorMessage.length > 0}
              color="secondary"
            >
              {t('field-duration-button-save')}
            </Button>
          </Stack>
        </Container>
      </Popover>
      {error && <ErrorFormMessage helperText={helperText} />}
    </Box>
  );
};
