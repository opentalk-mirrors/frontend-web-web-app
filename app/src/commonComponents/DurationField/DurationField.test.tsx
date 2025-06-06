// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ButtonProps } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import { DurationField } from './DurationField';
import { DURATION_OPTIONS, DurationValueOptions } from './fragments/constants';

const commonProps = {
  name: 'test',
  durationOptions: DURATION_OPTIONS as DurationValueOptions[],
  ButtonProps: {
    variant: 'outlined',
    size: 'small',
    color: 'primary',
  } as ButtonProps,
  min: 1,
  max: 999,
  allowEmpty: true,
  value: null,
  onChange: jest.fn(),
  onBlur: jest.fn(),
  error: false,
  setFieldValue: jest.fn(),
};

describe('DurationField', () => {
  it('displays unlimited time when value is null', () => {
    render(<DurationField {...commonProps} value={null} />);
    expect(screen.getByRole('button', { name: 'global-duration field-duration-unlimited-time' })).toBeInTheDocument();
  });

  it('displays popover with chips when button is clicked', async () => {
    render(<DurationField {...commonProps} />);
    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: '5 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '10 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '15 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '30 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'field-duration-custom-label' })).toBeInTheDocument();
  });

  it('can close the popover', async () => {
    render(<DurationField {...commonProps} />);
    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: '5 global-minute' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'field-duration-button-close' }));
    expect(screen.queryByRole('button', { name: '5 global-minute' })).not.toBeInTheDocument();
  });

  it('can set custom duration between min and max', async () => {
    render(<DurationField {...commonProps} />);
    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    fireEvent.click(button);
    const customButton = await screen.findByRole('button', { name: 'field-duration-custom-label' });
    fireEvent.click(customButton);
    const customInput = await screen.findByRole('spinbutton');
    expect(customInput).toBeInTheDocument();
    fireEvent.change(customInput, { target: { value: '20' } });
    expect(customInput).toHaveValue(20);
    fireEvent.click(await screen.findByRole('button', { name: 'field-duration-button-save' }));
    expect(commonProps.setFieldValue).toHaveBeenCalledWith('test', 20);
  });
});
