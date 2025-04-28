// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { useFormikContext } from 'formik';

import AnswersFormElement from './AnswersFormElement';

jest.mock('formik', () => {
  return {
    ...jest.requireActual('formik'),
    useFormikContext: jest.fn(),
    FieldArray: (props: { render: () => React.ReactElement }) => props.render(),
    Field: () => <div />,
  };
});

jest.mock('../../../commonComponents', () => ({
  CommonTextField: () => <div />,
}));

describe('AnswersFormElement', () => {
  const mockUseFormikContext = useFormikContext as jest.Mock;

  beforeEach(() => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {},
    });
  });

  afterAll(() => cleanup());

  it('renders without errors', () => {
    render(<AnswersFormElement name="test-name" />);
    expect(screen.getByText('poll-input-choices')).toHaveProperty('tagName', 'BUTTON');
  });

  it('is disabled in edit mode', () => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {
        'test-name': [''],
      },
    });

    render(<AnswersFormElement name="test-name" />);
    waitFor(() => {
      expect(screen.getByText('poll-input-choices')).toBeDisabled();
    });
  });
});
