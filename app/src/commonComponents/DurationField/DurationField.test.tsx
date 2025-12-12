// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ButtonProps } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  onChange: vi.fn(),
  onBlur: vi.fn(),
  error: false,
  setFieldValue: vi.fn(),
};

describe('DurationField', () => {
  it('displays unlimited time when value is null', () => {
    render(<DurationField {...commonProps} value={null} />);
    expect(screen.getByRole('button', { name: 'global-duration field-duration-unlimited-time' })).toBeInTheDocument();
  });

  it('displays popover with chips when button is clicked', async () => {
    const user = userEvent.setup();

    render(<DurationField {...commonProps} />);

    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    await user.click(button);

    expect(await screen.findByRole('button', { name: '5 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '10 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '15 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '30 global-minute' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'field-duration-custom-label' })).toBeInTheDocument();
  });

  it('can close the popover', async () => {
    const user = userEvent.setup();
    render(<DurationField {...commonProps} />);

    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    await user.click(button);

    expect(await screen.findByRole('button', { name: '5 global-minute' })).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'field-duration-button-close' }));

    expect(screen.queryByRole('button', { name: '5 global-minute' })).not.toBeInTheDocument();
  });

  it('can set custom duration between min and max', async () => {
    const user = userEvent.setup();
    render(<DurationField {...commonProps} />);

    const button = await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' });
    await user.click(button);

    const customButton = await screen.findByRole('button', { name: 'field-duration-custom-label' });

    await user.click(customButton);

    const customInput = screen.getByRole('spinbutton');
    expect(customInput).toBeInTheDocument();

    await user.clear(customInput);
    await user.type(customInput, '20');

    expect(customInput).toHaveValue(20);

    await user.click(await screen.findByRole('button', { name: 'field-duration-button-save' }));

    expect(commonProps.setFieldValue).toHaveBeenCalledExactlyOnceWith('test', 20);
  });
});
