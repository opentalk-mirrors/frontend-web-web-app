// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { FormWrapper } from './FormWrapper';

describe('FormWrapper Component', () => {
  const formWrapperTestProps = {
    label: 'test-label',
    helperText: 'test-helper-text',
    valid: true,
    error: false,
  };

  it('renders component without crashing', () => {
    render(
      <FormWrapper {...formWrapperTestProps}>
        <></>
      </FormWrapper>
    );

    expect(screen.getByText(formWrapperTestProps.label)).toBeInTheDocument();
  });
});
