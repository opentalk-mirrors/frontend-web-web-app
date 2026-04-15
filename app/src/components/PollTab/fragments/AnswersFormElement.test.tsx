// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { useFormikContext } from 'formik';
import { range } from 'lodash';
import { Mock } from 'vitest';

import { renderWithProviders } from '../../../utils/testUtils';
import AnswersFormElement from './AnswersFormElement';

vi.mock('formik', () => {
  return {
    ...vi.importActual('formik'),
    useFormikContext: vi.fn(),
    FieldArray: (props: { render: () => React.ReactElement }) => props.render(),
    Field: () => <div />,
  };
});

const MIN_ANSWERS_LENGTH = 2;
const MAX_ANSWERS_LENGTH = 4;

vi.mock('../../../commonComponents', () => ({
  CommonTextField: () => <div />,
}));

describe('AnswersFormElement', () => {
  const mockUseFormikContext = useFormikContext as Mock;

  beforeEach(() => {
    mockUseFormikContext.mockReset();
  });

  it('renders without errors', () => {
    mockUseFormikContext.mockReturnValue({ values: { 'test-name': Array(MIN_ANSWERS_LENGTH).fill('') } });
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    expect(screen.getByText('poll-input-option-button')).toHaveProperty('tagName', 'BUTTON');
  });

  it('on initial render default option fields should be visible', async () => {
    const mockContext = { values: { 'test-name': Array(MIN_ANSWERS_LENGTH).fill('') } };
    mockUseFormikContext.mockReturnValue(mockContext);
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    const options = screen.getAllByText('poll-input-option');
    expect(options).toHaveLength(MIN_ANSWERS_LENGTH);
  });

  it('should show delete buttons on every option if there are more than min options', async () => {
    const answers = range(MIN_ANSWERS_LENGTH + 1).map((number) => `Option ${number}`);
    const mockContext = { values: { 'test-name': answers } };
    mockUseFormikContext.mockReturnValue(mockContext);
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    const deleteButtons = screen.getAllByTestId('CancelIcon');
    expect(deleteButtons).toHaveLength(answers.length);
  });

  it('should not show delete buttons on options if there are only min options', async () => {
    const answers = range(MIN_ANSWERS_LENGTH).map((number) => `Option ${number}`);
    const mockContext = { values: { 'test-name': answers } };
    mockUseFormikContext.mockReturnValue(mockContext);
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    const deleteButtons = screen.queryByTestId('CancelIcon');
    expect(deleteButtons).not.toBeInTheDocument();
  });
  it('should show an error message if there are duplicate options', async () => {
    const answers = ['Option 1', 'Option 2', 'Option 1'];
    const mockContext = {
      values: { 'test-name': answers },
      errors: { 'test-name': ['poll-form-input-error-choice-unique'] },
    };
    mockUseFormikContext.mockReturnValue(mockContext);
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    expect(screen.getByText('poll-form-input-error-choice-unique')).toBeInTheDocument();
  });
  it('should have the add more option button disabled and show limit of Max options reached when user exceeds allowed max options', async () => {
    const mockContext = { values: { 'test-name': Array(MAX_ANSWERS_LENGTH).fill('') } };
    mockUseFormikContext.mockReturnValue(mockContext);
    renderWithProviders(
      <AnswersFormElement name="test-name" answersRange={{ min: MIN_ANSWERS_LENGTH, max: MAX_ANSWERS_LENGTH }} />,
      {
        provider: { mui: true },
      }
    );
    expect(screen.queryByText('poll-input-option-button')).not.toBeInTheDocument();
    expect(screen.getByText('poll-input-option-max')).toBeInTheDocument();
    expect(screen.getByText('poll-input-option-max')).toBeDisabled();
  });
});
