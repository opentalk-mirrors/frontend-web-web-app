// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import CommonSwitch from './CommonSwitch';

const commonProps = {
  checked: false,
  onChange: jest.fn(),
  label: 'fake switch',
  inputProps: {
    role: 'switch',
  },
};

describe('CommonSwitch', () => {
  it('changes state on enter key press', () => {
    render(<CommonSwitch {...commonProps} />);
    const switchElement = screen.getByRole('switch');

    fireEvent.keyDown(switchElement, { code: 'Enter' });

    // Check if onChange was called with the expected parameters
    expect(commonProps.onChange).toHaveBeenCalledWith(expect.objectContaining({ target: { checked: true } }), true);
  });
});
