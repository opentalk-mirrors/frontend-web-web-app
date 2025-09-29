// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem } from '@mui/material';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CommonTextField from './CommonTextField';

// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
Object.assign(global, { TextDecoder, TextEncoder });

const LABEL = 'Label';
const PLACEHOLDER = 'Placeholder';
const VALUE = 'Value';
const START_ADORNMENT = 'Adore';
const HELPER_TEXT = 'Helper text';

describe('CommonTextField', () => {
  it('renders with visible label', () => {
    render(<CommonTextField label={LABEL} placeholder={PLACEHOLDER} />);
    const textField = screen.getByRole('textbox', { name: LABEL });
    expect(textField).toBeInTheDocument();
    expect(textField).not.toHaveAttribute('aria-label');
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveStyle('display: block');
  });
  it('hides the label and adds aria-label for text field', () => {
    render(<CommonTextField label={LABEL} hideLabel={true} />);
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveStyle('display: none');
    const textField = screen.getByRole('textbox', { name: LABEL });
    expect(textField).toHaveAttribute('aria-label', LABEL);
  });
  it('hides the label and does not add aria-label for combobox', () => {
    render(
      <CommonTextField label={LABEL} hideLabel={true} select>
        <MenuItem>Test</MenuItem>
      </CommonTextField>
    );
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveStyle('display: none');
    const combobox = screen.getByRole('combobox', { name: LABEL });
    expect(combobox).not.toHaveAttribute('aria-label', LABEL);
  });
  it('shrinks the label when user types value', () => {
    render(<CommonTextField label={LABEL} placeholder={PLACEHOLDER} />);
    const textField = screen.getByRole('textbox', { name: LABEL });
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveAttribute('data-shrink', 'false');
    fireEvent.change(textField, { target: { value: VALUE } });
    expect(label).toHaveAttribute('data-shrink', 'true');
  });
  it('shrinks the label only when user types value even with the start adornment', async () => {
    render(
      <CommonTextField label={LABEL} placeholder={PLACEHOLDER} InputProps={{ startAdornment: START_ADORNMENT }} />
    );
    const textField = screen.getByRole('textbox', { name: LABEL });
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveAttribute('data-shrink', 'false');
    await userEvent.type(textField, VALUE);
    await waitFor(() => {
      expect(label).toHaveAttribute('data-shrink', 'true');
    });
  });
  it('shrinks the label with the start adornment, if parent component passes a value, without focusing the input', () => {
    render(<CommonTextField label={LABEL} value={LABEL} InputProps={{ startAdornment: START_ADORNMENT }} />);
    const label = screen.getByText(LABEL, { selector: 'label' });
    expect(label).toHaveAttribute('data-shrink', 'true');
  });
  it('shows remaining characters helper text if max characters defined', () => {
    render(<CommonTextField label={LABEL} value={VALUE} maxCharacters={VALUE.length} />);
    const helperText = screen.getByText('global-textfield-max-characters');
    expect(helperText).toBeInTheDocument();
  });
  it('does not show remaining characters if max characters and show limit are defined, and value length is below the show limit at', () => {
    render(<CommonTextField label={LABEL} value={VALUE} maxCharacters={VALUE.length * 2} showLimitAt={VALUE.length} />);
    const helperText = screen.queryByText('global-textfield-max-characters');
    expect(helperText).not.toBeInTheDocument();
  });
  it('shows remaining characters if max characters and show limit are defined, and value length is equal or above the show limit at', () => {
    render(
      <CommonTextField label={LABEL} value={VALUE} maxCharacters={VALUE.length * 2} showLimitAt={VALUE.length - 1} />
    );
    const helperText = screen.getByText('global-textfield-max-characters');
    expect(helperText).toBeInTheDocument();
  });
  it('shows plain helper text without error', () => {
    render(<CommonTextField label={LABEL} helperText={HELPER_TEXT} />);
    const helperText = screen.getByText(HELPER_TEXT);
    expect(helperText).toBeInTheDocument();
    const errorText = screen.queryByText(/global-error/i);
    expect(errorText).not.toBeInTheDocument();
  });
  it('shows plain helper with error prefix', () => {
    render(<CommonTextField label={LABEL} helperText={HELPER_TEXT} error={true} />);
    const helperText = screen.getByText('global-error' + ': ' + HELPER_TEXT);
    expect(helperText).toBeInTheDocument();
  });
  it('shall call onBlur and onFocus props passed by parent', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<CommonTextField label={LABEL} onFocus={onFocus} onBlur={onBlur} />);
    const textField = screen.getByRole('textbox', { name: LABEL });
    act(() => {
      textField.focus();
    });
    expect(onFocus).toHaveBeenCalled();

    await userEvent.click(document.body);

    await waitFor(() => {
      expect(onBlur).toHaveBeenCalled();
    });
  });
});
