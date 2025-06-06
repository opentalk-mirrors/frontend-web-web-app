// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TextField } from '@mui/material';
import { render, screen } from '@testing-library/react';

import CommonFormItem from './CommonFormItem';

const commonProps = {
  label: 'Test Label',
  control: <TextField aria-label="Fake input field" type="text" />,
  name: 'testName',
  onChange: jest.fn(),
  onBlur: jest.fn(),
};

describe('CommonFormItem', () => {
  it('renders error message when provided.', () => {
    const { rerender } = render(<CommonFormItem {...commonProps} helperText="error message" />);
    expect(screen.queryByText('error message')).not.toBeInTheDocument();
    rerender(<CommonFormItem {...commonProps} helperText="error message" error />);
    expect(screen.getByText('error message')).toBeInTheDocument();
  });
});
