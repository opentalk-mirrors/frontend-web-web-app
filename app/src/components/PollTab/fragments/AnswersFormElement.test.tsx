// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useFormikContext } from 'formik';

import { render, screen, waitFor, cleanup } from '../../../utils/testUtils';
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

describe.skip('AnswersFormElement', () => {
  const mockUseFormikContext = useFormikContext as jest.Mock;

  beforeEach(() => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {},
    });
  });

  afterAll(() => cleanup());

  it('unconditionally renders', async () => {
    await render(<AnswersFormElement name="test-name" />);
    expect(screen.getByText('poll-input-choices')).toHaveProperty('tagName', 'BUTTON');
  });

  it('is disabled in edit mode', async () => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {
        'test-name': [''],
      },
    });

    await render(<AnswersFormElement name="test-name" />);
    waitFor(() => {
      expect(screen.getByText('poll-input-choices')).toBeDisabled();
    });
  });
});
