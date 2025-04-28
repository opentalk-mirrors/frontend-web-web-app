// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';

import { FormWrapper } from './FormWrapper';

describe('FormWrapper Component', () => {
  const formWrapperTestProps = {
    label: 'test-label',
    helperText: 'test-helper-text',
    valid: true,
    error: false,
  };

  // Remove eslint comment after solving
  // https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2632
  /* eslint-disable jest/expect-expect */
  it('renders component without crashing', () => {
    render(
      <FormWrapper {...formWrapperTestProps}>
        <></>
      </FormWrapper>
    );
  });
});
