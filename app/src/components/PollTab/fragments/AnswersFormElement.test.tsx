// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';
import { useFormikContext } from 'formik';
import { Mock } from 'vitest';

import AnswersFormElement from './AnswersFormElement';

vi.mock('formik', () => {
  return {
    ...vi.importActual('formik'),
    useFormikContext: vi.fn(),
    FieldArray: (props: { render: () => React.ReactElement }) => props.render(),
    Field: () => <div />,
  };
});

vi.mock('../../../commonComponents', () => ({
  CommonTextField: () => <div />,
}));

describe('AnswersFormElement', () => {
  const mockUseFormikContext = useFormikContext as Mock;

  beforeEach(() => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {},
    });
  });

  it('renders without errors', () => {
    render(<AnswersFormElement name="test-name" />);
    expect(screen.getByText('poll-input-choices')).toHaveProperty('tagName', 'BUTTON');
  });

  it('is disabled in edit mode', async () => {
    mockUseFormikContext.mockReturnValue({
      errors: [],
      values: {
        'test-name': [''],
      },
    });

    render(<AnswersFormElement name="test-name" />);
    await waitFor(() => {
      expect(screen.getByText('poll-input-choices')).toBeDisabled();
    });
  });
});
