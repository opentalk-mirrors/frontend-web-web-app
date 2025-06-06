// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { ErrorFormMessage } from './ErrorFormMessage';

const commonProps = {
  helperText: 'This is an error message',
  id: 'error-message-id',
};

describe('ErrorFormMessage', () => {
  it('displays the error message', () => {
    render(<ErrorFormMessage {...commonProps} />);
    expect(screen.getByText('global-error')).toBeInTheDocument();
    expect(screen.getByText(commonProps.helperText)).toBeInTheDocument();
  });
});
