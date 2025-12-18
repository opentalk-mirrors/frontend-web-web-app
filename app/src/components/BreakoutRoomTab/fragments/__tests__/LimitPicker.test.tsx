// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LimitPicker } from '../LimitPicker';

describe('LimitPicker component', () => {
  it('renders with initial value', () => {
    const onChangeMock = vi.fn();
    render(<LimitPicker value={5} onChange={onChangeMock} min={1} max={10} labelKey="test.label" name="test" />);
    const input = screen.getByLabelText('test.label') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('does not allow non-numeric input', async () => {
    const onChangeMock = vi.fn();
    render(<LimitPicker value={5} onChange={onChangeMock} min={1} max={10} labelKey="test.label" name="test" />);
    const input = screen.getByLabelText('test.label') as HTMLInputElement;
    await userEvent.type(input, 'abc');
    expect(onChangeMock).not.toHaveBeenCalled();
    expect(input.value).toBe('5');
  });

  it('clamps value to either min or max on out of the bound input', async () => {
    const onChangeMock = vi.fn();
    render(<LimitPicker value={5} onChange={onChangeMock} min={4} max={10} labelKey="test.label" name="test" />);
    const input = screen.getByLabelText('test.label') as HTMLInputElement;
    await userEvent.type(input, '15');
    expect(onChangeMock).toHaveBeenCalledWith(10);
    await userEvent.clear(input);
    await userEvent.type(input, '3');
    expect(onChangeMock).toHaveBeenCalledWith(4);
    await userEvent.tab();
    expect(input.value).toBe('4');
  });

  it('calls onChange with valid numeric input', async () => {
    const onChangeMock = vi.fn();
    render(<LimitPicker value={5} onChange={onChangeMock} min={1} max={10} labelKey="test.label" name="test" />);
    const input = screen.getByLabelText('test.label') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '7');
    expect(onChangeMock).toHaveBeenCalledWith(7);
    expect(input.value).toBe('7');
  });
});
