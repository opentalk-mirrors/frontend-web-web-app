// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { clamp } from 'lodash';
import { KeyboardEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonFormItem, CommonTextField } from '../../../commonComponents';

type LimitPickerProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  labelKey: string;
  name: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const TextNumberInput = styled(CommonTextField)(() => ({
  appearance: 'textfield',
  width: '4rem',
  '& input': {
    textAlign: 'center',
  },
}));

export function LimitPicker({ value, onChange, min, max, labelKey, name }: LimitPickerProps) {
  const { t } = useTranslation();
  const lastValidValue = useRef(value);
  const [rawValue, setRawValue] = useState(String(value));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (/^\d*$/.test(rawValue) || rawValue === '') {
      setRawValue(rawValue);
      const numericValue = Number(rawValue);
      if (!isNaN(numericValue)) {
        lastValidValue.current = clamp(numericValue, min, max);
        onChange(lastValidValue.current);
      }
    }
  };

  const handleBlur = () => {
    setRawValue(String(lastValidValue.current));
    onChange(lastValidValue.current);
  };

  const handleKeyDownEvent = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const newValue = clamp(lastValidValue.current + 1, min, max);
      setRawValue(String(newValue));
      lastValidValue.current = newValue;
      onChange(newValue);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const newValue = clamp(lastValidValue.current - 1, min, max);
      setRawValue(String(newValue));
      lastValidValue.current = newValue;
      onChange(newValue);
    }
  };

  return (
    <CommonFormItem
      name={name}
      value={rawValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDownEvent}
      label={t(labelKey)}
      control={
        <TextNumberInput
          type="text"
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
            },
          }}
        />
      }
    />
  );
}
